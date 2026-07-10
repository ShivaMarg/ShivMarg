/* =========================================================
   ShivMarg — मेरी साधना Dashboard
   dashboard.js

   Wires dashboard.html to the ShivaMarg FastAPI backend:
     - /api/auth/*          (auth.js already handles login; this
                              file assumes a token already exists)
     - /api/streak/*        (streak_ping / streak_me)
     - /api/puja/*          (puja_routes.py)
     - /api/challenges/*    (challenge_routes.py)
     - /api/family/*        (family_routes.py)

   Drop this file next to dashboard.html and adjust API_BASE /
   TOKEN_KEY below to match the rest of your frontend (pwa.js,
   auth.js, mantra-tracker.html, etc).
   ========================================================= */

(() => {
  'use strict';

  // ---------------------------------------------------------
  // CONFIG — adjust these two to match the rest of your site
  // ---------------------------------------------------------
  const API_BASE  =  'https://www.api.shivmarg.live'; // must match the base your FastAPI backend is running on
  const TOKEN_KEY = 'admin_token'; // must match the key your login flow writes to localStorage

  // ---------------------------------------------------------
  // DOM refs
  // ---------------------------------------------------------
  const $authGate      = document.getElementById('authGate');
  const $app            = document.getElementById('app');
  const $viewsRoot       = document.getElementById('views-root');
  const $tabbar          = document.getElementById('tabbar');
  const $mobileTabbar     = document.getElementById('mobileTabbar');
  const $headerStreakNum  = document.getElementById('headerStreakNum');
  const $avatarBtn        = document.getElementById('avatarBtn');
  const $toastStack       = document.getElementById('toastStack');
  const $modalBackdrop    = document.getElementById('modalBackdrop');
  const $modalBody        = document.getElementById('modalBody');

  let currentUser = null;
  const VIEWS = ['overview', 'puja', 'diary', 'challenges', 'family', 'settings'];

  // ---------------------------------------------------------
  // Token helpers
  // ---------------------------------------------------------
  const getToken   = () => localStorage.getItem(TOKEN_KEY);
  const clearToken = () => localStorage.removeItem(TOKEN_KEY);

  // ---------------------------------------------------------
  // Fetch wrapper
  // ---------------------------------------------------------
  async function api(path, { method = 'GET', body = null } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let res;
    try {
      res = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (err) {
      throw new Error('नेटवर्क त्रुटि — कृपया अपना इंटरनेट जांचें।');
    }

    if (res.status === 401) {
      clearToken();
      showGate();
      throw new Error('सत्र समाप्त हो गया। कृपया पुनः लॉगिन करें।');
    }

    let data = null;
    try { data = await res.json(); } catch (_) { /* empty body, e.g. 204 */ }

    if (!res.ok) {
      const detail = data && (data.detail || data.message);
      throw new Error(typeof detail === 'string' ? detail : `त्रुटि (${res.status})`);
    }
    return data;
  }

  // ---------------------------------------------------------
  // Toast
  // ---------------------------------------------------------
  function toast(msg, type = '') {
    const el = document.createElement('div');
    el.className = `toast ${type}`.trim();
    el.textContent = msg;
    $toastStack.appendChild(el);
    setTimeout(() => el.remove(), 3600);
  }

  // ---------------------------------------------------------
  // Modal
  // ---------------------------------------------------------
  function openModal(html) {
    $modalBody.innerHTML = `<button class="modal-close" id="modalCloseBtn">✕</button>${html}`;
    $modalBackdrop.classList.add('active');
    document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
  }
  function closeModal() {
    $modalBackdrop.classList.remove('active');
    $modalBody.innerHTML = '';
  }
  $modalBackdrop.addEventListener('click', (e) => {
    if (e.target === $modalBackdrop) closeModal();
  });

  // ---------------------------------------------------------
  // Small utils
  // ---------------------------------------------------------
  function escapeHTML(s = '') {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }
  function userTypeLabel(t) {
    return {
      working_professional: 'व्यस्त जीवन (कामकाजी)',
      student: 'विद्यार्थी',
      homemaker: 'गृहस्थ',
      senior_citizen: 'वरिष्ठ नागरिक',
    }[t] || t;
  }
  function relationLabel(r) {
    return {
      owner: 'स्वामी', parent: 'माता-पिता', child: 'बच्चा',
      grandparent: 'दादा-दादी', other: 'अन्य',
    }[r] || r;
  }
  function heatColor(count) {
    if (count <= 0) return 'var(--cream-deep)';
    if (count === 1) return '#F3C98A';
    if (count === 2) return '#E8A24C';
    return 'var(--saffron)';
  }
  function skeletonHTML() {
    return `<div class="view active"><div class="card col-12">
      <div class="skeleton skel-row"></div>
      <div class="skeleton skel-row"></div>
      <div class="skeleton skel-row" style="width:60%"></div>
    </div></div>`;
  }
  function errorHTML(msg) {
    return `<div class="view active"><div class="card col-12 empty">
      <span class="ic">⚠️</span>
      <p>${escapeHTML(msg)}</p>
      <button class="btn btn-ghost" onclick="location.reload()">पुनः प्रयास करें</button>
    </div></div>`;
  }
  function bindViewNavButtons() {
    $viewsRoot.querySelectorAll('[data-view]').forEach(btn => {
      btn.addEventListener('click', () => switchView(btn.dataset.view));
    });
  }

  // ---------------------------------------------------------
  // Boot / auth gate
  // ---------------------------------------------------------
  async function boot() {
    const token = getToken();
    if (!token) { showGate(); return; }
    try {
      currentUser = await api('/api/auth/me');
      showApp();
      wireTabs();
      renderHeader();
      await switchView('overview');
      pingStreak();
    } catch (err) {
      showGate();
    }
  }

  function showGate() { $authGate.style.display = 'flex'; $app.style.display = 'none'; }
  function showApp()  { $authGate.style.display = 'none'; $app.style.display = 'block'; }

  function renderHeader() {
    if (!currentUser) return;
    const initial = (currentUser.display_name || currentUser.username || 'U')[0].toUpperCase();
    $avatarBtn.textContent = initial;
    $avatarBtn.title = currentUser.display_name || currentUser.username;
  }

  async function pingStreak() {
    try {
      const res = await api('/api/streak/ping', { method: 'POST', body: {} });
      $headerStreakNum.textContent = res.streak ?? '—';
      if (res.is_new_day) toast(`🔥 ${res.streak} दिन की लगातार यात्रा जारी है!`, 'ok');
    } catch (_) { /* silent — header streak just stays "—" */ }
  }

  // ---------------------------------------------------------
  // Tabs / routing
  // ---------------------------------------------------------
  function wireTabs() {
    [$tabbar, $mobileTabbar].forEach($bar => {
      $bar.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-view]');
        if (!btn) return;
        switchView(btn.dataset.view);
      });
    });
    $avatarBtn.addEventListener('click', () => switchView('settings'));
  }

  function setActiveTabUI(view) {
    document.querySelectorAll('.tab-btn, .m-tab').forEach(b => {
      b.classList.toggle('active', b.dataset.view === view);
    });
  }

  const RENDERERS = {
    overview: renderOverview,
    puja: renderPuja,
    diary: renderDiary,
    challenges: renderChallenges,
    family: renderFamily,
    settings: renderSettings,
  };

  async function switchView(view) {
    if (!VIEWS.includes(view)) view = 'overview';
    setActiveTabUI(view);
    $viewsRoot.innerHTML = skeletonHTML();
    try {
      await RENDERERS[view]();
    } catch (err) {
      $viewsRoot.innerHTML = errorHTML(err.message);
    }
  }

  // ===========================================================
  // OVERVIEW
  // ===========================================================
  async function renderOverview() {
    const [streakR, pujaR, challR, familyR] = await Promise.allSettled([
      api('/api/streak/me'),
      api('/api/puja/today'),
      api('/api/challenges/my'),
      api('/api/family/dashboard'),
    ]);

    const streak = streakR.status === 'fulfilled' ? streakR.value : { streak: 0 };
    const puja   = pujaR.status   === 'fulfilled' ? pujaR.value   : null;
    const chall  = (challR.status === 'fulfilled' ? challR.value.challenges : []) || [];
    const family = familyR.status === 'fulfilled' ? familyR.value : null;

    const activeCount = chall.filter(c => !c.completed).length;
    const today = new Date().toLocaleDateString('hi-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    $viewsRoot.innerHTML = `
      <div class="view active">
        <section class="hero">
          <div class="hero-top">
            <div>
              <div class="hero-greet">आपकी साधना यात्रा</div>
              <h1>नमस्ते, ${escapeHTML(currentUser.display_name || currentUser.username)} 🙏</h1>
              <div class="hero-date data">${today}</div>
            </div>
          </div>
          <div class="hero-stats">
            <div class="hero-stat"><div class="num data">${streak.streak ?? 0}</div><div class="lbl">दिन की स्ट्रीक 🔥</div></div>
            <div class="hero-stat"><div class="num data">${puja ? `${puja.completed_count}/${puja.total}` : '—'}</div><div class="lbl">आज की पूजा</div></div>
            <div class="hero-stat"><div class="num data">${activeCount}</div><div class="lbl">सक्रिय चैलेंज</div></div>
            <div class="hero-stat"><div class="num data">${family ? family.members.length : 0}</div><div class="lbl">परिवार सदस्य</div></div>
          </div>
        </section>

        <div class="grid">
          <div class="card col-6">
            <div class="card-head">
              <div class="card-title"><span class="ic">🪔</span><h3>आज की पूजा</h3></div>
              <button class="card-link" data-view="puja">विस्तार से देखें →</button>
            </div>
            ${puja
              ? `<p class="data" style="font-size:13.5px;color:var(--ink-soft);">${escapeHTML(puja.title)}</p>
                 <p style="margin-top:8px;font-size:13px;">${puja.completed_count} / ${puja.total} पूर्ण</p>`
              : `<div class="empty"><span class="ic">🪔</span><p>अपनी दैनिक साधना प्रोफ़ाइल अभी सेट करें।</p>
                 <button class="btn btn-primary btn-sm" data-view="puja">शुरू करें</button></div>`
            }
          </div>

          <div class="card col-6">
            <div class="card-head">
              <div class="card-title"><span class="ic">🚩</span><h3>संकल्प चैलेंज</h3></div>
              <button class="card-link" data-view="challenges">सभी देखें →</button>
            </div>
            ${chall.length
              ? chall.slice(0, 3).map(c => `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--line);">
                  <span style="font-size:13.5px;">${escapeHTML(c.challenge_slug)}</span>
                  <span class="data" style="font-size:12.5px;color:var(--saffron-deep);font-weight:700;">${c.current_streak} 🔥</span>
                </div>`).join('')
              : `<div class="empty"><span class="ic">🚩</span><p>अभी तक कोई चैलेंज जॉइन नहीं किया।</p>
                 <button class="btn btn-primary btn-sm" data-view="challenges">चैलेंज देखें</button></div>`
            }
          </div>

          <div class="card col-6">
            <div class="card-head">
              <div class="card-title"><span class="ic">📿</span><h3>जप डायरी</h3></div>
              <button class="card-link" data-view="diary">विस्तार से देखें →</button>
            </div>
            <p style="font-size:13.5px;color:var(--ink-soft);">पिछले 30 दिनों की अपनी साधना देखें और प्रगति ट्रैक करें।</p>
          </div>

          <div class="card col-6">
            <div class="card-head">
              <div class="card-title"><span class="ic">👨‍👩‍👧‍👦</span><h3>परिवार</h3></div>
              <button class="card-link" data-view="family">विस्तार से देखें →</button>
            </div>
            ${family
              ? `<p style="font-size:13.5px;">${escapeHTML(family.family_name)} — ${family.members.length} सदस्य</p>`
              : `<div class="empty"><span class="ic">👨‍👩‍👧‍👦</span><p>अभी तक किसी परिवार से नहीं जुड़े।</p>
                 <button class="btn btn-primary btn-sm" data-view="family">जोड़ें / बनाएं</button></div>`
            }
          </div>
        </div>
      </div>`;

    bindViewNavButtons();
  }

  // ===========================================================
  // PUJA
  // ===========================================================
  async function renderPuja() {
    let data;
    try {
      data = await api('/api/puja/today');
    } catch (err) {
      // 400 → user_type not set yet
      $viewsRoot.innerHTML = `
        <div class="view active">
          <div class="card col-12">
            <div class="card-head"><div class="card-title"><span class="ic">🪔</span><h3>अपनी साधना प्रोफ़ाइल चुनें</h3></div></div>
            <p style="font-size:13.5px;color:var(--ink-soft);margin-bottom:16px;">आपकी दिनचर्या के अनुसार हम उपयुक्त दैनिक पूजा सुझाएंगे।</p>
            <div class="grid">
              ${['working_professional', 'student', 'homemaker', 'senior_citizen'].map(t => `
                <div class="card col-6" style="cursor:pointer;" data-usertype="${t}">
                  <h3 style="font-size:15px;">${userTypeLabel(t)}</h3>
                </div>`).join('')}
            </div>
          </div>
        </div>`;
      $viewsRoot.querySelectorAll('[data-usertype]').forEach(el => {
        el.addEventListener('click', async () => {
          try {
            await api('/api/puja/set-type', { method: 'POST', body: { user_type: el.dataset.usertype } });
            toast('साधना प्रोफ़ाइल सेट हो गई 🙏', 'ok');
            renderPuja();
          } catch (e) { toast(e.message, 'err'); }
        });
      });
      return;
    }

    $viewsRoot.innerHTML = `
      <div class="view active">
        <div class="card col-12">
          <div class="card-head">
            <div class="card-title"><span class="ic">🪔</span><h3>${escapeHTML(data.title)}</h3></div>
            <span class="data" style="font-size:13px;color:var(--ink-soft);">${data.completed_count}/${data.total} पूर्ण</span>
          </div>
          <div id="pujaItems">
            ${data.items.map(item => `
              <label style="display:flex;align-items:center;gap:12px;padding:12px 4px;border-bottom:1px solid var(--line);${item.completed ? 'opacity:0.6;' : ''}">
                <input type="checkbox" ${item.completed ? 'checked disabled' : ''} data-slot="${escapeHTML(item.slot)}" data-mantra="${escapeHTML(item.mantra_slug)}" style="width:20px;height:20px;accent-color:var(--tulsi);">
                <span style="flex:1;">
                  <b style="font-family:var(--font-hindi);">${escapeHTML(item.mantra_name)}</b><br>
                  <span class="data" style="font-size:12px;color:var(--ink-soft);">${escapeHTML(item.time_hint)} · ${item.repetitions} बार · ${item.duration_min} मिनट</span>
                </span>
              </label>`).join('')}
          </div>
        </div>
      </div>`;

    $viewsRoot.querySelectorAll('#pujaItems input[type=checkbox]:not(:disabled)').forEach(cb => {
      cb.addEventListener('change', async () => {
        if (!cb.checked) return;
        cb.disabled = true;
        try {
          await api('/api/puja/complete', { method: 'POST', body: { slot: cb.dataset.slot, mantra_slug: cb.dataset.mantra } });
          toast('पूर्ण हुआ 🙏', 'ok');
          renderPuja();
        } catch (e) {
          toast(e.message, 'err');
          cb.disabled = false;
          cb.checked = false;
        }
      });
    });
  }

  // ===========================================================
  // DIARY (30-day heatmap fed by /api/puja/history)
  // ===========================================================
  async function renderDiary() {
    const [history, streak] = await Promise.all([
      api('/api/puja/history?days=30'),
      api('/api/streak/me'),
    ]);

    const map = {};
    (history.history || []).forEach(d => { map[d.date] = d.completed_count; });

    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({ date: key, count: map[key] || 0 });
    }

    $viewsRoot.innerHTML = `
      <div class="view active">
        <div class="card col-12">
          <div class="card-head">
            <div class="card-title"><span class="ic">📿</span><h3>जप डायरी — पिछले 30 दिन</h3></div>
            <span class="data" style="font-size:13px;color:var(--ink-soft);">🔥 ${streak.streak ?? 0} दिन की स्ट्रीक</span>
          </div>
          <div style="display:grid;grid-template-columns:repeat(10,1fr);gap:6px;">
            ${days.map(d => `<div title="${d.date} — ${d.count} पूर्ण" style="aspect-ratio:1;border-radius:6px;background:${heatColor(d.count)};"></div>`).join('')}
          </div>
          <p style="margin-top:14px;font-size:12px;color:var(--ink-soft);">हल्का = कम गतिविधि, गहरा केसरिया = अधिक गतिविधि वाला दिन।</p>
        </div>
      </div>`;
  }

  // ===========================================================
  // CHALLENGES
  // ===========================================================
  async function renderChallenges() {
    const [allRes, mineRes] = await Promise.all([
      api('/api/challenges'),
      api('/api/challenges/my'),
    ]);
    const all = allRes.challenges || [];
    const mine = mineRes.challenges || [];
    const mineSlugs = new Set(mine.map(m => m.challenge_slug));

    $viewsRoot.innerHTML = `
      <div class="view active">
        <div class="grid">
          <div class="card col-12">
            <div class="card-head"><div class="card-title"><span class="ic">🔥</span><h3>मेरे सक्रिय चैलेंज</h3></div></div>
            ${mine.length ? mine.map(c => `
              <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 4px;border-bottom:1px solid var(--line);flex-wrap:wrap;gap:8px;">
                <div>
                  <b>${escapeHTML(c.challenge_slug)}</b><br>
                  <span class="data" style="font-size:12px;color:var(--ink-soft);">${c.total_days_completed}/${c.target_days} दिन · स्ट्रीक ${c.current_streak}🔥</span>
                </div>
                <div style="display:flex;gap:6px;">
                  ${!c.completed
                    ? `<button class="btn btn-tulsi btn-sm" data-log="${escapeHTML(c.challenge_slug)}">जाप दर्ज करें</button>`
                    : `<span class="btn btn-ghost btn-sm" style="pointer-events:none;">पूर्ण ✅</span>`}
                  <button class="btn btn-ghost btn-sm" data-board="${escapeHTML(c.challenge_slug)}">लीडरबोर्ड</button>
                </div>
              </div>`).join('') : `<div class="empty"><span class="ic">🚩</span><p>अभी तक कोई चैलेंज जॉइन नहीं किया।</p></div>`}
          </div>

          <div class="card col-12">
            <div class="card-head"><div class="card-title"><span class="ic">🕉️</span><h3>उपलब्ध चैलेंज</h3></div></div>
            <div class="grid">
              ${all.map(c => `
                <div class="card col-4">
                  <h3 style="font-size:15px;">${escapeHTML(c.badge_icon || '🔱')} ${escapeHTML(c.title)}</h3>
                  <p style="font-size:12.5px;color:var(--ink-soft);margin:8px 0;">${escapeHTML(c.description || '')}</p>
                  <p class="data" style="font-size:12px;color:var(--ink-soft);">${c.duration_days} दिन · दैनिक लक्ष्य ${c.daily_target}</p>
                  ${mineSlugs.has(c.slug)
                    ? `<span class="btn btn-ghost btn-sm btn-block" style="margin-top:10px;pointer-events:none;">शामिल हैं ✅</span>`
                    : `<button class="btn btn-primary btn-sm btn-block" style="margin-top:10px;" data-join="${escapeHTML(c.slug)}">जॉइन करें</button>`}
                </div>`).join('')}
            </div>
          </div>
        </div>
      </div>`;

    $viewsRoot.querySelectorAll('[data-join]').forEach(btn => {
      btn.addEventListener('click', async () => {
        try {
          const res = await api(`/api/challenges/${btn.dataset.join}/join`, { method: 'POST' });
          toast(res.message || 'जॉइन हो गया 🙏', 'ok');
          renderChallenges();
        } catch (e) { toast(e.message, 'err'); }
      });
    });
    $viewsRoot.querySelectorAll('[data-log]').forEach(btn => {
      btn.addEventListener('click', () => openLogModal(btn.dataset.log));
    });
    $viewsRoot.querySelectorAll('[data-board]').forEach(btn => {
      btn.addEventListener('click', () => openLeaderboardModal(btn.dataset.board));
    });
  }

  function openLogModal(slug) {
    openModal(`
      <h3>आज का जाप दर्ज करें</h3>
      <p class="sub">${escapeHTML(slug)}</p>
      <div class="field">
        <label>जाप संख्या</label>
        <input type="number" id="logCount" min="1" value="108">
      </div>
      <div class="modal-actions">
        <button class="btn btn-ghost btn-block" id="logCancel">रद्द करें</button>
        <button class="btn btn-primary btn-block" id="logSubmit">दर्ज करें</button>
      </div>`);

    document.getElementById('logCancel').addEventListener('click', closeModal);
    document.getElementById('logSubmit').addEventListener('click', async () => {
      const count = parseInt(document.getElementById('logCount').value, 10);
      if (!count || count < 1) { toast('मान्य संख्या दर्ज करें', 'err'); return; }
      try {
        const res = await api('/api/challenges/log', { method: 'POST', body: { challenge_slug: slug, count } });
        toast(res.message, 'ok');
        closeModal();
        renderChallenges();
      } catch (e) { toast(e.message, 'err'); }
    });
  }

  async function openLeaderboardModal(slug) {
    openModal(`<h3>लीडरबोर्ड</h3><p class="sub">${escapeHTML(slug)}</p><div id="lbBody" class="skeleton skel-row"></div>`);
    try {
      const res = await api(`/api/challenges/${slug}/leaderboard`);
      document.getElementById('lbBody').outerHTML = `
        <div>${res.leaderboard.map(u => `
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--line);">
            <span>#${u.rank} ${escapeHTML(u.username)}</span>
            <span class="data">${u.total_days_completed} दिन · ${u.current_streak}🔥</span>
          </div>`).join('') || '<p style="color:var(--ink-soft);">अभी कोई प्रतिभागी नहीं।</p>'}</div>`;
    } catch (e) {
      document.getElementById('lbBody').outerHTML = `<p style="color:var(--ink-soft);">लोड नहीं हो सका।</p>`;
    }
  }

  // ===========================================================
  // FAMILY
  // ===========================================================
  async function renderFamily() {
    let family;
    try {
      family = await api('/api/family/dashboard');
    } catch (err) {
      $viewsRoot.innerHTML = `
        <div class="view active">
          <div class="grid">
            <div class="card col-6">
              <div class="card-head"><div class="card-title"><span class="ic">➕</span><h3>परिवार बनाएं</h3></div></div>
              <div class="field"><label>परिवार का नाम</label><input type="text" id="famName" placeholder="जैसे: शर्मा परिवार"></div>
              <button class="btn btn-primary btn-block" id="famCreateBtn">बनाएं</button>
            </div>
            <div class="card col-6">
              <div class="card-head"><div class="card-title"><span class="ic">🔑</span><h3>परिवार से जुड़ें</h3></div></div>
              <div class="field"><label>आमंत्रण कोड</label><input type="text" id="famCode" placeholder="जैसे: AB12CD" style="text-transform:uppercase;"></div>
              <button class="btn btn-primary btn-block" id="famJoinBtn">जुड़ें</button>
            </div>
          </div>
        </div>`;

      document.getElementById('famCreateBtn').addEventListener('click', async () => {
        const name = document.getElementById('famName').value.trim();
        if (!name) { toast('परिवार का नाम डालें', 'err'); return; }
        try {
          const res = await api('/api/family/create', { method: 'POST', body: { family_name: name } });
          toast(`${res.message} — कोड: ${res.invite_code}`, 'ok');
          renderFamily();
        } catch (e) { toast(e.message, 'err'); }
      });
      document.getElementById('famJoinBtn').addEventListener('click', async () => {
        const code = document.getElementById('famCode').value.trim().toUpperCase();
        if (!code) { toast('आमंत्रण कोड डालें', 'err'); return; }
        try {
          const res = await api('/api/family/join', { method: 'POST', body: { invite_code: code } });
          toast(res.message, 'ok');
          renderFamily();
        } catch (e) { toast(e.message, 'err'); }
      });
      return;
    }

    $viewsRoot.innerHTML = `
      <div class="view active">
        <div class="card col-12">
          <div class="card-head">
            <div class="card-title"><span class="ic">👨‍👩‍👧‍👦</span><h3>${escapeHTML(family.family_name)}</h3></div>
            <span class="data" style="font-size:12.5px;color:var(--ink-soft);">कोड: ${escapeHTML(family.invite_code)}</span>
          </div>
          ${family.members.map(m => `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 4px;border-bottom:1px solid var(--line);">
              <div style="display:flex;align-items:center;gap:10px;">
                <div class="avatar-btn" style="width:32px;height:32px;font-size:12px;">${escapeHTML((m.username || 'U')[0].toUpperCase())}</div>
                <div>
                  <b>${escapeHTML(m.username)}${m.is_you ? ' (आप)' : ''}</b><br>
                  <span class="data" style="font-size:11.5px;color:var(--ink-soft);">${relationLabel(m.relation)}</span>
                </div>
              </div>
              <span class="data" style="font-size:12.5px;color:var(--saffron-deep);font-weight:700;">${m.today_completed_count} आज पूर्ण</span>
            </div>`).join('')}

          <div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap;">
            ${!family.members.find(m => m.is_you)?.relation || family.members.find(m => m.is_you)?.relation === 'other'
              ? `<select id="relationSelect" class="data" style="padding:9px 12px;border-radius:10px;border:1.5px solid var(--line);">
                   <option value="">अपना संबंध चुनें</option>
                   <option value="parent">माता-पिता</option>
                   <option value="child">बच्चा</option>
                   <option value="grandparent">दादा-दादी</option>
                   <option value="other">अन्य</option>
                 </select>
                 <button class="btn btn-ghost btn-sm" id="famRelBtn">सहेजें</button>`
              : ''}
            <button class="btn btn-ghost" id="famLeaveBtn">परिवार छोड़ें</button>
          </div>
        </div>
      </div>`;

    document.getElementById('famLeaveBtn').addEventListener('click', async () => {
      if (!confirm('क्या आप वाकई परिवार छोड़ना चाहते हैं?')) return;
      try {
        const res = await api('/api/family/leave', { method: 'POST' });
        toast(res.message, 'ok');
        renderFamily();
      } catch (e) { toast(e.message, 'err'); }
    });

    const relBtn = document.getElementById('famRelBtn');
    if (relBtn) {
      relBtn.addEventListener('click', async () => {
        const relation = document.getElementById('relationSelect').value;
        if (!relation) { toast('संबंध चुनें', 'err'); return; }
        try {
          await api('/api/family/relation', { method: 'PATCH', body: { relation } });
          toast('अपडेट हो गया 🙏', 'ok');
          renderFamily();
        } catch (e) { toast(e.message, 'err'); }
      });
    }
  }

  // ===========================================================
  // SETTINGS
  // ===========================================================
  async function renderSettings() {
    const u = currentUser;
    $viewsRoot.innerHTML = `
      <div class="view active">
        <div class="grid">
          <div class="card col-6">
            <div class="card-head"><div class="card-title"><span class="ic">👤</span><h3>प्रोफ़ाइल</h3></div></div>
            <div class="field"><label>प्रदर्शित नाम</label><input type="text" id="setDisplayName" value="${escapeHTML(u.display_name || '')}"></div>
            <div class="field"><label>यूज़रनेम</label><input type="text" id="setUsername" value="${escapeHTML(u.username || '')}"></div>
            <div class="field"><label>ईमेल</label><input type="email" id="setEmail" value="${escapeHTML(u.email || '')}"></div>
            <div class="field">
              <label>पसंदीदा भाषा</label>
              <select id="setLang">
                ${['hindi', 'maithili', 'sanskrit', 'english'].map(l => `<option value="${l}" ${u.preferred_language === l ? 'selected' : ''}>${l}</option>`).join('')}
              </select>
            </div>
            <div class="field"><label>शहर</label><input type="text" id="setCity" value="${escapeHTML(u.city || '')}"></div>
            <div class="field"><label>राज्य</label><input type="text" id="setState" value="${escapeHTML(u.state || '')}"></div>
            <button class="btn btn-primary btn-block" id="saveProfileBtn">सहेजें</button>
          </div>

          <div class="card col-6">
            <div class="card-head"><div class="card-title"><span class="ic">🔒</span><h3>पासवर्ड बदलें</h3></div></div>
            <div class="field"><label>पुराना पासवर्ड</label><input type="password" id="oldPass"></div>
            <div class="field"><label>नया पासवर्ड</label><input type="password" id="newPass"></div>
            <button class="btn btn-primary btn-block" id="changePassBtn">पासवर्ड बदलें</button>

            <div class="card-head" style="margin-top:24px;"><div class="card-title"><span class="ic">🚪</span><h3>लॉगआउट</h3></div></div>
            <button class="btn btn-ghost btn-block" id="logoutBtn">लॉगआउट करें</button>
          </div>
        </div>
      </div>`;

    document.getElementById('saveProfileBtn').addEventListener('click', async () => {
      const body = {
        display_name: document.getElementById('setDisplayName').value.trim(),
        username: document.getElementById('setUsername').value.trim(),
        email: document.getElementById('setEmail').value.trim(),
        preferred_language: document.getElementById('setLang').value,
        city: document.getElementById('setCity').value.trim(),
        state: document.getElementById('setState').value.trim(),
      };
      try {
        currentUser = await api('/api/auth/profile', { method: 'PATCH', body });
        toast('प्रोफ़ाइल अपडेट हुई 🙏', 'ok');
        renderHeader();
      } catch (e) { toast(e.message, 'err'); }
    });

    document.getElementById('changePassBtn').addEventListener('click', async () => {
      const old_password = document.getElementById('oldPass').value;
      const new_password = document.getElementById('newPass').value;
      if (!old_password || !new_password) { toast('दोनों फ़ील्ड भरें', 'err'); return; }
      try {
        const res = await api('/api/auth/password', { method: 'POST', body: { old_password, new_password } });
        toast(res.message, 'ok');
        document.getElementById('oldPass').value = '';
        document.getElementById('newPass').value = '';
      } catch (e) { toast(e.message, 'err'); }
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
      clearToken();
      location.href = '/admin-login';
    });
  }

  // ---------------------------------------------------------
  boot();
})();