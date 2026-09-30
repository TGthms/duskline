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
    var stageHost = root && root.querySelector('.weather-map-stage');
    var statusHost = document.getElementById('weatherMapStatus');
    var contextMenu = document.getElementById('weatherMapContextMenu');
    var contextPlaceLabel = document.getElementById('weatherMapContextPlace');
    var contextViewButton = document.getElementById('weatherMapContextView');
    var contextAddButton = document.getElementById('weatherMapContextAdd');
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
    var feedbackTimer = 0;
    var renderFrame = 0;
    var longPressTimer = 0;
    var longPressPointer = null;
    var longPressStart = null;
    var suppressNextMapClick = false;
    var contextCity = null;
    var contextIsSaved = false;
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
    function setStatus(message, visible, loading) {
      if (!statusHost) return;
      statusHost.textContent = message || '';
      statusHost.hidden = !visible || !message;
      if (loading && visible && message) statusHost.setAttribute('data-loading', 'true');
      else statusHost.removeAttribute('data-loading');
    }
    function setBusy(busy) {
      if (!root) return;
      if (busy) root.setAttribute('aria-busy', 'true');
      else root.removeAttribute('aria-busy');
    }
    function showMapFeedback(message) {
      clearTimeout(feedbackTimer);
      setBusy(false);
      setStatus(message, true, false);
      feedbackTimer = window.setTimeout(function () {
        if (isOpen) setStatus('', false);
      }, 2400);
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
      if (typeof deps.onOpen === 'function') deps.onOpen();
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
      if (typeof deps.onClose === 'function') deps.onClose();
    }
    function hideContextMenu(restoreFocus) {
      if (!contextMenu || contextMenu.hidden) return;
      contextMenu.hidden = true;
      contextCity = null;
      if (restoreFocus && isOpen && closeButton) closeButton.focus({ preventScroll: true });
    }
    function close() {
      if (!isOpen) return;
      isOpen = false;
      clearTimeout(moveTimer);
      clearTimeout(styleTimer);
      clearTimeout(requestTimer);
      clearTimeout(feedbackTimer);
      clearTimeout(longPressTimer);
      if (renderFrame) {
        if (global.cancelAnimationFrame) global.cancelAnimationFrame(renderFrame);
        else global.clearTimeout(renderFrame);
      }
      renderFrame = 0;
      longPressPointer = null;
      longPressStart = null;
      hideContextMenu(false);
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
        if (contextMenu && !contextMenu.hidden) {
          hideContextMenu(true);
          return;
        }
        close();
        return;
      }
      if (contextMenu && !contextMenu.hidden
          && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
        var menuItems = Array.prototype.slice.call(contextMenu.querySelectorAll('[role="menuitem"]:not([disabled])'));
        if (menuItems.length) {
          event.preventDefault();
          var menuIndex = menuItems.indexOf(document.activeElement);
          var step = event.key === 'ArrowDown' ? 1 : -1;
          menuItems[(menuIndex + step + menuItems.length) % menuItems.length].focus();
        }
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
    function distanceKm(lat1, lon1, lat2, lon2) {
      var radians = Math.PI / 180;
      var dLat = (lat2 - lat1) * radians;
      var dLon = (lon2 - lon1) * radians;
      var a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
        + Math.cos(lat1 * radians) * Math.cos(lat2 * radians)
        * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
    }
    function nearestPlace(lat, lon) {
      var nearest = null;
      var nearestDistance = Infinity;
      places.forEach(function (item) {
        var city = item && item.city;
        if (!city) return;
        var d = distanceKm(lat, lon, Number(city.lat), Number(city.lon));
        if (d < nearestDistance) { nearest = item; nearestDistance = d; }
      });
      return nearest && nearestDistance <= 25 ? nearest : null;
    }
    function cityAtClientPoint(clientX, clientY) {
      var lat;
      var lon;
      if (map && !fallbackActive) {
        var canvas = map.getCanvas();
        var bounds = canvas.getBoundingClientRect();
        var projected = map.unproject([clientX - bounds.left, clientY - bounds.top]);
        lat = projected.lat;
        lon = projected.lng;
      } else {
        var bounds = (fallbackHost || stageHost).getBoundingClientRect();
        var x = Math.max(0, Math.min(bounds.width, clientX - bounds.left));
        var y = Math.max(0, Math.min(bounds.height, clientY - bounds.top));
        lon = (x / Math.max(1, bounds.width)) * 360 - 180;
        lat = 90 - (y / Math.max(1, bounds.height)) * 180;
      }
      lat = Math.max(-85, Math.min(85, Number(lat)));
      lon = normalizeLongitude(Number(lon));
      var place = nearestPlace(lat, lon);
      if (place) {
      return { city: Object.assign({}, place.city), name: place.name || place.city.name || '', saved: !!place.saved };
      }
      var coordinateLabel = lat.toFixed(2) + '°, ' + lon.toFixed(2) + '°';
      return {
        city: {
          name: t('weather.mapPinnedPlace', 'Pinned place'),
          admin1: coordinateLabel,
          lat: Number(lat.toFixed(4)), lon: Number(lon.toFixed(4)),
          country: '', country_code: '', tryNws: false, isMapPin: true
        },
        name: coordinateLabel,
        saved: false
      };
    }
    function showContextMenu(clientX, clientY) {
      if (!contextMenu || !stageHost || !isOpen) return;
      var selected = cityAtClientPoint(clientX, clientY);
      contextCity = selected.city;
      contextIsSaved = selected.saved || (typeof deps.isFavorite === 'function' && deps.isFavorite(selected.city));
      if (contextPlaceLabel) contextPlaceLabel.textContent = selected.name;
      if (contextViewButton) {
        contextViewButton.textContent = selected.city.isMapPin
          ? t('weather.mapViewHere', 'View weather here')
          : t('weather.mapViewPlace', 'View {place}').replace('{place}', selected.name);
      }
      if (contextAddButton) {
        contextAddButton.textContent = contextIsSaved
          ? t('weather.mapAlreadySaved', 'Already in My Sky')
          : selected.city.isMapPin
            ? t('weather.mapAddPin', 'Add pin to My Sky')
            : t('weather.mapAddPlace', 'Add {place} to My Sky').replace('{place}', selected.name);
        contextAddButton.disabled = contextIsSaved;
      }
      contextMenu.hidden = false;
      contextMenu.style.visibility = 'hidden';
      var stageRect = stageHost.getBoundingClientRect();
      var menuRect = contextMenu.getBoundingClientRect();
      var left = Math.max(8, Math.min(stageRect.width - menuRect.width - 8, clientX - stageRect.left));
      var top = Math.max(8, Math.min(stageRect.height - menuRect.height - 8, clientY - stageRect.top));
      contextMenu.style.left = left + 'px';
      contextMenu.style.top = top + 'px';
      contextMenu.style.visibility = '';
      if (contextViewButton) contextViewButton.focus({ preventScroll: true });
    }
    function pointOnMap(event) {
      var target = event && event.target;
      return !!(target && ((canvasHost && canvasHost.contains(target)) || (fallbackHost && fallbackHost.contains(target))));
    }
    function onMapContextMenu(event) {
      if (!pointOnMap(event)) return;
      event.preventDefault();
      event.stopPropagation();
      suppressNextMapClick = true;
      window.setTimeout(function () { suppressNextMapClick = false; }, 650);
      showContextMenu(event.clientX, event.clientY);
    }
    function clearLongPress() {
      clearTimeout(longPressTimer);
      longPressTimer = 0;
      longPressPointer = null;
      longPressStart = null;
    }
    function onMapPointerDown(event) {
      if (!pointOnMap(event) || (event.pointerType !== 'touch' && event.pointerType !== 'pen')) return;
      if (contextMenu && !contextMenu.hidden) hideContextMenu(false);
      clearLongPress();
      longPressPointer = event.pointerId;
      longPressStart = { x: event.clientX, y: event.clientY };
      var pointerId = event.pointerId;
      var x = event.clientX;
      var y = event.clientY;
      longPressTimer = window.setTimeout(function () {
        if (longPressPointer !== pointerId) return;
        suppressNextMapClick = true;
        window.setTimeout(function () { suppressNextMapClick = false; }, 650);
        showContextMenu(x, y);
        longPressTimer = 0;
      }, 520);
    }
    function onMapPointerMove(event) {
      if (longPressPointer == null || event.pointerId !== longPressPointer || !longPressStart) return;
      if (Math.abs(event.clientX - longPressStart.x) > 10 || Math.abs(event.clientY - longPressStart.y) > 10) clearLongPress();
    }
    function onMapPointerEnd(event) {
      if (longPressPointer == null || (event.pointerId != null && event.pointerId !== longPressPointer)) return;
      clearLongPress();
    }
    if (contextMenu) {
      contextMenu.addEventListener('click', function (event) {
        var button = event.target.closest && event.target.closest('[data-map-action]');
        if (!button || !contextCity) return;
        event.preventDefault();
        event.stopPropagation();
        var action = button.getAttribute('data-map-action');
        var city = contextCity;
        hideContextMenu(false);
        if (action === 'view' && typeof deps.onSelectCity === 'function') deps.onSelectCity(city);
        else if (action === 'add' && !contextIsSaved && typeof deps.onAddCity === 'function') {
          deps.onAddCity(city);
          showMapFeedback(t('weather.notice.added', 'Added to My Sky'));
        }
      });
    }
    if (stageHost) {
      stageHost.addEventListener('contextmenu', onMapContextMenu);
      stageHost.addEventListener('pointerdown', onMapPointerDown, true);
      stageHost.addEventListener('pointermove', onMapPointerMove, true);
      stageHost.addEventListener('pointerup', onMapPointerEnd, true);
      stageHost.addEventListener('pointercancel', onMapPointerEnd, true);
      stageHost.addEventListener('click', function (event) {
        if (contextMenu && !contextMenu.hidden && !contextMenu.contains(event.target)) hideContextMenu(false);
      });
    }
    if (root) root.addEventListener('pointerdown', function (event) {
      if (contextMenu && !contextMenu.hidden && !contextMenu.contains(event.target)) hideContextMenu(false);
    }, true);
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
      setStatus(t('weather.mapLoadingWeather', 'Loading nearby forecast…'), true, true);
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
    function legendConfig(layer) {
      if (layer === 'precipitation') {
        return {
          min: 0, max: 100, ticks: [0, 25, 50, 75, 100], transparentUntil: 8,
          stops: [
            { value: 8, color: '#6dcbff' }, { value: 25, color: '#32b0f1' },
            { value: 50, color: '#3f7ae8' }, { value: 75, color: '#5b53cf' },
            { value: 100, color: '#994ed6' }
          ]
        };
      }
      if (layer === 'wind') {
        return {
          min: 0, max: 26, ticks: [0, 6, 12, 18, 26], transparentUntil: 2,
          stops: [
            { value: 2, color: '#49b0d9' }, { value: 6, color: '#4fcdb7' },
            { value: 12, color: '#beda61' }, { value: 18, color: '#ffa748' },
            { value: 26, color: '#e4505f' }
          ]
        };
      }
      return {
        min: -20, max: 40, ticks: [-20, -5, 8, 18, 28, 40], transparentUntil: null,
        stops: [
          { value: -20, color: '#4062ca' }, { value: -5, color: '#389cdd' },
          { value: 8, color: '#4ccac9' }, { value: 18, color: '#adde71' },
          { value: 28, color: '#ffc746' }, { value: 40, color: '#eb5644' }
        ]
      };
    }
    function gradientCss(config) {
      var stops = [];
      if (config.transparentUntil != null) {
        var transparentAt = ((config.transparentUntil - config.min) / (config.max - config.min)) * 100;
        stops.push('transparent 0%', 'transparent ' + transparentAt.toFixed(2) + '%');
      }
      config.stops.forEach(function (stop) {
        var position = ((stop.value - config.min) / (config.max - config.min)) * 100;
        stops.push(stop.color + ' ' + position.toFixed(2) + '%');
      });
      return 'linear-gradient(90deg,' + stops.join(',') + ')';
    }
    function formatLegendValue(layer, value) {
      if (layer === 'temperature') return typeof deps.fmtTemp === 'function' ? deps.fmtTemp(value) : value + '°';
      if (layer === 'precipitation') return value + '%';
      return typeof deps.fmtWind === 'function' ? deps.fmtWind(value) : value + ' m/s';
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
      var dimensions = renderDimensions(canvasHost && canvasHost.clientWidth);
      var width = dimensions.width;
      var height = dimensions.height;
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
    function renderDimensions(viewportWidth) {
      var width = Math.max(96, Math.min(180, Math.round((Number(viewportWidth) || 720) / 4)));
      return { width: width, height: Math.round(width / 2) };
    }
    function scheduleWeatherImage(grid) {
      if (renderFrame) {
        if (global.cancelAnimationFrame) global.cancelAnimationFrame(renderFrame);
        else global.clearTimeout(renderFrame);
      }
      var render = function () {
        renderFrame = 0;
        if (isOpen && grid === activeGrid) drawWeatherImage(grid);
      };
      renderFrame = global.requestAnimationFrame
        ? global.requestAnimationFrame(render) : global.setTimeout(render, 16);
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
    function formatLocalTime(iso) {
      if (!iso) return '';
      var stamp = new Date(String(iso) + 'Z');
      if (!Number.isFinite(stamp.getTime())) return '';
      try {
        return new Intl.DateTimeFormat(typeof deps.localeTag === 'function' ? deps.localeTag() : undefined, {
          hour: 'numeric', minute: '2-digit', timeZoneName: 'short'
        }).format(stamp);
      } catch (e) { return stamp.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); }
    }
    function updateTimeOutput(grid) {
      if (!timeOutput || !grid || !grid.times || !grid.times.length) return;
      var stampIndex = Math.min(grid.times.length - 1, grid.baseIndex + selectedOffset);
      var iso = grid.times[stampIndex];
      var local = formatLocalTime(iso);
      var prefix = selectedOffset === 0 ? t('weather.now', 'Now') + ' · ' : '';
      timeOutput.textContent = prefix + formatTime(iso) + (local ? ' · ' + local : '');
    }
    function syncTimeControl(grid) {
      if (!timeInput) return;
      var available = Math.max(0, (grid.times || []).length - grid.baseIndex - 1);
      maxOffset = Math.min(12, available);
      selectedOffset = Math.max(0, Math.min(selectedOffset, maxOffset));
      timeInput.max = String(maxOffset);
      timeInput.value = String(selectedOffset);
      timeInput.disabled = maxOffset < 1;
      updateTimeOutput(grid);
      if (timeLabel) timeLabel.textContent = t('weather.mapForecastHour', 'Forecast hour · UTC');
    }
    function legendForLayer(layer) {
      var title = layer === 'temperature' ? t('settings.temperature', 'Temperature')
        : layer === 'precipitation' ? t('weather.chanceOfPrecipitation', 'Chance of precipitation')
          : t('weather.wind', 'Wind');
      if (legendTitle) legendTitle.textContent = title;
      if (legendGradient) legendGradient.dataset.layer = layer;
      var config = legendConfig(layer);
      if (legendGradient) legendGradient.style.background = gradientCss(config);
      if (legendValues) {
        legendValues.replaceChildren();
        legendValues.style.position = 'relative';
        legendValues.style.height = '14px';
        config.ticks.forEach(function (value) {
          var tick = document.createElement('span');
          var fraction = (value - config.min) / (config.max - config.min);
          tick.textContent = formatLegendValue(layer, value);
          tick.style.position = 'absolute';
          tick.style.left = (fraction * 100).toFixed(2) + '%';
          tick.style.transform = fraction >= 0.999 ? 'translateX(-100%)' : (fraction <= 0.001 ? 'none' : 'translateX(-50%)');
          legendValues.appendChild(tick);
        });
        legendValues.style.fontSize = config.ticks.length > 5 ? '9px' : '';
      }
    }
    function applyGrid(grid) {
      if (!grid || !isOpen) return;
      activeGrid = grid;
      baseIndex = grid.baseIndex;
      if (map && map.getSource(RASTER_ID)) scheduleWeatherImage(grid);
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
        if (suppressNextMapClick) { suppressNextMapClick = false; return; }
        var feature = event.features && event.features[0];
        if (!feature) return;
        var sourceRef = map.getSource(CITY_SOURCE);
        sourceRef.getClusterExpansionZoom(feature.properties.cluster_id).then(function (zoom) {
          if (!map) return;
          map.easeTo({ center: feature.geometry.coordinates, zoom: zoom, duration: reducedMotion() ? 0 : 480 });
        }).catch(function () {});
      });
      map.on('click', 'duskline-weather-city-targets', function (event) {
        if (suppressNextMapClick) { suppressNextMapClick = false; return; }
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
        button.addEventListener('click', function (event) {
          if (suppressNextMapClick) {
            event.preventDefault();
            event.stopPropagation();
            suppressNextMapClick = false;
            return;
          }
          selectPlace(index);
        });
        placesHost.appendChild(button);
      });
    }
    var fallbackZoom = 1;
    var fallbackPan = { x: 0, y: 0 };
    function fitFallback() {
      if (!fallbackHost || !fallbackActive) return;
      const atlas = fallbackHost.querySelector('.weather-map-atlas');
      if (!atlas) return;
      const width = Math.min(fallbackHost.clientWidth, fallbackHost.clientHeight * 2);
      atlas.style.width = width + 'px';
      atlas.style.height = width / 2 + 'px';
      const maxX = width * (fallbackZoom - 1) / 2;
      const maxY = width / 2 * (fallbackZoom - 1) / 2;
      fallbackPan.x = Math.max(-maxX, Math.min(maxX, fallbackPan.x));
      fallbackPan.y = Math.max(-maxY, Math.min(maxY, fallbackPan.y));
      atlas.style.transform = 'translate(' + fallbackPan.x + 'px,' + fallbackPan.y + 'px) scale(' + fallbackZoom + ')';
    }
    function fallbackMapSvg() {
      return '<div class="weather-map-atlas"><img src="assets/world-land.svg" alt="" class="weather-map-world" draggable="false"></div>';
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
        button.addEventListener('click', function (event) {
          if (suppressNextMapClick) {
            event.preventDefault();
            event.stopPropagation();
            suppressNextMapClick = false;
            return;
          }
          selectPlace(index);
        });
        markerLayer.appendChild(button);
      });
      fallbackHost.querySelector(".weather-map-atlas").appendChild(markerLayer);
      fitFallback();
    }
    if (fallbackHost) {
      let drag = null;
      fallbackHost.addEventListener('pointerdown', function (event) {
        if (event.target.closest('button')) return;
        drag = {x: event.clientX, y: event.clientY, panX: fallbackPan.x, panY: fallbackPan.y};
        fallbackHost.setPointerCapture(event.pointerId);
      });
      fallbackHost.addEventListener('pointermove', function (event) {
        if (!drag) return;
        fallbackPan = {x: drag.panX + event.clientX - drag.x, y: drag.panY + event.clientY - drag.y};
        fitFallback();
      });
      fallbackHost.addEventListener('pointerup', function () { drag = null; });
      fallbackHost.addEventListener('pointercancel', function () { drag = null; });
      fallbackHost.tabIndex = 0;
      fallbackHost.setAttribute('aria-label', t('weather.mapOfflineNavigation', 'Offline world map. Use arrow keys to pan and zoom buttons to explore.'));
      fallbackHost.addEventListener('keydown', function (event) {
        const moves = {ArrowLeft: [40,0], ArrowRight: [-40,0], ArrowUp: [0,40], ArrowDown: [0,-40]};
        if (moves[event.key]) { event.preventDefault(); fallbackPan.x += moves[event.key][0]; fallbackPan.y += moves[event.key][1]; fitFallback(); }
      });
      if (typeof ResizeObserver === 'function') new ResizeObserver(fitFallback).observe(fallbackHost);
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
      if (mapControls) mapControls.hidden = false;
      if (credit) credit.textContent = t('weather.mapOfflineCredit', 'Offline world map · Natural Earth · Geographic city coordinates');
      setBusy(false);
      setStatus(reason || t('weather.mapOffline', 'Detailed tiles unavailable. Showing the offline world map.'), true);
      legendForLayer(selectedLayer);
      if (!activeGrid) setStatus(t('weather.mapOffline', 'Detailed tiles unavailable. Showing the offline world map.'), true);
    }
    function loadCityMap(options) {
      if (global.navigator && global.navigator.onLine === false) { useFallback(); return; }
      var city = selectedCity(options);
      mapTimeZone = 'UTC';
      var center = [Number(city.lon), Number(city.lat)];
      if (!Number.isFinite(center[0]) || !Number.isFinite(center[1])) center = [-74.006, 40.713];
      if (canvasHost) canvasHost.hidden = false;
      if (fallbackHost) fallbackHost.hidden = true;
      if (mapControls) mapControls.hidden = false;
      setStatus(t('weather.mapLoading', 'Loading map…'), true, true);
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
            setStatus(t('weather.mapEstimate', 'Interpolated forecast estimate · Updates with the visible area'), true);
            setBusy(false);
            map.resize();
            requestAnimationFrame(function () { if (map) map.resize(); });
          } catch (error) {
            useFallback(t('weather.mapOffline', 'Detailed tiles unavailable. Showing the offline world map.'));
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
        useFallback(t('weather.mapOffline', 'Detailed tiles unavailable. Showing the offline world map.'));
      });
    }
    function open(options) {
      const subhead = document.getElementById('weatherMapSubhead');
      if (subhead) subhead.textContent = t('weather.mapEstimate', 'Interpolated forecast estimates');
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
      if (fallbackActive) { fallbackZoom = Math.min(6, fallbackZoom * 1.4); fitFallback(); return; }
      if (!map) return;
      map.zoomIn({ duration: reducedMotion() ? 0 : 240 });
    });
    if (zoomOutButton) zoomOutButton.addEventListener('click', function () {
      if (fallbackActive) { fallbackZoom = Math.max(1, fallbackZoom / 1.4); if (fallbackZoom === 1) fallbackPan = {x: 0, y: 0}; fitFallback(); return; }
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
      if (activeGrid) scheduleWeatherImage(activeGrid);
    });
    if (timeInput) timeInput.addEventListener('input', function () {
      selectedOffset = Math.max(0, Math.min(maxOffset, Number(timeInput.value) || 0));
      if (activeGrid) {
        updateTimeOutput(activeGrid);
        scheduleWeatherImage(activeGrid);
      }
    });
    if (timeInput) timeInput.addEventListener('change', function () {
      if (activeGrid) scheduleWeatherImage(activeGrid);
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
        formatTime: formatTime,
        formatLocalTime: formatLocalTime,
        renderDimensions: renderDimensions,
        distanceKm: distanceKm,
        legendConfig: legendConfig,
        gradientCss: gradientCss
      }
    };
  };
})(window);
