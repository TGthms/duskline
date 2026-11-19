import unittest

import numpy as np

from generate import GRID_SHAPE, TILE_SIZE, colorize, grid_coordinates, longitude_indices, project


class RasterTests(unittest.TestCase):
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


if __name__ == "__main__":
    unittest.main()
