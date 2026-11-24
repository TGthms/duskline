"""Build immutable XYZ WebP archives from Open-Meteo's spatial ICON forecast."""

import argparse
import asyncio
from concurrent.futures import ProcessPoolExecutor
from datetime import datetime, timedelta, timezone
import io
import json
import multiprocessing
from pathlib import Path
import sys
from tempfile import TemporaryDirectory
import time
from urllib.request import urlopen

import aiohttp
from fsspec.core import OpenFile
from fsspec.implementations.http import HTTPFileSystem
import mapbox_vector_tile
import numpy as np
from omfiles import OmFileReader
from PIL import Image
from pmtiles.tile import Compression, TileType, tileid_to_zxy
from pmtiles.writer import Writer
from scipy.spatial import cKDTree


BUCKET = "https://openmeteo.s3.amazonaws.com/"
REGULAR_FEED = "dwd_icon"
NATIVE_FEED = "dwd_icon_global_native"
MODEL = "DWD ICON"
GRID_SHAPE = (1441, 2879)
NATIVE_SHAPE = (1, 2949120)
GRID_STEP = 0.125
TILE_SIZE = 512
MAX_ZOOM = 3
WIND_ARROW_ZOOM = 4
HOUR = timedelta(hours=1)
VARIABLES = {
    "temperature": "temperature_2m",
    "precipitation": "precipitation",
    "wind_u": "wind_u_component_10m",
    "wind_v": "wind_v_component_10m",
}
PALETTES = json.loads(Path(__file__).with_name("palettes.json").read_text())


class SpatialFileSystem(HTTPFileSystem):
    def __init__(self):
        super().__init__(client_kwargs={"timeout": aiohttp.ClientTimeout(total=60)}, skip_instance_cache=True)
        self.blocks = {}

    async def _cat_file(self, url=None, start=None, end=None, *, path=None, **kwargs):
        # OmFileReader passes the fsspec path by keyword.
        url = url or path
        if start is None or end is None or start < 0 or end <= start:
            return await super()._cat_file(url, start, end, **kwargs)
        block = 1024 * 1024
        result = []
        for index in range(start // block, (end - 1) // block + 1):
            offset = index * block
            key = (url, index)
            if key not in self.blocks:
                if len(self.blocks) >= 24:
                    evict = next((key for key, value in self.blocks.items() if value.done()), None)
                    if evict is not None:
                        del self.blocks[evict]
                self.blocks[key] = asyncio.create_task(super()._cat_file(url, offset, offset + block))
            data = await self.blocks[key]
            result.append(data[max(0, start - offset):end - offset])
        return b"".join(result)


def collect_fields(url, native_index=None):
    filesystem = SpatialFileSystem()
    fields = {}
    with OmFileReader(OpenFile(filesystem, url)) as root:
        for layer, name in VARIABLES.items():
            reader = root.get_child_by_name(name)
            expected_shape = GRID_SHAPE if native_index is None else NATIVE_SHAPE
            if reader.shape != expected_shape:
                raise ValueError(f"Unexpected ICON grid for {name}: {reader.shape}")
            field = reader[:, :]
            if np.count_nonzero(np.isfinite(field)) < field.size * 0.99:
                raise ValueError(f"Incomplete ICON field: {name}")
            if native_index is not None:
                field = field[0, native_index]
            fields[layer] = field
    return fields


def model_time(value):
    return datetime.fromisoformat(value).astimezone(timezone.utc)


def frame_id(stamp):
    return stamp.strftime("%Y%m%d%H")


def source_path(feed, run, stamp):
    return f"{BUCKET}data_spatial/{feed}/{run:%Y/%m/%d/%H%MZ}/{stamp:%Y-%m-%dT%H%M}.om"


def feed_run(feed):
    with urlopen(f"{BUCKET}data_spatial/{feed}/latest.json", timeout=30) as response:
        metadata = json.load(response)
    run = model_time(metadata["reference_time"])
    frames = [run + offset * HOUR for offset in range(1, 25)]
    valid = set(map(model_time, metadata["valid_times"]))
    if not metadata["completed"] or not set(VARIABLES.values()).issubset(metadata["variables"]):
        raise ValueError("The published ICON model run is incomplete.")
    if not all(stamp in valid for stamp in frames):
        raise ValueError("The published ICON run is missing hourly frames.")
    expected_crs = 'GEOGCRS["WGS 84"' if feed == REGULAR_FEED else 'GEOGCRS["ICON Native Grid"'
    if not metadata["crs_wkt"].startswith(expected_crs):
        raise ValueError(f"Unexpected coordinate system for {feed}")
    return run, frames, feed


def get_run(source):
    feeds = [REGULAR_FEED, NATIVE_FEED] if source == "auto" else [source]
    complete = []
    for feed in feeds:
        try:
            complete.append(feed_run(feed))
        except (OSError, ValueError, KeyError) as error:
            print(f"ICON feed {feed}: {error}", file=sys.stderr)
    if not complete:
        raise ValueError("No supported complete ICON run is available.")
    return max(complete, key=lambda candidate: candidate[0])


def unit_sphere(latitude, longitude):
    lat, lon = np.deg2rad(latitude), np.deg2rad(longitude)
    horizontal = np.cos(lat)
    return np.stack(np.broadcast_arrays(horizontal * np.cos(lon), horizontal * np.sin(lon), np.sin(lat)), axis=-1)


def nearest_cells(tree, latitude, longitude):
    return tree.query(unit_sphere(latitude, longitude))[1]


def save_native_index(path):
    url = f"{BUCKET}data/{NATIVE_FEED}/static/coordinates.om"
    with OmFileReader(OpenFile(SpatialFileSystem(), url)) as root:
        latitude = root.get_child_by_name("lat")
        longitude = root.get_child_by_name("lon")
        if latitude.shape != NATIVE_SHAPE or longitude.shape != NATIVE_SHAPE:
            raise ValueError("Unexpected native ICON coordinate grid")
        tree = cKDTree(unit_sphere(latitude[0, :], longitude[0, :]))
    height, width = GRID_SHAPE
    columns = np.arange(width) * GRID_STEP - 180
    index = np.empty(GRID_SHAPE, dtype=np.int32)
    # Row batches bound peak memory and use the same grid for every forecast hour.
    for start in range(0, height, 32):
        rows = np.arange(start, min(height, start + 32)) * GRID_STEP - 90
        index[start:start + len(rows)] = nearest_cells(tree, rows[:, None], columns)
    np.save(path, index)


def grid_coordinates(z, x, y, samples=TILE_SIZE):
    side = 1 << z
    centers = (np.arange(samples) + 0.5) / samples
    longitude = (x + centers) * 360 / side - 180
    mercator = np.pi * (1 - 2 * (y + centers) / side)
    latitude = np.degrees(np.arctan(np.sinh(mercator)))
    return (latitude + 90) / GRID_STEP, (longitude + 180) / GRID_STEP


def longitude_indices(columns):
    # ICON omits one 0.125° longitude next to the date line. Interpolate
    # across the remaining 0.25° gap and wrap back to column zero.
    edge = GRID_SHAPE[1] - 1
    west = np.minimum(np.floor(columns).astype(int), edge)
    east = (west + 1) % GRID_SHAPE[1]
    fraction = (columns - west) / np.where(west == edge, 2, 1)
    return west, east, fraction


def project(field, z, x, y, *, interpolate, samples=TILE_SIZE):
    rows, columns = grid_coordinates(z, x, y, samples)
    west, east, dx = longitude_indices(columns)
    if not interpolate:
        # Keep sampled dry pixels transparent at the edges of precipitation.
        nearest = np.where(dx < 0.5, west, east)
        return field[np.ix_(np.rint(rows).astype(int), nearest)]
    south = np.floor(rows).astype(int)
    dy = (rows - south)[:, None]
    lower = field[np.ix_(south, west)] * (1 - dx) + field[np.ix_(south, east)] * dx
    upper = field[np.ix_(south + 1, west)] * (1 - dx) + field[np.ix_(south + 1, east)] * dx
    return lower * (1 - dy) + upper * dy


def colorize(values, layer):
    stops, colors = zip(*PALETTES[layer]["stops"])
    finite = np.isfinite(values)
    values = np.where(finite, values, 0)
    step = 0.1 if layer == "precipitation" else 0.5
    quantized = np.rint(values / step) * step
    rgba = np.empty((*values.shape, 4), dtype=np.uint8)
    for channel in range(3):
        rgba[..., channel] = np.rint(np.interp(quantized, stops, [color[channel] for color in colors]))
    if layer == "precipitation":
        finite &= values >= stops[0] - 1e-6
    rgba[..., 3] = np.where(finite, 255, 0)
    return rgba


def raster_tile(field, layer, z, x, y):
    if layer == "wind":
        rgba = colorize(np.hypot(*(project(component, z, x, y, interpolate=True) for component in field)), layer)
    elif layer == "precipitation":
        # Keep the wide-view pyramid compact. At local zoom, sample partial coverage.
        rgba = (precipitation_pixels(field, z, x, y) if z == MAX_ZOOM
                else colorize(project(field, z, x, y, interpolate=False), layer))
    else:
        rgba = colorize(project(field, z, x, y, interpolate=True), layer)
    buf = io.BytesIO()
    Image.fromarray(rgba).save(buf, format="WEBP", lossless=True, method=3)
    return buf.getvalue()


def precipitation_pixels(field, z, x, y):
    samples = project(field, z, x, y, interpolate=False, samples=TILE_SIZE * 2)
    samples = samples.reshape(TILE_SIZE, 2, TILE_SIZE, 2)
    wet = np.isfinite(samples) & (samples >= PALETTES["precipitation"]["stops"][0][0] - 1e-6)
    coverage = wet.sum(axis=(1, 3))
    # Use the wet samples for intensity, and use their pixel coverage for opacity.
    rate = np.where(wet, samples, 0).sum(axis=(1, 3)) / np.maximum(coverage, 1)
    rgba = colorize(rate, "precipitation")
    rgba[..., 3] = np.rint(coverage * (255 / 4)).astype(np.uint8)
    return rgba


def wind_arrow_tile(wind, z, x, y):
    count = 7
    east, north = (project(component, z, x, y, interpolate=True, samples=count) for component in wind)
    speed = np.hypot(east, north)
    bearings = np.degrees(np.arctan2(east, north)) % 360
    features = []
    for row, col in np.argwhere(speed >= 1.5):
        features.append({
            "geometry": {"type": "Point", "coordinates": [
                round((col + 0.5) * 4096 / count), round((row + 0.5) * 4096 / count)
            ]},
            "properties": {"bearing": int(round(bearings[row, col])) % 360},
        })
    return mapbox_vector_tile.encode({"name": "wind", "features": features}, default_options={"y_coord_down": True})


def write_archive(path, layer, max_zoom, tile_type, make_tile):
    with path.open("wb") as payload:
        writer = Writer(payload)
        for tile_id in range((4 ** (max_zoom + 1) - 1) // 3):
            tile = make_tile(*tileid_to_zxy(tile_id))
            if len(tile) > 512 * 1024:
                raise ValueError(f"Tile exceeds gateway range budget: {path.name} / {tile_id}")
            writer.write_tile(tile_id, tile)
        file_format = "webp" if tile_type == TileType.WEBP else "pbf"
        writer.finalize(
            {"tile_type": tile_type, "tile_compression": Compression.NONE, "min_zoom": 0, "max_zoom": max_zoom},
            {"name": layer, "attribution": "DWD ICON · Open-Meteo", "format": file_format},
        )


def render_frame(output, run, stamp, feed, index_path):
    started = time.monotonic()
    try:
        native_index = np.load(index_path, mmap_mode="r") if index_path else None
        fields = collect_fields(source_path(feed, run, stamp), native_index)
    except Exception as error:
        raise RuntimeError(f"Cannot read ICON frame {stamp.isoformat()}") from error
    wind = (fields.pop("wind_u"), fields.pop("wind_v"))
    fields["wind"] = wind
    for layer, field in fields.items():
        archive = output / f"{frame_id(stamp)}-{layer}.pmtiles"
        write_archive(archive, layer, MAX_ZOOM, TileType.WEBP, lambda z, x, y: raster_tile(field, layer, z, x, y))
        print(f"{archive.name} {archive.stat().st_size:,} bytes", flush=True)
    arrows = output / f"{frame_id(stamp)}-wind-direction.pmtiles"
    write_archive(arrows, "wind", WIND_ARROW_ZOOM, TileType.MVT, lambda z, x, y: wind_arrow_tile(wind, z, x, y))
    print(f"{arrows.name} {arrows.stat().st_size:,} bytes", flush=True)
    print(f"{stamp.isoformat()} rendered in {time.monotonic() - started:.1f}s", flush=True)


def manifest(run, frames):
    return {
        "version": 1,
        "run": frame_id(run),
        "frames": [frame_id(stamp) for stamp in frames],
        "model": MODEL,
        "maxZoom": MAX_ZOOM,
        "tileSize": TILE_SIZE,
        "palettes": PALETTES,
        "windArrowZoom": WIND_ARROW_ZOOM,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--run", action="store_true", help="Print the newest completed run ID")
    parser.add_argument("--expected-run", help="Abort if the upstream run changed")
    parser.add_argument("--frame", help="Generate one forecast frame for local verification")
    parser.add_argument("--jobs", type=int, default=3)
    parser.add_argument("--source", choices=["auto", REGULAR_FEED, NATIVE_FEED], default="auto")
    args = parser.parse_args()
    run, frames, feed = get_run(args.source)
    if args.run:
        print(frame_id(run))
        return
    if args.expected_run and args.expected_run != frame_id(run):
        raise ValueError("The upstream model run has advanced.")
    if args.frame:
        frames = [stamp for stamp in frames if frame_id(stamp) == args.frame]
    if not args.output or not frames:
        parser.error("Provide --output and an available forecast frame.")
    args.output.mkdir(exist_ok=True, parents=True)
    print(f"Publishing {feed} run {frame_id(run)}", flush=True)
    with TemporaryDirectory() as scratch:
        index_path = Path(scratch) / "native-index.npy" if feed == NATIVE_FEED else None
        if index_path:
            save_native_index(index_path)
        if len(frames) == 1:
            render_frame(args.output, run, frames[0], feed, index_path)
        else:
            with ProcessPoolExecutor(max_workers=args.jobs, mp_context=multiprocessing.get_context("spawn")) as pool:
                jobs = [pool.submit(render_frame, args.output, run, stamp, feed, index_path) for stamp in frames]
                for job in jobs:
                    job.result()
    (args.output / "manifest.json").write_text(json.dumps(manifest(run, frames), separators=(",", ":")))


if __name__ == "__main__":
    main()
