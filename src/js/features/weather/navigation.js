'use strict';
/* Browser navigation owns view history; weather data and rendering stay in their factories. */
(function (global) {
  const W = global.DusklineWeather;
  if (!W || !W.active) return;
  W.factories.navigation = function (deps) {
    let applying = false;
    let pendingClose = false;
    let deferredSheet = null;
    const rootUrl = new URL(location.href);
    ['city', 'dest', 'lat', 'lon', 'name', 'admin1', 'tz', 'country', 'country_code', 'cc'].forEach(key => rootUrl.searchParams.delete(key));
    function state() { return history.state && history.state.duskline || {city: null, sheet: null}; }
    function urlFor(city) {
      const url = new URL(rootUrl);
      if (city) {
        ['lat', 'lon', 'name', 'admin1', 'tz', 'country', 'country_code'].forEach(key => {
          if (city[key] != null && city[key] !== '') url.searchParams.set(key, city[key]);
        });
      }
      return url;
    }
    function push(next, replace) {
      if (applying) return;
      history[replace ? 'replaceState' : 'pushState']({duskline: next}, '', urlFor(next.city));
    }
    function detail(city) {
      if (applying) return;
      const current = state();
      if (current.city && deps.sameCity(current.city, city)) return;
      const initialLink = !history.state && (location.search.includes('city=') || location.search.includes('lat='));
      if (initialLink) history.replaceState({duskline: {city: null, sheet: null}}, '', rootUrl);
      push({city: city, sheet: null});
    }
    function sheet(kind, options) {
      if (pendingClose) { deferredSheet = {kind: kind, options: options || {}}; return; }
      const current = state();
      if (applying) return;
      push({city: current.city, sheet: {kind: kind, options: options || {}}}, !!(current.sheet && current.sheet.kind === kind));
    }
    function close(view) {
      const current = state();
      if (applying || view === 'sheet' && !current.sheet || view === 'detail' && !current.city) return false;
      if (pendingClose) {
        if (view === 'detail') pendingClose.view = 'detail';
        return true;
      }
      pendingClose = {view:view};
      history.go(view === 'detail' && current.sheet ? -2 : -1);
      return true;
    }
    global.addEventListener('popstate', function () {
      applying = true;
      const next = state();
      const closing = pendingClose;
      pendingClose = false;
      // A sheet dismissal may still be navigating when the city Back control is pressed.
      // Finish the requested trip to the list before restoring any intermediate city.
      if (closing && closing.view === 'detail' && next.city) {
        pendingClose = closing;
        applying = false;
        history.back();
        return;
      }
      if (deferredSheet) {
        const queued = deferredSheet; deferredSheet = null;
        applying = false;
        push({city: next.city, sheet: queued});
        return;
      }
      if (deps.sheetOpen()) deps.dismissSheet();
      const currentCity = deps.currentCity();
      if (!next.city) { if (currentCity) deps.dismissDetail(); }
      else if (!currentCity || !deps.sameCity(currentCity,next.city)) deps.openCity(next.city);
      if (next.sheet) deps.openSheet(next.sheet.kind, next.sheet.options);
      applying = false;
    });
    return {detail: detail, sheet: sheet, close: close};
  };
})(window);
