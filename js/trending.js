/**
 * trending.js — ShivMarg Trending Pages Widget
 * Usage: <div id="sm-trending"></div>  then include this script
 */

(function () {
  const API = "https://api.shivmarg.live/api/public/trending-pages?limit=6";
  const TRACK_API = "https://api.shivmarg.live/api/public/track";
  const CONTAINER_ID = "sm-trending";

  /* ── Track current page view ─────────────────────────── */
  function trackCurrentPage() {
    const pageId = document.body.dataset.pageId
      || window.SM_PAGE_ID          // fallback: set this var in your page
      || location.pathname.replace(/\//g, "").replace(/-/g, "-") 
      || "home";

    // fire-and-forget, no await needed
    fetch(TRACK_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page_id: pageId,
        ref:     document.referrer.slice(0, 200),
        ua_hint: /Mobi/i.test(navigator.userAgent) ? "mobile" : "desktop",
      }),
    }).catch(() => {}); // silent fail — never break the page
  }

  /* ── Render skeleton while loading ──────────────────── */
  function renderSkeleton(container) {
    container.innerHTML = `
      <div class="trending-header">
        <span class="trending-icon">🔥</span>
        <h2 class="trending-title">अभी सबसे अधिक पढ़ा जा रहा</h2>
      </div>
      <div class="trending-grid">
        ${Array(6).fill(`
          <div class="trending-card skeleton">
            <div class="sk-icon"></div>
            <div class="sk-lines">
              <div class="sk-line sk-w70"></div>
              <div class="sk-line sk-w45"></div>
            </div>
          </div>`).join("")}
      </div>`;
  }

  /* ── Render real cards ───────────────────────────────── */
  function renderCards(container, items) {
    if (!items || items.length === 0) {
      container.innerHTML = "";
      return;
    }

    const cards = items.map((item, i) => `
      <a class="trending-card" href="${item.url}" aria-label="${item.title}">
        <div class="trending-rank">${i + 1}</div>
        <div class="trending-card-icon">${item.icon}</div>
        <div class="trending-card-body">
          <div class="trending-card-title">${item.title}</div>
          <div class="trending-card-views">
            <span class="views-dot"></span>
            ${formatViews(item.views)} पाठक
          </div>
        </div>
        <div class="trending-card-arrow">›</div>
      </a>`).join("");

    container.innerHTML = `
      <div class="trending-header">
        <span class="trending-fire">🔥</span>
        <h2 class="trending-title">अभी सबसे अधिक पढ़ा जा रहा</h2>
        <span class="trending-live-dot" title="Live data"></span>
      </div>
      <div class="trending-grid">${cards}</div>
      <div class="trending-footer">
        ShivMarg पर सबसे लोकप्रिय सामग्री
      </div>`;
  }

  function formatViews(n) {
    if (n >= 1000) return (n / 1000).toFixed(1) + "k";
    return String(n);
  }

  /* ── Inject CSS (once) ───────────────────────────────── */
  function injectStyles() {
    if (document.getElementById("sm-trending-style")) return;
    const s = document.createElement("style");
    s.id = "sm-trending-style";
    s.textContent = `
      /* ── TRENDING WIDGET ── */
      #sm-trending {
        padding: 1.5rem 0;
        font-family: 'Noto Sans Devanagari', 'Noto Serif Devanagari', sans-serif;
      }

      .trending-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 1rem;
        padding: 0 2rem;
      }

      .trending-fire { font-size: 1.4rem; }

      .trending-title {
        font-size: 1.15rem;
        font-weight: 700;
        color: var(--mithila-maroon, #7D1E0F);
        font-family: 'Noto Serif Devanagari', serif;
        margin: 0;
        flex: 1;
      }

      /* pulsing green dot — "live" indicator */
      .trending-live-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #27AE60;
        box-shadow: 0 0 0 0 rgba(39,174,96,0.6);
        animation: livePulse 2s infinite;
        flex-shrink: 0;
      }

      @keyframes livePulse {
        0%   { box-shadow: 0 0 0 0 rgba(39,174,96,0.6); }
        70%  { box-shadow: 0 0 0 7px rgba(39,174,96,0); }
        100% { box-shadow: 0 0 0 0 rgba(39,174,96,0); }
      }

      /* 3-column grid on desktop, 2 on tablet, 1 on mobile */
      .trending-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        padding: 0 2rem;
      }

      @media (max-width: 900px) {
        .trending-grid { grid-template-columns: repeat(2, 1fr); }
      }

      @media (max-width: 540px) {
        .trending-grid { grid-template-columns: 1fr; padding: 0 1rem; }
        .trending-header { padding: 0 1rem; }
      }

      /* ── CARD ── */
      .trending-card {
        display: flex;
        align-items: center;
        gap: 12px;
        background: #fff;
        border: 1px solid rgba(200,144,26,0.25);
        border-left: 4px solid var(--saffron, #D4520A);
        border-radius: 10px;
        padding: 12px 14px;
        text-decoration: none;
        color: inherit;
        transition: transform 0.18s, box-shadow 0.18s, border-color 0.18s;
        position: relative;
        overflow: hidden;
      }

      .trending-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(200,144,26,0.18);
        border-left-color: var(--gold, #C8901A);
      }

      /* rank badge */
      .trending-rank {
        position: absolute;
        top: 6px;
        right: 8px;
        font-size: 0.6rem;
        font-weight: 700;
        color: rgba(200,144,26,0.5);
        font-family: 'Noto Sans Devanagari', sans-serif;
      }

      .trending-card-icon {
        font-size: 1.6rem;
        flex-shrink: 0;
        line-height: 1;
      }

      .trending-card-body { flex: 1; min-width: 0; }

      .trending-card-title {
        font-size: 0.92rem;
        font-weight: 700;
        color: var(--text-dark, #1A0800);
        font-family: 'Noto Serif Devanagari', serif;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 1.3;
      }

      .trending-card-views {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 0.7rem;
        color: var(--text-light, #7A4520);
        font-family: 'Noto Sans Devanagari', sans-serif;
        margin-top: 3px;
      }

      .views-dot {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: var(--green-auspicious, #2D6A4F);
        flex-shrink: 0;
      }

      .trending-card-arrow {
        font-size: 1.2rem;
        color: rgba(200,144,26,0.5);
        flex-shrink: 0;
      }

      /* ── FOOTER ── */
      .trending-footer {
        text-align: center;
        font-size: 0.72rem;
        color: var(--text-light, #7A4520);
        font-family: 'Noto Sans Devanagari', sans-serif;
        margin-top: 10px;
        opacity: 0.7;
      }

      /* ── SKELETON ── */
      .trending-card.skeleton {
        pointer-events: none;
        border-left-color: rgba(200,144,26,0.15);
      }

      .sk-icon {
        width: 32px; height: 32px;
        border-radius: 50%;
        background: linear-gradient(90deg, #f0e8d8 25%, #faf4e8 50%, #f0e8d8 75%);
        background-size: 200% 100%;
        animation: shimmer 1.4s infinite;
        flex-shrink: 0;
      }

      .sk-lines { flex: 1; }

      .sk-line {
        height: 10px;
        border-radius: 5px;
        background: linear-gradient(90deg, #f0e8d8 25%, #faf4e8 50%, #f0e8d8 75%);
        background-size: 200% 100%;
        animation: shimmer 1.4s infinite;
        margin-bottom: 6px;
      }

      .sk-w70 { width: 70%; }
      .sk-w45 { width: 45%; }

      @keyframes shimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `;
    document.head.appendChild(s);
  }

  /* ── Main init ───────────────────────────────────────── */
  function init() {
    const container = document.getElementById(CONTAINER_ID);
    if (!container) return;

    injectStyles();
    renderSkeleton(container);
    trackCurrentPage();

    fetch(API)
      .then((r) => r.json())
      .then((data) => renderCards(container, data.trending))
      .catch(() => {
        container.innerHTML = ""; // silent fail — hide widget on error
      });
  }

  /* Run after DOM ready */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();