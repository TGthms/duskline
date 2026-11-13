# duskline — 60-second product film

Status: storyboard draft for approval. Scene implementation, Studio preview, still rendering, and MP4 export follow approval.

## Format and creative direction

- Master: 1920 × 1080, 16:9, 60 fps, exactly 3,600 frames.
- Audio: instrumental music with short on-screen headlines; no voiceover. Use an original or licensed track with restrained electronic pulses, warm pads, and a gentle lift into the map reveal. Resolve quietly under the end card.
- Story: your sky → your plans → the details → the world → awareness → duskline.
- Default units: Celsius. Demonstrate a real unit preference change to Fahrenheit and back.
- Presentation: a cinematic product film built from duskline's UI, with enlarged feature close-ups and occasional device framing. Keep one primary idea per shot, generous negative space, and readable holds.
- New headlines belong to the video only. Product labels and translated UI come from the existing catalogs.

## Workspace findings and reuse

The repository is the existing duskline weather app, a static HTML/CSS/classic JavaScript application, not a React application. There is no existing Remotion project. Build the approved video in an isolated `weather-demo-video/` project with React, TypeScript, Remotion, Tailwind, and Lucide where needed. Port the relevant app markup and styles into presentational React components; preserve recognizable hierarchy, labels, weather icons, and behavior. Do not import the app's DOM-owning runtime into Remotion.

Use these first-party sources:

| Source | Reuse |
| --- | --- |
| `assets/duskline-icon-512.png` | Existing app icon and sunset identity |
| `src/css/duskline.css` | Actual brand palette and chrome |
| `src/css/weather-product.css`, `src/js/features/weather/product.js` | My Sky, hourly strip, 5-day preview, saved places |
| `src/js/features/weather/app.js`, `forecast-sheet.js`, `charts.js` | City detail, full 10-day forecast, hourly charts, metric sheets, Units |
| `src/js/features/weather/aqi.js` | AQI scale and pollutant detail |
| `src/js/features/weather/map.js`, `src/css/weather-map.css` | Forecast map, layer controls, time scrubber, legend |
| `src/js/features/weather/alerts.js`, `primary-alerts.js`, `push-notifications.js` | Alert summaries, expanded warning, notification preferences |
| `src/js/data/weather-packs/` | Existing localized product labels |
| `e2e/visual-baselines/chromium/` | Reference for real desktop and mobile layouts |

The brand layer overrides the older editorial theme in `tokens.css`: use duskline's cyan/violet identity rather than the legacy brass palette.

## Visual and motion system

- Background: `#070B14` → `#0F172A`, incorporating duskline's `#08111F` night tone. Soft, low-opacity cyan `#7DD3FC` and violet `#A78BFA` radial illumination; a restrained warm horizon echoes the actual icon.
- Glass: panels based on `rgba(11,26,47,.72)`, `backdrop-filter: blur(24px)`, `1px solid rgba(255,255,255,.12)`, subtle inner highlight and soft shadow. Preserve a dark backing wherever the atmosphere would reduce text contrast.
- Typography: SF Pro/system stack with bundled Inter fallback for predictable rendering. White primary text, duskline `#EAF3FF` secondary highlights, and `#9EB2CB` muted text where contrast permits. Display tracking `-0.03em`; body tracking near zero; tabular weather numerals. Preserve the lowercase duskline wordmark.
- At 1080p: headlines approximately 88–112px, hero temperatures 180–220px, featured UI values 48–72px, readable UI labels 28–36px. Maintain at least 120px horizontal and 100px vertical safe margins for essential content. Dense UI is enlarged for feature shots rather than shrunk to fit.
- Springs: Remotion `spring()` with damping 200 and overshoot clamping. Eased camera, masks, chart reveals, and fades use `Easing.bezier(0.22,1,0.36,1)`. No linear easing or bounce.
- Card arrivals: 6–8-frame stagger, approximately 36–48-frame settle. Settle before the reading hold.
- Camera: restrained scale changes, generally 1.00 → 1.06, and perspective around 1600px. Maximum card tilt about 4°; settle toward a front-facing view before reading. Avoid rotating charts or text during reading holds.
- Continuity: keep city names and key values spatially anchored across related shots. Feature sheets grow from their trigger and return along the same path. Transition overlaps are included in the 60-second master, never added on top.
- All motion and atmosphere are driven by the Remotion frame. Freeze time and seed all procedural effects for repeatable renders.

## Storyboard

The ranges below are master-timeline intervals; frame intervals are start-inclusive and end-exclusive.

| Time / frames | Scene and on-screen headline | Picture, action, and motion |
| --- | --- | --- |
| **0:00–0:05** / **0–300** | **01 · Brand reveal** — “Weather, beautifully clear.” | Begin in midnight. A slim warm horizon illuminates the existing duskline icon. The lowercase wordmark and headline settle into view. A luminous edge resolves into the My Sky card for the next shot. Hold the complete identity for the final two seconds. |
| **0:05–0:13** / **300–780** | **02 · My Sky** — “Start with your sky.” | A broad glass My Sky surface eases from a shallow 3D angle into a readable front view: San Francisco, **17°C**, partly cloudy, **H:19° L:13°**. Hourly icons and the genuine **5-day preview** appear in a restrained stagger. Close in on the rain-planning summary: **85% · 6–9 PM · 1.8 mm**. Cloud cover and the sky tint support the changing forecast. |
| **0:13–0:22** / **780–1320** | **03 · Forecast depth** — “The next hour. The next ten days.” | Open **View forecast**. The full **10-Day Forecast** becomes the hero, with aligned temperature ranges and rain probabilities. Select tomorrow; the corresponding day sheet expands from that row. A temperature curve and precipitation bars reveal with a single eased sweep. Highlight the evening rain window, then give the chart a clear reading hold. No minute-by-minute precipitation claim. |
| **0:22–0:30** / **1320–1800** | **04 · Conditions and units** — “Every detail, in perspective.” | Bring AQI, wind, UV, and sunset into a clean 2×2 close-up: **US AQI 28 · Good**, **SW 14 km/h**, **UV 1 · Low**, **Sunset 4:59 PM**. Briefly emphasize the real AQI scale. At about 0:26, open the actual **Units** settings surface; select **°F** and show **17°C → 63°F**, then return to **°C** before continuing. Keep the setting and affected reading visible together. |
| **0:30–0:39** / **1800–2340** | **05 · Forecast maps** — “See what’s moving in.” | The forecast surface recedes into a wide, dark map of the Bay Area and Pacific coast. Begin on **Chance of precipitation** with a clearly labeled forecast overlay. Scrub **Now → +6h** to reveal the incoming rain band. Switch to **Temperature** for the final beat; **Wind** and **US AQI** remain recognizable available tabs. Keep the legend, time, and map/data attribution visible. Use a local or properly attributed map asset; depict forecast fields rather than observational radar. |
| **0:39–0:46** / **2340–2760** | **06 · Horizon** — “Your places. One horizon.” | Pull back into the actual **Horizon** city-card language: San Francisco **17°**, London **9°**, Tokyo **16°**, Sydney **24°**, each with its own local time and weather. Save Tokyo and show it among saved places. A compact language-picker action briefly switches existing labels to Japanese, then back to English; the support line reads **“30 languages. A world of weather.”** Keep the city cards readable rather than turning them into a fast carousel. |
| **0:46–0:54** / **2760–3240** | **07 · Alerts** — “Stay aware as conditions change.” | Move to a saved Seattle forecast with a fictional **High Wind Warning**. The amber alert summary expands into the existing warning presentation, including source, affected area, and validity. A persistent **Demo data** label identifies the fictional conditions. Then show the actual optional US notification preferences, including selected places, severity filters, and quiet hours. Supporting copy: **“Optional US weather notifications.”** Use a calm accent and single restrained sound cue. Do not depict delivered push notifications as a verified device event. |
| **0:54–1:00** / **3240–3600** | **08 · Return and close** — “Your sky, wherever you are.” → **“duskline”** | For roughly two seconds, return to My Sky in a minimal device frame with the genuine saved/offline state and its original check time visible. Then simplify to the app icon, lowercase wordmark, original **“Weather, beautifully clear.”** tagline, and **dusklineweather.pages.dev**. Keep the end card stable for the final three seconds as the music resolves. |

## Demo-data continuity

Use one deterministic fictional fixture anchored at **November 12, 2026, 16:00 America/Los_Angeles**. Data is for storytelling, not a current forecast. The same city and hour must agree across My Sky, detail, charts, and map.

- San Francisco: 17°C; partly cloudy; feels like 16°C; high 19°C / low 13°C. Hourly temperatures at 16:00–23:00: **17, 16, 15, 14, 14, 13, 13, 13°C**. Rain probabilities: **10, 25, 65, 85, 80, 25, 20, 10%**. Keep the displayed 18:00–21:00 rain window and 1.8 mm accumulation consistent with the fixture's planner calculation.
- Full ten-day low/high pairs in °C: **13/19, 12/18, 12/17, 11/18, 12/20, 13/21, 13/20, 12/18, 11/17, 12/19**. The My Sky preview uses the next five dates, excluding today, matching the app.
- Metrics: US AQI 28; UV 1 at the anchored hour; SW wind 14 km/h; humidity 72%; pressure 1016 hPa; sunset 16:59. Any detail charts or forecast maxima must explain, rather than contradict, these current readings.
- The same absolute instant is **00:00 Friday in London**, **09:00 Friday in Tokyo**, and **11:00 Friday in Sydney**. Seattle remains **16:00 Thursday**. Preserve each place's timezone and day/night presentation.
- Seattle: rain, 11°C, fictional high-wind warning with gusts up to 95 km/h, valid until 23:00 local. Keep the warning explicitly labeled as demo data; do not reuse a real alert identifier or imply a live warning.
- Units: 17°C displays as 63°F with the app's rounding. Return to Celsius globally before the map and city montage. Convert wind/precipitation only when their own preference changes.
- Offline: show saved forecast/check time; public alerts require a connection. Do not carry an apparently live warning into the offline closing shot.

## Modular implementation after approval

Create a master composition plus separately previewable scene components: `BrandReveal`, `MySky`, `ForecastDepth`, `ConditionsAndUnits`, `ForecastMap`, `Horizon`, `WeatherAlerts`, and `Closing`. Give each scene its own file and editable timeline entry. Share `Atmosphere`, `GlassPanel`, `WeatherIcon`, `DeviceFrame`, `Headline`, and deterministic fixture helpers.

The video project is authoring infrastructure, outside the shipped weather runtime. Existing app scripts, locale packs, service-worker shell, and visual baselines require no changes for this plan. If subsequent implementation changes the actual app, apply the repository's runtime, translation, and validation requirements to those changes.

## Verification and delivery after approval

1. Start Remotion Studio as soon as the scaffold runs, then implement scenes with its preview available.
2. Before a full render, render PNG stills at master frames **180, 570, 1080, 1410, 1635, 1725, 2070, 2520, 2670, 2850, 3120, 3280, 3480**, plus transition boundaries and their midpoint frames. These cover the hero, chart, both unit states, map, language state, warning, preferences, offline state, and end card. Adjust sample points if approved timing changes.
3. Inspect the rendered PNGs at full resolution for text clipping, overlap, glass contrast, chart labels, local dates/times, units, alert attribution, and safe margins. Check the smallest text at typical playback size. Correct flaws and rerender affected stills before export.
4. Review complete playback for pacing, readable holds, spatial continuity, eased motion, correct 60 fps timing, and synchronized audio. Still images alone do not validate motion.
5. After preview and still verification passes, export H.264 MP4 at 1920 × 1080, 60 fps, targeting approximately **20–30 Mb/s**, with high-quality audio. Check final metadata, duration, beginning/end frames, and full audio/video playback. Deliver the MP4, selected stills, and reusable Remotion source.
6. Report browser/render checks as such. Do not claim physical-device notification receipt, haptics, VoiceOver, Home Screen behavior, or production acceptance from a rendered demonstration.
