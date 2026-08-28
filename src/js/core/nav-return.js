'use strict';
/* Duskline — cross-page return context (scroll + back label)
   Stamp outbound navigations; restore contextual Back on destination pages.
   Load after env.js; safe on all pages.

   Return stack (prevents Weather ↔ Gallery loops):
     · Forward nav (app bar, deep-links, etc.) pushes origin with optional parent
     · Back chrome (.gallery-app-back / footer home) POPs parent — never re-stamps
     · Guide → Weather → Gallery → Back → Weather shows Guide again

   Rules:
     · Guide → anywhere           → Back to the Guide
     · Tools hub → mini/gallery   → Back to Tools
     · Tool mini → Gallery/legal  → Back to that tool
     · Tool mini → Tools hub      → do NOT overwrite stamp
     · Gallery → tools            → Back to Gallery
     · Tools hub Back: Guide or Gallery only (never Tools / mini-app)
     · Tool mini default: Back to Tools when no stamp
*/

(function () {
  var KEY = 'duskline-return-v1';
  var MAX_AGE_MS = 2 * 60 * 60 * 1000;
  var MAX_PARENT_DEPTH = 6;

  /** Short display names for “Back to {name}” (EN + es/zh/ja). */
  var TOOL_SHORT = {
    weather: { en: 'Weather', es: 'Tiempo', zh: '天气', ja: '天気' },
    currency: { en: 'Currency', es: 'Divisas', zh: '货币', ja: '通貨' },
    clock: { en: 'World Clock', es: 'Reloj mundial', zh: '世界时钟', ja: '世界時計' },
    'tip-tax': { en: 'Tip & Tax', es: 'Propina e impuestos', zh: '小费与税', ja: 'チップと税' },
    drive: { en: 'Road Trip', es: 'Viaje por carretera', zh: '自驾', ja: 'ロードトリップ' },
    emergency: { en: 'Emergency', es: 'Emergencias', zh: '紧急电话', ja: '緊急連絡先' }
  };

  function pathOf(href) {
    try {
      var u = new URL(href, location.href);
      return u.pathname.replace(/\\/g, '/');
    } catch (e) {
      return String(href || '');
    }
  }

  function fileOf(p) {
    p = pathOf(p);
    var parts = p.split('/').filter(Boolean);
    return parts.length ? parts[parts.length - 1] : '';
  }

  function isToolsHubPath(p) {
    return /\/tools\.html$/i.test(p || '') || fileOf(p).toLowerCase() === 'index.html';
  }

  function isToolMiniAppPath(p) {
    return /\/tools-[a-z0-9-]+\.html$/i.test(p || '');
  }

  function isGalleryPath(p) {
    return /\/gallery\.html$/i.test(p || '');
  }

  function isLegalPath(p) {
    return /\/(privacy|terms)\.html$/i.test(p || '');
  }

  /**
   * Guide homepage: index.html, `/`, trailing slash, or a directory-style path
   * without a .html file (e.g. GitHub Pages project root without trailing slash).
   */
  function isGuidePath(p) {
    p = pathOf(p || '');
    if (!p || p === '/') return true;
    if (/\/index\.html$/i.test(p)) return true;
    if (/\/$/.test(p)) return true;
    if (isToolsHubPath(p) || isToolMiniAppPath(p) || isGalleryPath(p) || isLegalPath(p)) return false;
    var f = fileOf(p);
    // No .html segment → treat as site/app root (project Pages base path)
    if (f && !/\.html?$/i.test(f)) return true;
    return false;
  }

  function isAppChromePage(p) {
    return isGuidePath(p)
      || isToolsHubPath(p)
      || isToolMiniAppPath(p)
      || isGalleryPath(p)
      || isLegalPath(p);
  }

  function toolIdFromPath(p) {
    var f = fileOf(p).toLowerCase();
    var m = f.match(/^tools-([a-z0-9-]+)\.html$/);
    return m ? m[1] : null;
  }

  function langCode() {
    return (typeof currentLang === 'string' && currentLang) || 'en';
  }

  function dictText(key, fallback) {
    var dict = typeof getI18nDict === 'function' ? getI18nDict(langCode()) : null;
    if (dict && dict[key]) return dict[key];
    return fallback;
  }

  function shortToolName(toolId) {
    var map = TOOL_SHORT[toolId];
    if (!map) return toolId || 'Tools';
    var L = langCode();
    return map[L] || map.en || toolId;
  }

  function backToNamed(name) {
    var L = langCode();
    if (L === 'zh') return '返回' + name;
    if (L === 'ja') return name + 'に戻る';
    if (L === 'es') return 'Volver a ' + name;
    return 'Back to ' + name;
  }

  function readReturn() {
    try {
      var raw = sessionStorage.getItem(KEY);
      if (!raw) return null;
      var o = JSON.parse(raw);
      if (!o || !o.ts || Date.now() - o.ts > MAX_AGE_MS) return null;
      return o;
    } catch (e) {
      return null;
    }
  }

  function writeReturn(obj) {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(obj));
    } catch (e) { /* private mode */ }
  }

  function clearReturn() {
    try { sessionStorage.removeItem(KEY); } catch (e) {}
  }

  /** Clone a stamp node for nesting as parent (bounded depth). */
  function cloneAsParent(ret, depth) {
    if (!ret || !ret.label || depth > MAX_PARENT_DEPTH) return null;
    return {
      label: ret.label,
      href: ret.href || '',
      toolId: ret.toolId || '',
      scrollY: typeof ret.scrollY === 'number' ? ret.scrollY : 0,
      parent: ret.parent ? cloneAsParent(ret.parent, depth + 1) : null,
      ts: ret.ts || Date.now()
    };
  }

  function originFromHere() {
    var p = pathOf(location.href);
    if (isGuidePath(p)) {
      return { label: 'guide', href: 'index.html' };
    }
    if (isToolsHubPath(p)) {
      return { label: 'tools', href: 'index.html' };
    }
    if (isToolMiniAppPath(p)) {
      var id = toolIdFromPath(p);
      var file = fileOf(p) || ('tools-' + id + '.html');
      return { label: 'tool', href: file, toolId: id || '' };
    }
    if (isGalleryPath(p)) {
      return { label: 'gallery', href: 'https://travelusa.pages.dev/' };
    }
    if (isLegalPath(p)) {
      return { label: 'legal', href: fileOf(p) || 'privacy.html' };
    }
    return null;
  }

  function isBackChromeLink(a) {
    if (!a || !a.classList) return false;
    return a.classList.contains('gallery-app-back')
      || a.classList.contains('gallery-app-footer-home');
  }

  /** Keep only scroll-restore payload when returning to the guide (never leave tools/tool as active stamp). */
  function writeGuideScrollRestore(ret) {
    if (ret && ret.label === 'guide' && typeof ret.scrollY === 'number' && ret.scrollY > 0) {
      writeReturn({
        label: 'guide',
        href: ret.href || 'index.html',
        scrollY: ret.scrollY,
        ts: Date.now(),
        pendingScrollRestore: true
      });
      return;
    }
    clearReturn();
  }

  /**
   * Following the Back control: pop the stack so the destination keeps its
   * original parent (Guide → Weather → Gallery → Back → Weather shows Guide).
   */
  function popReturnOnBack(targetHref) {
    var ret = readReturn();
    var destFile = fileOf(targetHref).toLowerCase();
    var destPath = pathOf(targetHref);

    // Returning to the Guide: restore scroll only — do not promote a tools/tool parent
    // (that left a stale tools stamp on the guide and broke later “Back to the Guide” hops).
    if (isGuidePath(destPath)) {
      if (ret && ret.label === 'guide') {
        writeGuideScrollRestore(ret);
        return;
      }
      if (ret && ret.parent && ret.parent.label === 'guide') {
        writeGuideScrollRestore(ret.parent);
        return;
      }
      clearReturn();
      return;
    }

    // Prefer popping when Back href matches current stamp target
    if (ret && ret.href && String(ret.href).toLowerCase() === destFile) {
      if (ret.parent && ret.parent.label) {
        var p = cloneAsParent(ret.parent, 0);
        if (p) {
          p.ts = Date.now();
          writeReturn(p);
          return;
        }
      }
      clearReturn();
      return;
    }

    // Back went somewhere else — still pop if we have a parent chain, else clear
    if (ret && ret.parent && ret.parent.label) {
      var p2 = cloneAsParent(ret.parent, 0);
      if (p2) {
        p2.ts = Date.now();
        writeReturn(p2);
        return;
      }
    }
    clearReturn();
  }

  function stampOutbound(targetHref) {
    var from = originFromHere();
    if (!from) return;
    var dest = pathOf(targetHref);
    var here = pathOf(location.href);
    if (!dest || dest === here) return;
    if (!isAppChromePage(dest)) return;

    // Mini-app → Tools hub: keep prior parent (Guide/Gallery)
    if (from.label === 'tool' && isToolsHubPath(dest)) return;

    // Tools hub → Guide: clear tools-tree stamps (guide has no Back chrome)
    if (from.label === 'tools' && isGuidePath(dest)) {
      clearReturn();
      return;
    }

    var prev = readReturn();

    // Returning to the Guide while a guide stamp (with scrollY) is active —
    // do not overwrite with the mini-app as origin (footer “Guide” links, etc.)
    if (isGuidePath(dest) && prev && prev.label === 'guide') {
      return;
    }

    // Guide → anywhere: always a clean guide stamp (never nest stale tools/tool parents)
    if (from.label === 'guide') {
      writeReturn({
        from: here,
        href: 'index.html',
        scrollY: Math.round(window.scrollY || window.pageYOffset || 0),
        label: 'guide',
        toolId: '',
        parent: null,
        ts: Date.now(),
        to: dest
      });
      return;
    }

    // Don't re-stamp if navigating to the current stamp target (edge cases)
    if (prev && prev.href && String(prev.href).toLowerCase() === fileOf(dest).toLowerCase()
        && prev.label === from.label && String(prev.href).toLowerCase() === String(from.href).toLowerCase()) {
      return;
    }

    // Nest previous stamp as parent so Back can restore it
    var parent = null;
    if (prev && prev.label) {
      var sameOrigin = prev.label === from.label
        && String(prev.href || '').toLowerCase() === String(from.href || '').toLowerCase();
      if (!sameOrigin) {
        parent = cloneAsParent(prev, 0);
      } else if (prev.parent) {
        parent = cloneAsParent(prev.parent, 0);
      }
    }

    writeReturn({
      from: here,
      href: from.href,
      scrollY: Math.round(window.scrollY || window.pageYOffset || 0),
      label: from.label,
      toolId: from.toolId || '',
      parent: parent,
      ts: Date.now(),
      to: dest
    });
  }

  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    if (a.target === '_blank' || a.hasAttribute('download')) return;
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#' || /^(mailto|tel|javascript):/i.test(href)) return;
    try {
      var u = new URL(href, location.href);
      if (u.origin === location.origin && pathOf(u.href) === pathOf(location.href) && u.hash) return;
    } catch (err) { /* continue */ }

    // Back chrome: pop stack, never stamp current page as new origin
    if (isBackChromeLink(a)) {
      popReturnOnBack(href);
      return;
    }

    stampOutbound(href);
  }, true);

  function setChromeLink(el, href, i18nKey, enLabel, plainLabel) {
    if (!el) return;
    el.setAttribute('href', href);
    var text = plainLabel != null ? plainLabel : dictText(i18nKey, enLabel);
    if (i18nKey) {
      el.setAttribute('data-i18n-aria', i18nKey);
    } else {
      el.removeAttribute('data-i18n-aria');
    }
    el.setAttribute('aria-label', text);
    var labelEl = el.querySelector('.gallery-app-back-label')
      || el.querySelector('[data-i18n]')
      || null;
    if (labelEl) {
      if (i18nKey && !plainLabel) {
        labelEl.setAttribute('data-i18n', i18nKey);
      } else {
        labelEl.removeAttribute('data-i18n');
      }
      labelEl.textContent = text;
    }
  }

  function applyGuideChrome(back, footer) {
    setChromeLink(back, 'index.html', 'gallery.backToGuide', 'Back to the Guide');
    if (footer) setChromeLink(footer, 'index.html', 'gallery.backToGuide', 'Back to the Guide');
  }

  function applyToolsChrome(back, footer) {
    setChromeLink(back, 'index.html', 'tools.backToTools', 'Back to Tools');
    if (footer) setChromeLink(footer, 'index.html', 'tools.backToTools', 'Back to Tools');
  }

  function applyGalleryChrome(back, footer) {
    var label = dictText('gallery.backToGallery', 'Back to Gallery');
    setChromeLink(back, 'https://travelusa.pages.dev/', 'gallery.backToGallery', 'Back to Gallery', label);
    if (footer) setChromeLink(footer, 'https://travelusa.pages.dev/', 'gallery.backToGallery', 'Back to Gallery', label);
  }

  function applyToolChrome(back, footer, ret) {
    var href = (ret && ret.href) || 'index.html';
    if (!/^tools-[a-z0-9-]+\.html$/i.test(href)) {
      applyToolsChrome(back, footer);
      return;
    }
    var toolId = (ret && ret.toolId) || toolIdFromPath(href) || '';
    var name = shortToolName(toolId);
    var label = backToNamed(name);
    setChromeLink(back, href, null, label, label);
    if (footer) setChromeLink(footer, href, null, label, label);
  }

  function applyLegalChrome(back, footer, ret) {
    var href = (ret && ret.href) || 'index.html';
    if (!/^(privacy|terms)\.html$/i.test(href)) {
      applyGuideChrome(back, footer);
      return;
    }
    var label = backToNamed(href.indexOf('terms') >= 0
      ? dictText('nav.terms', 'Terms')
      : dictText('nav.privacy', 'Privacy'));
    setChromeLink(back, href, null, label, label);
    if (footer) setChromeLink(footer, href, null, label, label);
  }

  function applyStampChrome(back, footer, ret, opts) {
    opts = opts || {};
    if (!ret || !ret.label) return false;
    var hereFile = fileOf(pathOf(location.href)).toLowerCase();
    if (ret.href && String(ret.href).toLowerCase() === hereFile) return false;

    if (ret.label === 'guide') {
      applyGuideChrome(back, footer);
      return true;
    }
    if (ret.label === 'tools') {
      if (opts.forbidTools) return false;
      applyToolsChrome(back, footer);
      return true;
    }
    if (ret.label === 'gallery') {
      if (opts.forbidGallery) return false;
      applyGalleryChrome(back, footer);
      return true;
    }
    if (ret.label === 'tool') {
      if (opts.forbidTool) return false;
      applyToolChrome(back, footer, ret);
      return true;
    }
    if (ret.label === 'legal') {
      applyLegalChrome(back, footer, ret);
      return true;
    }
    return false;
  }

  /**
   * If the stamp's target IS the page we're on, we already "arrived" —
   * promote parent (or clear). Covers browser Back and missed pop clicks.
   */
  function normalizeStampForCurrentPage() {
    var hereFile = fileOf(pathOf(location.href)).toLowerCase();
    if (!hereFile) return;
    var guard = 0;
    while (guard++ < MAX_PARENT_DEPTH) {
      var ret = readReturn();
      if (!ret || !ret.href) return;
      if (String(ret.href).toLowerCase() !== hereFile) return;
      // Stamp pointed at us → restore parent journey
      if (ret.parent && ret.parent.label) {
        var p = cloneAsParent(ret.parent, 0);
        if (p) {
          p.ts = Date.now();
          writeReturn(p);
          continue;
        }
      }
      clearReturn();
      return;
    }
  }

  /** Drop irrelevant stamps while sitting on the guide homepage. */
  function cleanStampOnGuide() {
    if (!isGuidePath(pathOf(location.href))) return;
    var ret = readReturn();
    if (!ret) return;
    if (ret.label === 'guide' && (ret.pendingScrollRestore || (typeof ret.scrollY === 'number' && ret.scrollY > 0))) {
      return;
    }
    // tools/tool/gallery leftovers confuse the next deep-link out of Essentials/etc.
    clearReturn();
  }

  function referrerIsGuide() {
    try {
      var refPath = document.referrer ? pathOf(document.referrer) : '';
      return !!(refPath && isGuidePath(refPath));
    } catch (e) {
      return false;
    }
  }

  function applyReturnChrome() {
    var back = document.querySelector('a.gallery-app-back');
    var footer = document.querySelector('a.gallery-app-footer-home');
    if (!back && !footer) {
      cleanStampOnGuide();
      return;
    }

    normalizeStampForCurrentPage();
    cleanStampOnGuide();

    var here = pathOf(location.href);
    var ret = readReturn();

    // Tools hub: Guide or Gallery only
    if (isToolsHubPath(here)) {
      if (ret && ret.label === 'gallery') {
        applyGalleryChrome(back, footer);
      } else {
        setChromeLink(back, 'index.html', 'tools.backToGuide', 'Back to the Guide');
        if (footer) setChromeLink(footer, 'index.html', 'tools.backToGuide', 'Back to the Guide');
      }
      return;
    }

    if (isToolMiniAppPath(here)) {
      // Stale bare tools stamp (or missing stamp) while document.referrer is the guide —
      // typical after browser-back left a tools stamp, then user deep-linked from Essentials.
      // Do NOT override a tools stamp that has a parent (real Tools hub → mini-app hop).
      var staleTools = ret && ret.label === 'tools' && !ret.parent;
      if (referrerIsGuide() && (!ret || staleTools)) {
        writeReturn({
          label: 'guide',
          href: 'index.html',
          scrollY: 0,
          parent: null,
          ts: Date.now(),
          to: here
        });
        applyGuideChrome(back, footer);
        return;
      }
      if (applyStampChrome(back, footer, ret, {})) return;
      if (referrerIsGuide()) {
        applyGuideChrome(back, footer);
        return;
      }
      applyToolsChrome(back, footer);
      return;
    }

    if (isGalleryPath(here)) {
      if (applyStampChrome(back, footer, ret, { forbidGallery: true })) return;
      applyGuideChrome(back, footer);
      return;
    }

    if (isLegalPath(here)) {
      if (applyStampChrome(back, footer, ret, {})) return;
      applyGuideChrome(back, footer);
    }
  }

  function restoreGuideScroll() {
    // Never apply guide scrollY on mini-apps / legal (would clamp to doc end).
    if (document.body.classList.contains('page-legal')
      || document.body.classList.contains('page-gallery')
      || document.body.classList.contains('page-tools')) {
      return;
    }
    if (!isGuidePath(pathOf(location.href))) return;
    var ret = readReturn();
    if (!ret || ret.label !== 'guide' || typeof ret.scrollY !== 'number') return;
    // Allow restore when scrollY is set (including pending flag from Back chrome)
    if (!ret.scrollY && !ret.pendingScrollRestore) return;
    try {
      if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    } catch (e) {}
    var y = ret.scrollY || 0;
    if (!y) return;
    try {
      // Consume one-shot restore so later in-page reloads don't jump
      ret.scrollY = 0;
      delete ret.pendingScrollRestore;
      writeReturn(ret);
    } catch (e2) {}
    var apply = function () {
      try { window.scrollTo(0, y); } catch (e3) {}
    };
    requestAnimationFrame(function () {
      requestAnimationFrame(apply);
    });
    window.addEventListener('load', apply, { once: true });
    window.addEventListener('pageshow', function (ev) {
      if (ev && ev.persisted) apply();
    }, { once: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      applyReturnChrome();
      restoreGuideScroll();
    });
  } else {
    applyReturnChrome();
    restoreGuideScroll();
  }

  window.addEventListener('load', function () {
    applyReturnChrome();
  });

  window.__usaTravelNavReturn = {
    stamp: stampOutbound,
    read: readReturn,
    apply: applyReturnChrome,
    pop: popReturnOnBack,
    clear: clearReturn
  };

  document.addEventListener('duskline:prefs', function (e) {
    const type = e && e.detail && e.detail.type;
    if (type !== 'lang') return;
    applyReturnChrome();
  });
})();
