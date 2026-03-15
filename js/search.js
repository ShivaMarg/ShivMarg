(function () {
  /* === Wait for DOM === */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    const input = document.querySelector('.nav-search');
    if (!input) return; /* page has no nav-search, skip */

    /* === Inject dropdown wrapper around existing input === */
    const wrapper = document.createElement('div');
    wrapper.id = 'sm-search-wrap';
    wrapper.style.cssText = 'position:relative;display:inline-block;';

    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);

    /* Give input an ID so we can reference it */
    input.id = 'sm-search-input';
    input.setAttribute('autocomplete', 'off');

    /* Create dropdown panel */
    const dropdown = document.createElement('div');
    dropdown.id = 'sm-dropdown';
    dropdown.style.cssText = `
      display:none;
      position:absolute;
      top:calc(100% + 8px);
      right:0;
      width:340px;
      max-height:420px;
      overflow-y:auto;
      background:rgba(13,5,0,0.97);
      border:1px solid rgba(212,160,23,0.35);
      border-radius:2px;
      z-index:9999;
      backdrop-filter:blur(16px);
      -webkit-backdrop-filter:blur(16px);
      box-shadow:0 20px 60px rgba(0,0,0,0.8);
    `;
    wrapper.appendChild(dropdown);

    /* Scrollbar styling injected once */
    if (!document.getElementById('sm-style')) {
      const style = document.createElement('style');
      style.id = 'sm-style';
      style.textContent = `
        #sm-dropdown::-webkit-scrollbar { width: 4px; }
        #sm-dropdown::-webkit-scrollbar-track { background: transparent; }
        #sm-dropdown::-webkit-scrollbar-thumb { background: rgba(212,160,23,0.3); border-radius: 2px; }
        #sm-search-input:focus { border-color: #D4A017 !important; outline: none; }
      `;
      document.head.appendChild(style);
    }

    /* === State === */
    let index = [];
    let fetchDone = false;
    let fetchStarted = false;

    /* === Load index lazily on first focus === */
    input.addEventListener('focus', function () {
      if (!fetchStarted) {
        fetchStarted = true;
        fetch('/search-index.json')
          .then(function (r) { return r.json(); })
          .then(function (data) { index = data; fetchDone = true; })
          .catch(function () { fetchDone = true; });
      }
    });

    /* === Search on input === */
    input.addEventListener('input', function () {
      var q = this.value.trim().toLowerCase();
      if (!q || q.length < 2) { hide(); return; }
      if (!fetchDone) { renderMessage('लोड हो रहा है…'); return; }
      var results = doSearch(q);
      render(results, q);
    });

    /* === Close on outside click === */
    document.addEventListener('click', function (e) {
      if (!wrapper.contains(e.target)) hide();
    });

    /* === Close on Escape === */
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { hide(); this.blur(); }
    });

    /* === Search logic === */
    function doSearch(q) {
      return index.filter(function (item) {
        var haystack = [
          item.title || '',
          item.titleEng || '',
          item.category || '',
          item.preview || ''
        ].concat(item.keywords || []).join(' ').toLowerCase();
        return haystack.indexOf(q) !== -1;
      }).slice(0, 8);
    }

    /* === Render results === */
    function render(results, q) {
      if (!results.length) {
        renderMessage('कोई परिणाम नहीं मिला');
        return;
      }

      var html = results.map(function (item, i) {
        var previewText = (item.preview || '').substring(0, 55);
        return '<a href="' + item.url + '" style="' +
          'display:flex;align-items:center;gap:12px;' +
          'padding:12px 16px;text-decoration:none;color:inherit;' +
          'border-bottom:1px solid rgba(212,160,23,0.1);' +
          'background:' + (i % 2 ? 'rgba(255,255,255,0.02)' : 'transparent') + ';' +
          'transition:background 0.2s;"' +
          ' onmouseover="this.style.background=\'rgba(212,160,23,0.1)\'"' +
          ' onmouseout="this.style.background=\'' + (i % 2 ? 'rgba(255,255,255,0.02)' : 'transparent') + '\'">' +

          '<span style="font-size:1.4rem;line-height:1;flex-shrink:0;">' + (item.symbol || '🕉️') + '</span>' +

          '<div style="flex:1;overflow:hidden;">' +
            '<div style="font-family:\'Tiro Devanagari Sanskrit\',serif;font-size:0.95rem;' +
              'color:#F2C94C;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' +
              highlight(item.title || '', q) +
            '</div>' +
            '<div style="font-family:\'Cinzel\',serif;font-size:0.6rem;letter-spacing:2px;' +
              'color:rgba(253,245,230,0.4);text-transform:uppercase;margin:2px 0;">' +
              (item.category || '') +
            '</div>' +
            '<div style="font-family:\'Tiro Devanagari Sanskrit\',serif;font-size:0.78rem;' +
              'color:rgba(253,245,230,0.55);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' +
              previewText + (previewText.length >= 55 ? '…' : '') +
            '</div>' +
          '</div>' +

          '<span style="color:rgba(212,160,23,0.4);font-size:0.75rem;flex-shrink:0;">→</span>' +
        '</a>';
      }).join('');

      html += '<div style="padding:8px 16px;text-align:center;font-family:\'Cinzel\',serif;' +
        'font-size:0.58rem;letter-spacing:2px;color:rgba(253,245,230,0.25);text-transform:uppercase;">' +
        results.length + ' परिणाम मिले</div>';

      dropdown.innerHTML = html;
      show();
    }

    /* === Highlight matched text === */
    function highlight(text, q) {
      var escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return text.replace(
        new RegExp('(' + escaped + ')', 'gi'),
        '<span style="color:#FF6B00;font-weight:bold;">$1</span>'
      );
    }

    function renderMessage(msg) {
      dropdown.innerHTML = '<div style="padding:20px;text-align:center;' +
        'font-family:\'Cinzel\',serif;font-size:0.75rem;' +
        'letter-spacing:2px;color:rgba(253,245,230,0.4);">' + msg + '</div>';
      show();
    }

    function show() { dropdown.style.display = 'block'; }
    function hide() { dropdown.style.display = 'none'; }
  }
})();