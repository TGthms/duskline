"""Build immutable XYZ WebP archives from Open-Meteo's spatial ICON forecast."""

import argparse
import asyncio
from concurrent.futures import ProcessPoolExecutor
from datetime import datetime, timedelta, timezone
import io
import json
import multiprocessing
from pathlib import Path
import time
from urllib.request import urlopen

import aiohttp
from fsspec.core import OpenFile
from fsspec.implementations.http import HTTPFileSystem
import numpy as np
from omfiles import OmFileReader
from PIL import Image
from pmtiles.tile import Compression, TileType, tileid_to_zxy
from pmtiles.writer import Writer


SPATIAL = "https://openmeteo.s3.amazonaws.com/data_spatial/dwd_icon/"
MODEL = "DWD ICON"
GRID_SHAPE = (1441, 2879)
GRID_STEP = 0.125
TILE_SIZE = 512
MAX_ZOOM = 3
HOUR = timedelta(hours=1)
VARIABLES = {"temperature": "temperature_2m", "precipitation": "precipitation"}
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


def collect_fields(url):
    filesystem = SpatialFileSystem()
    fields = {}
    with OmFileReader(OpenFile(filesystem, url)) as root:
        for layer, name in VARIABLES.items():
            reader = root.get_child_by_name(name)
            if reader.shape != GRID_SHAPE:
                raise ValueError(f"Unexpected ICON grid for {name}: {reader.shape}")
            field = reader[:, :]
            if np.count_nonzero(np.isfinite(field)) < field.size * 0.99:
                raise ValueError(f"Incomplete ICON field: {name}")
            fields[layer] = field
    return fields


def model_time(value):
    return datetime.fromisoformat(value).astimezone(timezone.utc)


def frame_id(stamp):
    return stamp.strftime("%Y%m%d%H")


def source_path(run, stamp):
    return f"{SPATIAL}{run:%Y/%m/%d/%H%MZ}/{stamp:%Y-%m-%dT%H%M}.om"


def get_run():
    with urlopen(SPATIAL + "latest.json", timeout=30) as response:
        metadata = json.load(response)
    run = model_time(metadata["reference_time"])
    frames = [run + offset * HOUR for offset in range(1, 25)]
    valid = set(map(model_time, metadata["valid_times"]))
    if not metadata["completed"] or not set(VARIABLES.values()).issubset(metadata["variables"]):
        raise ValueError("The published ICON model run is incomplete.")
    if not all(stamp in valid for stamp in frames):
        raise ValueError("The published ICON run is missing hourly frames.")
    return run, frames


def grid_coordinates(z, x, y):
    side = TILE_SIZE << z
    pixel_centers = np.arange(TILE_SIZE) + 0.5
    longitude = (x * TILE_SIZE + pixel_centers) * 360 / side - 180
    mercator = np.pi * (1 - 2 * (y * TILE_SIZE + pixel_centers) / side)
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


def project(field, z, x, y, *, interpolate):
    rows, columns = grid_coordinates(z, x, y)
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
    step = 0.5 if layer == "temperature" else 0.1
    quantized = np.rint(values / step) * step
    rgba = np.empty((*values.shape, 4), dtype=np.uint8)
    for channel in range(3):
        rgba[..., channel] = np.rint(np.interp(quantized, stops, [color[channel] for color in colors]))
    if layer == "precipitation":
        finite &= values >= stops[0] - 1e-6
    rgba[..., 3] = np.where(finite, 255, 0)
    return rgba


def write_archive(path, field, layer):
    with path.open("wb") as payload:
        writer = Writer(payload)
        for tile_id in range((4 ** (MAX_ZOOM + 1) - 1) // 3):
            z, x, y = tileid_to_zxy(tile_id)
            rgba = colorize(project(field, z, x, y, interpolate=layer == "temperature"), layer)
            buf = io.BytesIO()
            Image.fromarray(rgba).save(buf, format="WEBP", lossless=True, method=3)
            writer.write_tile(tile_id, buf.getvalue())
        writer.finalize(
            {"tile_type": TileType.WEBP, "tile_compression": Compression.NONE,
             "min_zoom": 0, "max_zoom": MAX_ZOOM},
            {"name": layer, "attribution": "DWD ICON · Open-Meteo", "format": "webp"},
        )


def render_frame(output, run, stamp):
    started = time.monotonic()
    try:
        fields = collect_fields(source_path(run, stamp))
    except Exception as error:
        raise RuntimeError(f"Cannot read ICON frame {stamp.isoformat()}") from error
    for layer, field in fields.items():
        archive = output / f"{frame_id(stamp)}-{layer}.pmtiles"
        write_archive(archive, field, layer)
        print(f"{archive.name} {archive.stat().st_size:,} bytes", flush=True)
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
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--run", action="store_true", help="Print the newest completed run ID")
    parser.add_argument("--expected-run", help="Abort if the upstream run changed")
    parser.add_argument("--frame", help="Generate one forecast frame for local verification")
    parser.add_argument("--jobs", type=int, default=3)
    args = parser.parse_args()
    run, frames = get_run()
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
    if len(frames) == 1:
        render_frame(args.output, run, frames[0])
    else:
        with ProcessPoolExecutor(max_workers=args.jobs, mp_context=multiprocessing.get_context("spawn")) as pool:
            jobs = [pool.submit(render_frame, args.output, run, stamp) for stamp in frames]
            for job in jobs:
                job.result()
    (args.output / "manifest.json").write_text(json.dumps(manifest(run, frames), separators=(",", ":")))


if __name__ == "__main__":
    main()
