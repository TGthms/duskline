'use strict';
/* duskline weather map. MapLibre and its CSS are loaded only when the map opens. */
(function (global) {
  var W = global.DusklineWeather;
  if (!W || !W.active) return;

  W.factories.map = function createWeatherMap(deps) {
    deps = deps || {};
    var root = document.getElementById('weatherMap');
    var canvasHost = document.getElementById('weatherMapCanvas');
    var fallbackHost = document.getElementById('weatherMapFallback');
    var statusHost = document.getElementById('weatherMapStatus');
    var closeButton = document.getElementById('weatherMapClose');
    var zoomInButton = document.getElementById('weatherMapZoomIn');
    var zoomOutButton = document.getElementById('weatherMapZoomOut');
    var mapControls = root && root.querySelector('.weather-map-control-stack');
    var layerHost = document.getElementById('weatherMapLayers');
    var placesHost = document.getElementById('weatherMapPlaces');
    var timeInput = document.getElementById('weatherMapTime');
    var timeOutput = document.getElementById('weatherMapTimeOutput');
    var timeLabel = document.getElementById('weatherMapTimeLabel');
    var legendTitle = document.getElementById('weatherMapLegendTitle');
    var legendGradient = document.getElementById('weatherMapGradient');
    var legendValues = document.getElementById('weatherMapLegendValues');
    var credit = document.getElementById('weatherMapCredit');
    var map = null;
    var mapLibraryPromise = null;
    var isOpen = false;
    var styleReady = false;
    var fallbackActive = false;
    var tileErrors = 0;
    var mapTimeZone = 'UTC';
    var selectedLayer = 'temperature';
    var selectedOffset = 0;
    var baseIndex = 0;
    var maxOffset = 12;
    var places = [];
    var activeGrid = null;
    var activeController = null;
    var moveTimer = 0;
    var styleTimer = 0;
    var requestTimer = 0;
    var returnFocus = null;
    var previousStyles = null;
    var previousInert = [];
    var activeRequestKey = '';
    var lastGridRequestAt = 0;
    var cachedGrids = new Map();
    var RASTER_ID = 'duskline-weather-field';
    var GRID_ID = 'duskline-weather-grid';
    var CITY_SOURCE = 'duskline-weather-places';
    var STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';
    var MAPLIBRE_CSS = 'assets/vendor/maplibre-gl/maplibre-gl.css';
    var GRID_STEPS = 6;

    function t(key, fallback) {
      return typeof deps.t === 'function' ? deps.t(key, fallback) : (fallback || key);
    }
    function escapeHtml(value) {
      if (typeof deps.escapeHtml === 'function') return deps.escapeHtml(value);
      return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
      });
    }
    function reducedMotion() {
      if (typeof deps.motionLevel === 'function' && deps.motionLevel() !== 'full') return true;
      return !!(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }
    function selectedCity(options) {
      return options && options.initialCity || places[0] && places[0].city || { name: 'New York', lat: 40.713, lon: -74.006 };
    }
    function setStatus(message, visible) {
      if (!statusHost) return;
      statusHost.textContent = message || '';
      statusHost.hidden = !visible || !message;
    }
    function setBusy(busy) {
      if (!root) return;
      if (busy) root.setAttribute('aria-busy', 'true');
      else root.removeAttribute('aria-busy');
    }
    function lockBackground() {
      previousStyles = {
        htmlOverflow: document.documentElement.style.overflow,
        bodyOverflow: document.body.style.overflow
      };
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.documentElement.classList.add('weather-map-open');
      previousInert = [];
      ['navbar', 'main', 'dusklineFooter', 'weatherToast'].forEach(function (id) {
        var element = document.getElementById(id);
        if (!element) return;
        previousInert.push({ element: element, value: !!element.inert });
        element.inert = true;
      });
    }
    function unlockBackground() {
      document.documentElement.classList.remove('weather-map-open');
      if (previousStyles) {
        document.documentElement.style.overflow = previousStyles.htmlOverflow;
        document.body.style.overflow = previousStyles.bodyOverflow;
      }
      previousStyles = null;
      previousInert.forEach(function (row) { row.element.inert = row.value; });
      previousInert = [];
    }
    function close() {
      if (!isOpen) return;
      isOpen = false;
      clearTimeout(moveTimer);
      clearTimeout(styleTimer);
      clearTimeout(requestTimer);
      if (activeController) activeController.abort();
      activeController = null;
      if (map) {
        try { map.remove(); } catch (e) { /* tolerate partially initialized maps */ }
        map = null;
      }
      document.removeEventListener('keydown', onDialogKeydown, true);
      if (root) {
        root.classList.remove('is-open');
        root.setAttribute('aria-hidden', 'true');
        root.hidden = true;
        root.removeAttribute('aria-busy');
      }
      unlockBackground();
      setStatus('', false);
      if (returnFocus && returnFocus.isConnected) {
        try { returnFocus.focus({ preventScroll: true }); } catch (e) { returnFocus.focus(); }
      }
      returnFocus = null;
    }
    function focusableItems() {
      return root ? Array.prototype.slice.call(root.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), summary, [tabindex="0"]'
      )).filter(function (el) {
        return !el.hidden && el.getAttribute('aria-hidden') !== 'true' && el.getClientRects().length > 0;
      }) : [];
    }
    function onDialogKeydown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== 'Tab') return;
      var focusable = focusableItems();
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    function addStyleSheet() {
      return new Promise(function (resolve, reject) {
        var link = document.getElementById('weatherMapLibreCss');
        if (link && link.dataset.loaded === 'true') { resolve(); return; }
        if (!link) {
          link = document.createElement('link');
          link.id = 'weatherMapLibreCss';
          link.rel = 'stylesheet';
          link.href = MAPLIBRE_CSS;
          document.head.appendChild(link);
        }
        var done = function () { link.dataset.loaded = 'true'; resolve(); };
        link.addEventListener('load', done, { once: true });
        link.addEventListener('error', function () { reject(new Error('Map styles could not load.')); }, { once: true });
        if (link.sheet) done();
      });
    }
    function loadMapLibrary() {
      if (!mapLibraryPromise) {
        mapLibraryPromise = Promise.all([
          import('../../../../assets/vendor/maplibre-gl/maplibre-gl.mjs'),
          addStyleSheet()
        ]).then(function (result) { return result[0]; }).catch(function (error) {
          mapLibraryPromise = null;
          throw error;
        });
      }
      return mapLibraryPromise;
    }
    function mercatorY(latitude) {
      var radians = Math.max(-85.0511, Math.min(85.0511, latitude)) * Math.PI / 180;
      return Math.log(Math.tan(Math.PI / 4 + radians / 2));
    }
    function latitudeAtY(y) {
      return (2 * Math.atan(Math.exp(y)) - Math.PI / 2) * 180 / Math.PI;
    }
    function normalizeLongitude(longitude) {
      return ((longitude + 180) % 360 + 360) % 360 - 180;
    }
    function gridGeometry(bounds) {
      var west = bounds.getWest();
      var east = bounds.getEast();
      if (east <= west) east += 360;
      if (east - west > 360) east = west + 360;
      var north = Math.min(85.0511, bounds.getNorth());
      var south = Math.max(-85.0511, bounds.getSouth());
      if (north <= south) { north = Math.min(85.0511, south + 0.2); }
      var topY = mercatorY(north);
      var bottomY = mercatorY(south);
      var points = [];
      for (var y = 0; y < GRID_STEPS; y++) {
        for (var x = 0; x < GRID_STEPS; x++) {
          var fx = x / (GRID_STEPS - 1);
          var fy = y / (GRID_STEPS - 1);
          var rawLon = west + (east - west) * fx;
          points.push({
            x: fx,
            y: fy,
            latitude: Math.max(-85, Math.min(85, latitudeAtY(topY + (bottomY - topY) * fy))),
            longitude: normalizeLongitude(rawLon),
            hourly: null
          });
        }
      }
      var key = [west, east, north, south].map(function (value) { return value.toFixed(2); }).join(',');
      return {
        west: west, east: east, north: north, south: south,
        coordinates: [[west, north], [east, north], [east, south], [west, south]],
        points: points, key: key
      };
    }
    function makeGridUrl(geometry) {
      var params = new URLSearchParams();
      params.set('latitude', geometry.points.map(function (point) { return point.latitude.toFixed(4); }).join(','));
      params.set('longitude', geometry.points.map(function (point) { return point.longitude.toFixed(4); }).join(','));
      params.set('hourly', 'temperature_2m,precipitation_probability,wind_speed_10m');
      params.set('temperature_unit', 'celsius');
      params.set('wind_speed_unit', 'ms');
      params.set('timezone', 'GMT');
      params.set('cell_selection', 'nearest');
      params.set('forecast_days', '2');
      return 'https://api.open-meteo.com/v1/forecast?' + params.toString();
    }
    function valueAtOrNearNow(times) {
      if (!times || !times.length) return 0;
      var currentHour = Math.floor(Date.now() / 3600000) * 3600000;
      var result = times.findIndex(function (time) {
        var date = new Date(String(time) + 'Z').getTime();
        return Number.isFinite(date) && date >= currentHour;
      });
      return result >= 0 ? result : 0;
    }
    function fetchWeatherGrid(geometry) {
      var now = Date.now();
      var cached = cachedGrids.get(geometry.key);
      if (cached && now - cached.fetchedAt < 8 * 60 * 1000) {
        applyGrid(cached.grid);
        return Promise.resolve(cached.grid);
      }
      if (activeController) activeController.abort();
      clearTimeout(requestTimer);
      activeController = new AbortController();
      var controller = activeController;
      activeRequestKey = geometry.key;
      setStatus(t('weather.mapLoadingWeather', 'Loading nearby forecast…'), true);
      setBusy(true);
      requestTimer = setTimeout(function () { controller.abort(); }, 20000);
      return fetch(makeGridUrl(geometry), { signal: controller.signal, credentials: 'omit' }).then(function (response) {
        if (!response.ok) throw new Error('Forecast service returned ' + response.status);
        return response.json();
      }).then(function (payload) {
        if (!isOpen || controller !== activeController || activeRequestKey !== geometry.key) return null;
        clearTimeout(requestTimer);
        var locations = Array.isArray(payload) ? payload : [payload];
        if (!locations.length || locations[0].error) throw new Error(locations[0] && locations[0].reason || 'No forecast data.');
        geometry.points.forEach(function (point, index) {
          var location = locations[index];
          point.hourly = location && location.hourly || null;
        });
        var times = geometry.points[0] && geometry.points[0].hourly && geometry.points[0].hourly.time || [];
        var index = valueAtOrNearNow(times);
        var grid = { geometry: geometry, times: times, baseIndex: index, fetchedAt: Date.now() };
        cachedGrids.set(geometry.key, { grid: grid, fetchedAt: Date.now() });
        while (cachedGrids.size > 4) cachedGrids.delete(cachedGrids.keys().next().value);
        applyGrid(grid);
        return grid;
      }).catch(function (error) {
        if (error && error.name === 'AbortError') {
          if (isOpen && controller === activeController) {
            setStatus(t('weather.mapWeatherUnavailable', 'Weather layers are unavailable right now.'), true);
            setBusy(false);
          }
          return null;
        }
        if (isOpen && controller === activeController) {
          setStatus(t('weather.mapWeatherUnavailable', 'Weather layers are unavailable right now.'), true);
          setBusy(false);
          if (fallbackActive) renderFallbackPlaces();
        }
        return null;
      }).finally(function () {
        if (controller === activeController) {
          activeController = null;
          clearTimeout(requestTimer);
        }
      });
    }
    function selectedDataValue(point, layer, index) {
      if (!point || !point.hourly) return null;
      var key = layer === 'temperature' ? 'temperature_2m'
        : layer === 'precipitation' ? 'precipitation_probability' : 'wind_speed_10m';
      var series = point.hourly[key] || [];
      var value = series[index];
      return value == null || !Number.isFinite(Number(value)) ? null : Number(value);
    }
    function palette(layer, value) {
      if (!Number.isFinite(value)) return [0, 0, 0, 0];
      var stops;
      if (layer === 'temperature') {
        stops = [[-20, [64, 98, 202, 185]], [-5, [56, 156, 221, 190]], [8, [76, 202, 201, 188]],
          [18, [173, 222, 113, 194]], [28, [255, 199, 70, 202]], [40, [235, 86, 68, 210]]];
      } else if (layer === 'precipitation') {
        if (value < 8) return [0, 0, 0, 0];
        stops = [[8, [109, 203, 255, 72]], [25, [50, 176, 241, 120]], [50, [63, 122, 232, 165]],
          [75, [91, 83, 207, 190]], [100, [153, 78, 214, 210]]];
      } else {
        if (value < 2) return [0, 0, 0, 0];
        stops = [[2, [73, 176, 217, 75]], [6, [79, 205, 183, 130]], [12, [190, 218, 97, 175]],
          [18, [255, 167, 72, 198]], [26, [228, 80, 95, 214]]];
      }
      if (value <= stops[0][0]) return stops[0][1];
      if (value >= stops[stops.length - 1][0]) return stops[stops.length - 1][1];
      for (var i = 0; i < stops.length - 1; i++) {
        var left = stops[i], right = stops[i + 1];
        if (value < left[0] || value > right[0]) continue;
        var mix = (value - left[0]) / (right[0] - left[0]);
        return left[1].map(function (channel, channelIndex) {
          return Math.round(channel + (right[1][channelIndex] - channel) * mix);
        });
      }
      return [0, 0, 0, 0];
    }
    function interpolatedValue(grid, x, y, layer, hourIndex) {
      var weighted = 0;
      var weightSum = 0;
      for (var i = 0; i < grid.geometry.points.length; i++) {
        var point = grid.geometry.points[i];
        var value = selectedDataValue(point, layer, hourIndex);
        if (value == null) continue;
        var dx = x - point.x;
        var dy = y - point.y;
        var distance = dx * dx + dy * dy;
        if (distance < 0.00001) return value;
        var weight = 1 / (distance * distance);
        weighted += value * weight;
        weightSum += weight;
      }
      return weightSum > 0 ? weighted / weightSum : null;
    }
    function drawWeatherImage(grid) {
      if (!grid || !grid.geometry) return;
      var width = 180;
      var height = 90;
      var canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      var context = canvas.getContext('2d', { alpha: true });
      if (!context) return;
      var image = context.createImageData(width, height);
      var hourIndex = Math.min(grid.times.length - 1, grid.baseIndex + selectedOffset);
      if (hourIndex < 0) hourIndex = 0;
      for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
          var value = interpolatedValue(grid, x / (width - 1), y / (height - 1), selectedLayer, hourIndex);
          var color = palette(selectedLayer, value);
          var index = (y * width + x) * 4;
          image.data[index] = color[0];
          image.data[index + 1] = color[1];
          image.data[index + 2] = color[2];
          image.data[index + 3] = color[3];
        }
      }
      context.putImageData(image, 0, 0);
      if (map && map.getSource(RASTER_ID)) {
        try {
          map.getSource(RASTER_ID).updateImage({ image: canvas, coordinates: grid.geometry.coordinates });
          var raster = map.getLayer(RASTER_ID);
          if (raster) map.setPaintProperty(RASTER_ID, 'raster-opacity', selectedLayer === 'precipitation' ? 0.76 : 0.68);
        } catch (error) { /* map may close between the draw and source update */ }
      }
    }
    function formatTime(iso) {
      if (!iso) return t('weather.now', 'Now');
      var stamp = new Date(String(iso) + 'Z');
      if (!Number.isFinite(stamp.getTime())) return String(iso).slice(-5);
      try {
        var options = { hour: 'numeric', minute: '2-digit', timeZone: mapTimeZone, timeZoneName: 'short' };
        return stamp.toLocaleTimeString(typeof deps.localeTag === 'function' ? deps.localeTag() : 'en-US', options);
      } catch (e) { return stamp.toLocaleTimeString([], { hour: 'numeric' }); }
    }
    function syncTimeControl(grid) {
      if (!timeInput) return;
      var available = Math.max(0, (grid.times || []).length - grid.baseIndex - 1);
      maxOffset = Math.min(12, available);
      selectedOffset = Math.max(0, Math.min(selectedOffset, maxOffset));
      timeInput.max = String(maxOffset);
      timeInput.value = String(selectedOffset);
      timeInput.disabled = maxOffset < 1;
      var stampIndex = Math.min(grid.times.length - 1, grid.baseIndex + selectedOffset);
      var text = selectedOffset === 0 ? t('weather.now', 'Now') : formatTime(grid.times[stampIndex]);
      if (timeOutput) timeOutput.textContent = text;
      if (timeLabel) timeLabel.textContent = t('weather.mapForecastHour', 'Forecast hour · UTC');
    }
    function legendForLayer(layer) {
      var title = layer === 'temperature' ? t('settings.temperature', 'Temperature')
        : layer === 'precipitation' ? t('weather.chanceOfPrecipitation', 'Chance of precipitation')
          : t('weather.wind', 'Wind');
      if (legendTitle) legendTitle.textContent = title;
      if (legendGradient) legendGradient.dataset.layer = layer;
      if (legendValues) {
        var values = layer === 'temperature'
          ? (deps.useF && deps.useF() ? [-4, 14, 32, 50, 68, 86, 104] : [-20, -5, 8, 18, 28, 40])
          : layer === 'precipitation' ? [0, 25, 50, 75, 100] : [0, 5, 10, 15, 20, 25];
        legendValues.textContent = values.map(function (value) {
          if (layer === 'temperature') return typeof deps.fmtTemp === 'function' ? deps.fmtTemp(deps.useF && deps.useF() ? (value - 32) * 5 / 9 : value) : value + '°';
          if (layer === 'precipitation') return value + '%';
          return typeof deps.fmtWind === 'function' ? deps.fmtWind(value) : value + ' m/s';
        }).join('  ');
      }
    }
    function applyGrid(grid) {
      if (!grid || !isOpen) return;
      activeGrid = grid;
      baseIndex = grid.baseIndex;
      if (map && map.getSource(RASTER_ID)) drawWeatherImage(grid);
      syncTimeControl(grid);
      legendForLayer(selectedLayer);
      setStatus('', false);
      setBusy(false);
    }
    function requestVisibleWeather() {
      if (!map || !styleReady || fallbackActive || !isOpen) return;
      var geometry;
      try { geometry = gridGeometry(map.getBounds()); } catch (e) { return; }
      var cached = cachedGrids.get(geometry.key);
      var wait = 2500 - (Date.now() - lastGridRequestAt);
      if (!cached && lastGridRequestAt && wait > 0) {
        clearTimeout(moveTimer);
        moveTimer = setTimeout(requestVisibleWeather, wait);
        return;
      }
      if (!cached) lastGridRequestAt = Date.now();
      fetchWeatherGrid(geometry);
    }
    function queueVisibleWeather() {
      clearTimeout(moveTimer);
      moveTimer = setTimeout(requestVisibleWeather, 520);
    }
    function installWeatherRaster(library) {
      var bounds = map.getBounds();
      var geometry = gridGeometry(bounds);
      var transparent = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
      map.addSource(RASTER_ID, {
        type: 'image', url: transparent,
        coordinates: geometry.coordinates
      });
      var symbol = (map.getStyle().layers || []).find(function (layer) { return layer.type === 'symbol'; });
      var raster = {
        id: RASTER_ID, type: 'raster', source: RASTER_ID,
        paint: { 'raster-opacity': 0.68, 'raster-fade-duration': 0, 'raster-resampling': 'linear' }
      };
      if (symbol) map.addLayer(raster, symbol.id);
      else map.addLayer(raster);
      installCityLayer(library);
      requestVisibleWeather();
    }
    function placeGeoJson() {
      return {
        type: 'FeatureCollection',
        features: places.filter(function (item) {
          return item && item.city && Number.isFinite(Number(item.city.lat)) && Number.isFinite(Number(item.city.lon));
        }).map(function (item, index) {
          return {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [Number(item.city.lon), Number(item.city.lat)] },
            properties: {
              placeIndex: index,
              name: String(item.name || item.city.name || ''),
              saved: item.saved ? 1 : 0,
              temperature: item.temperature == null ? '' : Number(item.temperature)
            }
          };
        })
      };
    }
    function selectPlace(index) {
      var item = places[Number(index)];
      if (!item || !item.city || typeof deps.onSelectCity !== 'function') return;
      deps.onSelectCity(item.city);
    }
    function installCityLayer(library) {
      var source = placeGeoJson();
      map.addSource(CITY_SOURCE, { type: 'geojson', data: source, cluster: true, clusterRadius: 40, clusterMaxZoom: 5 });
      map.addLayer({
        id: 'duskline-weather-place-clusters', type: 'circle', source: CITY_SOURCE,
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#203653', 'circle-opacity': 0.94, 'circle-radius': ['step', ['get', 'point_count'], 22, 10, 24, 30, 28],
          'circle-stroke-width': 1.5, 'circle-stroke-color': '#d7edff'
        }
      });
      map.addLayer({
        id: 'duskline-weather-cluster-count', type: 'symbol', source: CITY_SOURCE,
        filter: ['has', 'point_count'],
        layout: { 'text-field': ['get', 'point_count_abbreviated'], 'text-size': 11, 'text-font': ['Open Sans Semibold', 'Arial Unicode MS Regular'] },
        paint: { 'text-color': '#fff' }
      });
      map.addLayer({
        id: 'duskline-weather-city-targets', type: 'circle', source: CITY_SOURCE,
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#fff', 'circle-opacity': 0.01, 'circle-stroke-opacity': 0,
          'circle-radius': 22
        }
      });
      map.addLayer({
        id: 'duskline-weather-city-points', type: 'circle', source: CITY_SOURCE,
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': ['case', ['==', ['get', 'saved'], 1], '#fff', '#263c58'],
          'circle-radius': ['case', ['==', ['get', 'saved'], 1], 7, 5],
          'circle-stroke-width': 1.5, 'circle-stroke-color': '#17314d', 'circle-opacity': 0.98
        }
      });
      map.on('click', 'duskline-weather-place-clusters', function (event) {
        var feature = event.features && event.features[0];
        if (!feature) return;
        var sourceRef = map.getSource(CITY_SOURCE);
        sourceRef.getClusterExpansionZoom(feature.properties.cluster_id).then(function (zoom) {
          if (!map) return;
          map.easeTo({ center: feature.geometry.coordinates, zoom: zoom, duration: reducedMotion() ? 0 : 480 });
        }).catch(function () {});
      });
      map.on('click', 'duskline-weather-city-targets', function (event) {
        var feature = event.features && event.features[0];
        if (feature) selectPlace(feature.properties.placeIndex);
      });
      ['duskline-weather-place-clusters', 'duskline-weather-city-targets'].forEach(function (layerId) {
        map.on('mouseenter', layerId, function () { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', layerId, function () { map.getCanvas().style.cursor = ''; });
      });
    }
    function updatePlaces(nextPlaces) {
      places = Array.isArray(nextPlaces) ? nextPlaces : (typeof deps.getPlaces === 'function' ? deps.getPlaces() : []);
      renderPlacesList();
      if (fallbackActive) renderFallbackPlaces();
      if (map && map.getSource(CITY_SOURCE)) {
        try { map.getSource(CITY_SOURCE).setData(placeGeoJson()); } catch (e) { /* map is closing */ }
      }
    }
    function renderPlacesList() {
      if (!placesHost) return;
      placesHost.replaceChildren();
      places.forEach(function (item, index) {
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'weather-map-place';
        var title = document.createElement('span');
        title.className = 'weather-map-place-name';
        title.textContent = item.name || item.city && item.city.name || '';
        var detail = document.createElement('span');
        detail.className = 'weather-map-place-detail';
        var temperature = item.temperature != null && Number.isFinite(Number(item.temperature))
          ? (typeof deps.fmtTemp === 'function' ? deps.fmtTemp(Number(item.temperature)) : Math.round(item.temperature) + '°') : '';
        detail.textContent = [temperature, item.city && (item.city.admin1 || item.city.country)].filter(Boolean).join(' · ');
        button.setAttribute('aria-label', [title.textContent, detail.textContent].filter(Boolean).join(', '));
        button.append(title, detail);
        button.addEventListener('click', function () { selectPlace(index); });
        placesHost.appendChild(button);
      });
    }
    function fallbackMapSvg() {
      return '<svg class="weather-map-world" viewBox="0 0 1000 500" aria-hidden="true" focusable="false">'
        + '<defs><linearGradient id="mapOcean" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#15385a"/><stop offset="1" stop-color="#0c2038"/></linearGradient></defs>'
        + '<rect width="1000" height="500" rx="20" fill="url(#mapOcean)"/>'
        + '<g class="weather-map-graticule"><path d="M0 125H1000M0 250H1000M0 375H1000M250 0V500M500 0V500M750 0V500"/></g>'
        + '<g class="weather-map-land"><path d="M73 102 124 71 189 58 232 72 259 103 246 128 222 138 211 174 185 190 177 226 157 250 145 288 123 280 112 248 93 226 86 192 67 166 57 131Z"/>'
        + '<path d="M204 291 237 299 258 325 267 356 252 388 242 429 220 460 206 431 210 397 195 370 187 337Z"/>'
        + '<path d="M436 94 472 74 512 78 533 97 557 100 579 86 617 91 640 108 677 103 709 119 744 122 771 141 813 143 851 163 876 190 858 211 823 210 804 228 768 221 749 241 715 232 700 246 677 241 658 258 640 250 624 273 599 269 585 292 558 287 546 267 521 261 508 244 487 234 465 214 451 189 429 174 417 146Z"/>'
        + '<path d="M505 271 542 278 568 301 576 335 563 367 549 393 535 430 515 447 501 417 494 384 481 361 475 327 485 298Z"/>'
        + '<path d="M761 281 799 272 826 285 845 306 837 327 806 331 781 319Z"/>'
        + '<path d="M889 358 931 352 958 369 953 393 925 402 894 390Z"/>'
        + '</g></svg>';
    }
    function renderFallbackPlaces() {
      if (!fallbackHost) return;
      fallbackHost.replaceChildren();
      fallbackHost.innerHTML = fallbackMapSvg();
      var markerLayer = document.createElement('div');
      markerLayer.className = 'weather-map-fallback-markers';
      places.forEach(function (item, index) {
        if (!item.city || (!item.saved && !item.featured)) return;
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'weather-map-fallback-marker' + (item.saved ? ' is-saved' : '');
        button.style.left = (Math.max(1, Math.min(99, (Number(item.city.lon) + 180) / 360 * 100))) + '%';
        button.style.top = (Math.max(3, Math.min(97, (90 - Number(item.city.lat)) / 180 * 100))) + '%';
        var temp = item.temperature != null && Number.isFinite(Number(item.temperature))
          ? (typeof deps.fmtTemp === 'function' ? deps.fmtTemp(Number(item.temperature)) : Math.round(item.temperature) + '°') : '';
        button.setAttribute('aria-label', [item.name || item.city.name, temp].filter(Boolean).join(', '));
        button.title = button.getAttribute('aria-label');
        button.addEventListener('click', function () { selectPlace(index); });
        markerLayer.appendChild(button);
      });
      fallbackHost.appendChild(markerLayer);
    }
    function useFallback(reason) {
      if (!isOpen || fallbackActive) return;
      fallbackActive = true;
      clearTimeout(styleTimer);
      if (map) {
        try { map.remove(); } catch (e) {}
        map = null;
      }
      if (canvasHost) canvasHost.hidden = true;
      if (fallbackHost) {
        fallbackHost.hidden = false;
        renderFallbackPlaces();
      }
      if (mapControls) mapControls.hidden = true;
      if (credit) credit.textContent = t('weather.mapSchematicCredit', 'Schematic map · City positions are approximate');
      setBusy(false);
      setStatus(reason || t('weather.mapTilesUnavailable', 'Detailed map tiles are unavailable. Showing the local schematic map.'), true);
      legendForLayer(selectedLayer);
      if (!activeGrid) setStatus(t('weather.mapTilesUnavailable', 'Detailed map tiles are unavailable. Showing the local schematic map.'), true);
    }
    function loadCityMap(options) {
      var city = selectedCity(options);
      mapTimeZone = 'UTC';
      var center = [Number(city.lon), Number(city.lat)];
      if (!Number.isFinite(center[0]) || !Number.isFinite(center[1])) center = [-74.006, 40.713];
      if (canvasHost) canvasHost.hidden = false;
      if (fallbackHost) fallbackHost.hidden = true;
      if (mapControls) mapControls.hidden = false;
      setStatus(t('weather.mapLoading', 'Loading map…'), true);
      setBusy(true);
      loadMapLibrary().then(function (library) {
        if (!isOpen) return;
        map = new library.Map({
          container: canvasHost,
          style: STYLE_URL,
          center: center,
          zoom: 3.4,
          minZoom: 1.3,
          maxZoom: 11,
          maxPitch: 0,
          pitchWithRotate: false,
          dragRotate: false,
          attributionControl: false,
          cooperativeGestures: true,
          canvasContextAttributes: { antialias: true, preserveDrawingBuffer: false }
        });
        map.once('load', function () {
          if (!isOpen || !map) return;
          styleReady = true;
          clearTimeout(styleTimer);
          styleTimer = setTimeout(function () {
            if (!map || !isOpen || fallbackActive) return;
            try { if (!map.loaded()) useFallback(); } catch (e) { useFallback(); }
          }, 12000);
          map.once('idle', function () { clearTimeout(styleTimer); });
          try {
            installWeatherRaster(library);
            setStatus('', false);
            setBusy(false);
            map.resize();
            requestAnimationFrame(function () { if (map) map.resize(); });
          } catch (error) {
            useFallback(t('weather.mapTilesUnavailable', 'Detailed map tiles are unavailable. Showing the local schematic map.'));
          }
        });
        map.on('error', function (event) {
          if (!isOpen || fallbackActive) return;
          tileErrors++;
          var sourceFailure = !!(event && (event.sourceId || event.source));
          if (!styleReady && tileErrors >= 4) useFallback();
          else if (styleReady && (sourceFailure || !global.navigator.onLine) && tileErrors >= 4) useFallback();
        });
        map.on('moveend', queueVisibleWeather);
        styleTimer = setTimeout(function () {
          if (isOpen && !styleReady) useFallback();
        }, 12000);
      }).catch(function () {
        useFallback(t('weather.mapTilesUnavailable', 'Detailed map tiles are unavailable. Showing the local schematic map.'));
      });
    }
    function open(options) {
      if (!root || isOpen) return;
      if (typeof deps.getPlaces === 'function') places = deps.getPlaces() || [];
      if (options && Array.isArray(options.places)) places = options.places;
      isOpen = true;
      styleReady = false;
      fallbackActive = false;
      tileErrors = 0;
      selectedOffset = 0;
      activeGrid = null;
      returnFocus = document.activeElement;
      if (root.parentElement !== document.body) document.body.appendChild(root);
      root.hidden = false;
      root.setAttribute('aria-hidden', 'false');
      root.classList.add('is-open');
      lockBackground();
      updatePlaces(places);
      legendForLayer(selectedLayer);
      if (layerHost) {
        layerHost.querySelectorAll('[data-weather-layer]').forEach(function (button) {
          button.setAttribute('aria-pressed', button.getAttribute('data-weather-layer') === selectedLayer ? 'true' : 'false');
        });
      }
      document.addEventListener('keydown', onDialogKeydown, true);
      setTimeout(function () { if (isOpen && closeButton) closeButton.focus({ preventScroll: true }); }, 0);
      loadCityMap(options || {});
    }
    if (closeButton) closeButton.addEventListener('click', close);
    if (zoomInButton) zoomInButton.addEventListener('click', function () {
      if (!map) return;
      map.zoomIn({ duration: reducedMotion() ? 0 : 240 });
    });
    if (zoomOutButton) zoomOutButton.addEventListener('click', function () {
      if (!map) return;
      map.zoomOut({ duration: reducedMotion() ? 0 : 240 });
    });
    if (root) root.addEventListener('click', function (event) { if (event.target === root) close(); });
    if (root) root.addEventListener('transitionend', function (event) {
      if (event.target === root && !isOpen) root.hidden = true;
    });
    if (layerHost) layerHost.addEventListener('click', function (event) {
      var button = event.target.closest && event.target.closest('[data-weather-layer]');
      if (!button || !layerHost.contains(button)) return;
      selectedLayer = button.getAttribute('data-weather-layer') || 'temperature';
      layerHost.querySelectorAll('[data-weather-layer]').forEach(function (item) {
        item.setAttribute('aria-pressed', item === button ? 'true' : 'false');
      });
      legendForLayer(selectedLayer);
      if (activeGrid) drawWeatherImage(activeGrid);
    });
    if (timeInput) timeInput.addEventListener('input', function () {
      selectedOffset = Math.max(0, Math.min(maxOffset, Number(timeInput.value) || 0));
      if (activeGrid) {
        var stampIndex = Math.min(activeGrid.times.length - 1, activeGrid.baseIndex + selectedOffset);
        if (timeOutput) timeOutput.textContent = selectedOffset === 0 ? t('weather.now', 'Now') : formatTime(activeGrid.times[stampIndex]);
        drawWeatherImage(activeGrid);
      }
    });
    if (timeInput) timeInput.addEventListener('change', function () {
      if (activeGrid) drawWeatherImage(activeGrid);
    });
    if (root) root.addEventListener('transitionend', function (event) {
      if (event.target === root && isOpen && map) map.resize();
    });
    if (root) root.addEventListener('close', close);
    global.addEventListener('online', function () {
      if (isOpen && fallbackActive) {
        fallbackActive = false;
        styleReady = false;
        if (fallbackHost) fallbackHost.hidden = true;
        if (canvasHost) canvasHost.hidden = false;
        if (mapControls) mapControls.hidden = false;
        loadCityMap({ initialCity: selectedCity() });
      }
    });
    return {
      open: open,
      close: close,
      updatePlaces: updatePlaces,
      isOpen: function () { return isOpen; },
      helpers: {
        gridGeometry: gridGeometry,
        palette: palette,
        formatTime: formatTime
      }
    };
  };
})(window);
