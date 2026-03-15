/**
 * ShivaMarg Auth — auth.js
 * Drop-in login / register modal for any page.
 * Reads/writes JWT to localStorage key "sm_token".
 * Exposes: window.SmAuth.{init, getUser, getToken, logout, requireLogin}
 *
 * Usage in HTML:
 *   <script src="/js/auth.js"></script>
 *   <script> SmAuth.init({ apiBase: 'http://localhost:8000' }); </script>
 */

(function () {
  'use strict';

  /* ─── CONFIG ─── */
  const TOKEN_KEY   = 'sm_token';
  const USER_KEY    = 'sm_user';
  let   API_BASE    = 'https://shivamargbackend.onrender.com'; // ← change to your server URL in prod

  /* ─── STATE ─── */
  let _user  = null;
  let _token = null;

  /* ─── STYLES (injected once) ─── */
  function injectStyles() {
    if (document.getElementById('sm-auth-styles')) return;
    const style = document.createElement('style');
    style.id = 'sm-auth-styles';
    style.textContent = `
      /* ── Auth overlay ── */
      #sm-auth-overlay {
        position:fixed; inset:0; z-index:9000;
        background:rgba(0,0,0,0.75); backdrop-filter:blur(6px);
        display:none; align-items:center; justify-content:center;
        animation:sm-fade-in .25s ease;
      }
      #sm-auth-overlay.active { display:flex; }
      @keyframes sm-fade-in { from{opacity:0} to{opacity:1} }

      #sm-auth-modal {
        background:linear-gradient(145deg,#0C0520,#040210);
        border:1px solid rgba(124,77,255,0.3);
        width:min(460px, 94vw); padding:36px 32px;
        position:relative; animation:sm-slide-up .3s ease;
      }
      @keyframes sm-slide-up { from{transform:translateY(28px);opacity:0} to{transform:none;opacity:1} }
      #sm-auth-modal::before {
        content:''; position:absolute; top:0;left:0;right:0; height:3px;
        background:linear-gradient(90deg,transparent,#7C4DFF,#C9A84C,#7C4DFF,transparent);
      }

      .sm-close {
        position:absolute; top:14px; right:16px;
        background:none; border:none; color:rgba(255,255,255,0.4);
        font-size:1.4rem; cursor:pointer; transition:color .2s;
      }
      .sm-close:hover { color:#fff; }

      .sm-modal-title {
        font-family:'Cinzel Decorative',serif;
        font-size:1.3rem; color:#E8C96A; text-align:center; margin-bottom:6px;
        letter-spacing:1px;
      }
      .sm-modal-sub {
        font-family:'Cinzel',serif; font-size:0.62rem; letter-spacing:4px;
        color:rgba(179,157,219,0.6); text-transform:uppercase; text-align:center;
        margin-bottom:26px;
      }

      /* Tabs */
      .sm-tabs { display:flex; border:1px solid rgba(124,77,255,0.22); margin-bottom:24px; }
      .sm-tab {
        flex:1; padding:10px; text-align:center;
        font-family:'Cinzel',serif; font-size:0.68rem; letter-spacing:3px; text-transform:uppercase;
        color:rgba(255,255,255,0.4); cursor:pointer; transition:all .25s;
        background:none; border:none;
      }
      .sm-tab.active { background:rgba(124,77,255,0.15); color:#B39DDB; }
      .sm-tab:hover:not(.active) { color:rgba(255,255,255,0.7); }

      /* Form */
      .sm-form { display:flex; flex-direction:column; gap:13px; }
      .sm-form input {
        width:100%; background:rgba(0,0,0,0.55);
        border:1px solid rgba(124,77,255,0.22); color:#F3EEFF;
        padding:11px 14px; font-family:'EB Garamond',serif; font-size:0.97rem;
        outline:none; transition:border-color .3s; border-radius:1px;
      }
      .sm-form input::placeholder { color:rgba(243,238,255,0.3); }
      .sm-form input:focus { border-color:#9575CD; }

      .sm-submit-btn {
        background:linear-gradient(135deg,#1A0840,#0A0320);
        border:1px solid rgba(124,77,255,0.4); color:#F3EEFF;
        padding:13px; font-family:'Cinzel',serif; font-size:0.78rem;
        letter-spacing:3px; text-transform:uppercase; cursor:pointer;
        transition:all .3s; position:relative; overflow:hidden; margin-top:4px;
      }
      .sm-submit-btn::before {
        content:''; position:absolute; inset:0;
        background:rgba(124,77,255,0.25); opacity:0; transition:opacity .3s;
      }
      .sm-submit-btn:hover::before { opacity:1; }
      .sm-submit-btn span { position:relative; z-index:1; }
      .sm-submit-btn:disabled { opacity:0.5; cursor:wait; }

      .sm-error {
        color:#FF8A80; font-size:0.84rem; text-align:center;
        font-family:'EB Garamond',serif; font-style:italic; min-height:20px;
      }
      .sm-toggle-link {
        text-align:center; font-size:0.84rem; color:rgba(243,238,255,0.45);
        font-family:'EB Garamond',serif;
      }
      .sm-toggle-link a {
        color:#B39DDB; cursor:pointer; text-decoration:underline;
      }

      /* ── Topbar Auth Widget ── */
      #sm-auth-widget {
        position:fixed; top:12px; right:16px; z-index:8000;
        display:flex; align-items:center; gap:10px;
      }
      .sm-widget-btn {
        font-family:'Cinzel',serif; font-size:0.6rem; letter-spacing:2px; text-transform:uppercase;
        padding:7px 16px; border:1px solid rgba(124,77,255,0.35);
        color:rgba(243,238,255,0.65); background:rgba(4,2,16,0.8);
        cursor:pointer; transition:all .25s; backdrop-filter:blur(8px);
      }
      .sm-widget-btn:hover { border-color:#B39DDB; color:#F3EEFF; }
      .sm-widget-btn.primary { background:rgba(124,77,255,0.18); border-color:#7C4DFF; color:#B39DDB; }

      .sm-user-chip {
        display:flex; align-items:center; gap:8px;
        background:rgba(4,2,16,0.8); border:1px solid rgba(124,77,255,0.22);
        padding:6px 14px; backdrop-filter:blur(8px);
      }
      .sm-avatar {
        width:28px; height:28px; border-radius:50%;
        background:linear-gradient(135deg,#7C4DFF,#512DA8);
        display:flex; align-items:center; justify-content:center;
        font-family:'Cinzel',serif; font-size:0.75rem; color:#fff; font-weight:700;
      }
      .sm-uname { font-family:'Cinzel',serif; font-size:0.62rem; letter-spacing:1px; color:#B39DDB; }
      .sm-logout {
        font-family:'Cinzel',serif; font-size:0.58rem; letter-spacing:1px;
        color:rgba(255,255,255,0.35); cursor:pointer; text-transform:uppercase;
        background:none; border:none; padding:0; transition:color .2s;
      }
      .sm-logout:hover { color:#FF8A80; }

      /* Toast */
      #sm-toast {
        position:fixed; bottom:80px; left:50%; transform:translateX(-50%);
        background:rgba(20,8,50,0.95); border:1px solid rgba(124,77,255,0.35);
        color:#B39DDB; font-family:'Cinzel',serif; font-size:0.7rem; letter-spacing:2px;
        padding:10px 24px; z-index:9999; opacity:0;
        transition:opacity .4s; white-space:nowrap; pointer-events:none;
      }
      #sm-toast.show { opacity:1; }
    `;
    document.head.appendChild(style);
  }

  /* ─── TOAST ─── */
  function toast(msg, dur = 2800) {
    let el = document.getElementById('sm-toast');
    if (!el) { el = document.createElement('div'); el.id = 'sm-toast'; document.body.appendChild(el); }
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), dur);
  }

  /* ─── TOKEN / STORAGE ─── */
  function saveSession(token, user) {
    _token = token; _user = user;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function loadSession() {
    _token = localStorage.getItem(TOKEN_KEY);
    const raw = localStorage.getItem(USER_KEY);
    _user  = raw ? JSON.parse(raw) : null;
  }

  function clearSession() {
    _token = null; _user = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  /* ─── API CALLS ─── */
  async function apiPost(path, body) {
    const res = await fetch(API_BASE + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Request failed');
    return data;
  }

  async function verifyToken() {
    if (!_token) return false;
    try {
      const res = await fetch(API_BASE + '/api/auth/me', {
        headers: { Authorization: 'Bearer ' + _token }
      });
      if (!res.ok) { clearSession(); return false; }
      const user = await res.json();
      _user = user;
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return true;
    } catch {
      clearSession(); return false;
    }
  }

  /* ─── MODAL HTML ─── */
  function buildModal() {
    const overlay = document.createElement('div');
    overlay.id = 'sm-auth-overlay';
    overlay.innerHTML = `
      <div id="sm-auth-modal" role="dialog" aria-modal="true" aria-label="Login or Register">
        <button class="sm-close" id="sm-close-btn" aria-label="Close">×</button>
        <div class="sm-modal-title">🕉️ ShivaMarg</div>
        <div class="sm-modal-sub" id="sm-modal-sub">भक्त-पोर्टल में प्रवेश करें</div>

        <div class="sm-tabs">
          <button class="sm-tab active" id="sm-tab-login" onclick="SmAuth._switchTab('login')">लॉगिन</button>
          <button class="sm-tab" id="sm-tab-register" onclick="SmAuth._switchTab('register')">नया खाता</button>
        </div>

        <!-- Login form -->
        <div id="sm-login-form" class="sm-form">
          <input type="email" id="sm-l-email" placeholder="ईमेल पता" autocomplete="email">
          <input type="password" id="sm-l-pass" placeholder="पासवर्ड" autocomplete="current-password">
          <div class="sm-error" id="sm-l-error"></div>
          <button class="sm-submit-btn" id="sm-l-btn" onclick="SmAuth._doLogin()">
            <span>🔱 लॉगिन करें</span>
          </button>
          <div class="sm-toggle-link">नया भक्त? <a onclick="SmAuth._switchTab('register')">खाता बनाएँ</a></div>
        </div>

        <!-- Register form -->
        <div id="sm-register-form" class="sm-form" style="display:none">
          <input type="text" id="sm-r-name" placeholder="उपयोगकर्ता नाम (Username)" autocomplete="username">
          <input type="email" id="sm-r-email" placeholder="ईमेल पता" autocomplete="email">
          <input type="password" id="sm-r-pass" placeholder="पासवर्ड (न्यूनतम ६ अक्षर)" autocomplete="new-password">
          <input type="password" id="sm-r-pass2" placeholder="पासवर्ड पुनः दर्ज करें">
          <div class="sm-error" id="sm-r-error"></div>
          <button class="sm-submit-btn" id="sm-r-btn" onclick="SmAuth._doRegister()">
            <span>🌸 खाता बनाएँ</span>
          </button>
          <div class="sm-toggle-link">पहले से खाता है? <a onclick="SmAuth._switchTab('login')">लॉगिन करें</a></div>
        </div>
      </div>`;

    document.body.appendChild(overlay);

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) SmAuth._closeModal();
    });
    document.getElementById('sm-close-btn').addEventListener('click', SmAuth._closeModal);

    // Enter key
    overlay.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') SmAuth._closeModal();
      if (e.key === 'Enter') {
        const isLogin = document.getElementById('sm-login-form').style.display !== 'none';
        isLogin ? SmAuth._doLogin() : SmAuth._doRegister();
      }
    });
  }

  /* ─── AUTH WIDGET (top bar) ─── */
  function buildWidget() {
    const w = document.createElement('div');
    w.id = 'sm-auth-widget';
    document.body.appendChild(w);
    renderWidget();
  }

  function renderWidget() {
    const w = document.getElementById('sm-auth-widget');
    if (!w) return;
    if (_user) {
      w.innerHTML = `
        <div class="sm-user-chip">
          <div class="sm-avatar">${_user.avatar || _user.username[0].toUpperCase()}</div>
          <span class="sm-uname">${_user.username}</span>
          <button class="sm-logout" onclick="SmAuth.logout()">लॉगआउट</button>
        </div>`;
    } else {
      w.innerHTML = `
        <button class="sm-widget-btn" onclick="SmAuth._switchTab('register');SmAuth._openModal()">खाता बनाएँ</button>
        <button class="sm-widget-btn primary" onclick="SmAuth._switchTab('login');SmAuth._openModal()">लॉगिन</button>`;
    }
    // Notify comments module
    document.dispatchEvent(new CustomEvent('sm-auth-changed', { detail: { user: _user } }));
  }

  /* ─── MODAL ACTIONS ─── */
  function _openModal()  { document.getElementById('sm-auth-overlay').classList.add('active'); }
  function _closeModal() { document.getElementById('sm-auth-overlay').classList.remove('active'); }

  function _switchTab(tab) {
    const isLogin = tab === 'login';
    document.getElementById('sm-login-form').style.display    = isLogin ? 'flex' : 'none';
    document.getElementById('sm-register-form').style.display = isLogin ? 'none' : 'flex';
    document.getElementById('sm-tab-login').classList.toggle('active', isLogin);
    document.getElementById('sm-tab-register').classList.toggle('active', !isLogin);
    document.getElementById('sm-modal-sub').textContent = isLogin ? 'भक्त-पोर्टल में प्रवेश करें' : 'नया खाता बनाएँ';
    document.getElementById(isLogin ? 'sm-l-error' : 'sm-r-error').textContent = '';
  }

  async function _doLogin() {
    const email = document.getElementById('sm-l-email').value.trim();
    const pass  = document.getElementById('sm-l-pass').value;
    const errEl = document.getElementById('sm-l-error');
    const btn   = document.getElementById('sm-l-btn');

    if (!email || !pass) { errEl.textContent = 'कृपया सभी क्षेत्र भरें।'; return; }
    btn.disabled = true; errEl.textContent = '';
    try {
      const data = await apiPost('/api/auth/login', { email, password: pass });
      saveSession(data.token, data.user);
      _closeModal();
      renderWidget();
      toast('🙏 जय शिव! स्वागत है, ' + data.user.username);
    } catch (e) {
      errEl.textContent = e.message;
    } finally {
      btn.disabled = false;
    }
  }

  async function _doRegister() {
    const username = document.getElementById('sm-r-name').value.trim();
    const email    = document.getElementById('sm-r-email').value.trim();
    const pass     = document.getElementById('sm-r-pass').value;
    const pass2    = document.getElementById('sm-r-pass2').value;
    const errEl    = document.getElementById('sm-r-error');
    const btn      = document.getElementById('sm-r-btn');

    if (!username || !email || !pass || !pass2) { errEl.textContent = 'कृपया सभी क्षेत्र भरें।'; return; }
    if (pass !== pass2) { errEl.textContent = 'पासवर्ड मेल नहीं खाते।'; return; }
    if (pass.length < 6) { errEl.textContent = 'पासवर्ड कम से कम 6 अक्षरों का हो।'; return; }

    btn.disabled = true; errEl.textContent = '';
    try {
      const data = await apiPost('/api/auth/register', { username, email, password: pass });
      saveSession(data.token, data.user);
      _closeModal();
      renderWidget();
      toast('🌸 खाता बन गया! जय महादेव, ' + data.user.username);
    } catch (e) {
      errEl.textContent = e.message;
    } finally {
      btn.disabled = false;
    }
  }

  function logout() {
    clearSession();
    renderWidget();
    toast('👋 लॉगआउट हो गए। जय शिव!');
  }

  /* ─── PUBLIC API ─── */
  window.SmAuth = {
    init(opts = {}) {
      if (opts.apiBase) API_BASE = opts.apiBase;
      injectStyles();
      loadSession();
      buildModal();
      buildWidget();
      // Silently verify token in background
      if (_token) {
        verifyToken().then(() => renderWidget());
      }
    },
    getUser()  { return _user; },
    getToken() { return _token; },
    logout,
    /** Call this to require login before an action. Returns true if logged in, else opens modal. */
    requireLogin(onSuccess) {
      if (_user) { if (onSuccess) onSuccess(_user); return true; }
      _openModal();
      // After login event, run callback once
      function handler(e) {
        if (e.detail && e.detail.user) {
          document.removeEventListener('sm-auth-changed', handler);
          if (onSuccess) onSuccess(e.detail.user);
        }
      }
      document.addEventListener('sm-auth-changed', handler);
      return false;
    },
    _openModal, _closeModal, _switchTab, _doLogin, _doRegister,
  };
})();