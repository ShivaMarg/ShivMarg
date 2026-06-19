/*!
 * last-visited.js
 * --------------------------------------------------------
 * Shows a "Continue where you left off" popup with the
 * previous page's title, image, and link.
 *
 * Usage:
 *   <script src="/js/last-visited.js"></script>
 *
 * Optional config (set BEFORE the script tag loads):
 *   <script>
 *     window.LAST_VISITED_CONFIG = {
 *       image: "/images/custom-thumb.jpg", // overrides auto og:image detection
 *       expireAfterDays: 30,                // forget after N days of inactivity (default 30)
 *       excludePaths: ["/login", "/checkout"], // never store/show these paths
 *       storageKey: "lv_last_page"          // localStorage key
 *     };
 *   </script>
 *   <script src="/js/last-visited.js"></script>
 *
 * Behavior:
 *   - Navigating between pages within the SAME tab/session: no popup,
 *     just silently records the page (using sessionStorage as the flag).
 *   - Closing the tab/browser and coming back later (new session) to
 *     ANY page on the site: shows the "continue where you left off" card
 *     pointing to whatever page they were last on.
 * --------------------------------------------------------
 */
(function () {
  "use strict";

  var cfg = Object.assign(
    {
      image: null,
      expireAfterDays: 30,
      excludePaths: [],
      storageKey: "lv_last_page",
      debug: false
    },
    window.LAST_VISITED_CONFIG || {}
  );

  var STORAGE_KEY = cfg.storageKey;
  var SESSION_FLAG = STORAGE_KEY + "_session_active";

  function getCurrentPageData() {
    var img = cfg.image;
    if (!img) {
      var metaImg =
        document.querySelector('meta[property="og:image"]') ||
        document.querySelector('meta[name="og:image"]') ||
        document.querySelector('meta[name="twitter:image"]') || '/images/ShivMarg.png';
      img = metaImg ? metaImg.getAttribute("content") : null;
    }
    return {
      url: window.location.href,
      path: window.location.pathname,
      title: document.title || window.location.hostname,
      image: img,
      timestamp: Date.now()
    };
  }

  function isExcluded(path) {
    return cfg.excludePaths.some(function (p) {
      return path.indexOf(p) === 0;
    });
  }

  function saveCurrentPage() {
    if (isExcluded(window.location.pathname)) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(getCurrentPageData()));
    } catch (e) {
      /* localStorage unavailable (private mode etc) — fail silently */
    }
  }

  function getStoredPage() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function normalizeHost(host) {
    return (host || "").replace(/^www\./, "").toLowerCase();
  }

  function cameFromSameSite() {
    if (!document.referrer) {
      if (cfg.debug) console.log("[last-visited] no referrer -> treated as fresh visit");
      return false; // no referrer = direct visit, new tab, bookmark, etc.
    }
    try {
      var refHost = normalizeHost(new URL(document.referrer).hostname);
      var curHost = normalizeHost(window.location.hostname);
      var same = refHost === curHost;
      if (cfg.debug) {
        console.log(
          "[last-visited] referrer host:", refHost,
          "| current host:", curHost,
          "| same site:", same
        );
      }
      return same;
    } catch (e) {
      return false;
    }
  }

  function isNewSession() {
    // If the browser says we navigated here FROM another page on this
    // same site, this is definitely just routing -> not a fresh visit.
    if (cameFromSameSite()) {
      try {
        sessionStorage.setItem(SESSION_FLAG, "1");
      } catch (e) {}
      return false;
    }
    try {
      if (sessionStorage.getItem(SESSION_FLAG)) return false;
      sessionStorage.setItem(SESSION_FLAG, "1");
      return true;
    } catch (e) {
      // sessionStorage unavailable -> fall back to always showing
      return true;
    }
  }

  function shouldShowPopup(stored, isNewSess) {
    if (!stored) {
      if (cfg.debug) console.log("[last-visited] no stored page -> skip");
      return false;
    }
    if (!isNewSess) {
      if (cfg.debug) console.log("[last-visited] same session/internal nav -> skip");
      return false;
    }
    if (stored.path === window.location.pathname) {
      if (cfg.debug) console.log("[last-visited] stored path same as current -> skip");
      return false;
    }

    var ageMs = Date.now() - stored.timestamp;
    var maxMs = cfg.expireAfterDays * 24 * 60 * 60 * 1000;
    if (ageMs > maxMs) {
      if (cfg.debug) console.log("[last-visited] stored page too old -> skip");
      return false;
    }
    if (cfg.debug) console.log("[last-visited] showing popup for:", stored.url);
    return true;
  }

  function injectStyles() {
    if (document.getElementById("lv-styles")) return;
    var css =
      "#lv-overlay{position:fixed;inset:0;background:rgba(20,15,10,.55);" +
      "display:flex;align-items:flex-end;justify-content:center;z-index:999999;" +
      "opacity:0;transition:opacity .25s ease;backdrop-filter:blur(2px);}" +
      "#lv-overlay.lv-show{opacity:1;}" +
      "#lv-card{width:100%;max-width:480px;background:#fff7ec;" +
      "border-radius:28px 28px 0 0;padding:28px 24px 32px;box-sizing:border-box;" +
      "transform:translateY(100%);transition:transform .32s cubic-bezier(.22,1,.36,1);" +
      "box-shadow:0 -10px 40px rgba(0,0,0,.25);position:relative;" +
      "font-family:Arial,Helvetica,sans-serif;}" +
      "#lv-overlay.lv-show #lv-card{transform:translateY(0);}" +
      "#lv-handle{width:42px;height:5px;background:#d8c9b3;border-radius:4px;" +
      "margin:0 auto 18px;}" +
      "#lv-close{position:absolute;top:14px;right:16px;width:32px;height:32px;" +
      "border-radius:50%;background:rgba(0,0,0,.06);border:none;font-size:18px;" +
      "color:#5c4a35;cursor:pointer;line-height:32px;text-align:center;padding:0;}" +
      "#lv-img-wrap{display:flex;justify-content:center;margin-bottom:18px;}" +
      "#lv-img{max-height:160px;max-width:80%;object-fit:contain;" +
      "filter:drop-shadow(0 8px 18px rgba(0,0,0,.25));border-radius:14px;}" +
      "#lv-eyebrow{text-align:center;font-size:13px;letter-spacing:.5px;" +
      "color:#a8631f;font-weight:700;text-transform:uppercase;margin-bottom:6px;}" +
      "#lv-title{text-align:center;font-size:26px;line-height:1.15;font-weight:800;" +
      "color:#5c3a1e;margin:0 0 6px;word-break:break-word;}" +
      "#lv-sub{text-align:center;font-size:14px;color:#8a6f52;margin:0 0 22px;" +
      "overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}" +
      "#lv-btn{display:block;width:100%;text-align:center;background:#5c3a1e;" +
      "color:#fff;font-size:17px;font-weight:700;padding:15px 0;border-radius:40px;" +
      "text-decoration:none;box-shadow:0 6px 14px rgba(92,58,30,.35);}" +
      "#lv-btn:active{transform:scale(.98);}" +
      "@media (min-width:640px){" +
      "#lv-overlay{align-items:center;}" +
      "#lv-card{border-radius:24px;max-width:380px;}" +
      "#lv-handle{display:none;}" +
      "}";
    var style = document.createElement("style");
    style.id = "lv-styles";
    style.textContent = css;
    document.head.appendChild(style);
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function showPopup(data) {
    injectStyles();

    var overlay = document.createElement("div");
    overlay.id = "lv-overlay";

    var imgHtml = data.image
      ? '<div id="lv-img-wrap"><img id="lv-img" src="' +
        escapeHtml(data.image) +
        '" alt=""></div>'
      : "";

    var hostname = "";
    try {
      hostname = new URL(data.url).hostname.replace("www.", "");
    } catch (e) {
      hostname = "";
    }

    overlay.innerHTML =
      '<div id="lv-card" role="dialog" aria-label="Continue where you left off">' +
      '<button id="lv-close" aria-label="Close">&times;</button>' +
      '<div id="lv-handle"></div>' +
      imgHtml +
      '<div id="lv-eyebrow">Welcome back</div>' +
      '<h2 id="lv-title">' +
      escapeHtml(data.title) +
      "</h2>" +
      '<p id="lv-sub">' +
      escapeHtml(hostname) +
      "</p>" +
      '<a id="lv-btn" href="' +
      escapeHtml(data.url) +
      '">Continue where you left off</a>' +
      "</div>";

    document.body.appendChild(overlay);

    requestAnimationFrame(function () {
      overlay.classList.add("lv-show");
    });

    function close() {
      overlay.classList.remove("lv-show");
      setTimeout(function () {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }, 300);
    }

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) close(); // click on blank/dark space closes it
    });
    overlay.querySelector("#lv-close").addEventListener("click", close);

    document.addEventListener("keydown", function escListener(e) {
      if (e.key === "Escape") {
        close();
        document.removeEventListener("keydown", escListener);
      }
    });
  }

  function init() {
    var stored = getStoredPage();
    var isNewSess = isNewSession();
    if (shouldShowPopup(stored, isNewSess)) {
      // wait a tick so it doesn't fight with page's own load animations
      setTimeout(function () {
        showPopup(stored);
      }, 600);
    }
    // Always update storage to the page being viewed right now,
    // so the *next* fresh session shows this one.
    saveCurrentPage();
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    init();
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }
})();