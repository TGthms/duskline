'use strict';
/* Duskline — core/env.js
   Classic non-module script. Shared global scope with other src/js scripts.
   Canonical load order: see header of src/js/app.js
*/

function safeMatchMedia(query) {
  try {
    if (typeof window.matchMedia === 'function') return window.matchMedia(query);
  } catch (e) { /* some webviews throw on unknown queries */ }
  return { matches: false, media: query, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} };
}

function isConstrainedViewport() {
  try {
    const w = window.innerWidth || 0;
    const h = window.innerHeight || 0;
    // watchOS / wearable webviews are typically well under 320 CSS px
    if ((w > 0 && w <= 320) || (h > 0 && h <= 280)) return true;
    if (safeMatchMedia('(max-width: 320px), (max-height: 280px)').matches) return true;
    // Optional Client Hints — ignore if absent
    if (typeof navigator.deviceMemory === 'number' && navigator.deviceMemory > 0 && navigator.deviceMemory < 1) return true;
  } catch (e) { /* ignore */ }
  return false;
}

/** Phones / tablets / coarse pointers — skip perpetual GPU effects that jank scroll. */
function isMobileOrCoarsePointer() {
  try {
    if (safeMatchMedia('(max-width: 900px)').matches) return true;
    if (safeMatchMedia('(pointer: coarse)').matches) return true;
    if (typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 1
        && safeMatchMedia('(max-width: 1200px)').matches) return true;
  } catch (e) { /* ignore */ }
  return false;
}

const ENV = {
  constrained: isConstrainedViewport(),
  mobile: isMobileOrCoarsePointer(),
  hasIO: typeof IntersectionObserver === 'function',
  hasRAF: typeof requestAnimationFrame === 'function',
  hasXHR: typeof XMLHttpRequest === 'function',
  reduceMotion: safeMatchMedia('(prefers-reduced-motion: reduce)').matches
};

// Let CSS disable GPU-heavy layers without waiting for full script paint.
try {
  if (ENV.mobile || ENV.constrained) {
    document.documentElement.setAttribute('data-mobile-lite', 'true');
  }
} catch (e) { /* ignore */ }

function raf(fn) {
  if (ENV.hasRAF) return requestAnimationFrame(fn);
  return setTimeout(() => fn(Date.now()), 16);
}
function cancelRaf(id) {
  if (id == null) return;
  try {
    if (ENV.hasRAF) cancelAnimationFrame(id);
    else clearTimeout(id);
  } catch (e) { /* ignore */ }
}

// Constrained webviews can blank on an unhandled rejection. Desktop: leave it visible.
window.addEventListener('unhandledrejection', (e) => {
  if (!ENV.constrained) return;
  try { if (e && typeof e.preventDefault === 'function') e.preventDefault(); } catch (err) { /* ignore */ }
});

