/**
 * muhurat-widget.js
 * =================
 * Drop this ONE script on any page. Anywhere you want a muhurat list,
 * add:
 *
 *   <div class="muhurat-widget" data-type="vivah"></div>
 *   <div class="muhurat-widget" data-type="mundan"></div>
 *   <div class="muhurat-widget" data-type="upanayan"></div>
 *
 * Optional attributes on the div:
 *   data-year="2027"     -- defaults to current year
 *   data-limit="5"        -- defaults to 8
 *   data-title="false"    -- set to "false" to hide the built-in heading
 *
 * Only shows UPCOMING dates (today or later). If the current year runs
 * out of upcoming dates (e.g. you're in December), it automatically
 * pulls from next year's JSON too, so the widget never goes empty.
 *
 * Data source: /muhurat_data.json (relative to site root).
 * Change JSON_PATH below if you host it elsewhere.
 */

(function () {
  const JSON_PATH = '/muhurat_data.json';

  const TITLES = {
    vivah: 'विवाहक मुहूर्त',
    mundan: 'मुड़न मुहूर्त',
    upanayan: 'उपनयन मुहूर्त',
  };

  const MONTH_NAMES = ['जनवरी','फरवरी','मार्च','अप्रैल','मई','जून',
                        'जुलाई','अगस्त','सितम्बर','अक्टूबर','नवम्बर','दिसम्बर'];

  let dataPromise = null;

  function loadData() {
    if (!dataPromise) {
      dataPromise = fetch(JSON_PATH)
        .then(res => {
          if (!res.ok) throw new Error(`Could not load ${JSON_PATH} (${res.status})`);
          return res.json();
        })
        .catch(err => {
          console.error('[muhurat-widget]', err);
          return null;
        });
    }
    return dataPromise;
  }

  function formatEntry(e) {
    const d = new Date(e.date);
    const dateStr = `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} (${e.vaar})`;
    return `${dateStr} – ${e.masa} ${e.paksha} ${e.tithi}। ${e.nakshatra} नक्षत्र।`;
  }

  // today at midnight, so "today" itself still counts as upcoming
  function todayMidnight() {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }

  function getUpcomingEntries(data, type, startYear, limit) {
    const key = `${type}_muhurat`;
    const today = todayMidnight();
    let entries = [];
    let year = startYear;

    // keep pulling from later years until we have enough upcoming entries
    // (safety cap: don't look more than 5 years ahead)
    for (let i = 0; i < 5 && entries.length < limit; i++) {
      const yearData = data[String(year)];
      if (yearData && yearData[key]) {
        const upcoming = yearData[key].filter(e => new Date(e.date) >= today);
        entries = entries.concat(upcoming);
      }
      year++;
    }

    return entries.slice(0, limit);
  }

  function renderWidget(el, entries, type, showTitle) {
    let html = '';
    if (showTitle) {
      html += `<h3 class="muhurat-widget-title">${TITLES[type] || type}</h3>`;
    }

    if (entries.length === 0) {
      html += `<p class="muhurat-widget-empty">आगामी कोनो शुभ मुहूर्त उपलब्ध नहि अछि।</p>`;
    } else {
      html += '<div class="muhurat-widget-list">';
      entries.forEach(e => {
        html += `
          <div class="muhurat-card">
            <span class="m-date-badge">✦ ${MONTH_NAMES[new Date(e.date).getMonth()]} ${new Date(e.date).getFullYear()}</span>
            <span class="m-tithi">${formatEntry(e)}</span>
          </div>`;
      });
      html += '</div>';
    }

    el.innerHTML = html;
  }

  function initAll() {
    const widgets = document.querySelectorAll('.muhurat-widget');
    if (widgets.length === 0) return;

    loadData().then(data => {
      if (!data) return;

      widgets.forEach(el => {
        const type = el.dataset.type;
        if (!TITLES[type]) {
          console.warn('[muhurat-widget] unknown data-type:', type, el);
          return;
        }
        const year = parseInt(el.dataset.year || String(new Date().getFullYear()), 10);
        const limit = parseInt(el.dataset.limit || '8', 10);
        const showTitle = el.dataset.title !== 'false';

        const entries = getUpcomingEntries(data, type, year, limit);
        renderWidget(el, entries, type, showTitle);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();