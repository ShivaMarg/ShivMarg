/* =========================================================
   ShivMarg — मेरी साधना Dashboard (embeddable section)
   sadhna-dashboard.js

   Logged-in  -> real calls to /api/streak, /api/puja,
                 /api/challenges, /api/family, /api/auth.
   Logged-out -> same UI, filled with local DEMO_DATA. Any
                 write action (checkbox, join, log jaap, save
                 profile, etc.) opens a "login to save" prompt
                 instead of hitting the API.

   AUTH INTEGRATION — adjust the 3 functions in the AUTH
   ADAPTER block below to match auth2.js's real SmAuth API.
   Assumed shape (matches your jaap-tracker pattern):
     window.SmAuth.isLoggedIn()  -> boolean
     window.SmAuth.getUser()     -> {display_name, username, email, ...} | null
     window.SmAuth.getToken()    -> string | null
     document dispatches 'sm-auth-changed' on login/logout
   If SmAuth isn't present at all, the widget just stays in
   permanent guest/demo mode — nothing breaks.
   ========================================================= */

(() => {
  'use strict';

  const API_BASE = window.SHIVAMARG_API_BASE || 'https://api.shivmarg.live';

  const root = document.getElementById('smSadhna');
  if (!root) return; // section not present on this page

  // ---------------------------------------------------------
  // DOM refs (all scoped inside #smSadhna)
  // ---------------------------------------------------------
  const $guestbar      = document.getElementById('smdGuestbar');
  const $guestLoginBtn = document.getElementById('smdGuestLoginBtn');
  const $sidebar        = document.getElementById('smdSidebar');
  const $mobileTabs      = document.getElementById('smdMobileTabs');
  const $sideFoot         = document.getElementById('smdSideFoot');
  const $streakLabel       = document.getElementById('smdStreakLabel');
  const $viewsRoot           = document.getElementById('smdViewsRoot');
  const $toastStack           = document.getElementById('smdToastStack');
  const $modalBackdrop          = document.getElementById('smdModalBackdrop');
  const $modalBody                = document.getElementById('smdModalBody');

  const VIEWS = ['overview', 'puja', 'diary', 'challenges', 'family', 'settings'];
  let currentUser = null;
  let guest = true;
  let lastAuthToken = null;
  let booting = false;
  let tabsBound = false;
    let authWatcher = null;

    function startAuthWatcher() {

        if (authWatcher) return;

        authWatcher = setInterval(() => {

            const token = smGetToken();

            if (!token) return;

            clearInterval(authWatcher);
            authWatcher = null;

            boot(true);

        }, 5000); // every 5 sec
    }
  // ---------------------------------------------------------
  // AUTH ADAPTER — wire to real SmAuth here
  // ---------------------------------------------------------
    function smGetToken() {
        return (
            localStorage.getItem("sm_token") ||
            localStorage.getItem("admin_token") ||
            localStorage.getItem("editor_token") ||
            null
        );
    }

    function smIsLoggedIn() {
        return !!smGetToken();
    }

    function promptLogin() {
        if (window.SmAuth && typeof window.SmAuth.requireLogin === 'function') {
            window.SmAuth.requireLogin();
            return;
        }
        const loginUrl = '/login/';
        if (window.location.pathname !== loginUrl) {
            window.location.assign(loginUrl);
        }
    }

    // User will be fetched from API instead
    function smGetUser() {
        return currentUser;
    }

  // ---------------------------------------------------------
  // DEMO DATA — shown to logged-out visitors
  // ---------------------------------------------------------
  const DEMO_USER = {
    display_name: 'साधक जी', username: 'sadhak_demo', email: '',
    preferred_language: 'hindi', city: '', state: '',
  };
  const DEMO = {
    streak: { streak: 7 },
    puja: {
      title: 'प्रातःकालीन एवं सांध्य पूजा', completed_count: 2, total: 5,
      items: [
        { slot: 'morning_1', mantra_slug: 'gayatri-mantra', mantra_name: 'गायत्री मंत्र', time_hint: 'प्रातः', repetitions: 11, duration_min: 5, completed: true },
        { slot: 'morning_2', mantra_slug: 'mahamrityunjaya', mantra_name: 'महामृत्युंजय मंत्र', time_hint: 'प्रातः', repetitions: 5, duration_min: 6, completed: true },
        { slot: 'midday', mantra_slug: 'vishnu-sahasranama', mantra_name: 'विष्णु सहस्रनाम', time_hint: 'मध्याह्न', repetitions: 1, duration_min: 20, completed: false },
        { slot: 'evening', mantra_slug: 'hanuman-chalisa', mantra_name: 'हनुमान चालीसा', time_hint: 'सायं', repetitions: 3, duration_min: 10, completed: false },
        { slot: 'night', mantra_slug: 'shiv-chalisa', mantra_name: 'शिव चालीसा', time_hint: 'रात्रि', repetitions: 1, duration_min: 8, completed: false },
      ],
    },
    challengesMy: {
      challenges: [
        { challenge_slug: 'shravan-som-jaap', current_streak: 4, total_days_completed: 12, target_days: 30, completed: false },
      ],
    },
    challengesAll: {
      challenges: [
        { slug: 'shravan-som-jaap', title: 'श्रावण सोमवार जाप', description: '30 दिन लगातार शिव मंत्र जाप', duration_days: 30, daily_target: 108, badge_icon: '🔱' },
        { slug: '108-din-gayatri', title: '108 दिन गायत्री साधना', description: 'गायत्री मंत्र का 108 दिन का संकल्प', duration_days: 108, daily_target: 108, badge_icon: '🕉️' },
        { slug: 'ekadashi-vrat-jaap', title: 'एकादशी व्रत जाप', description: 'हर एकादशी विष्णु सहस्रनाम', duration_days: 12, daily_target: 1, badge_icon: '🪷' },
      ],
    },
    family: {
      family_name: 'शर्मा परिवार (डेमो)', invite_code: 'DEMO01',
      members: [
        { username: 'saurabh', is_you: true, relation: 'owner', today_completed_count: 2 },
        { username: 'mummy_ji', is_you: false, relation: 'parent', today_completed_count: 4 },
      ],
    },
    history: {
      history: Array.from({ length: 12 }, (_, i) => ({
        date: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10),
        count: [0, 1, 2, 3][i % 4],
      })),
    },
  };

  // ---------------------------------------------------------
  // Fetch wrapper (only used when logged in)
  // ---------------------------------------------------------
  async function api(path, { method = 'GET', body = null } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    const token = smGetToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let res;
    try {
      res = await fetch(`${API_BASE}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
    } catch (err) {
      throw new Error('नेटवर्क त्रुटि — कृपया अपना इंटरनेट जांचें।');
    }
    if (res.status === 401) {
      document.dispatchEvent(new CustomEvent('sm-auth-changed'));
      throw new Error('सत्र समाप्त हो गया। कृपया पुनः लॉगिन करें।');
    }
    let data = null;
    try { data = await res.json(); } catch (_) {}
    if (!res.ok) {
      const detail = data && (data.detail || data.message);
      throw new Error(typeof detail === 'string' ? detail : `त्रुटि (${res.status})`);
    }
    return data;
  }

  // ---------------------------------------------------------
  // Toast / Modal
  // ---------------------------------------------------------
  function toast(msg, type = '') {
    const el = document.createElement('div');
    el.className = `smd-toast ${type ? 'smd-' + type : ''}`.trim();
    el.textContent = msg;
    $toastStack.appendChild(el);
    setTimeout(() => el.remove(), 3600);
  }
  function openModal(html) {
    $modalBody.innerHTML = `<button class="smd-modal-close" id="smdModalCloseBtn">✕</button>${html}`;
    $modalBackdrop.classList.add('smd-active');
    document.getElementById('smdModalCloseBtn').addEventListener('click', closeModal);
  }
  function closeModal() {
    $modalBackdrop.classList.remove('smd-active');
    $modalBody.innerHTML = '';
  }
  $modalBackdrop.addEventListener('click', (e) => { if (e.target === $modalBackdrop) closeModal(); });

  function guardOrPrompt(actionLabel) {
    // Call at the top of every write action. Returns true if the
    // action should proceed (user is logged in); otherwise shows
    // the login prompt and returns false.
    if (!guest) return true;
    openModal(`
      <h3>🙏 लॉगिन आवश्यक है</h3>
      <p class="smd-sub">${escapeHTML(actionLabel)} के लिए कृपया अपने ShivMarg खाते से लॉगिन करें। अभी आप डेमो डेटा देख रहे हैं।</p>
      <div class="smd-modal-actions">
        <button class="smd-btn smd-btn-ghost smd-btn-block" id="smdGuardCancel">रद्द करें</button>
        <button class="smd-btn smd-btn-primary smd-btn-block" id="smdGuardLogin">लॉगिन करें</button>
      </div>`);
    document.getElementById('smdGuardCancel').addEventListener('click', closeModal);
    document.getElementById('smdGuardLogin').addEventListener('click', () => { closeModal(); promptLogin(); });
    return false;
  }

  // ---------------------------------------------------------
  // Utils
  // ---------------------------------------------------------
  function escapeHTML(s = '') {
    return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }
  function userTypeLabel(t) {
    return { working_professional:'व्यस्त जीवन (कामकाजी)', student:'विद्यार्थी', homemaker:'गृहस्थ', senior_citizen:'वरिष्ठ नागरिक' }[t] || t;
  }
  function relationLabel(r) {
    return { owner:'स्वामी', parent:'माता-पिता', child:'बच्चा', grandparent:'दादा-दादी', other:'अन्य' }[r] || r;
  }
  function heatColor(count) {
    if (count <= 0) return 'var(--smd-cream-deep)';
    if (count === 1) return '#F3C98A';
    if (count === 2) return '#E8A24C';
    return 'var(--smd-saffron)';
  }
  function skeletonHTML() {
    return `<div class="smd-card smd-col-12">
      <div class="smd-skeleton smd-skel-row"></div>
      <div class="smd-skeleton smd-skel-row"></div>
      <div class="smd-skeleton smd-skel-row" style="width:60%"></div>
    </div>`;
  }
  function errorHTML(msg) {
    return `<div class="smd-card smd-col-12 smd-empty">
      <span class="smd-ic">⚠️</span><p>${escapeHTML(msg)}</p>
      <button class="smd-btn smd-btn-ghost" id="smdRetryBtn">पुनः प्रयास करें</button>
    </div>`;
  }
  function bindNavButtons(scope) {
    scope.querySelectorAll('[data-view]').forEach(btn => {
      btn.addEventListener('click', () => switchView(btn.dataset.view));
    });
  }

  // ---------------------------------------------------------
  // Boot
  // ---------------------------------------------------------
  async function syncAuthState(force = false) {
    const token = smGetToken();
    const authSignature = token || '__guest__';
    if (!force && authSignature === lastAuthToken && guest === !token) return false;

    lastAuthToken = authSignature;
    guest = !token;

    if (guest) {
      currentUser = DEMO_USER;
    } else {
      try {
        currentUser = await api('/api/auth/me');
      } catch (e) {
        console.warn('Auth refresh failed:', e);
        guest = true;
        currentUser = DEMO_USER;
      }
    }

    $guestbar.hidden = !guest;
    renderSideFoot();
    buildMobileTabs();
    wireTabs();

    const activeView = root.dataset.view || 'overview';
    await switchView(activeView);

    if (!guest) pingStreak();
    else $streakLabel.textContent = `🔥 ${DEMO.streak.streak} दिन (डेमो)`;
    return true;
  }

  async function boot(force = false) {
    if (booting) return;
    booting = true;
    try {
      await syncAuthState(force);
    } finally {
      booting = false;
    }
    if (guest) {
        startAuthWatcher();
    }   
  }

  function renderSideFoot() {
    $sideFoot.innerHTML = '';
  }

  function buildMobileTabs() {
    const sidebarBtns = $sidebar.querySelectorAll('.smd-tab-btn');
    $mobileTabs.innerHTML = '';
    sidebarBtns.forEach(b => {
      const clone = b.cloneNode(true);
      $mobileTabs.appendChild(clone);
    });
  }

  async function pingStreak() {
    try {
      const res = await api('/api/streak/ping', { method: 'POST', body: {} });
      $streakLabel.textContent = `🔥 ${res.streak ?? '—'} दिन`;
      if (res.is_new_day) toast(`🔥 ${res.streak} दिन की लगातार यात्रा जारी है!`, 'ok');
    } catch (_) {}
  }

  // ---------------------------------------------------------
  // Tabs / routing
  // ---------------------------------------------------------
  function wireTabs() {
    if (tabsBound) return;
    [$sidebar, $mobileTabs].forEach($bar => {
      $bar.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-view]');
        if (!btn) return;
        switchView(btn.dataset.view);
      });
    });
    tabsBound = true;
  }
  function setActiveTabUI(view) {
    root.querySelectorAll('.smd-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.view === view));
  }

  const RENDERERS = {
    overview: renderOverview, puja: renderPuja, diary: renderDiary,
    challenges: renderChallenges, family: renderFamily, settings: renderSettings,
  };

  async function switchView(view) {
    if (!VIEWS.includes(view)) view = 'overview';
    root.dataset.view = view;
    setActiveTabUI(view);
    $viewsRoot.innerHTML = `<div class="smd-grid">${skeletonHTML()}</div>`;
    try {
      await RENDERERS[view]();
    } catch (err) {
      $viewsRoot.innerHTML = errorHTML(err.message);
      const retry = document.getElementById('smdRetryBtn');
      if (retry) retry.addEventListener('click', () => switchView(view));
    }
  }

  // ===========================================================
  // OVERVIEW
  // ===========================================================
  async function renderOverview() {
    let streak, puja, chall, family;
    if (guest) {
      streak = DEMO.streak; puja = DEMO.puja; chall = DEMO.challengesMy.challenges; family = DEMO.family;
    } else {
      const [sR, pR, cR, fR] = await Promise.allSettled([
        api('/api/streak/me'), api('/api/puja/today'), api('/api/challenges/my'), api('/api/family/dashboard'),
      ]);
      streak = sR.status === 'fulfilled' ? sR.value : { streak: 0 };
      puja   = pR.status === 'fulfilled' ? pR.value : null;
      chall  = (cR.status === 'fulfilled' ? cR.value.challenges : []) || [];
      family = fR.status === 'fulfilled' ? fR.value : null;
    }

    const activeCount = chall.filter(c => !c.completed).length;
    const today = new Date().toLocaleDateString('hi-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    $viewsRoot.innerHTML = `
      <section class="smd-hero">
        <div class="smd-hero-greet">आपकी साधना यात्रा${guest ? ' · डेमो डेटा' : ''}</div>
        <h1>नमस्ते, ${escapeHTML(currentUser.display_name || currentUser.username)} 🙏</h1>
        <div class="smd-hero-date smd-data">${today}</div>
        <div class="smd-hero-stats">
          <div class="smd-hero-stat"><div class="smd-num smd-data">${streak.streak ?? 0}</div><div class="smd-lbl">दिन की स्ट्रीक 🔥</div></div>
          <div class="smd-hero-stat"><div class="smd-num smd-data">${puja ? `${puja.completed_count}/${puja.total}` : '—'}</div><div class="smd-lbl">आज की पूजा</div></div>
          <div class="smd-hero-stat"><div class="smd-num smd-data">${activeCount}</div><div class="smd-lbl">सक्रिय चैलेंज</div></div>
          <div class="smd-hero-stat"><div class="smd-num smd-data">${family ? family.members.length : 0}</div><div class="smd-lbl">परिवार सदस्य</div></div>
        </div>
      </section>

      <div class="smd-grid">
        <div class="smd-card smd-col-6">
          <div class="smd-card-head">
            <div class="smd-card-title"><span class="smd-ic">🪔</span><h3>आज की पूजा</h3></div>
            <button class="smd-card-link" data-view="puja">विस्तार से देखें →</button>
          </div>
          ${puja
            ? `<p class="smd-data" style="font-size:13px;color:var(--smd-ink-soft);">${escapeHTML(puja.title)}</p>
               <p style="margin-top:8px;font-size:13px;">${puja.completed_count} / ${puja.total} पूर्ण</p>`
            : `<div class="smd-empty"><span class="smd-ic">🪔</span><p>अपनी दैनिक साधना प्रोफ़ाइल अभी सेट करें।</p>
               <button class="smd-btn smd-btn-primary smd-btn-sm" data-view="puja">शुरू करें</button></div>`}
        </div>

        <div class="smd-card smd-col-6">
          <div class="smd-card-head">
            <div class="smd-card-title"><span class="smd-ic">🚩</span><h3>संकल्प चैलेंज</h3></div>
            <button class="smd-card-link" data-view="challenges">सभी देखें →</button>
          </div>
          ${chall.length
            ? chall.slice(0, 3).map(c => `
              <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--smd-line);">
                <span style="font-size:13px;">${escapeHTML(c.challenge_slug)}</span>
                <span class="smd-data" style="font-size:12px;color:var(--smd-saffron-deep);font-weight:700;">${c.current_streak} 🔥</span>
              </div>`).join('')
            : `<div class="smd-empty"><span class="smd-ic">🚩</span><p>अभी तक कोई चैलेंज जॉइन नहीं किया।</p>
               <button class="smd-btn smd-btn-primary smd-btn-sm" data-view="challenges">चैलेंज देखें</button></div>`}
        </div>

        <div class="smd-card smd-col-6">
          <div class="smd-card-head">
            <div class="smd-card-title"><span class="smd-ic">📿</span><h3>जप डायरी</h3></div>
            <button class="smd-card-link" data-view="diary">विस्तार से देखें →</button>
          </div>
          <p style="font-size:13px;color:var(--smd-ink-soft);">पिछले दिनों की अपनी साधना देखें और प्रगति ट्रैक करें।</p>
        </div>

        <div class="smd-card smd-col-6">
          <div class="smd-card-head">
            <div class="smd-card-title"><span class="smd-ic">👨‍👩‍👧‍👦</span><h3>परिवार</h3></div>
            <button class="smd-card-link" data-view="family">विस्तार से देखें →</button>
          </div>
          ${family
            ? `<p style="font-size:13px;">${escapeHTML(family.family_name)} — ${family.members.length} सदस्य</p>`
            : `<div class="smd-empty"><span class="smd-ic">👨‍👩‍👧‍👦</span><p>अभी तक किसी परिवार से नहीं जुड़े।</p>
               <button class="smd-btn smd-btn-primary smd-btn-sm" data-view="family">जोड़ें / बनाएं</button></div>`}
        </div>
      </div>`;

    bindNavButtons($viewsRoot);
  }

  // ===========================================================
  // PUJA
  // ===========================================================
  async function renderPuja() {
    let data;
    if (guest) {
      data = DEMO.puja;
    } else {
      try {
        data = await api('/api/puja/today');
      } catch (err) {
        $viewsRoot.innerHTML = `
          <div class="smd-card smd-col-12">
            <div class="smd-card-head"><div class="smd-card-title"><span class="smd-ic">🪔</span><h3>अपनी साधना प्रोफ़ाइल चुनें</h3></div></div>
            <p style="font-size:13px;color:var(--smd-ink-soft);margin-bottom:16px;">आपकी दिनचर्या के अनुसार हम उपयुक्त दैनिक पूजा सुझाएंगे।</p>
            <div class="smd-grid">
              ${['working_professional','student','homemaker','senior_citizen'].map(t => `
                <div class="smd-card smd-col-6" style="cursor:pointer;" data-usertype="${t}">
                  <h3 style="font-size:14.5px;">${userTypeLabel(t)}</h3>
                </div>`).join('')}
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
    }

    $viewsRoot.innerHTML = `
      <div class="smd-card smd-col-12">
        <div class="smd-card-head">
          <div class="smd-card-title"><span class="smd-ic">🪔</span><h3>${escapeHTML(data.title)}</h3></div>
          <span class="smd-data" style="font-size:12.5px;color:var(--smd-ink-soft);">${data.completed_count}/${data.total} पूर्ण</span>
        </div>
        <div id="smdPujaItems">
          ${data.items.map(item => `
            <label style="display:flex;align-items:center;gap:12px;padding:11px 4px;border-bottom:1px solid var(--smd-line);${item.completed ? 'opacity:0.6;' : ''}">
              <input type="checkbox" ${item.completed ? 'checked disabled' : ''} data-slot="${escapeHTML(item.slot)}" data-mantra="${escapeHTML(item.mantra_slug)}" style="width:19px;height:19px;accent-color:var(--smd-tulsi);">
              <span style="flex:1;">
                <b style="font-family:var(--smd-font-hindi);">${escapeHTML(item.mantra_name)}</b><br>
                <span class="smd-data" style="font-size:11.5px;color:var(--smd-ink-soft);">${escapeHTML(item.time_hint)} · ${item.repetitions} बार · ${item.duration_min} मिनट</span>
              </span>
            </label>`).join('')}
        </div>
      </div>`;

    $viewsRoot.querySelectorAll('#smdPujaItems input[type=checkbox]:not(:disabled)').forEach(cb => {
      cb.addEventListener('change', async () => {
        if (!cb.checked) return;
        if (!guardOrPrompt('पूजा पूर्ण दर्ज करने')) { cb.checked = false; return; }
        cb.disabled = true;
        try {
          await api('/api/puja/complete', { method: 'POST', body: { slot: cb.dataset.slot, mantra_slug: cb.dataset.mantra } });
          toast('पूर्ण हुआ 🙏', 'ok');
          renderPuja();
        } catch (e) { toast(e.message, 'err'); cb.disabled = false; cb.checked = false; }
      });
    });
  }

  // ===========================================================
  // DIARY
  // ===========================================================
  async function renderDiary() {
    let history, streak;
    if (guest) {
      history = DEMO.history;
      streak = DEMO.streak;
    } else {
      [history, streak] = await Promise.all([api('/api/puja/history?days=30'), api('/api/streak/me')]);
    }

    const map = {};
    (history.history || []).forEach(d => { map[d.date] = d.count ?? d.completed_count; });

    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({ date: key, count: map[key] || 0 });
    }

    $viewsRoot.innerHTML = `
      <div class="smd-card smd-col-12">
        <div class="smd-card-head">
          <div class="smd-card-title"><span class="smd-ic">📿</span><h3>जप डायरी — पिछले 30 दिन</h3></div>
          <span class="smd-data" style="font-size:12.5px;color:var(--smd-ink-soft);">🔥 ${streak.streak ?? 0} दिन की स्ट्रीक</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(10,1fr);gap:6px;">
          ${days.map(d => `<div title="${d.date} — ${d.count} पूर्ण" style="aspect-ratio:1;border-radius:6px;background:${heatColor(d.count)};"></div>`).join('')}
        </div>
        <p style="margin-top:14px;font-size:11.5px;color:var(--smd-ink-soft);">हल्का = कम गतिविधि, गहरा केसरिया = अधिक गतिविधि वाला दिन।</p>
      </div>`;
  }

  // ===========================================================
  // CHALLENGES
  // ===========================================================
  async function renderChallenges() {
    let all, mine;
    if (guest) {
      all = DEMO.challengesAll.challenges;
      mine = DEMO.challengesMy.challenges;
    } else {
      const [allRes, mineRes] = await Promise.all([api('/api/challenges'), api('/api/challenges/my')]);
      all = allRes.challenges || [];
      mine = mineRes.challenges || [];
    }
    const mineSlugs = new Set(mine.map(m => m.challenge_slug));

    $viewsRoot.innerHTML = `
      <div class="smd-grid">
        <div class="smd-card smd-col-12">
          <div class="smd-card-head"><div class="smd-card-title"><span class="smd-ic">🔥</span><h3>मेरे सक्रिय चैलेंज</h3></div></div>
          ${mine.length ? mine.map(c => `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 4px;border-bottom:1px solid var(--smd-line);flex-wrap:wrap;gap:8px;">
              <div>
                <b>${escapeHTML(c.challenge_slug)}</b><br>
                <span class="smd-data" style="font-size:11.5px;color:var(--smd-ink-soft);">${c.total_days_completed}/${c.target_days} दिन · स्ट्रीक ${c.current_streak}🔥</span>
              </div>
              <div style="display:flex;gap:6px;">
                ${!c.completed
                  ? `<button class="smd-btn smd-btn-tulsi smd-btn-sm" data-log="${escapeHTML(c.challenge_slug)}">जाप दर्ज करें</button>`
                  : `<span class="smd-btn smd-btn-ghost smd-btn-sm" style="pointer-events:none;">पूर्ण ✅</span>`}
                <button class="smd-btn smd-btn-ghost smd-btn-sm" data-board="${escapeHTML(c.challenge_slug)}">लीडरबोर्ड</button>
              </div>
            </div>`).join('') : `<div class="smd-empty"><span class="smd-ic">🚩</span><p>अभी तक कोई चैलेंज जॉइन नहीं किया।</p></div>`}
        </div>

        <div class="smd-card smd-col-12">
          <div class="smd-card-head"><div class="smd-card-title"><span class="smd-ic">🕉️</span><h3>उपलब्ध चैलेंज</h3></div></div>
          <div class="smd-grid">
            ${all.map(c => `
              <div class="smd-card smd-col-4">
                <h3 style="font-size:14.5px;">${escapeHTML(c.badge_icon || '🔱')} ${escapeHTML(c.title)}</h3>
                <p style="font-size:12px;color:var(--smd-ink-soft);margin:8px 0;">${escapeHTML(c.description || '')}</p>
                <p class="smd-data" style="font-size:11.5px;color:var(--smd-ink-soft);">${c.duration_days} दिन · दैनिक लक्ष्य ${c.daily_target}</p>
                ${mineSlugs.has(c.slug)
                  ? `<span class="smd-btn smd-btn-ghost smd-btn-sm smd-btn-block" style="margin-top:10px;pointer-events:none;">शामिल हैं ✅</span>`
                  : `<button class="smd-btn smd-btn-primary smd-btn-sm smd-btn-block" style="margin-top:10px;" data-join="${escapeHTML(c.slug)}">जॉइन करें</button>`}
              </div>`).join('')}
          </div>
        </div>
      </div>`;

    $viewsRoot.querySelectorAll('[data-join]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!guardOrPrompt('चैलेंज जॉइन करने')) return;
        try {
          const res = await api(`/api/challenges/${btn.dataset.join}/join`, { method: 'POST' });
          toast(res.message || 'जॉइन हो गया 🙏', 'ok');
          renderChallenges();
        } catch (e) { toast(e.message, 'err'); }
      });
    });
    $viewsRoot.querySelectorAll('[data-log]').forEach(btn => {
      btn.addEventListener('click', () => { if (guardOrPrompt('जाप दर्ज करने')) openLogModal(btn.dataset.log); });
    });
    $viewsRoot.querySelectorAll('[data-board]').forEach(btn => {
      btn.addEventListener('click', () => openLeaderboardModal(btn.dataset.board));
    });
  }

  function openLogModal(slug) {
    openModal(`
      <h3>आज का जाप दर्ज करें</h3>
      <p class="smd-sub">${escapeHTML(slug)}</p>
      <div class="smd-field"><label>जाप संख्या</label><input type="number" id="smdLogCount" min="1" value="108"></div>
      <div class="smd-modal-actions">
        <button class="smd-btn smd-btn-ghost smd-btn-block" id="smdLogCancel">रद्द करें</button>
        <button class="smd-btn smd-btn-primary smd-btn-block" id="smdLogSubmit">दर्ज करें</button>
      </div>`);
    document.getElementById('smdLogCancel').addEventListener('click', closeModal);
    document.getElementById('smdLogSubmit').addEventListener('click', async () => {
      const count = parseInt(document.getElementById('smdLogCount').value, 10);
      if (!count || count < 1) { toast('मान्य संख्या दर्ज करें', 'err'); return; }
      try {
        const res = await api('/api/challenges/log', { method: 'POST', body: { challenge_slug: slug, count } });
        toast(res.message, 'ok'); closeModal(); renderChallenges();
      } catch (e) { toast(e.message, 'err'); }
    });
  }

  async function openLeaderboardModal(slug) {
    openModal(`<h3>लीडरबोर्ड</h3><p class="smd-sub">${escapeHTML(slug)}</p><div id="smdLbBody" class="smd-skeleton smd-skel-row"></div>`);
    if (guest) {
      document.getElementById('smdLbBody').outerHTML = `<p style="color:var(--smd-ink-soft);font-size:13px;">लीडरबोर्ड देखने के लिए लॉगिन करें।</p>`;
      return;
    }
    try {
      const res = await api(`/api/challenges/${slug}/leaderboard`);
      document.getElementById('smdLbBody').outerHTML = `
        <div>${res.leaderboard.map(u => `
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--smd-line);">
            <span>#${u.rank} ${escapeHTML(u.username)}</span>
            <span class="smd-data">${u.total_days_completed} दिन · ${u.current_streak}🔥</span>
          </div>`).join('') || '<p style="color:var(--smd-ink-soft);">अभी कोई प्रतिभागी नहीं।</p>'}</div>`;
    } catch (e) {
      document.getElementById('smdLbBody').outerHTML = `<p style="color:var(--smd-ink-soft);">लोड नहीं हो सका।</p>`;
    }
  }

  // ===========================================================
  // FAMILY
  // ===========================================================
  async function renderFamily() {
    let family;
    if (guest) {
      family = DEMO.family;
    } else {
      try {
        family = await api('/api/family/dashboard');
      } catch (err) {
        $viewsRoot.innerHTML = `
          <div class="smd-grid">
            <div class="smd-card smd-col-6">
              <div class="smd-card-head"><div class="smd-card-title"><span class="smd-ic">➕</span><h3>परिवार बनाएं</h3></div></div>
              <div class="smd-field"><label>परिवार का नाम</label><input type="text" id="smdFamName" placeholder="जैसे: शर्मा परिवार"></div>
              <button class="smd-btn smd-btn-primary smd-btn-block" id="smdFamCreateBtn">बनाएं</button>
            </div>
            <div class="smd-card smd-col-6">
              <div class="smd-card-head"><div class="smd-card-title"><span class="smd-ic">🔑</span><h3>परिवार से जुड़ें</h3></div></div>
              <div class="smd-field"><label>आमंत्रण कोड</label><input type="text" id="smdFamCode" placeholder="जैसे: AB12CD" style="text-transform:uppercase;"></div>
              <button class="smd-btn smd-btn-primary smd-btn-block" id="smdFamJoinBtn">जुड़ें</button>
            </div>
          </div>`;
        document.getElementById('smdFamCreateBtn').addEventListener('click', async () => {
          if (!guardOrPrompt('परिवार बनाने')) return;
          const name = document.getElementById('smdFamName').value.trim();
          if (!name) { toast('परिवार का नाम डालें', 'err'); return; }
          try {
            const res = await api('/api/family/create', { method: 'POST', body: { family_name: name } });
            toast(`${res.message} — कोड: ${res.invite_code}`, 'ok'); renderFamily();
          } catch (e) { toast(e.message, 'err'); }
        });
        document.getElementById('smdFamJoinBtn').addEventListener('click', async () => {
          if (!guardOrPrompt('परिवार से जुड़ने')) return;
          const code = document.getElementById('smdFamCode').value.trim().toUpperCase();
          if (!code) { toast('आमंत्रण कोड डालें', 'err'); return; }
          try {
            const res = await api('/api/family/join', { method: 'POST', body: { invite_code: code } });
            toast(res.message, 'ok'); renderFamily();
          } catch (e) { toast(e.message, 'err'); }
        });
        return;
      }
    }

    $viewsRoot.innerHTML = `
      <div class="smd-card smd-col-12">
        <div class="smd-card-head">
          <div class="smd-card-title"><span class="smd-ic">👨‍👩‍👧‍👦</span><h3>${escapeHTML(family.family_name)}</h3></div>
          <span class="smd-data" style="font-size:12px;color:var(--smd-ink-soft);">कोड: ${escapeHTML(family.invite_code)}</span>
        </div>
        ${family.members.map(m => `
          <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 4px;border-bottom:1px solid var(--smd-line);">
            <div style="display:flex;align-items:center;gap:10px;">
              <div class="smd-avatar" style="width:30px;height:30px;font-size:11px;">${escapeHTML((m.username || 'U')[0].toUpperCase())}</div>
              <div><b>${escapeHTML(m.username)}${m.is_you ? ' (आप)' : ''}</b><br><span class="smd-data" style="font-size:11px;color:var(--smd-ink-soft);">${relationLabel(m.relation)}</span></div>
            </div>
            <span class="smd-data" style="font-size:12px;color:var(--smd-saffron-deep);font-weight:700;">${m.today_completed_count} आज पूर्ण</span>
          </div>`).join('')}

        <div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap;">
          ${!family.members.find(m => m.is_you)?.relation || family.members.find(m => m.is_you)?.relation === 'other'
            ? `<select id="smdRelationSelect" class="smd-data" style="padding:9px 12px;border-radius:10px;border:1.5px solid var(--smd-line);">
                 <option value="">अपना संबंध चुनें</option>
                 <option value="parent">माता-पिता</option><option value="child">बच्चा</option>
                 <option value="grandparent">दादा-दादी</option><option value="other">अन्य</option>
               </select>
               <button class="smd-btn smd-btn-ghost smd-btn-sm" id="smdFamRelBtn">सहेजें</button>` : ''}
          <button class="smd-btn smd-btn-ghost" id="smdFamLeaveBtn">परिवार छोड़ें</button>
        </div>
      </div>`;

    document.getElementById('smdFamLeaveBtn').addEventListener('click', async () => {
      if (!guardOrPrompt('परिवार छोड़ने')) return;
      if (!confirm('क्या आप वाकई परिवार छोड़ना चाहते हैं?')) return;
      try { const res = await api('/api/family/leave', { method: 'POST' }); toast(res.message, 'ok'); renderFamily(); }
      catch (e) { toast(e.message, 'err'); }
    });
    const relBtn = document.getElementById('smdFamRelBtn');
    if (relBtn) relBtn.addEventListener('click', async () => {
      if (!guardOrPrompt('संबंध सहेजने')) return;
      const relation = document.getElementById('smdRelationSelect').value;
      if (!relation) { toast('संबंध चुनें', 'err'); return; }
      try { await api('/api/family/relation', { method: 'PATCH', body: { relation } }); toast('अपडेट हो गया 🙏', 'ok'); renderFamily(); }
      catch (e) { toast(e.message, 'err'); }
    });
  }

  // ===========================================================
  // SETTINGS
  // ===========================================================
  async function renderSettings() {
    const u = currentUser;
    $viewsRoot.innerHTML = `
      <div class="smd-grid">
        <div class="smd-card smd-col-6">
          <div class="smd-card-head"><div class="smd-card-title"><span class="smd-ic">👤</span><h3>प्रोफ़ाइल</h3></div></div>
          <div class="smd-field"><label>प्रदर्शित नाम</label><input type="text" id="smdSetDisplayName" value="${escapeHTML(u.display_name || '')}" ${guest ? 'disabled' : ''}></div>
          <div class="smd-field"><label>यूज़रनेम</label><input type="text" id="smdSetUsername" value="${escapeHTML(u.username || '')}" ${guest ? 'disabled' : ''}></div>
          <div class="smd-field"><label>ईमेल</label><input type="email" id="smdSetEmail" value="${escapeHTML(u.email || '')}" ${guest ? 'disabled' : ''}></div>
          <div class="smd-field">
            <label>पसंदीदा भाषा</label>
            <select id="smdSetLang" ${guest ? 'disabled' : ''}>
              ${['hindi','maithili','sanskrit','english'].map(l => `<option value="${l}" ${u.preferred_language === l ? 'selected' : ''}>${l}</option>`).join('')}
            </select>
          </div>
          <div class="smd-field"><label>शहर</label><input type="text" id="smdSetCity" value="${escapeHTML(u.city || '')}" ${guest ? 'disabled' : ''}></div>
          <div class="smd-field"><label>राज्य</label><input type="text" id="smdSetState" value="${escapeHTML(u.state || '')}" ${guest ? 'disabled' : ''}></div>
          <button class="smd-btn smd-btn-primary smd-btn-block" id="smdSaveProfileBtn">${guest ? 'लॉगिन करें' : 'सहेजें'}</button>
        </div>

        <div class="smd-card smd-col-6">
          <div class="smd-card-head"><div class="smd-card-title"><span class="smd-ic">🔒</span><h3>पासवर्ड बदलें</h3></div></div>
          <div class="smd-field"><label>पुराना पासवर्ड</label><input type="password" id="smdOldPass" ${guest ? 'disabled' : ''}></div>
          <div class="smd-field"><label>नया पासवर्ड</label><input type="password" id="smdNewPass" ${guest ? 'disabled' : ''}></div>
          <button class="smd-btn smd-btn-primary smd-btn-block" id="smdChangePassBtn">${guest ? 'लॉगिन करें' : 'पासवर्ड बदलें'}</button>

          ${!guest ? `
          <div class="smd-card-head" style="margin-top:24px;"><div class="smd-card-title"><span class="smd-ic">🚪</span><h3>लॉगआउट</h3></div></div>
          <button class="smd-btn smd-btn-ghost smd-btn-block" id="smdLogoutBtn">लॉगआउट करें</button>` : ''}
        </div>
      </div>`;

    document.getElementById('smdSaveProfileBtn').addEventListener('click', async () => {
      if (!guardOrPrompt('प्रोफ़ाइल सहेजने')) return;
      const body = {
        display_name: document.getElementById('smdSetDisplayName').value.trim(),
        username: document.getElementById('smdSetUsername').value.trim(),
        email: document.getElementById('smdSetEmail').value.trim(),
        preferred_language: document.getElementById('smdSetLang').value,
        city: document.getElementById('smdSetCity').value.trim(),
        state: document.getElementById('smdSetState').value.trim(),
      };
      try {
        currentUser = await api('/api/auth/profile', { method: 'PATCH', body });
        toast('प्रोफ़ाइल अपडेट हुई 🙏', 'ok');
        renderSideFoot();
      } catch (e) { toast(e.message, 'err'); }
    });

    document.getElementById('smdChangePassBtn').addEventListener('click', async () => {
      if (!guardOrPrompt('पासवर्ड बदलने')) return;
      const old_password = document.getElementById('smdOldPass').value;
      const new_password = document.getElementById('smdNewPass').value;
      if (!old_password || !new_password) { toast('दोनों फ़ील्ड भरें', 'err'); return; }
      try {
        const res = await api('/api/auth/password', { method: 'POST', body: { old_password, new_password } });
        toast(res.message, 'ok');
        document.getElementById('smdOldPass').value = ''; document.getElementById('smdNewPass').value = '';
      } catch (e) { toast(e.message, 'err'); }
    });

    const logoutBtn = document.getElementById('smdLogoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', () => {
      if (window.SmAuth && typeof window.SmAuth.logout === 'function') window.SmAuth.logout();
      document.dispatchEvent(new CustomEvent('sm-auth-changed'));
    });
  }

  // ---------------------------------------------------------
  // React to login/logout happening elsewhere on the page
  // ---------------------------------------------------------
  document.addEventListener('sm-auth-changed', () => boot(true));
  window.addEventListener('storage', (e) => {
    if (e.key && ['sm_token', 'admin_token', 'editor_token'].includes(e.key)) {
      boot(true);
    }
  });
  window.addEventListener('focus', () => {
    if (document.hasFocus()) boot(true);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => boot(true));
  } else {
    boot(true);
  }
})();