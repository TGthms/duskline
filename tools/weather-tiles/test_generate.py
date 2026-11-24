import unittest
from datetime import datetime, timedelta, timezone
from unittest.mock import patch

import mapbox_vector_tile
import numpy as np
from scipy.spatial import cKDTree

from generate import (GRID_SHAPE, NATIVE_FEED, REGULAR_FEED, TILE_SIZE, colorize, get_run, grid_coordinates,
                      longitude_indices, nearest_cells, precipitation_pixels, project, unit_sphere, wind_arrow_tile)


class RasterTests(unittest.TestCase):
    def test_native_lookup_wraps_the_date_line_and_handles_polar_latitudes(self):
        tree = cKDTree(unit_sphere(np.array([0, 0, 89.9]), np.array([179.9, -175, 90])))
        self.assertEqual(nearest_cells(tree, [0, 0, 89.9], [-179.9, -175, -90]).tolist(), [0, 1, 2])

    @patch("generate.feed_run")
    def test_newer_native_run_replaces_the_legacy_run_and_survives_its_removal(self, feed_run):
        now = datetime(2026, 11, 30, tzinfo=timezone.utc)
        regular = (now - timedelta(hours=6), [], REGULAR_FEED)
        native = (now, [], NATIVE_FEED)
        feed_run.side_effect = [regular, native, OSError("offline"), native]
        self.assertEqual(get_run("auto"), native)
        self.assertEqual(get_run("auto"), native)

    def test_web_mercator_tile_edges_use_the_same_model_coordinates(self):
        top_rows, right_columns = grid_coordinates(1, 1, 0)
        bottom_rows, left_columns = grid_coordinates(1, 0, 1)
        self.assertGreater(top_rows[0], top_rows[-1])
        self.assertGreater(top_rows[-1], 720)
        self.assertLess(bottom_rows[0], 720)
        self.assertAlmostEqual(right_columns[0] - left_columns[-1], 360 / (2 * TILE_SIZE) / 0.125)
        west, east, fraction = longitude_indices(np.array([2878.0, 2879.0]))
        self.assertEqual(west.tolist(), [2878, 2878])
        self.assertEqual(east.tolist(), [0, 0])
        self.assertEqual(fraction.tolist(), [0.0, 0.5])

    def test_precipitation_does_not_interpolate_wetness_or_color_missing_values(self):
        field = np.zeros(GRID_SHAPE, dtype=np.float32)
        field[720:, :] = 0.1
        projected = project(field, 0, 0, 0, interpolate=False)
        midpoint = TILE_SIZE // 2
        self.assertTrue(np.all(projected[:midpoint] > 0))
        self.assertTrue(np.all(projected[midpoint:] == 0))
        painted = colorize(np.array([[0, 0.09, 0.1, 30, np.nan]]), "precipitation")
        self.assertEqual(painted[0, :, 3].tolist(), [0, 0, 255, 255, 0])
        np.testing.assert_array_equal(painted[0, 3, :3], [255, 196, 81])

    @patch("generate.project")
    def test_precipitation_edges_use_coverage_without_diluting_rain_intensity(self, projection):
        samples = np.zeros((TILE_SIZE * 2, TILE_SIZE * 2), dtype=np.float32)
        samples[:2, :2] = [[5, 0], [np.nan, 0.09]]
        samples[:2, 2:4] = 5
        projection.return_value = samples
        pixels = precipitation_pixels(None, 3, 0, 0)
        self.assertEqual(pixels[0, :3, 3].tolist(), [64, 255, 0])
        np.testing.assert_array_equal(pixels[0, 0, :3], pixels[0, 1, :3])

    def test_wind_arrows_point_in_the_direction_of_travel_and_omit_calm(self):
        calm = np.zeros(GRID_SHAPE, dtype=np.float32)
        breeze = np.full(GRID_SHAPE, 5, dtype=np.float32)
        def features(east, north):
            tile = wind_arrow_tile((east, north), 0, 0, 0)
            return mapbox_vector_tile.decode(tile, default_options={"y_coord_down": True})["wind"]["features"]
        self.assertFalse(features(calm, calm))
        arrows = features(breeze, calm)
        self.assertEqual(len(arrows), 49)
        self.assertEqual(arrows[0]["geometry"]["coordinates"], [293, 293])
        self.assertEqual({feature["properties"]["bearing"] for feature in arrows}, {90})
        self.assertEqual({feature["properties"]["bearing"] for feature in features(calm, -breeze)}, {180})


if __name__ == "__main__":
    unittest.main()
