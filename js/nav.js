/**
 * ShivaMarg Navigation Module
 * Include this single file on all pages: <script src="/js/nav.js"></script>
 * 
 * This module:
 * - Creates the navbar HTML on page load
 * - Handles all dropdowns and mobile menu logic
 * - Syncs with auth state automatically
 * - Works everywhere without conflicts
 */

(function () {
  'use strict';

  const NAV_HTML = `
<nav id="sm-navbar">
  <div class="nav-container">
    <!-- LOGO -->
    <a href="/" class="logo">Shiva<em>Marg</em></a>

    <!-- HAMBURGER (Mobile) -->
    <button class="hamburger" id="hamburger" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>

    <!-- CENTER MENU (Desktop) -->
    <div class="nav-center">
      <div class="nav-links">
        <div class="nav-dropdown">
          <button class="nav-dropdown-btn" data-menu="shiv-menu">शिव स्तोत्र</button>
          <div class="dropdown-content" id="shiv-menu">
            <div class="dropdown-label">✦ शिव पंचाक्षर स्तोत्र ✦</div>
            <a href="/shiva-mantras">शिव मंत्र</a>
            <a href="/shiva-mantras/Shiva-mahamrityunjaya-mantra/">महामृत्युंजय मंत्र</a>
            <a href="#">निर्वाणपटकम्</a>
            <div class="dropdown-divider"></div>
            <div class="dropdown-label">✦ शिव आरती ✦</div>
            <a href="#">शिव आरती</a>
            <a href="#">महा आरती</a>
          </div>
        </div>

        <div class="nav-dropdown">
          <button class="nav-dropdown-btn" data-menu="shakti-menu">शक्ति</button>
          <div class="dropdown-content" id="shakti-menu">
            <div class="dropdown-label">✦ माता दुर्गा ✦</div>
            <a href="/durga-mantras/">माँ दुर्गा मंत्र</a>
            <a href="#">अष्टोत्तर शतनाम</a>
            <div class="dropdown-divider"></div>
            <div class="dropdown-label">✦ देवी काली ✦</div>
            <a href="/maha-kali-mantra/">माँ काली मंत्र</a>
            <a href="#">कालिका स्तोत्र</a>
          </div>
        </div>

        <div class="nav-dropdown">
          <button class="nav-dropdown-btn" data-menu="vishnu-menu">विष्णु</button>
          <div class="dropdown-content" id="vishnu-menu">
            <div class="dropdown-label">✦ भगवान विष्णु ✦</div>
            <a href="/bhagvan-vishnu-mantra/">विष्णु मंत्र</a>
            <a href="#">विष्णु सहस्रनाम</a>
          </div>
        </div>

        <div class="nav-dropdown">
          <button class="nav-dropdown-btn" data-menu="ram-menu">राम-हनुमान</button>
          <div class="dropdown-content" id="ram-menu">
            <div class="dropdown-label">✦ श्री राम ✦</div>
            <a href="/Shri-ram-mantra/">राम मंत्र</a>
            <a href="#">राम रक्षा स्तोत्र</a>
            <div class="dropdown-divider"></div>
            <div class="dropdown-label">✦ हनुमान जी ✦</div>
            <a href="/hanumanji/">हनुमान मंत्र</a>
            <a href="#">हनुमान चालीसा</a>
          </div>
        </div>

        <div class="nav-dropdown">
          <button class="nav-dropdown-btn" data-menu="krishna-menu">कृष्ण</button>
          <div class="dropdown-content" id="krishna-menu">
            <div class="dropdown-label">✦ श्री कृष्ण ✦</div>
            <a href="/Krishna-Mahamantras/">कृष्ण महामंत्र</a>
            <a href="#">कृष्ण भजन</a>
            <div class="dropdown-divider"></div>
            <div class="dropdown-label">✦ मैथिली गीत ✦</div>
            <a href="/Vidyapati-Geet-Sangrah/">विद्यापति गीत संग्रह</a>
          </div>
        </div>

        <div class="nav-dropdown">
          <button class="nav-dropdown-btn" data-menu="other-menu">अन्य देव</button>
          <div class="dropdown-content" id="other-menu">
            <div class="dropdown-label">✦ गणेश जी ✦</div>
            <a href="/ganesh-mantras/">गणेश मंत्र</a>
            <div class="dropdown-divider"></div>
            <div class="dropdown-label">✦ सूर्य देव ✦</div>
            <a href="/surya-dev/">सूर्य मंत्र</a>
          </div>
        </div>
      </div>
    </div>

    <!-- RIGHT: Search + Auth -->
    <div class="nav-right">
      <input class="nav-search" type="text" placeholder="🔍 खोजें...">
      <div id="nav-auth-widget"></div>
    </div>
  </div>

  <!-- MOBILE MENU -->
  <div class="mobile-menu" id="mobile-menu">
    <div class="mobile-menu-content" id="mobile-menu-content"></div>
  </div>
</nav>`;

  const NAV_STYLES = `
    :root {
      --saffron: #FF6B00;
      --deep-saffron: #CC4400;
      --gold: #D4A017;
      --gold-light: #F2C94C;
      --gold-pale: #FBE89A;
      --crimson: #7B0000;
      --maroon: #3D0000;
      --cream: #FDF5E6;
      --smoke: #F8EDD8;
      --dark: #0D0500;
      --dark2: #170800;
      --dark3: #1F0A00;
    }

    #sm-navbar {
      position: sticky; top: 0; z-index: 200;
      background: rgba(13,5,0,0.92); backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(212,160,23,0.15);
      display: flex; align-items: center; justify-content: space-between;
      height: 64px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.35);
    }

    #sm-navbar .nav-container {
      display: flex; align-items: center; justify-content: space-between;
      width: 100%; padding: 0 24px; gap: 20px;
    }

    #sm-navbar .logo {
      font-family: 'Cinzel Decorative', serif; font-size: 1.35rem;
      color: var(--gold); text-decoration: none; letter-spacing: 1.5px;
      flex-shrink: 0; display: flex; align-items: center; gap: 8px;
    }
    #sm-navbar .logo::before { content: '🕉️'; font-size: 1.5rem; }
    #sm-navbar .logo em { color: var(--saffron); font-style: normal; }
    #sm-navbar .logo:hover { color: var(--gold-light); }

    #sm-navbar .nav-center { display: flex; align-items: center; gap: 0; flex: 1; max-width: 800px; }
    #sm-navbar .nav-links  { display: flex; gap: 0; }

    #sm-navbar .nav-links a, #sm-navbar .nav-dropdown-btn {
      color: rgba(253,245,230,0.65); text-decoration: none;
      font-family: 'Cinzel', serif; font-size: 0.72rem; letter-spacing: 2px;
      text-transform: uppercase; padding: 0 14px; height: 64px;
      display: flex; align-items: center;
      border-bottom: 2px solid transparent;
      transition: all 0.3s ease;
      background: none; border: none; cursor: pointer; white-space: nowrap;
    }
    #sm-navbar .nav-links a:hover, #sm-navbar .nav-dropdown-btn:hover { color: var(--gold-light); border-bottom-color: var(--saffron); }

    #sm-navbar .nav-dropdown { position: relative; display: inline-block; }
    #sm-navbar .nav-dropdown-btn { padding: 0 14px; gap: 6px; }
    #sm-navbar .nav-dropdown-btn::after { content: '▼'; font-size: 0.45rem; transition: transform 0.3s ease; margin-left: 4px; }
    #sm-navbar .nav-dropdown-btn.active::after { transform: rotate(180deg); }

    #sm-navbar .dropdown-content {
      position: absolute; top: 64px; left: 0;
      background: rgba(13,5,0,0.97); border: 1px solid rgba(212,160,23,0.2);
      border-top: none; min-width: 320px;
      max-height: 0; overflow: hidden;
      transition: max-height 0.4s ease, opacity 0.4s ease;
      opacity: 0; z-index: 1000;
      backdrop-filter: blur(16px); box-shadow: 0 12px 48px rgba(0,0,0,0.5);
    }
    #sm-navbar .dropdown-content.active { max-height: 600px; opacity: 1; }
    #sm-navbar .dropdown-content a {
      display: block; padding: 12px 20px;
      color: rgba(253,245,230,0.7); text-decoration: none;
      font-family: 'Tiro Devanagari Sanskrit', serif; font-size: 0.95rem;
      transition: all 0.2s ease; border-bottom: 1px solid rgba(212,160,23,0.08);
    }
    #sm-navbar .dropdown-content a:last-child { border-bottom: none; }
    #sm-navbar .dropdown-content a:hover { background: rgba(212,160,23,0.12); color: var(--gold-light); padding-left: 26px; }
    #sm-navbar .dropdown-divider { height: 1px; background: linear-gradient(90deg,transparent,rgba(212,160,23,0.15),transparent); margin: 6px 0; }
    #sm-navbar .dropdown-label { padding: 10px 20px; font-family: 'Cinzel',serif; font-size: 0.63rem; letter-spacing: 4px; color: var(--saffron); text-transform: uppercase; font-weight: 600; }

    #sm-navbar .nav-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }

    #sm-navbar .nav-right .auth-btn {
      display: inline-block;
    }

    #sm-navbar .nav-search {
      background: rgba(255,255,255,0.06); border: 1px solid rgba(212,160,23,0.22);
      color: var(--cream); padding: 8px 14px;
      font-family: 'Cinzel',serif; font-size: 0.7rem; letter-spacing: 1px;
      outline: none; border-radius: 3px; width: 160px; transition: all 0.3s ease;
    }
    #sm-navbar .nav-search::placeholder { color: rgba(253,245,230,0.3); }
    #sm-navbar .nav-search:focus { border-color: var(--gold); background: rgba(255,255,255,0.1); box-shadow: 0 0 12px rgba(212,160,23,0.2); }

    #sm-navbar .auth-btn {
      font-family: 'Cinzel',serif; font-size: 0.68rem; letter-spacing: 2px; text-transform: uppercase;
      padding: 8px 16px; border: 1px solid rgba(212,160,23,0.35);
      color: rgba(253,245,230,0.7); background: transparent;
      cursor: pointer; transition: all 0.3s ease; border-radius: 3px; white-space: nowrap;
    }
    #sm-navbar .auth-btn:hover { border-color: var(--gold); color: var(--gold-light); background: rgba(212,160,23,0.08); }
    #sm-navbar .auth-btn.primary {
      background: linear-gradient(135deg,rgba(255,107,0,0.15),rgba(212,160,23,0.1));
      border-color: var(--saffron); color: var(--gold-light);
    }
    #sm-navbar .auth-btn.primary:hover { background: linear-gradient(135deg,rgba(255,107,0,0.25),rgba(212,160,23,0.2)); box-shadow: 0 0 16px rgba(255,107,0,0.2); }

    #sm-navbar .user-chip {
      display: flex; align-items: center; gap: 10px;
      background: rgba(212,160,23,0.08); border: 1px solid rgba(212,160,23,0.25);
      padding: 6px 12px; border-radius: 20px;
      cursor: pointer; transition: all 0.3s ease; position: relative;
    }
    #sm-navbar .user-chip:hover { background: rgba(212,160,23,0.15); border-color: var(--gold); }

    #sm-navbar .avatar {
      width: 32px; height: 32px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-family: 'Cinzel',serif; font-size: 0.8rem; color: #fff; font-weight: 700;
    }
    #sm-navbar .user-name {
      font-family: 'Cinzel',serif; font-size: 0.68rem; letter-spacing: 1px;
      color: var(--gold-light); max-width: 120px; overflow: hidden; text-overflow: ellipsis;
    }

    #sm-navbar .user-menu {
      position: absolute; top: calc(100% + 8px); right: 0;
      background: rgba(13,5,0,0.97); border: 1px solid rgba(212,160,23,0.25);
      border-radius: 4px; min-width: 180px;
      max-height: 0; overflow: hidden;
      transition: max-height 0.3s ease, opacity 0.3s ease;
      opacity: 0; z-index: 1001;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5); backdrop-filter: blur(12px);
    }
    #sm-navbar .user-menu.active { max-height: 250px; opacity: 1; }
    #sm-navbar .user-menu a, #sm-navbar .user-menu button {
      display: block; width: 100%; padding: 12px 16px;
      color: rgba(253,245,230,0.7); text-decoration: none;
      font-family: 'Cinzel',serif; font-size: 0.68rem; letter-spacing: 1px;
      border: none; background: none; text-align: left; cursor: pointer;
      transition: all 0.2s ease; border-bottom: 1px solid rgba(212,160,23,0.08);
    }
    #sm-navbar .user-menu a:last-child, #sm-navbar .user-menu button:last-child { border-bottom: none; }
    #sm-navbar .user-menu a:hover, #sm-navbar .user-menu button:hover { background: rgba(212,160,23,0.12); color: var(--gold-light); padding-left: 20px; }
    #sm-navbar .logout-btn { color: #FF6B6B !important; }
    #sm-navbar .logout-btn:hover { background: rgba(255,107,107,0.1) !important; }

    #sm-navbar .hamburger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 8px; z-index: 201; }
    #sm-navbar .hamburger span { width: 24px; height: 2px; background: var(--gold); border-radius: 2px; transition: all 0.3s ease; }
    #sm-navbar .hamburger.active span:nth-child(1) { transform: rotate(45deg) translate(8px,8px); }
    #sm-navbar .hamburger.active span:nth-child(2) { opacity: 0; }
    #sm-navbar .hamburger.active span:nth-child(3) { transform: rotate(-45deg) translate(7px,-7px); }

    #sm-navbar .mobile-menu {
      position: fixed; top: 64px; left: 0; right: 0;
      background: rgba(13,5,0,0.98); border-bottom: 1px solid rgba(212,160,23,0.15);
      max-height: 0; overflow-y: auto; overflow-x: hidden;
      transition: max-height 0.4s ease; z-index: 199; backdrop-filter: blur(12px);
    }
    #sm-navbar .mobile-menu.active { max-height: 100vh; }
    #sm-navbar .mobile-menu-content { padding: 20px 16px; display: flex; flex-direction: column; gap: 0; }
    #sm-navbar .mobile-menu-item {
      padding: 12px 0; border-bottom: 1px solid rgba(212,160,23,0.08);
      color: rgba(253,245,230,0.65); font-family: 'Tiro Devanagari Sanskrit',serif;
      font-size: 0.95rem; cursor: pointer; transition: color 0.2s ease; display: block; text-decoration: none;
    }
    #sm-navbar .mobile-menu-item:hover { color: var(--gold-light); padding-left: 8px; }
    #sm-navbar .mobile-menu-item.label {
      font-family: 'Cinzel',serif; font-size: 0.68rem; letter-spacing: 3px;
      color: var(--saffron); text-transform: uppercase; margin-top: 12px; cursor: default;
    }
    #sm-navbar .mobile-menu-item.label:hover { color: var(--saffron); padding-left: 0; }
    #sm-navbar .mobile-menu-divider { height: 1px; background: rgba(212,160,23,0.1); margin: 12px 0; }
    #sm-navbar .mobile-auth-section { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(212,160,23,0.15); }
    #sm-navbar .mobile-auth-section .auth-btn { width: 100%; text-align: center; }

    @media (max-width: 1000px) {
      #sm-navbar .nav-search { width: 120px; font-size: 0.65rem; }
      #sm-navbar .nav-links a, #sm-navbar .nav-dropdown-btn { padding: 0 10px; font-size: 0.65rem; }
    }
    @media (max-width: 800px) {
      #sm-navbar .nav-center { display: none; }
      #sm-navbar .hamburger  { display: flex; }
      #sm-navbar .nav-search { display: none; }
      #sm-navbar .logo { font-size: 1.15rem; }
      
      /* Hide auth buttons from top-right on mobile */
      #sm-navbar .nav-right .auth-btn { display: none; }
      
      /* Show user chip normally, but hide if we add hamburger mode later */
      #sm-navbar .user-chip { display: flex; }
    }
    @media (max-width: 480px) {
      #sm-navbar { height: 56px; }
      #sm-navbar .mobile-menu { top: 56px; }
      #sm-navbar .logo { font-size: 1rem; gap: 4px; }
      #sm-navbar .logo::before { font-size: 1.2rem; }
      #sm-navbar .avatar { width: 28px; height: 28px; font-size: 0.7rem; }
      #sm-navbar .user-name { max-width: 80px; font-size: 0.6rem; }
      #sm-navbar .auth-btn { padding: 5px 10px; font-size: 0.58rem; }
    }
  `;

  /* ─── INITIALIZE ─── */
  function init() {
    // Inject styles
    if (!document.getElementById('sm-nav-styles')) {
      const style = document.createElement('style');
      style.id = 'sm-nav-styles';
      style.textContent = NAV_STYLES;
      document.head.appendChild(style);
    }

    // Inject navbar HTML at the very top of body
    if (!document.getElementById('sm-navbar')) {
      const nav = document.createElement('div');
      nav.innerHTML = NAV_HTML;
      document.body.insertBefore(nav.firstElementChild, document.body.firstChild);
    }

    // Setup event listeners
    setupDropdowns();
    setupMobileMenu();
    setupAuth();
  }

  /* ─── DROPDOWNS ─── */
  function setupDropdowns() {
    const buttons = document.querySelectorAll('#sm-navbar .nav-dropdown-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const menuId = btn.getAttribute('data-menu');
        const menu = document.getElementById(menuId);
        
        // Close all other menus
        document.querySelectorAll('#sm-navbar .dropdown-content').forEach(m => {
          if (m !== menu) m.classList.remove('active');
        });
        document.querySelectorAll('#sm-navbar .nav-dropdown-btn').forEach(b => {
          if (b !== btn) b.classList.remove('active');
        });

        // Toggle current menu
        menu.classList.toggle('active');
        btn.classList.toggle('active');
      });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#sm-navbar .nav-dropdown')) {
        document.querySelectorAll('#sm-navbar .dropdown-content').forEach(m => m.classList.remove('active'));
        document.querySelectorAll('#sm-navbar .nav-dropdown-btn').forEach(b => b.classList.remove('active'));
      }
    });
  }

  /* ─── MOBILE MENU ─── */
  function setupMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuContent = document.getElementById('mobile-menu-content');

    // Build mobile menu - auth section will be added by renderNavAuth()
    mobileMenuContent.innerHTML = `
        <div id="mobile-auth-section"></div>
      <div class="mobile-menu-item label">✦ शिव स्तोत्र ✦</div>
      <a href="/shiva-mantras" class="mobile-menu-item">शिव मंत्र</a>
      <a href="/shiva-mantras/Shiva-mahamrityunjaya-mantra/" class="mobile-menu-item">महामृत्युंजय मंत्र</a>
      <div class="mobile-menu-divider"></div>
      <div class="mobile-menu-item label">✦ शक्ति ✦</div>
      <a href="/durga-mantras/" class="mobile-menu-item">माँ दुर्गा मंत्र</a>
      <a href="/maha-kali-mantra/" class="mobile-menu-item">माँ काली मंत्र</a>
      <div class="mobile-menu-divider"></div>
      <div class="mobile-menu-item label">✦ विष्णु ✦</div>
      <a href="/bhagvan-vishnu-mantra/" class="mobile-menu-item">विष्णु मंत्र</a>
      <a href="/Krishna-Mahamantras/" class="mobile-menu-item">कृष्ण महामंत्र</a>
      <div class="mobile-menu-divider"></div>
      <div class="mobile-menu-item label">✦ राम-हनुमान ✦</div>
      <a href="/Shri-ram-mantra/" class="mobile-menu-item">राम मंत्र</a>
      <a href="/hanumanji/" class="mobile-menu-item">हनुमान मंत्र</a>
      <div class="mobile-menu-divider"></div>
      <div class="mobile-menu-item label">✦ मैथिली ✦</div>
      <a href="/Vidyapati-Geet-Sangrah/" class="mobile-menu-item">विद्यापति गीत संग्रह</a>
      <div class="mobile-menu-divider"></div>
     `;

    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#sm-navbar')) {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
      }
    });
  }

  /* ─── AUTH INTEGRATION ─── */
  function setupAuth() {
    // Wait for SmAuth to be available
    function trySetupAuth() {
      if (window.SmAuth) {
        window.SmAuth.init({
          apiBase: 'https://shivamargbackend.onrender.com',
          noWidget: true
        });
        renderNavAuth();
        document.addEventListener('sm-auth-changed', renderNavAuth);
      } else {
        setTimeout(trySetupAuth, 100);
      }
    }
    trySetupAuth();
  }

  function renderNavAuth() {
    const widget = document.getElementById('nav-auth-widget');
    const mobileAuth = document.getElementById('mobile-auth-section');
    const user = window.SmAuth?.getUser?.();

    if (!widget) return;

    if (user) {
      const avatarChar = (user.avatar && user.avatar.length === 1) ? user.avatar : user.username[0];
      const avatarBg = window.SmAuth.getAvatarBg(avatarChar);

      // Desktop: Show user chip in top-right
      widget.innerHTML = `
        <div class="user-chip" id="user-chip" onclick="event.stopPropagation();document.getElementById('user-menu').classList.toggle('active')">
          <div class="avatar" style="background:${avatarBg}">${avatarChar.toUpperCase()}</div>
          <span class="user-name">${user.username}</span>
          <div class="user-menu" id="user-menu">
            <a href="/profile.html">👤 प्रोफाइल</a>
            <a href="/settings.html">⚙️ सेटिंग्स</a>
            <a href="/favorites.html">❤️ पसंद</a>
            <button class="logout-btn" onclick="event.stopPropagation();window.SmAuth.logout()">🚪 लॉगआउट</button>
          </div>
        </div>`;

      // Mobile: Show options in hamburger menu
      if (mobileAuth) {
        mobileAuth.innerHTML = `
          <div class="mobile-menu-divider"></div>
          <div class="mobile-menu-item label">✦ खाता ✦</div>
          <a href="/profile.html" class="mobile-menu-item">👤 ${user.username}</a>
          <a href="/profile.html" class="mobile-menu-item">👤 प्रोफाइल</a>
          <a href="/settings.html" class="mobile-menu-item">⚙️ सेटिंग्स</a>
          <a href="/favorites.html" class="mobile-menu-item">❤️ पसंद</a>
          <button class="mobile-menu-item logout-btn" onclick="window.SmAuth.logout()" style="color: #FF6B6B; padding: 12px 0; border: none; background: none; text-align: left; cursor: pointer; font-family: 'Tiro Devanagari Sanskrit', serif; font-size: 0.95rem; width: 100%;">🚪 लॉगआउट</button>`;
      }
    } else {
      // Not logged in: Show login/register buttons
      widget.innerHTML = `
        <button class="auth-btn" onclick="window.SmAuth._switchTab('register');window.SmAuth._openModal()">खाता बनाएँ</button>
        <button class="auth-btn primary" onclick="window.SmAuth._switchTab('login');window.SmAuth._openModal()">लॉगिन</button>`;

      // Mobile: Show in hamburger menu instead
      if (mobileAuth) {
        mobileAuth.innerHTML = `
          <div class="mobile-menu-divider"></div>
          <div class="mobile-menu-item label">✦ खाता ✦</div>
          <button class="mobile-menu-item" onclick="window.SmAuth._switchTab('register');window.SmAuth._openModal()" style="color: #FDF5E6; padding: 12px 0; border: none; background: none; text-align: left; cursor: pointer; font-family: 'Tiro Devanagari Sanskrit', serif; font-size: 0.95rem; width: 100%;">👤 खाता बनाएँ</button>
          <button class="mobile-menu-item" onclick="window.SmAuth._switchTab('login');window.SmAuth._openModal()" style="color: #F2C94C; padding: 12px 0; border: none; background: none; text-align: left; cursor: pointer; font-family: 'Tiro Devanagari Sanskrit', serif; font-size: 0.95rem; width: 100%;">🔐 लॉगिन करें</button>`;
      }
    }

    // Close user menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#user-chip')) {
        document.getElementById('user-menu')?.classList.remove('active');
      }
    });
  }

  /* ─── START ─── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for manual use if needed
  window.SmNav = { init };
})();