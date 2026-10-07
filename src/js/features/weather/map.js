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
    const mapCredits = credit ? credit.innerHTML : '';
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
    var rasterWeights = null;
    var rasterCanvas = null;
    var rasterContext = null;
    var rasterImage = null;
    var lastRaster = null;
    var placesFrame = 0;
    var placesSignature = '';
    var citySourceSignature = '';
    var fallbackPlacesSignature = '';
    var mapLoadGeneration = 0;
    var deferredMapOptions = null;
    var currentMapOptions = null;
    let searchController = null, searchTimer = 0, searchGeneration = 0;
    const search = document.getElementById('weatherMapSearch');
    const results = document.getElementById('weatherMapSearchResults');
    const inspect = document.getElementById('weatherMapInspect');
    var RASTER_ID = 'duskline-weather-field';
    var GRID_ID = 'duskline-weather-grid';
    var CITY_SOURCE = 'duskline-weather-places';
    var STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';
    var MAPLIBRE_CSS = 'assets/vendor/maplibre-gl/maplibre-gl.css';
    var sampleCache = new Map();
    var lastCamera = null;
    const samplingSteps = [.025,.05,.1,.25,.5,1,2,5,10,20,45,90];

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
    var finishMapLoading = null;
    function setBusy(busy) {
      if (global.DusklineLoading) {
        if (busy && !finishMapLoading) finishMapLoading = global.DusklineLoading.begin(t('weather.mapLoadingWeather','Loading nearby forecast…'));
        else if (!busy && finishMapLoading) { finishMapLoading(); finishMapLoading = null; }
      }
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
      }, message.length>60 ? 6000 : 2400);
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
      contextGeneration++;
      if (restoreFocus && isOpen && closeButton) closeButton.focus({ preventScroll: true });
    }
    function close() {
      if (!isOpen) return;
      isOpen = false;
      searchGeneration++; clearTimeout(searchTimer); if (searchController) searchController.abort();
      if (results) results.hidden=true;
      mapLoadGeneration++;
      deferredMapOptions = null;
      currentMapOptions = null;
      setBusy(false);
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
      if (placesFrame) global.cancelAnimationFrame(placesFrame);
      placesFrame = 0;
      citySourceSignature = '';
      longPressPointer = null;
      longPressStart = null;
      hideContextMenu(false);
      if (activeController) activeController.abort();
      activeController = null;
      if (map) {
        try { lastCamera={center:map.getCenter().toArray(),zoom:map.getZoom()}; } catch (e) {}
        try { map.remove(); } catch (e) { /* tolerate partially initialized maps */ }
        map = null;
      }
      rasterWeights = rasterCanvas = rasterContext = rasterImage = lastRaster = null;
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
        'button:not([disabled]), input:not([disabled]), a[href], summary, [tabindex="0"]'
      )).filter(function (el) {
        return !el.hidden && el.getAttribute('aria-hidden') !== 'true' && el.getClientRects().length > 0;
      }) : [];
    }
    function onDialogKeydown(event) {
      if (event.key === 'Escape') {
        if (results && !results.hidden) { results.hidden=true;search.setAttribute('aria-expanded','false');search.focus();event.preventDefault();event.stopPropagation();return; }
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
      return nearest && nearestDistance <= 1 ? nearest : null;
    }
    function cityAtClientPoint(clientX, clientY) {
      var lat;
      var lon;
      if (map && !fallbackActive && root.classList.contains('is-map-ready')) {
        var canvas = map.getCanvas();
        var bounds = canvas.getBoundingClientRect();
        var projected = map.unproject([clientX - bounds.left, clientY - bounds.top]);
        lat = projected.lat;
        lon = projected.lng;
      } else {
        const atlas = fallbackHost && fallbackHost.querySelector('.weather-map-atlas');
        var bounds = (atlas || fallbackHost || stageHost).getBoundingClientRect();
        var x = Math.max(0, Math.min(bounds.width, clientX - bounds.left));
        var y = Math.max(0, Math.min(bounds.height, clientY - bounds.top));
        lon = (x / Math.max(1, bounds.width)) * 360 - 180;
        lat = 90 - (y / Math.max(1, bounds.height)) * 180;
      }
      lat = Math.max(-85, Math.min(85, Number(lat)));
      lon = normalizeLongitude(Number(lon));
      var place = nearestPlace(lat, lon);
      if (place) {
        const city = Object.assign({},place.city);
        if (!city.country && (city.name === 'Pinned place' || /°/.test(city.admin1 || '') || /°/.test(city.name || ''))) city.isMapPin = true;
        return {city:city,name:place.name || city.name || '',saved:!!place.saved};
      }
      var coordinateLabel = lat.toFixed(2) + '°, ' + lon.toFixed(2) + '°';
      return {
        city: {
          name: coordinateLabel,
          admin1: coordinateLabel,
          lat: Number(lat.toFixed(4)), lon: Number(lon.toFixed(4)),
          country: '', country_code: '', tryNws: false, isMapPin: true
        },
        name: coordinateLabel,
        saved: false
      };
    }
    const pinNames = new Map();
    let contextGeneration = 0;
    function resolvePin(city) {
      if (!city.isMapPin || typeof deps.resolveCity !== 'function' || global.navigator && global.navigator.onLine === false) return Promise.resolve(city);
      const key = city.lat.toFixed(4)+','+city.lon.toFixed(4)+':' + (typeof deps.localeTag === 'function' ? deps.localeTag() : 'en');
      if (pinNames.has(key)) return pinNames.get(key);
      const controller = new AbortController();
      const timer = setTimeout(function () { controller.abort(); },4000);
      const request = Promise.resolve().then(function () { return deps.resolveCity(city.lat,city.lon,controller.signal); }).then(function (place) {
        const resolved = Object.assign({},city,place || {},{lat:city.lat,lon:city.lon,isMapPin:true});
        if (resolved.country_code) delete resolved.tryNws;
        if (resolved.name === city.name) pinNames.delete(key);
        return resolved;
      }).catch(function () { pinNames.delete(key); return city; }).finally(function () { clearTimeout(timer); });
      pinNames.set(key,request);
      while (pinNames.size>100) pinNames.delete(pinNames.keys().next().value);
      return request;
    }
    function estimatedValue(city) {
      if (!activeGrid || !city) return null;
      const g=activeGrid.geometry,points=g.points;
      let lon=Number(city.lon);while(lon<g.west) lon+=360;while(lon>g.east) lon-=360;
      const x=(lon-g.west)/(g.east-g.west),y=(mercatorY(g.north)-mercatorY(city.lat))/(mercatorY(g.north)-mercatorY(g.south));
      if(x<0 || x>1 || y<0 || y>1) return null;
      let col=0,row=0;
      while(col<g.cols-2 && x>points[col+1].x) col++;
      while(row<g.rows-2 && y>points[(row+1)*g.cols].y) row++;
      const top=row*g.cols+col,fx=(x-points[top].x)/(points[top+1].x-points[top].x),fy=(y-points[top].y)/(points[top+g.cols].y-points[top].y);
      const indices=[top,top+1,top+g.cols,top+g.cols+1],weights=[(1-fx)*(1-fy),fx*(1-fy),(1-fx)*fy,fx*fy];
      const stamp=activeGrid.times[activeGrid.baseIndex+selectedOffset];let value=0;
      for(let i=0;i<4;i++) {
        if(weights[i]<=.000001) continue;
        const point=points[indices[i]],index=point.hourly && point.hourly.time.indexOf(stamp),sample=selectedDataValue(point,selectedLayer,index);
        if(sample == null) return null;value+=sample*weights[i];
      }
      return value;
    }
    function paintContextCity(city, pending) {
      contextCity = city;
      contextIsSaved = typeof deps.isFavorite === 'function' && deps.isFavorite(city);
      const estimate=estimatedValue(city);
      if (contextPlaceLabel) contextPlaceLabel.textContent = city.name+(estimate == null ? '' : ' · '+formatLegendValue(selectedLayer,selectedLayer === 'aqi' ? Math.round(estimate) : Math.round(estimate*10)/10)+' · '+formatTime(activeGrid.times[activeGrid.baseIndex+selectedOffset]));
      if (contextViewButton) {
        contextViewButton.disabled = pending;
        contextViewButton.textContent = pending ? t('weather.notice.searching','Searching places…') : t('weather.mapViewPlace','View {place}').replace('{place}',city.name);
      }
      if (contextAddButton) {
        contextAddButton.disabled = pending || contextIsSaved;
        contextAddButton.textContent = contextIsSaved ? t('weather.mapAlreadySaved','Already in My Sky') : t('weather.mapAddPlace','Add {place} to My Sky').replace('{place}',city.name);
      }
      contextMenu.setAttribute('aria-busy',String(pending));
    }
    function positionContextMenu(clientX,clientY) {
      const stage = stageHost.getBoundingClientRect();
      const menu = contextMenu.getBoundingClientRect();
      contextMenu.style.left = Math.max(8,Math.min(stage.width-menu.width-8,clientX-stage.left))+'px';
      contextMenu.style.top = Math.max(8,Math.min(stage.height-menu.height-8,clientY-stage.top))+'px';
    }
    function showContextMenu(clientX, clientY) {
      if (!contextMenu || !stageHost || !isOpen) return;
      var selected = cityAtClientPoint(clientX, clientY);
      const generation = ++contextGeneration;
      paintContextCity(Object.assign({},selected.city,{name:selected.name || selected.city.name}),!!selected.city.isMapPin);
      if (selected.city.isMapPin) resolvePin(selected.city).then(function (city) {
        if (generation !== contextGeneration || !isOpen || contextMenu.hidden) return;
        paintContextCity(city,false);
        positionContextMenu(clientX,clientY);
        if (typeof deps.onResolveCity === 'function') deps.onResolveCity(city);
        if (contextViewButton && !contextMenu.contains(document.activeElement)) contextViewButton.focus({preventScroll:true});
      });
      contextMenu.hidden = false;
      contextMenu.style.visibility = 'hidden';
      positionContextMenu(clientX,clientY);
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
          if (deps.onAddCity(city) !== false) showMapFeedback(t('weather.notice.added', 'Added to My Sky'));
          else showMapFeedback(t('weather.savedPlacesLimit','My Sky holds 24 saved places. Remove a place before adding another.'));
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
        function cleanup() {
          clearTimeout(timeout);
          link.removeEventListener('load',done);link.removeEventListener('error',failed);
        }
        function done() { cleanup();link.dataset.loaded = 'true';resolve(); }
        function failed() { cleanup();link.remove();reject(new Error('Map styles could not load.')); }
        var timeout = setTimeout(failed,14000);
        link.addEventListener('load', done, { once: true });
        link.addEventListener('error', failed, { once: true });
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
      let west = bounds.getWest(), east = bounds.getEast();
      if (east <= west) east += 360;
      east = Math.min(east,west+360);
      const choose = span => samplingSteps.find(step=>step >= span/5) || 90;
      const lonStep = Math.max(selectedLayer === 'aqi' ? .5 : .025,choose(east-west));
      const latStep = Math.max(selectedLayer === 'aqi' ? .5 : .025, choose(Math.min(85,bounds.getNorth())-Math.max(-85,bounds.getSouth())));
      west = Math.floor(west/lonStep)*lonStep; east = Math.min(west+360,Math.ceil(east/lonStep)*lonStep);
      const north = Math.min(85,Math.ceil(Math.min(85,bounds.getNorth())/latStep)*latStep);
      const south = Math.max(-85,Math.floor(Math.max(-85,bounds.getSouth())/latStep)*latStep);
      const cols = Math.max(2,Math.round((east-west)/lonStep)+1);
      const rows = Math.max(2,Math.ceil((north-south)/latStep)+1);
      const topY = mercatorY(north), bottomY = mercatorY(south), points = [];
      for (let row=0;row<rows;row++) for (let col=0;col<cols;col++) {
        const latitude = Math.max(south,north-row*latStep), rawLon = west+col*lonStep;
        points.push({x:(rawLon-west)/(east-west),y:(topY-mercatorY(latitude))/(topY-bottomY),
          latitude:latitude,longitude:normalizeLongitude(rawLon),hourly:null});
      }
      return {west,east,north,south,cols,rows,points,
        kind:selectedLayer === 'aqi' ? 'aqi' : 'weather',
        coordinates:[[west,north],[east,north],[east,south],[west,south]],
        key:[west,east,north,south,lonStep,latStep,selectedLayer === 'aqi' ? 'aqi' : 'weather'].join(',')};
    }
    function makeGridUrl(geometry) {
      var params = new URLSearchParams();
      params.set('latitude', geometry.points.map(function (point) { return point.latitude.toFixed(4); }).join(','));
      params.set('longitude', geometry.points.map(function (point) { return point.longitude.toFixed(4); }).join(','));
      params.set('hourly', geometry.kind === 'aqi' ? 'us_aqi' : 'temperature_2m,precipitation_probability,wind_speed_10m');
      if (geometry.kind !== 'aqi') { params.set('temperature_unit', 'celsius'); params.set('wind_speed_unit', 'ms'); }
      params.set('timezone', 'GMT');
      params.set('cell_selection', 'nearest');
      params.set('forecast_days', '2');
      if (geometry.kind === 'aqi') params.set('domains','cams_global');
      return (geometry.kind === 'aqi' ? 'https://air-quality-api.open-meteo.com/v1/air-quality?' : 'https://api.open-meteo.com/v1/forecast?') + params.toString();
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
      const pointKey = point => geometry.kind+':'+point.latitude.toFixed(5)+','+point.longitude.toFixed(5);
      geometry.points.forEach(point=>{
        const hit = sampleCache.get(pointKey(point));
        if (hit && now-hit.at < 8*60*1000) point.hourly = hit.hourly;
      });
      const requested = geometry.points.filter(point=>!point.hourly);
      const transport = requested.length ? fetch(makeGridUrl(Object.assign({},geometry,{points:requested})), {signal:controller.signal,credentials:'omit'}) : Promise.resolve({ok:true,json:()=>Promise.resolve([])});
      return transport.then(function (response) {
        if (!response.ok) throw new Error('Forecast service returned ' + response.status);
        return response.json();
      }).then(function (payload) {
        if (!isOpen || controller !== activeController || activeRequestKey !== geometry.key) return null;
        clearTimeout(requestTimer);
        var locations = Array.isArray(payload) ? payload : [payload];
        if (requested.length && (!locations.length || locations[0].error)) throw new Error(locations[0] && locations[0].reason || 'No forecast data.');
        requested.forEach(function (point, index) {
          var location = locations[index];
          point.hourly = location && location.hourly || null;
          if (point.hourly) sampleCache.set(pointKey(point),{hourly:point.hourly,at:Date.now()});
          while (sampleCache.size>256) sampleCache.delete(sampleCache.keys().next().value);
        });
        var availablePoint = geometry.points.find(point=>point.hourly && point.hourly.time && point.hourly.time.length);
        var times = availablePoint && availablePoint.hourly.time || [];
        if (!times.length) throw new Error('Forecast timestamps unavailable');
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
      var key = layer === 'aqi' ? 'us_aqi' : layer === 'temperature' ? 'temperature_2m'
        : layer === 'precipitation' ? 'precipitation_probability' : 'wind_speed_10m';
      var series = point.hourly[key] || [];
      var value = series[index];
      return value == null || !Number.isFinite(Number(value)) ? null : Number(value);
    }
    const PALETTE_STOPS = {
      temperature: [[-20,[64,98,202,185]],[-5,[56,156,221,190]],[8,[76,202,201,188]],
        [18,[173,222,113,194]],[28,[255,199,70,202]],[40,[235,86,68,210]]],
      precipitation: [[8,[109,203,255,72]],[25,[50,176,241,120]],[50,[63,122,232,165]],
        [75,[91,83,207,190]],[100,[153,78,214,210]]],
      aqi: [[0,[70,190,122,170]],[50,[70,190,122,170]],[100,[241,211,68,185]],[150,[239,150,61,190]],[200,[223,75,73,200]],[300,[150,88,190,205]],[500,[126,48,76,210]]],
      wind: [[2,[73,176,217,75]],[6,[79,205,183,130]],[12,[190,218,97,175]],
        [18,[255,167,72,198]],[26,[228,80,95,214]]]
    };
    function writePalette(layer, value, target, offset) {
      const kind = ['temperature','precipitation','aqi'].includes(layer) ? layer : 'wind';
      const stops = PALETTE_STOPS[kind];
      if (!Number.isFinite(value) || (kind !== 'temperature' && value < stops[0][0])) {
        target[offset] = target[offset+1] = target[offset+2] = target[offset+3] = 0;
        return;
      }
      if (kind === 'aqi') {
        const n=Math.round(value), band=global.DusklineAqiMath ? global.DusklineAqiMath.band(n,'us') : n<=50?'Good':n<=100?'Moderate':n<=150?'UnhealthySG':n<=200?'Unhealthy':n<=300?'VeryUnhealthy':'Hazardous';
        const color={Good:[70,190,122,170],Moderate:[241,211,68,185],UnhealthySG:[239,150,61,190],Unhealthy:[223,75,73,200],VeryUnhealthy:[150,88,190,205],Hazardous:[126,48,76,210]}[band];
        for(let channel=0;channel<4;channel++) target[offset+channel]=color[channel];
        return;
      }
      let left = stops[0], right = left, mix = 0;
      if (value >= stops[stops.length-1][0]) left = right = stops[stops.length-1];
      else if (value > stops[0][0]) {
        for (let i=0;i<stops.length-1;i++) {
          if (value < stops[i][0] || value > stops[i+1][0]) continue;
          left = stops[i]; right = stops[i+1];
          mix = (value-left[0])/(right[0]-left[0]);
          break;
        }
      }
      for (let channel=0;channel<4;channel++) {
        target[offset+channel] = Math.round(left[1][channel]+(right[1][channel]-left[1][channel])*mix);
      }
    }
    function palette(layer, value) {
      const color = [0,0,0,0];
      writePalette(layer,value,color,0);
      return color;
    }
    function legendConfig(layer) {
      if (layer === 'aqi') return {min:0,max:500,ticks:[0,50,100,150,200,300,500],transparentUntil:null,stops:PALETTE_STOPS.aqi.map(stop=>({value:stop[0],color:'rgb('+stop[1].slice(0,3).join(',')+')'}))};
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
      if (layer === 'aqi') return String(value);
      return typeof deps.fmtWind === 'function' ? deps.fmtWind(value) : value + ' m/s';
    }
    // Four local corners per pixel: memory is independent of sample count.
    function spatialWeights(points,width,height) {
      const signature = points.map(p=>p.x+','+p.y).join(';');
      if (rasterWeights && rasterWeights.width === width && rasterWeights.height === height && rasterWeights.signature === signature) return rasterWeights;
      const xs = Array.from(new Set(points.map(p=>p.x))), ys = Array.from(new Set(points.map(p=>p.y)));
      const count = width*height, state = {width,height,signature,indices:new Uint16Array(count*4),weights:new Float32Array(count*4)};
      function cell(values,v) { let i=0;while(i<values.length-2 && v>values[i+1]) i++;return i; }
      for (let y=0;y<height;y++) for (let x=0;x<width;x++) {
        const nx=x/(width-1),ny=y/(height-1), col=cell(xs,nx), row=cell(ys,ny);
        const fx=(nx-xs[col])/(xs[col+1]-xs[col]),fy=(ny-ys[row])/(ys[row+1]-ys[row]);
        const offset=(y*width+x)*4, top=row*xs.length+col;
        state.indices.set([top,top+1,top+xs.length,top+xs.length+1],offset);
        state.weights.set([(1-fx)*(1-fy),fx*(1-fy),(1-fx)*fy,fx*fy],offset);
      }
      rasterWeights=state;return state;
    }
    function renderPixels(grid,layer,hourIndex,width,height,target) {
      const points=grid.geometry.points, state=spatialWeights(points,width,height);
      const stamp=grid.times && grid.times[hourIndex];
      const values=points.map(point=>{
        const index=stamp && point.hourly && point.hourly.time ? point.hourly.time.indexOf(stamp) : hourIndex;
        return selectedDataValue(point,layer,index);
      });
      for (let pixel=0;pixel<width*height;pixel++) {
        let value=0,missing=false;
        for(let corner=0;corner<4;corner++) {
          const offset=pixel*4+corner,weight=state.weights[offset];
          if (weight<=.000001) continue;
          const sample=values[state.indices[offset]];
          if (sample == null) {missing=true;break;}
          value+=sample*weight;
        }
        writePalette(layer,missing?null:value,target,pixel*4);
      }
      return target;
    }
    function drawWeatherImage(grid) {
      if (!grid || !grid.geometry) return;
      var dimensions = renderDimensions(canvasHost && canvasHost.clientWidth);
      var width = dimensions.width;
      var height = dimensions.height;
      var hourIndex = Math.min(grid.times.length - 1, grid.baseIndex + selectedOffset);
      if (hourIndex < 0) hourIndex = 0;
      if (lastRaster && lastRaster.grid === grid && lastRaster.layer === selectedLayer && lastRaster.hour === hourIndex
        && lastRaster.width === width && lastRaster.height === height) return;
      if (!rasterCanvas) {
        rasterCanvas = document.createElement('canvas');
        rasterCanvas.width = width; rasterCanvas.height = height;
        rasterContext = rasterCanvas.getContext('2d',{alpha:true});
      }
      if (!rasterContext) { rasterCanvas = null; return; }
      if (!rasterImage || rasterCanvas.width !== width || rasterCanvas.height !== height) {
        if (rasterCanvas.width !== width || rasterCanvas.height !== height) {
          rasterCanvas.width = width; rasterCanvas.height = height;
        }
        rasterImage = rasterContext.createImageData(width,height);
      }
      renderPixels(grid,selectedLayer,hourIndex,width,height,rasterImage.data);
      rasterContext.putImageData(rasterImage,0,0);
      if (map && map.getSource(RASTER_ID)) {
        try {
          map.getSource(RASTER_ID).updateImage({ image: rasterCanvas, coordinates: grid.geometry.coordinates });
          var raster = map.getLayer(RASTER_ID);
          if (raster) map.setPaintProperty(RASTER_ID, 'raster-opacity', selectedLayer === 'precipitation' ? 0.76 : 0.68);
          lastRaster = {grid:grid,layer:selectedLayer,hour:hourIndex,width:width,height:height};
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
        if (isOpen && document.visibilityState !== 'hidden' && grid === activeGrid) drawWeatherImage(grid);
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
        : layer === 'aqi' ? t('weather.aqi','Air Quality')+' · US AQI' : layer === 'precipitation' ? t('weather.chanceOfPrecipitation', 'Chance of precipitation')
          : t('weather.wind', 'Wind');
      if(layer === 'temperature') title += ' · '+(typeof deps.useF === 'function' && deps.useF()?'°F':'°C');
      const subhead=document.getElementById('weatherMapSubhead');
      if(subhead) subhead.textContent=t('weather.mapEstimate','Interpolated forecast estimates')+(layer === 'aqi'?' · CAMS · ~45 km':'');
      if(credit && !fallbackActive && credit.dataset.layerCredits!==layer) {credit.innerHTML=mapCredits+' · <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Open-Meteo</a>'+(layer === 'aqi'?' · CAMS (~45 km)':'');credit.dataset.layerCredits=layer;}
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
        legendValues.style.fontSize = config.ticks.length > 5 ? '11px' : '';
      }
    }
    function applyGrid(grid) {
      if (!grid || !isOpen) return;
      grid.baseIndex = valueAtOrNearNow(grid.times);
      activeGrid = grid;
      baseIndex = grid.baseIndex;
      if (map && map.getSource(RASTER_ID)) scheduleWeatherImage(grid);
      syncTimeControl(grid);
      legendForLayer(selectedLayer);
      if(contextCity && contextMenu && !contextMenu.hidden) paintContextCity(contextCity,contextMenu.getAttribute('aria-busy') === 'true');
      setStatus('', false);
      setBusy(false);
    }
    function requestVisibleWeather() {
      if (!map || !styleReady || fallbackActive || !isOpen || document.visibilityState === 'hidden') return;
      var geometry;
      try { geometry = gridGeometry(map.getBounds()); } catch (e) { return; }
      if (activeController && activeRequestKey === geometry.key) return;
      var cached = cachedGrids.get(geometry.key);
      var fresh = cached && Date.now()-cached.fetchedAt < 8*60*1000;
      var wait = 2500 - (Date.now() - lastGridRequestAt);
      if (!fresh && lastGridRequestAt && wait > 0) {
        clearTimeout(moveTimer);
        moveTimer = setTimeout(requestVisibleWeather, wait);
        return;
      }
      if (!fresh) lastGridRequestAt = Date.now();
      fetchWeatherGrid(geometry);
    }
    function queueVisibleWeather() {
      clearTimeout(moveTimer);
      if (document.visibilityState === 'hidden') return;
      moveTimer = setTimeout(requestVisibleWeather, 520);
    }
    function installWeatherRaster(library) {
      lastRaster = null;
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
        }).map(function (item) {
          return {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [Number(item.city.lon), Number(item.city.lat)] },
            properties: {
              placeKey: placeKey(item.city),
              name: String(item.name || item.city.name || ''),
              saved: item.saved ? 1 : 0,
              temperature: item.temperature == null ? '' : Number(item.temperature)
            }
          };
        })
      };
    }
    function placeKey(city) { return Number(city.lat)+','+Number(city.lon); }
    function selectPlaceKey(key) {
      const item = places.find(function (place) { return place && place.city && placeKey(place.city) === key; });
      if (item && typeof deps.onSelectCity === 'function') deps.onSelectCity(item.city);
    }
    function sourceSignature(source) {
      return JSON.stringify(source.features.slice().sort(function (a,b) {
        const left=a.properties.placeKey,right=b.properties.placeKey;
        return left < right ? -1 : left > right ? 1 : 0;
      }));
    }
    function installCityLayer(library) {
      var source = placeGeoJson();
      map.addSource(CITY_SOURCE, { type: 'geojson', data: source, cluster: true, clusterRadius: 40, clusterMaxZoom: 5 });
      citySourceSignature = sourceSignature(source);
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
        const instance = map;
        var sourceRef = instance.getSource(CITY_SOURCE);
        sourceRef.getClusterExpansionZoom(feature.properties.cluster_id).then(function (zoom) {
          if (map !== instance || !isOpen) return;
          map.easeTo({ center: feature.geometry.coordinates, zoom: zoom, duration: reducedMotion() ? 0 : 480 });
        }).catch(function () {});
      });
      map.on('click', 'duskline-weather-city-targets', function (event) {
        if (suppressNextMapClick) { suppressNextMapClick = false; return; }
        var feature = event.features && event.features[0];
        if (feature) selectPlaceKey(feature.properties.placeKey);
      });
      ['duskline-weather-place-clusters', 'duskline-weather-city-targets'].forEach(function (layerId) {
        map.on('mouseenter', layerId, function () { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', layerId, function () { map.getCanvas().style.cursor = ''; });
      });
    }
    function updatePlaces(nextPlaces) {
      places = Array.isArray(nextPlaces) ? nextPlaces : (typeof deps.getPlaces === 'function' ? deps.getPlaces() : []);
      if (isOpen && !placesFrame) placesFrame = global.requestAnimationFrame(flushPlaces);
    }
    function flushPlaces() {
      placesFrame = 0;
      if (!isOpen) return;
      renderPlacesList();
      if (fallbackActive) renderFallbackPlaces();
      if (map && map.getSource(CITY_SOURCE)) {
        const source = placeGeoJson(), signature = sourceSignature(source);
        if (signature === citySourceSignature) return;
        try { map.getSource(CITY_SOURCE).setData(source); citySourceSignature = signature; } catch (e) { /* map is closing */ }
      }
    }
    function placeTemperature(item) {
      return item.temperature != null && Number.isFinite(Number(item.temperature))
        ? (typeof deps.fmtTemp === 'function' ? deps.fmtTemp(Number(item.temperature)) : Math.round(item.temperature)+'°') : '';
    }
    function renderPlacesList() {
      if (!placesHost) return;
      const rows = places.filter(function (item) { return item && item.city; }).map(function (item) {
        return {key:placeKey(item.city),name:item.name || item.city.name || '',
          detail:[placeTemperature(item),item.city.admin1 || item.city.country].filter(Boolean).join(' · ')};
      });
      const signature = JSON.stringify(rows);
      if (signature === placesSignature) return;
      const focused = placesHost.contains(document.activeElement) ? document.activeElement : null;
      const existing = new Map(Array.from(placesHost.children).map(function (button) { return [button.dataset.placeKey,button]; }));
      rows.forEach(function (row,index) {
        let button = existing.get(row.key);
        if (!button) {
          button = document.createElement('button');button.type = 'button';button.className = 'weather-map-place';
          button.dataset.placeKey = row.key;
          const title = document.createElement('span');title.className = 'weather-map-place-name';
          const detail = document.createElement('span');detail.className = 'weather-map-place-detail';
          button.append(title,detail);
          button.addEventListener('click', function (event) {
            if (suppressNextMapClick) { event.preventDefault();event.stopPropagation();suppressNextMapClick=false;return; }
            selectPlaceKey(row.key);
          });
        }
        existing.delete(row.key);
        button.children[0].textContent = row.name;
        button.children[1].textContent = row.detail;
        button.setAttribute('aria-label',[row.name,row.detail].filter(Boolean).join(', '));
        if (placesHost.children[index] !== button) placesHost.insertBefore(button,placesHost.children[index] || null);
      });
      existing.forEach(function (button) { button.remove(); });
      if (focused && focused.isConnected && document.activeElement !== focused) focused.focus({preventScroll:true});
      placesSignature = signature;
    }
    var fallbackZoom = 1;
    var fallbackPan = { x: 0, y: 0 };
    function fitFallback() {
      if (!fallbackHost || !isOpen) return;
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
      let atlas = fallbackHost.querySelector('.weather-map-atlas');
      if (!atlas) {
        fallbackHost.innerHTML = fallbackMapSvg();
        atlas = fallbackHost.querySelector('.weather-map-atlas');
        const layer = document.createElement('div');layer.className = 'weather-map-fallback-markers';atlas.appendChild(layer);
      }
      const rows = places.filter(function (item) { return item && item.city && (item.saved || item.featured); }).map(function (item) {
        return {key:placeKey(item.city),saved:!!item.saved,lat:Number(item.city.lat),lon:Number(item.city.lon),
          label:[item.name || item.city.name,placeTemperature(item)].filter(Boolean).join(', ')};
      });
      const signature = JSON.stringify(rows);
      if (signature === fallbackPlacesSignature) { fitFallback(); return; }
      const layer = atlas.querySelector('.weather-map-fallback-markers');
      const existing = new Map(Array.from(layer.children).map(function (button) { return [button.dataset.placeKey,button]; }));
      rows.forEach(function (row,index) {
        let button = existing.get(row.key);
        if (!button) {
          button = document.createElement('button');button.type='button';button.dataset.placeKey=row.key;
          button.addEventListener('click',function (event) {
            if (suppressNextMapClick) { event.preventDefault();event.stopPropagation();suppressNextMapClick=false;return; }
            selectPlaceKey(row.key);
          });
        }
        existing.delete(row.key);
        button.className = 'weather-map-fallback-marker'+(row.saved?' is-saved':'');
        button.style.left = Math.max(1,Math.min(99,(row.lon+180)/360*100))+'%';
        button.style.top = Math.max(3,Math.min(97,(90-row.lat)/180*100))+'%';
        button.setAttribute('aria-label',row.label);button.title=row.label;
        if (layer.children[index] !== button) layer.insertBefore(button,layer.children[index] || null);
      });
      existing.forEach(function (button) { button.remove(); });
      fallbackPlacesSignature = signature;
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
      if (root) {root.classList.remove('is-map-ready');root.dataset.mapState='fallback';}
      mapLoadGeneration++;
      clearTimeout(styleTimer);
      clearTimeout(requestTimer);
      if (activeController) activeController.abort();
      activeController = null;
      if (renderFrame) global.cancelAnimationFrame(renderFrame);
      renderFrame = 0;
      activeGrid = null;
      rasterWeights = rasterCanvas = rasterContext = rasterImage = lastRaster = null;
      selectedOffset = 0;
      if (timeInput) { timeInput.disabled = true;timeInput.value = '0'; }
      if (timeOutput) timeOutput.textContent = '';
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
      if(credit) delete credit.dataset.layerCredits;
      if (credit) credit.textContent = t('weather.mapOfflineCredit', 'Offline world map · Natural Earth · Geographic city coordinates');
      setBusy(false);
      setStatus(reason || t('weather.mapOffline', 'Detailed tiles unavailable. Showing the offline world map.'), true);
      legendForLayer(selectedLayer);
      if (!activeGrid) setStatus(t('weather.mapOffline', 'Detailed tiles unavailable. Showing the offline world map.'), true);
    }
    function loadCityMap(options) {
      currentMapOptions = options || {};
      tileErrors = 0;
      const generation = ++mapLoadGeneration;
      clearTimeout(styleTimer);
      if (document.visibilityState === 'hidden') { deferredMapOptions = options || {}; return; }
      deferredMapOptions = null;
      if (global.navigator && global.navigator.onLine === false) { useFallback(); return; }
      var city = selectedCity(options);
      mapTimeZone = 'UTC';
      var center = lastCamera ? lastCamera.center : [Number(city.lon), Number(city.lat)];
      if (!Number.isFinite(center[0]) || !Number.isFinite(center[1])) center = [-74.006, 40.713];
      if (canvasHost) canvasHost.hidden = false;
      if (fallbackHost) { fallbackHost.hidden = false; renderFallbackPlaces(); }
      if (mapControls) mapControls.hidden = false;
      setStatus(t('weather.mapLoading', 'Loading map…'), true, true);
      setBusy(true);
      styleTimer = setTimeout(function () {
        if (isOpen && generation === mapLoadGeneration && !root.classList.contains('is-map-ready')) useFallback();
      },12000);
      loadMapLibrary().then(function (library) {
        if (!isOpen || generation !== mapLoadGeneration || fallbackActive) return;
        if (document.visibilityState === 'hidden') { deferredMapOptions = options || {}; return; }
        map = new library.Map({
          container: canvasHost,
          style: STYLE_URL,
          center: center,
          zoom: lastCamera ? lastCamera.zoom : 3.4,
          minZoom: 1.3,
          maxZoom: 11,
          maxPitch: 0,
          pitchWithRotate: false,
          dragRotate: false,
          attributionControl: false,
          cooperativeGestures: false,
          canvasContextAttributes: { antialias: true, preserveDrawingBuffer: false }
        });
        map.once('load', function () {
          if (!isOpen || !map || generation !== mapLoadGeneration) return;
          styleReady = true;
          map.once('render',function () {
            if (!isOpen || generation !== mapLoadGeneration) return;
            root.classList.add('is-map-ready');root.dataset.mapState='ready';
            if (fallbackHost) fallbackHost.hidden=true;
            clearTimeout(styleTimer);
          });
          map.getCanvas().addEventListener('webglcontextlost',function (event) {event.preventDefault();useFallback();},{once:true});
          map.triggerRepaint();
          try {
            installWeatherRaster(library);
            map.resize();
            requestAnimationFrame(function () { if (map && generation === mapLoadGeneration) map.resize(); });
          } catch (error) {
            useFallback(t('weather.mapOffline', 'Detailed tiles unavailable. Showing the offline world map.'));
          }
        });
        map.on('error', function (event) {
          if (!isOpen || fallbackActive || generation !== mapLoadGeneration) return;
          tileErrors++;
          var sourceFailure = !!(event && (event.sourceId || event.source));
          if (!styleReady && tileErrors >= 4) useFallback();
          else if (styleReady && (sourceFailure || !global.navigator.onLine) && tileErrors >= 4) useFallback();
        });
        map.on('moveend', queueVisibleWeather);
      }).catch(function () {
        if (!isOpen || generation !== mapLoadGeneration) return;
        useFallback(t('weather.mapOffline', 'Detailed tiles unavailable. Showing the offline world map.'));
      });
    }
    if (typeof document.addEventListener === 'function') document.addEventListener('visibilitychange',function () {
      if (!isOpen) return;
      if (document.visibilityState === 'hidden') {
        clearTimeout(moveTimer);clearTimeout(styleTimer);
        if (renderFrame) global.cancelAnimationFrame(renderFrame);
        renderFrame = 0;
        if (!map && !fallbackActive) deferredMapOptions = currentMapOptions || {initialCity:selectedCity()};
        return;
      }
      if (deferredMapOptions) { loadCityMap(deferredMapOptions); return; }
      if (activeGrid) scheduleWeatherImage(activeGrid);
      if (map && !styleReady) {
        const generation = mapLoadGeneration;
        styleTimer = setTimeout(function () { if (isOpen && generation === mapLoadGeneration && !root.classList.contains('is-map-ready')) useFallback(); },12000);
      }
      queueVisibleWeather();
    });
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
      returnFocus = options && options.returnFocus || document.activeElement;
      if (root.parentElement !== document.body) document.body.appendChild(root);
      root.hidden = false;
      root.setAttribute('aria-hidden', 'false');
      root.classList.remove('is-map-ready');root.dataset.mapState='loading';
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
    if (inspect) inspect.addEventListener('click',function () {
      const rect = stageHost.getBoundingClientRect();
      showContextMenu(rect.left+rect.width/2,rect.top+rect.height/2);
    });
    if (search && results) {
      search.addEventListener('input',function () {
        clearTimeout(searchTimer); if (searchController) searchController.abort();
        const generation=++searchGeneration, query=search.value.trim();
        results.replaceChildren(); results.hidden=true; search.setAttribute('aria-expanded','false');
        if (query.length<2 || typeof deps.searchCities !== 'function') return;
        searchTimer=setTimeout(async function () {
          searchController=new AbortController();search.setAttribute('aria-busy','true');
          try {
            const cities=await deps.searchCities(query,searchController.signal);
            if (!isOpen || generation !== searchGeneration) return;
            cities.forEach(function (city) {
              const button=document.createElement('button');button.type='button';button.setAttribute('role','option');
              button.textContent=[city.name,city.admin1,city.country].filter(Boolean).join(' · ');
              button.addEventListener('click',function () {
                results.hidden=true;search.setAttribute('aria-expanded','false');search.value=city.name;
                places.push({city:city,name:city.name,featured:true});updatePlaces(places);
                const reveal=function () {
                  const rect=stageHost.getBoundingClientRect();
                  contextMenu.hidden=false;paintContextCity(city,false);
                  positionContextMenu(rect.left+rect.width/2,rect.top+rect.height/2);
                  contextViewButton.focus({preventScroll:true});
                };
                if (map) {
                  map.once('moveend',reveal);
                  map.flyTo({center:[city.lon,city.lat],zoom:8,duration:reducedMotion()?0:350});
                } else reveal();
              });
              results.appendChild(button);
            });
            if (!cities.length) results.textContent=t('weather.emptySearch','No cities found.');
            results.hidden=false;search.setAttribute('aria-expanded','true');
          } catch (error) {
            if (generation === searchGeneration && error.name !== 'AbortError') setStatus(t('weather.error','Could not load weather data.'),true);
          } finally { if(generation === searchGeneration) search.removeAttribute('aria-busy'); }
        },250);
      });
      search.addEventListener('keydown',function (event) {
        if (event.key === 'ArrowDown' && !results.hidden) {event.preventDefault();results.querySelector('button')?.focus();}
      });
      results.addEventListener('keydown',function (event) {
        const items=Array.from(results.querySelectorAll('button')),index=items.indexOf(document.activeElement);
        if(event.key === 'ArrowDown' || event.key === 'ArrowUp') {event.preventDefault();items[(index+(event.key==='ArrowDown'?1:-1)+items.length)%items.length]?.focus();}
        if(event.key === 'Escape') {event.preventDefault();event.stopPropagation();results.hidden=true;search.setAttribute('aria-expanded','false');search.focus();}
      });
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
      if (activeGrid && (selectedLayer === 'aqi') === (activeGrid.geometry.kind === 'aqi')) scheduleWeatherImage(activeGrid);
      else { activeGrid=null; if(map && map.getLayer(RASTER_ID)) map.setPaintProperty(RASTER_ID,'raster-opacity',0); if (timeInput) timeInput.disabled=true; if(timeOutput) timeOutput.textContent=''; requestVisibleWeather(); }
    });
    if (timeInput) timeInput.addEventListener('input', function () {
      var next = Math.max(0, Math.min(maxOffset, Number(timeInput.value) || 0));
      var stepped = next !== selectedOffset;
      selectedOffset = next;
      if (stepped && W.haptics) W.haptics.detent();
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
        loadCityMap(currentMapOptions || {initialCity:selectedCity()});
      }
    });
    return {
      open: open,
      close: close,
      updatePlaces: updatePlaces,
      isOpen: function () { return isOpen; },
      helpers: {
        gridGeometry: gridGeometry,
        makeGridUrl:makeGridUrl,
        estimatedValue:estimatedValue,
        palette: palette,
        formatTime: formatTime,
        formatLocalTime: formatLocalTime,
        renderDimensions: renderDimensions,
        renderPixels: renderPixels,
        distanceKm: distanceKm,
        legendConfig: legendConfig,
        gradientCss: gradientCss
      }
    };
  };
})(window);
