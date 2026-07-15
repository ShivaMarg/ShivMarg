/**
 * ShivMarg Auth — auth.js
 * Drop-in login / register modal for any page.
 * Reads/writes JWT to localStorage key "sm_token".
 *
 * Exposes: window.SmAuth.{init, getUser, getToken, logout, requireLogin, getAvatarBg}
 *
 * Usage (with navbar handling its own auth UI):
 *   SmAuth.init({ apiBase: '...', noWidget: true });
 *
 * Usage (standalone pages without a navbar):
 *   SmAuth.init({ apiBase: '...' });
 */

(function () {
  'use strict';

  /* ─── CONFIG ─── */
  const TOKEN_KEY = 'sm_token';
  const USER_KEY  = 'sm_user';
  let   API_BASE  = 'https://www.api.shivmarg.live';
  // let API_BASE = 'http://127.0.0.1:8000';
  let   NO_WIDGET = false; // set true when the page navbar manages its own auth UI

  /* ─── STATE ─── */
  let _user  = null;
  let _token = null;

  /* ─── STYLES ─── */
  function injectStyles() {
    if (document.getElementById('sm-auth-styles')) return;
    const style = document.createElement('style');
    style.id = 'sm-auth-styles';
style.textContent = `
      #sm-auth-overlay {
        position:fixed;inset:0;z-index:9000;
        background:rgba(30,41,59,0.45);backdrop-filter:blur(4px);
        display:none;align-items:center;justify-content:center;
        animation:sm-fade-in .25s ease;
      }
      #sm-auth-overlay.active{display:flex;}
      @keyframes sm-fade-in{from{opacity:0}to{opacity:1}}

      #sm-auth-modal{
        background:#FFFFFF;
        border:1px solid #bac3d2;
        border-radius:16px;
        width:min(440px,94vw);padding:36px 32px;
        position:relative;animation:sm-slide-up .3s ease;
        box-shadow:0 24px 60px rgba(15,23,42,0.16);
      }
      @keyframes sm-slide-up{from{transform:translateY(24px);opacity:0}to{transform:none;opacity:1}}
      #sm-auth-modal::before{
        content:'';position:absolute;top:0;left:0;right:0;height:3px;
        border-radius:16px 16px 0 0;
        background:linear-gradient(90deg,#2563EB,#22C55E);
      }

      .sm-close{
        position:absolute;top:14px;right:16px;
        background:#F1F5F9;border:none;color:#64748B;
        width:28px;height:28px;border-radius:50%;
        font-size:1.1rem;cursor:pointer;transition:all .2s;
        display:flex;align-items:center;justify-content:center;
      }
      .sm-close:hover{background:#E2E8F0;color:#0F172A;}

      .sm-modal-title{
        font-family:'Cinzel Decorative',serif;
        font-size:1.25rem;color:#0F172A;text-align:center;margin-bottom:6px;letter-spacing:0.5px;
      }
      .sm-modal-sub{
        font-family:'Cinzel',serif;font-size:0.6rem;letter-spacing:3px;
        color:#94A3B8;text-transform:uppercase;text-align:center;margin-bottom:26px;
      }

      .sm-tabs{display:flex;background:#F1F5F9;border-radius:10px;padding:4px;margin-bottom:24px;}
      .sm-tab{
        flex:1;padding:9px;text-align:center;border-radius:8px;
        font-family:'Cinzel',serif;font-size:0.65rem;letter-spacing:2px;text-transform:uppercase;
        color:#64748B;cursor:pointer;transition:all .25s;background:none;border:none;
      }
      .sm-tab.active{background:#FFFFFF;color:#2563EB;box-shadow:0 1px 4px rgba(15,23,42,0.1);}
      .sm-tab:hover:not(.active){color:#334155;}

      .sm-form{display:flex;flex-direction:column;gap:12px;}
      .sm-form input{
        width:100%;background:#F8FAFC;
        border:1px solid #E2E8F0;color:#0F172A;
        padding:11px 14px;font-family:'EB Garamond',serif;font-size:0.97rem;
        outline:none;transition:border-color .2s,background .2s;border-radius:8px;
      }
      .sm-form input::placeholder{color:#94A3B8;}
      .sm-form input:focus{border-color:#2563EB;background:#FFFFFF;}

      .sm-submit-btn{
        background:#2563EB;
        border:none;color:#FFFFFF;
        padding:13px;font-family:'Cinzel',serif;font-size:0.75rem;
        letter-spacing:2px;text-transform:uppercase;cursor:pointer;
        border-radius:8px;transition:background .2s;margin-top:4px;
      }
      .sm-submit-btn:hover{background:#1D4ED8;}
      .sm-submit-btn span{position:relative;z-index:1;}
      .sm-submit-btn:disabled{opacity:0.5;cursor:wait;}

      .sm-error{
        color:#DC2626;font-size:0.84rem;text-align:center;
        font-family:'EB Garamond',serif;font-style:italic;min-height:20px;
      }
      .sm-toggle-link{
        text-align:center;font-size:0.84rem;color:#64748B;
        font-family:'EB Garamond',serif;
      }
      .sm-toggle-link a{color:#2563EB;cursor:pointer;text-decoration:underline;}

      .sm-forgot-link{
        text-align:right;font-size:0.76rem;margin-top:-4px;
        font-family:'EB Garamond',serif;
      }
      .sm-forgot-link a{
        color:#94A3B8;text-decoration:none;cursor:pointer;
        transition:color .2s;
      }
      .sm-forgot-link a:hover{color:#2563EB;text-decoration:underline;}

      /* Floating widget — only shown when noWidget is false */
      #sm-auth-widget{
        position:fixed;top:12px;right:16px;z-index:8000;
        display:flex;align-items:center;gap:10px;
      }
      .sm-widget-btn{
        font-family:'Cinzel',serif;font-size:0.6rem;letter-spacing:2px;text-transform:uppercase;
        padding:8px 16px;border:1px solid #E2E8F0;border-radius:8px;
        color:#334155;background:#FFFFFF;
        cursor:pointer;transition:all .2s;box-shadow:0 2px 10px rgba(15,23,42,0.06);
      }
      .sm-widget-btn:hover{border-color:#2563EB;color:#2563EB;}
      .sm-widget-btn.primary{background:#2563EB;border-color:#2563EB;color:#FFFFFF;}
      .sm-widget-btn.primary:hover{background:#1D4ED8;}

      .sm-user-chip{
        display:flex;align-items:center;gap:8px;
        background:#FFFFFF;border:1px solid #E2E8F0;border-radius:30px;
        padding:6px 14px;box-shadow:0 2px 10px rgba(15,23,42,0.06);
      }
      .sm-avatar{
        width:28px;height:28px;border-radius:50%;
        display:flex;align-items:center;justify-content:center;
        font-family:'Cinzel',serif;font-size:0.75rem;color:#fff;font-weight:700;
      }
      .sm-uname{font-family:'Cinzel',serif;font-size:0.62rem;letter-spacing:1px;color:#334155;}
      .sm-logout{
        font-family:'Cinzel',serif;font-size:0.58rem;letter-spacing:1px;
        color:#94A3B8;cursor:pointer;text-transform:uppercase;
        background:none;border:none;padding:0;transition:color .2s;
      }
      .sm-logout:hover{color:#DC2626;}

      #sm-toast{
        position:fixed;bottom:80px;left:50%;transform:translateX(-50%);
        background:#0F172A;border:1px solid #1E293B;border-radius:10px;
        color:#22C55E;font-family:'Cinzel',serif;font-size:0.7rem;letter-spacing:2px;
        padding:10px 24px;z-index:9999;opacity:0;
        transition:opacity .4s;white-space:nowrap;pointer-events:none;
        box-shadow:0 8px 24px rgba(15,23,42,0.25);
      }
      #sm-toast.show{opacity:1;}

      .sm-google-btn{
        display:flex;align-items:center;justify-content:center;gap:10px;
        width:100%;padding:11px;margin-top:4px;
        background:#FFFFFF;border:1px solid #E2E8F0;border-radius:8px;
        color:#334155;font-family:'Cinzel',serif;font-size:0.7rem;
        letter-spacing:2px;text-transform:uppercase;cursor:pointer;
        transition:all .2s;
      }
      .sm-google-btn:hover{background:#F8FAFC;border-color:#22C55E;box-shadow:0 2px 10px rgba(34,197,94,0.12);}
      .sm-google-btn img{width:18px;height:18px;}
      .sm-or-divider{
        display:flex;align-items:center;gap:10px;margin:4px 0;
        color:#CBD5E1;font-family:'Cinzel',serif;font-size:0.58rem;letter-spacing:3px;
      }
      .sm-or-divider::before,.sm-or-divider::after{
        content:'';flex:1;height:1px;background:#E2E8F0;
      }
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

  /* ─── SESSION ─── */
  function saveSession(token, user) {
    _token = token; _user = user;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    document.dispatchEvent(
      new CustomEvent("sm-auth-changed")
    );
  }

  function loadSession() {
    _token = localStorage.getItem(TOKEN_KEY);
    const raw = localStorage.getItem(USER_KEY);
    _user = raw ? JSON.parse(raw) : null;
  }

  function clearSession() {
    _token = null; _user = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  /* ─── AVATAR COLORS ─── */
  const AVATAR_COLORS = {
    A:'linear-gradient(135deg,#E53935,#B71C1C)', B:'linear-gradient(135deg,#D81B60,#880E4F)',
    C:'linear-gradient(135deg,#8E24AA,#4A148C)', D:'linear-gradient(135deg,#5E35B1,#311B92)',
    E:'linear-gradient(135deg,#3949AB,#1A237E)', F:'linear-gradient(135deg,#1E88E5,#0D47A1)',
    G:'linear-gradient(135deg,#039BE5,#01579B)', H:'linear-gradient(135deg,#00ACC1,#006064)',
    I:'linear-gradient(135deg,#00897B,#004D40)', J:'linear-gradient(135deg,#43A047,#1B5E20)',
    K:'linear-gradient(135deg,#7CB342,#33691E)', L:'linear-gradient(135deg,#C0CA33,#827717)',
    M:'linear-gradient(135deg,#F9A825,#F57F17)', N:'linear-gradient(135deg,#FB8C00,#E65100)',
    O:'linear-gradient(135deg,#F4511E,#BF360C)', P:'linear-gradient(135deg,#8D6E63,#4E342E)',
    Q:'linear-gradient(135deg,#546E7A,#263238)', R:'linear-gradient(135deg,#EC407A,#AD1457)',
    S:'linear-gradient(135deg,#7C4DFF,#4527A0)', T:'linear-gradient(135deg,#00BCD4,#00838F)',
    U:'linear-gradient(135deg,#FF7043,#BF360C)', V:'linear-gradient(135deg,#26A69A,#00695C)',
    W:'linear-gradient(135deg,#AB47BC,#6A1B9A)', X:'linear-gradient(135deg,#EF5350,#C62828)',
    Y:'linear-gradient(135deg,#FDD835,#F9A825)', Z:'linear-gradient(135deg,#29B6F6,#0277BD)',
  };

  function getAvatarBg(letter) {
    const key = (letter || '?').toUpperCase();
    return AVATAR_COLORS[key] || 'linear-gradient(135deg,#7C4DFF,#512DA8)';
  }

  /* ─── API ─── */
  const FETCH_TIMEOUT = 40000;
  const RETRY_DELAY   = 3000;

  /* ─── ACTIVITY TRACKING ─── */
  // Fire-and-forget event logger. Works for logged-in (adds Bearer token)
  // and anonymous users (no token). Never blocks or throws to the caller.
  function trackActivity({ page_id, event_type, category, duration, meta }) {
    if (!page_id || !event_type) return;
    const headers = { 'Content-Type': 'application/json' };
    if (_token) headers['Authorization'] = 'Bearer ' + _token;

    fetch(API_BASE + '/api/activity/track', {
      method: 'POST',
      headers,
      body: JSON.stringify({ page_id, event_type, category, duration, meta }),
      keepalive: true, // survives page unload (useful for time_spent)
    }).catch(() => { /* best-effort, ignore failures */ });
  }

  async function apiPost(path, body, attempt = 0) {
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
    let res;
    try {
      res = await fetch(API_BASE + path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (e) {
      clearTimeout(timeoutId);
      if (attempt === 0) {
        toast('⏳ सर्वर जाग रहा है… थोड़ी प्रतीक्षा करें');
        await new Promise(r => setTimeout(r, RETRY_DELAY));
        return apiPost(path, body, 1);
      }
      throw new Error('सर्वर से संपर्क नहीं हो पाया। कृपया कुछ देर बाद पुनः प्रयास करें।');
    }
    clearTimeout(timeoutId);
    let data;
    try { data = await res.json(); }
    catch (e) { throw new Error('सर्वर से अमान्य उत्तर मिला। पुनः प्रयास करें।'); }
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
    } catch { clearSession(); return false; }
  }

  /* ─── MODAL ─── */
  function buildModal() {
    if (document.getElementById('sm-auth-overlay')) return; // already built
    const overlay = document.createElement('div');
    overlay.id = 'sm-auth-overlay';
    overlay.innerHTML = `
      <div id="sm-auth-modal" role="dialog" aria-modal="true" aria-label="Login or Register">
        <button class="sm-close" id="sm-close-btn" aria-label="Close">×</button>
        <div class="sm-modal-title">🕉️ ShivMarg</div>
        <div class="sm-modal-sub" id="sm-modal-sub">भक्त-पोर्टल में प्रवेश करें</div>
        <div class="sm-tabs">
          <button class="sm-tab active" id="sm-tab-login"    onclick="SmAuth._switchTab('login')">लॉगिन</button>
          <button class="sm-tab"        id="sm-tab-register" onclick="SmAuth._switchTab('register')">नया खाता</button>
        </div>
        <div id="sm-login-form" class="sm-form">
          <button class="sm-google-btn" id="sm-google-login-btn" onclick="SmAuth._doGoogleAuth()">
            <img src="https://developers.google.com/identity/images/g-logo.png" alt="G">
            Google से लॉगिन करें
          </button>
          <div class="sm-or-divider">या</div>
          <input type="email"    id="sm-l-email" placeholder="ईमेल पता"  autocomplete="email">
          <input type="password" id="sm-l-pass"  placeholder="पासवर्ड"   autocomplete="current-password">
          <div class="sm-forgot-link"><a href="/reset-password/">पासवर्ड भूल गए?</a></div>
          <div class="sm-error" id="sm-l-error"></div>
          <button class="sm-submit-btn" id="sm-l-btn" onclick="SmAuth._doLogin()">
            <span>🔱 लॉगिन करें</span>
          </button>
          <div class="sm-toggle-link">नया भक्त? <a onclick="SmAuth._switchTab('register')">खाता बनाएँ</a></div>

        </div>

        <div id="sm-register-form" class="sm-form" style="display:none">
          <button class="sm-google-btn" id="sm-google-reg-btn" onclick="SmAuth._doGoogleAuth()">
            <img src="https://developers.google.com/identity/images/g-logo.png" alt="G">
            Google से खाता बनाएँ
          </button>
          <div class="sm-or-divider">या</div>
          <input type="text"     id="sm-r-name"  placeholder="उपयोगकर्ता नाम (Username)" autocomplete="username">
          <input type="email"    id="sm-r-email" placeholder="ईमेल पता"                  autocomplete="email">
          <input type="password" id="sm-r-pass"  placeholder="पासवर्ड (न्यूनतम ६ अक्षर)" autocomplete="new-password">
          <input type="password" id="sm-r-pass2" placeholder="पासवर्ड पुनः दर्ज करें">
          <div class="sm-error" id="sm-r-error"></div>
          <button class="sm-submit-btn" id="sm-r-btn" onclick="SmAuth._doRegister()">
            <span>🌸 खाता बनाएँ</span>
          </button>
          <div class="sm-toggle-link">पहले से खाता है? <a onclick="SmAuth._switchTab('login')">लॉगिन करें</a></div>
          <div class="sm-or-divider">या</div>

        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) SmAuth._closeModal(); });
    document.getElementById('sm-close-btn').addEventListener('click', SmAuth._closeModal);
    overlay.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') SmAuth._closeModal();
      if (e.key === 'Enter') {
        const isLogin = document.getElementById('sm-login-form').style.display !== 'none';
        isLogin ? SmAuth._doLogin() : SmAuth._doRegister();
      }
    });
  }

  /* ─── FLOATING WIDGET (only when noWidget = false) ─── */
  function buildWidget() {
    if (NO_WIDGET) return; // navbar handles its own UI
    let w = document.getElementById('sm-auth-widget');
    if (!w) { w = document.createElement('div'); w.id = 'sm-auth-widget'; document.body.appendChild(w); }
    renderWidget();
  }

  function renderWidget() {
    // Always fire the event so ANY listener (navbar or floating widget) can react
    document.dispatchEvent(new CustomEvent('sm-auth-changed', { detail: { user: _user } }));

    if (NO_WIDGET) return; // navbar re-renders itself via the event above

    const w = document.getElementById('sm-auth-widget');
    if (!w) return;

    if (_user) {
      const avatarChar = (_user.avatar && _user.avatar.length === 1) ? _user.avatar : _user.username[0];
      const avatarBg   = getAvatarBg(avatarChar);
      w.innerHTML = `
        <div class="sm-user-chip">
          <a href="/profile.html" style="display:flex;align-items:center;gap:8px;text-decoration:none;cursor:pointer" title="मेरी प्रोफ़ाइल">
            <div class="sm-avatar" style="background:${avatarBg}">${avatarChar.toUpperCase()}</div>
            <span class="sm-uname">${_user.username}</span>
          </a>
          <button class="sm-logout" onclick="SmAuth.logout()">लॉगआउट</button>
        </div>`;
    } else {
      w.innerHTML = `
        <button class="sm-widget-btn" onclick="SmAuth._switchTab('register');SmAuth._openModal()">खाता बनाएँ</button>
        <button class="sm-widget-btn primary" onclick="SmAuth._switchTab('login');SmAuth._openModal()">लॉगिन</button>`;
    }
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
          if (window.registerNotificationTokenAfterLogin) {
        await window.registerNotificationTokenAfterLogin();
    }
      _closeModal();
      renderWidget();
      toast('🙏 जय शिव! स्वागत है, ' + data.user.username);
      if (window.ShivMargStreak) ShivMargStreak.onLogin(); 
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
      const data = await apiPost('/api/auth/register', {
        username, email, password: pass,
        signup_page: window.location.pathname,
      });
      saveSession(data.token, data.user);
      _closeModal();
      renderWidget();
      toast('🌸 खाता बन गया! जय महादेव, ' + data.user.username);
      if (window.ShivMargStreak) ShivMargStreak.onLogin(); 
    } catch (e) {
      errEl.textContent = e.message;
    } finally {
      btn.disabled = false;
    }
  }


  /* ─── GOOGLE AUTH ─── */
  const GOOGLE_CLIENT_ID = '299436963033-5u4k118211j4jbeum45r67omn10d0g7g.apps.googleusercontent.com'; // ← paste your Client ID here

  function _loadGoogleScript() {
    return new Promise((resolve) => {
      if (window.google) { resolve(); return; }
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.onload = resolve;
      document.head.appendChild(s);
    });
  }

  async function _doGoogleAuth() {
    if (!GOOGLE_CLIENT_ID) {
      toast('⚠️ Google लॉगिन अभी उपलब्ध नहीं है');
      return;
    }
    // Disable both Google buttons while working
    ['sm-google-login-btn','sm-google-reg-btn'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.disabled = true; el.textContent = '⏳ प्रतीक्षा करें…'; }
    });
    try {
      await _loadGoogleScript();
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          try {
            const data = await apiPost('/api/auth/google', {
              id_token: response.credential,
              signup_page: window.location.pathname,
            });
            saveSession(data.token, data.user);
            if (window.registerNotificationTokenAfterLogin) {
                await window.registerNotificationTokenAfterLogin();
            }
            _closeModal();
            renderWidget();
            toast(data.is_new
              ? '🌸 खाता बन गया! जय महादेव, ' + data.user.username
              : '🙏 जय शिव! स्वागत है, ' + data.user.username
            );
            if (window.ShivMargStreak) ShivMargStreak.onLogin();
          } catch (e) {
            // Show error in whichever tab is active
            const isLogin = document.getElementById('sm-login-form').style.display !== 'none';
            document.getElementById(isLogin ? 'sm-l-error' : 'sm-r-error').textContent = e.message;
          } finally {
            ['sm-google-login-btn','sm-google-reg-btn'].forEach(id => {
              const el = document.getElementById(id);
              if (el) {
                el.disabled = false;
                el.innerHTML = '<img src="https://developers.google.com/identity/images/g-logo.png" alt="G" style="width:18px;height:18px"> Google से ' + (id.includes('login') ? 'लॉगिन' : 'खाता बनाएँ');
              }
            });
          }
        },
      });
      window.google.accounts.id.prompt(); // shows the Google One Tap popup
    } catch (e) {
      toast('⚠️ Google लॉगिन में समस्या हुई');
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
      if (opts.apiBase)  API_BASE  = opts.apiBase;
      if (opts.noWidget) NO_WIDGET = true;
      injectStyles();
      loadSession();
      buildModal();
      buildWidget();
      // Silently verify token, then re-render
      if (_token) {
        verifyToken().then(() => renderWidget());
      } else {
        // Fire initial event even when logged out so navbar can render login buttons
        document.dispatchEvent(new CustomEvent('sm-auth-changed', { detail: { user: null } }));
      }
    },
    getUser()  { return _user;  },
    getToken() { return _token; },
    logout,
    requireLogin(onSuccess) {
      if (_user) { if (onSuccess) onSuccess(_user); return true; }
      _openModal();
      function handler(e) {
        if (e.detail && e.detail.user) {
          document.removeEventListener('sm-auth-changed', handler);
          if (onSuccess) onSuccess(e.detail.user);
        }
      }
      document.addEventListener('sm-auth-changed', handler);
      return false;
    },
    getAvatarBg,
    trackActivity,
    _openModal, _closeModal, _switchTab, _doLogin, _doRegister,_doGoogleAuth,
  };
})();