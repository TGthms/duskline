# Map performance stabilization

The independent source review identified repeated interpolation, per-pixel allocations, repeated city-source updates, and hidden animations. The optimized map preserves the 6×6 sampling grid, 98×49 phone raster at 390px, 180×90 desktop cap, color stops, alpha, interpolation formula, linear raster sampling, antialiasing, and map pixel density.

## Raster work

Spatial weights use a single Float64 table for the current dimensions and sample positions. Raw weights and point order retain the original arithmetic, including the nearest-point threshold and missing-data behavior. Each frame reads its 36 forecast values once, blends the cached weights, and writes directly into the reused ImageData buffer. The canvas and buffer persist across layer/time changes; unchanged frames skip upload. Closing or falling back releases the renderer buffers. The weight table costs approximately 1.4 MiB at phone resolution and 4.6 MiB at the desktop cap.

Twelve baseline RGBA hashes captured from revision `181a697` match exactly: all three layers, both resolutions, with complete and partially missing data. Tests also verify sample-read counts and clearing old pixels when all values are unavailable.

Run `npm run benchmark:map` to compare the checked-in original CPU kernel with the current one. Both run in the same native JavaScript realm, with 12 varying-hour iterations and three warmups. Every frame is checked for identical output. A representative Node v24.18.0 / macOS arm64 run measured:

| Viewport | Layer | Original median | Optimized median |
| --- | --- | ---: | ---: |
| 390px | Temperature | 2.06ms | 0.56ms |
| 390px | Precipitation | 2.91ms | 0.60ms |
| 390px | Wind | 2.82ms | 0.59ms |
| 1440px | Temperature | 9.96ms | 1.91ms |
| 1440px | Precipitation | 9.64ms | 1.84ms |
| 1440px | Wind | 9.69ms | 1.88ms |

This is a synthetic CPU-kernel measurement. Canvas uploads, WebGL drawing, networking, battery use, and device temperature are outside its scope. The full-screen WebGL renderer still has a cost during dragging; a target-device profile should precede changes to rendering quality.

## City updates and lifecycle

Place updates coalesce into one animation-frame flush. Relevant data signatures prevent redundant DOM work and GeoJSON `setData` calls. Keyed buttons retain focus and avoid dropping clicks; marker selection uses coordinate identity rather than an index that can change during a worker update. The offline atlas image and markers are retained across data updates.

Queued weather requests and raster work pause while the document is hidden and resume at current bounds. A matching in-flight grid request is reused. The 520ms debounce, 2.5-second network throttle (including stale cache entries), four-grid cache, and 20-second request deadline remain in effect. Hidden sky pseudo-elements pause beneath the map.

Cold loading has a deadline covering both the library and stylesheet. Failed/stalled stylesheet links are removed so a later open can retry. Generations prevent an earlier open from creating a second renderer after close/reopen. A healthy loaded map continues working while the user pans; ordinary rendering activity no longer triggers the old idle-based fallback deadline. Weather progress remains active through the grid fetch. Fallback cancels remaining field work and releases buffers.

Browser regressions exercise real MapLibre handlers and source uploads, coalescing, stable place buttons, canvas/ImageData reuse, duplicate-frame suppression, visibility suspension, cold-open races, stalled stylesheet recovery, and matching in-flight requests. GPU-unavailable runners verify the geographic offline atlas path.
