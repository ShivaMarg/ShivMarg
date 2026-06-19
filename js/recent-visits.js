(function () {
  'use strict';
  var STORAGE_KEY = 'sm_recent_visits';
  var MAX_ITEMS = 5;

  function safeGet() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function safeSet(list) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch (e) {}
  }

  function cleanTitle(t) {
    return (t || '').replace(/\s*[\|\-–]\s*Shiv\.?a?Marg.*$/i, '').trim() || 'पृष्ठ';
  }

  var ICON_MAP = [
    [/shiv|mahamrityunjaya/i, '🔱'],
    [/durga/i, '🪔'],
    [/krishna/i, '🦚'],
    [/ganesh/i, '🐘'],
    [/Shri-ram|ram\b/i, '🏹'],
    [/hanuman/i, '🙏'],
    [/lakshmi/i, '🌸'],
    [/saraswati|sharaswati/i, '📚'],
    [/vishnu/i, '🪷'],
    [/kali/i, '⚔️'],
    [/surya/i, '🌞'],
    [/gayatri/i, '🌅'],
    [/chandra/i, '🌙'],
    [/kartik/i, '🦚'],
    [/panchang/i, '📅'],
    [/vidyapati|maithili/i, '🎭']
  ];

  function getIcon(url) {
    for (var i = 0; i < ICON_MAP.length; i++) {
      if (ICON_MAP[i][0].test(url)) return ICON_MAP[i][1];
    }
    return '✦';
  }

  function render(list) {
    var trackEl = document.getElementById('rv-track');
    var section = document.getElementById('recent-visits-section');
    if (!trackEl || !section) return; // section only exists on index.html

    var currentPath = window.location.pathname;
    var items = list.filter(function (i) { return i.url !== currentPath; }).slice(0, MAX_ITEMS);

    if (!items.length) {
      section.classList.remove('has-items');
      trackEl.innerHTML = '';
      return;
    }

    trackEl.innerHTML = items.map(function (i) {
      return '<a class="rv-item" href="' + i.url + '">' +
        '<span class="rv-item-icon">' + getIcon(i.url) + '</span>' +
        '<span class="rv-item-text">' + i.title + '</span>' +
        '</a>';
    }).join('');

    section.classList.add('has-items');
  }

  function trackVisit() {
    var list = safeGet();
    var path = window.location.pathname;
    var title = cleanTitle(document.title);

    // Render existing list FIRST so current page never shows in its own list
    render(list);

    // Then record this visit for future pages
    list = list.filter(function (i) { return i.url !== path; });
    list.unshift({ url: path, title: title, ts: Date.now() });
    list = list.slice(0, MAX_ITEMS);
    safeSet(list);
  }

  window.SMRecentVisits = {
    clear: function () {
      safeSet([]);
      var trackEl = document.getElementById('rv-track');
      var section = document.getElementById('recent-visits-section');
      if (trackEl) trackEl.innerHTML = '';
      if (section) section.classList.remove('has-items');
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', trackVisit);
  } else {
    trackVisit();
  }
})();