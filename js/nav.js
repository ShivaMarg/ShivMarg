/**
 * ShivaMarg Navigation Module
 * Include this single file on all pages: <script src="/js/nav.js"></script>
 */

(function () {
  'use strict';

  if (!document.querySelector('script[src="/js/pwa.js"]')) {
    const pwaScript = document.createElement('script');
    pwaScript.src = '/js/pwa.js';
    pwaScript.defer = true;
    document.head.appendChild(pwaScript);
  }

  const NAV_HTML = `
<nav id="sm-navbar">
  <div class="nav-container">
    <!-- LOGO -->
    <a href="/" class="logo">
      <img src="https://shivmarg.live/images/shivmarg_logo.png" alt="ShivMarg Logo" class="logo-img" onerror="this.style.display='none'">
      Shiv<em>Marg</em>
    </a>

    <!-- HAMBURGER (Mobile) -->
    <button class="hamburger" id="hamburger" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>

    <!-- CENTER MENU (Desktop) -->
    <div class="nav-center">
      <div class="nav-links">
        <div class="nav-dropdown">
          
          <button class="nav-dropdown-btn" data-menu="shiv-menu">
          <img src="/images/shiva.png" alt="ShivMarg Logo" class="logo-img" onerror="this.style.display='none'">
          शिव स्तोत्र</button>
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
          <button class="nav-dropdown-btn" data-menu="shakti-menu">
          <img src="/images/durga.png" alt="Shakti Logo" class="logo-img" onerror="this.style.display='none'">
          शक्ति</button>
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
          <button class="nav-dropdown-btn" data-menu="vishnu-menu">
          <img src="/images/vishnu.png" alt="Vishnu Logo" class="logo-img" onerror="this.style.display='none'">
          विष्णु</button>
          <div class="dropdown-content" id="vishnu-menu">
            <div class="dropdown-label">✦ भगवान विष्णु ✦</div>
            <a href="/bhagvan-vishnu-mantra/">विष्णु मंत्र</a>
            <a href="#">विष्णु सहस्रनाम</a>
          </div>
        </div>

        <div class="nav-dropdown">
          <button class="nav-dropdown-btn" data-menu="ram-menu">
          <img src="/images/hanuman.png" alt="Ram Logo" class="logo-img" onerror="this.style.display='none'">
          राम-हनुमान</button>
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
          <button class="nav-dropdown-btn" data-menu="krishna-menu">
          <img src="/images/krishna.png" alt="Krishna Logo" class="logo-img" onerror="this.style.display='none'">
          कृष्ण</button>
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
          <button class="nav-dropdown-btn" data-menu="articles-menu">
          <img src="/images/writing.png" alt="Articles Logo" class="logo-img" onerror="this.style.display='none'">
          आलेख</button>
          <div class="dropdown-content" id="articles-menu">
            <div class="dropdown-label">✦ लेख ✦</div>
            <a href="/aalekh">आलेख</a>
            <a href="/article_editor">नया लेख लिखें</a>
            <a href="/become_author/">लेख संपादित करें</a>
          </div>
        </div>

      </div>
    </div>

    <!-- RIGHT: Search + Auth -->
    <div class="nav-right">
      <input class="nav-search" type="text" placeholder="खोजें...">
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
      --nav-bg:         #1A0000;
      --nav-border:     #4A0A0A;
      --nav-surface:    #210000;
      --nav-surface2:   #2E0303;
      --saffron:        #E85D04;
      --saffron-light:  #F48C42;
      --gold:           #C9931A;
      --gold-light:     #E8B84B;
      --cream:          #FDF0DC;
      --cream-muted:    rgba(253,240,220,0.55);
      --cream-dim:      rgba(253,240,220,0.30);
      --accent-border:  rgba(201,147,26,0.25);
    }

    #sm-navbar {
      position: sticky; top: 0; z-index: 200;
      background: var(--nav-bg);
      border-bottom: 2px solid var(--nav-border);
      display: flex; align-items: center; justify-content: space-between;
      height: 64px;
    }

    #sm-navbar .nav-container {
      display: flex; align-items: center; justify-content: space-between;
      width: 100%; padding: 0 24px; gap: 20px;
    }

    /* ── LOGO ── */
    #sm-navbar .logo {
      font-family: 'Cinzel Decorative', serif; font-size: 1.3rem;
      color: var(--gold); text-decoration: none; letter-spacing: 1.5px;
      flex-shrink: 0; display: flex; align-items: center; gap: 10px;
      transition: color 0.2s ease;
    }
    #sm-navbar .logo-img {
      height: 25px; width: auto; object-fit: contain;
      display: block; flex-shrink: 0;
    }
    #sm-navbar .logo em { color: var(--saffron); font-style: normal; }
    #sm-navbar .logo:hover { color: var(--gold-light); }

    /* ── NAV CENTER ── */
    #sm-navbar .nav-center { display: flex; align-items: center; flex: 1; max-width: 820px; }
    #sm-navbar .nav-links  { display: flex; gap: 0; }

    #sm-navbar .nav-dropdown-btn {
      color: var(--cream-muted);
      font-family: 'Cinzel', serif; font-size: 0.71rem; letter-spacing: 1.8px;
      text-transform: uppercase; padding: 0 13px; height: 64px;
      display: flex; align-items: center;
      border: none; border-bottom: 2px solid transparent;
      background: none; cursor: pointer; white-space: nowrap;
      transition: color 0.2s ease, border-bottom-color 0.2s ease, background 0.2s ease;
    }
    #sm-navbar .nav-dropdown-btn:hover {
      color: var(--gold-light);
      border-bottom-color: var(--saffron);
      background: var(--nav-surface);
    }
    #sm-navbar .nav-dropdown-btn::after {
      content: '▾'; font-size: 0.55rem; margin-left: 5px;
      transition: transform 0.3s ease; color: var(--gold);
    }
    #sm-navbar .nav-dropdown-btn.active { color: var(--gold-light); border-bottom-color: var(--saffron); }
    #sm-navbar .nav-dropdown-btn.active::after { transform: rotate(180deg); }

    /* ── DROPDOWN ── */
    #sm-navbar .nav-dropdown { position: relative; display: inline-block; }
    #sm-navbar .dropdown-content {
      position: absolute; top: 64px; left: 0;
      background: var(--nav-surface);
      border: 1px solid var(--nav-border);
      border-top: 2px solid var(--saffron);
      min-width: 300px;
      max-height: 100; overflow: hidden;
      transition: max-height 0.38s ease, opacity 0.38s ease;
      opacity: 0; z-index: 1000;
    }
    #sm-navbar .dropdown-content.active { max-height: 600px; opacity: 1; }

    #sm-navbar .dropdown-content a {
      display: block; padding: 11px 20px;
      color: var(--cream-muted); text-decoration: none;
      font-family: 'Tiro Devanagari Sanskrit', serif; font-size: 0.93rem;
      border-bottom: 1px solid rgba(74,10,10,0.5);
      transition: background 0.15s ease, color 0.15s ease, padding-left 0.15s ease;
    }
    #sm-navbar .dropdown-content a:last-child { border-bottom: none; }
    #sm-navbar .dropdown-content a:hover {
      background: var(--nav-surface2);
      color: var(--gold-light);
      padding-left: 26px;
    }
    #sm-navbar .nav-btn-icon {
      height: 22px;
      width: auto;
      object-fit: contain;
      vertical-align: middle;
      margin-right: 5px;
      border-radius: 50%;   /* optional: makes it circular */
    }
    #sm-navbar .dropdown-divider {
      height: 1px;
      background: var(--nav-border);
      margin: 4px 0;
    }
    #sm-navbar .dropdown-label {
      padding: 9px 20px;
      font-family: 'Cinzel', serif; font-size: 0.6rem;
      letter-spacing: 3.5px; color: var(--saffron);
      text-transform: uppercase; font-weight: 600;
    }

    /* ── NAV RIGHT ── */
    #sm-navbar .nav-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }

    #sm-navbar .nav-search {
      background: var(--nav-surface);
      border: 1px solid var(--nav-border);
      color: var(--cream); padding: 7px 13px;
      font-family: 'Cinzel', serif; font-size: 0.68rem; letter-spacing: 1px;
      outline: none; border-radius: 2px; width: 155px;
      transition: border-color 0.2s ease, background 0.2s ease;
    }
    #sm-navbar .nav-search::placeholder { color: var(--cream-dim); }
    #sm-navbar .nav-search:focus {
      border-color: var(--gold);
      background: var(--nav-surface2);
    }

    /* ── AUTH BUTTONS ── */
    #sm-navbar .auth-btn {
      font-family: 'Cinzel', serif; font-size: 0.66rem;
      letter-spacing: 1.8px; text-transform: uppercase;
      padding: 7px 15px;
      border: 1px solid var(--nav-border);
      color: var(--cream-muted); background: transparent;
      cursor: pointer; border-radius: 2px; white-space: nowrap;
      transition: all 0.2s ease;
    }
    #sm-navbar .auth-btn:hover {
      border-color: var(--gold);
      color: var(--gold-light);
      background: var(--nav-surface);
    }
    #sm-navbar .auth-btn.primary {
      background: var(--saffron);
      border-color: var(--saffron);
      color: #fff;
    }
    #sm-navbar .auth-btn.primary:hover {
      background: var(--saffron-light);
      border-color: var(--saffron-light);
    }

    /* ── USER CHIP ── */
    #sm-navbar .user-chip {
      display: flex; align-items: center; gap: 9px;
      background: var(--nav-surface);
      border: 1px solid var(--nav-border);
      padding: 5px 12px; border-radius: 20px;
      cursor: pointer; transition: all 0.2s ease; position: relative;
    }
    #sm-navbar .user-chip:hover { background: var(--nav-surface2); border-color: var(--gold); }

    #sm-navbar .avatar {
      width: 30px; height: 30px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-family: 'Cinzel', serif; font-size: 0.78rem; color: #fff; font-weight: 700;
    }
    #sm-navbar .user-name {
      font-family: 'Cinzel', serif; font-size: 0.66rem; letter-spacing: 1px;
      color: var(--gold-light); max-width: 120px;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }

    /* ── USER DROPDOWN ── */
    #sm-navbar .user-menu {
      position: absolute; top: calc(100% + 8px); right: 0;
      background: var(--nav-surface);
      border: 1px solid var(--nav-border);
      border-top: 2px solid var(--saffron);
      border-radius: 2px; min-width: 175px;
      max-height: 0; overflow: hidden;
      transition: max-height 0.3s ease, opacity 0.3s ease;
      opacity: 0; z-index: 1001;
    }
    #sm-navbar .user-menu.active { max-height: 250px; opacity: 1; }
    #sm-navbar .user-menu a, #sm-navbar .user-menu button {
      display: block; width: 100%; padding: 11px 16px;
      color: var(--cream-muted); text-decoration: none;
      font-family: 'Cinzel', serif; font-size: 0.66rem; letter-spacing: 1px;
      border: none; background: none; text-align: left; cursor: pointer;
      border-bottom: 1px solid rgba(74,10,10,0.5);
      transition: all 0.15s ease;
    }
    #sm-navbar .user-menu a:last-child, #sm-navbar .user-menu button:last-child { border-bottom: none; }
    #sm-navbar .user-menu a:hover, #sm-navbar .user-menu button:hover {
      background: var(--nav-surface2); color: var(--gold-light); padding-left: 20px;
    }
    #sm-navbar .logout-btn { color: #FF6B6B !important; }
    #sm-navbar .logout-btn:hover { background: rgba(255,80,80,0.08) !important; }

    /* ── HAMBURGER ── */
    #sm-navbar .hamburger {
      display: none; flex-direction: column; gap: 5px;
      background: none; border: none; cursor: pointer; padding: 8px; z-index: 201;
    }
    #sm-navbar .hamburger span {
      width: 24px; height: 2px; background: var(--gold);
      border-radius: 2px; transition: all 0.3s ease;
    }
    #sm-navbar .hamburger.active span:nth-child(1) { transform: rotate(45deg) translate(8px,8px); }
    #sm-navbar .hamburger.active span:nth-child(2) { opacity: 0; }
    #sm-navbar .hamburger.active span:nth-child(3) { transform: rotate(-45deg) translate(7px,-7px); }

    /* ── MOBILE MENU ── */
    #sm-navbar .mobile-menu {
      position: fixed; top: 64px; left: 0; right: 0;
      background: var(--nav-bg);
      border-bottom: 1px solid var(--nav-border);
      max-height: 0; overflow-y: auto; overflow-x: hidden;
      transition: max-height 0.4s ease; z-index: 199;
    }
    #sm-navbar .mobile-menu.active { max-height: 100vh; }
    #sm-navbar .mobile-menu-content {
      padding: 20px 16px; display: flex; flex-direction: column; gap: 0;
    }
    #sm-navbar .mobile-menu-item {
      padding: 12px 0; border-bottom: 1px solid rgba(74,10,10,0.4);
      color: var(--cream-muted); font-family: 'Tiro Devanagari Sanskrit', serif;
      font-size: 0.93rem; cursor: pointer;
      transition: color 0.15s ease, padding-left 0.15s ease;
      display: block; text-decoration: none;
    }
    #sm-navbar .mobile-menu-item:hover { color: var(--gold-light); padding-left: 8px; }
    #sm-navbar .mobile-menu-item.label {
      font-family: 'Cinzel', serif; font-size: 0.65rem; letter-spacing: 3px;
      color: var(--saffron); text-transform: uppercase; margin-top: 12px; cursor: default;
    }
    #sm-navbar .mobile-menu-item.label:hover { color: var(--saffron); padding-left: 0; }
    #sm-navbar .mobile-menu-divider { height: 1px; background: var(--nav-border); margin: 10px 0; }
    #sm-navbar .mobile-auth-section {
      display: flex; flex-direction: column; gap: 10px;
      margin-top: 20px; padding-top: 20px;
      border-top: 1px solid var(--nav-border);
    }
    #sm-navbar .mobile-auth-section .auth-btn { width: 100%; text-align: center; }

    /* ── RESPONSIVE ── */
    @media (max-width: 1050px) {
      #sm-navbar .nav-search { width: 115px; }
      #sm-navbar .nav-dropdown-btn { padding: 0 30px; font-size: 0.65rem; }
    }
    @media (max-width: 800px) {
      #sm-navbar .nav-center { display: none; }
      #sm-navbar .hamburger  { display: flex; margin-left: auto; }
      #sm-navbar .nav-search { display: none; }
      #sm-navbar .logo { font-size: 1.1rem; }
      #sm-navbar .nav-right .auth-btn { display: none; }
      #sm-navbar .user-chip { display: none; }
    }
    @media (max-width: 480px) {
      #sm-navbar { height: 56px; }
      #sm-navbar .mobile-menu { top: 56px; }
      #sm-navbar .logo { font-size: 0.95rem; gap: 7px; }
      #sm-navbar .logo-img { height: 30px; }
    }

  `;

  /* ─── INITIALIZE ─── */
  function init() {
    if (!document.getElementById('sm-nav-styles')) {
      const style = document.createElement('style');
      style.id = 'sm-nav-styles';
      style.textContent = NAV_STYLES;
      document.head.appendChild(style);
    }

    if (!document.getElementById('sm-navbar')) {
      const nav = document.createElement('div');
      nav.innerHTML = NAV_HTML;
      document.body.insertBefore(nav.firstElementChild, document.body.firstChild);
    }

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

        document.querySelectorAll('#sm-navbar .dropdown-content').forEach(m => {
          if (m !== menu) m.classList.remove('active');
        });
        document.querySelectorAll('#sm-navbar .nav-dropdown-btn').forEach(b => {
          if (b !== btn) b.classList.remove('active');
        });

        menu.classList.toggle('active');
        btn.classList.toggle('active');
      });
    });

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

    mobileMenuContent.innerHTML =
    `<div class="mobile-menu-divider"></div>
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
      <div class="mobile-menu-item label">✦ लेख प्रबंधन ✦</div>
      <a href="/articles" class="mobile-menu-item">सभी लेख</a>
      <a href="/article_editor" class="mobile-menu-item">नया लेख लिखें</a>
      <a href="/article_editor?edit=true" class="mobile-menu-item">मेरे लेख</a>`;

    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#sm-navbar')) {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
      }
    });
  }

  /* ─── AUTH INTEGRATION ─── */
function setupAuth() {
  function trySetupAuth() {
    if (window.SmAuth) {

      window.SmAuth.init({
        apiBase: 'https://www.api.shivmarg.live',
        noWidget: true
      });

      // Track page view
      const pageId =
        new URLSearchParams(window.location.search).get('slug') ||
        window.location.pathname ||
        'home';

      window.SmAuth.trackActivity({
        page_id: pageId,
        event_type: 'page_view',
        meta: {
          page_url: window.location.href,
          page_title: document.title,
          referrer: document.referrer
        }
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
      const isImageUrl = user.avatar && user.avatar.startsWith('http');

      let avatarHtml = '';
      if (isImageUrl) {
        avatarHtml = `<div class="avatar" style="overflow:hidden;padding:0"><img src="${user.avatar}" alt="${user.username}" style="width:100%;height:100%;object-fit:cover;border-radius:50%" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div style="width:100%;height:100%;display:none;align-items:center;justify-content:center;background:${avatarBg};font-family:'Cinzel',serif;font-size:0.78rem;color:#fff;font-weight:700">${avatarChar.toUpperCase()}</div></div>`;
      } else {
        avatarHtml = `<div class="avatar" style="background:${avatarBg}">${avatarChar.toUpperCase()}</div>`;
      }

      widget.innerHTML = `
        <div class="user-chip" id="user-chip" onclick="event.stopPropagation();document.getElementById('user-menu').classList.toggle('active')">
          ${avatarHtml}
          <span class="user-name">${user.username}</span>
          <div class="user-menu" id="user-menu">
            <a href="/profile/${user.username}">👤 प्रोफाइल</a>
            <a href="/user/${user.username}/myactivity">⚙️ सेटिंग्स</a>
            <a href="/favorites.html">❤️ पसंद</a>
            <button class="logout-btn" onclick="event.stopPropagation();window.SmAuth.logout()">🚪 लॉगआउट</button>
          </div>
        </div>`;

      if (mobileAuth) {
        mobileAuth.innerHTML = `
          <div class="mobile-menu-divider"></div>
          <div class="mobile-menu-item label">✦ खाता ✦</div>
          <div class="mobile-menu-item" style="color:#E8B84B;font-weight:bold;padding:8px 0;">👤 ${user.username}</div>
          <a href="/profile/${user.username}" class="mobile-menu-item">👤 प्रोफाइल</a>
          <a href="/user/${user.username}/myactivity" class="mobile-menu-item">⚙️ सेटिंग्स</a>
          <a href="/favorites.html" class="mobile-menu-item">❤️ पसंद</a>
          <button class="mobile-menu-item logout-btn" onclick="window.SmAuth.logout()" style="color:#FF6B6B;padding:12px 0;border:none;background:none;text-align:left;cursor:pointer;font-family:'Tiro Devanagari Sanskrit',serif;font-size:0.93rem;width:100%;">🚪 लॉगआउट</button>`;
      }
    } else {
      widget.innerHTML = `
        
        <button class="auth-btn primary"
        onclick="window.SmAuth._switchTab('login');window.SmAuth._openModal()">
        <img src="/images/user-interface.png" alt="Login Icon" class="nav-btn-icon" onerror="this.style.display='none'">
        </button>`;

      if (mobileAuth) {
        mobileAuth.innerHTML = `
          <div class="mobile-menu-divider"></div>
          <div class="mobile-menu-item label">✦ खाता ✦</div>
          <button class="mobile-menu-item" onclick="window.SmAuth._switchTab('register');window.SmAuth._openModal()" style="color:#FDF0DC;padding:12px 0;border:none;background:none;text-align:left;cursor:pointer;font-family:'Tiro Devanagari Sanskrit',serif;font-size:0.93rem;width:100%;">👤 खाता बनाएँ</button>
          <button class="mobile-menu-item" onclick="window.SmAuth._switchTab('login');window.SmAuth._openModal()" style="color:#E8B84B;padding:12px 0;border:none;background:none;text-align:left;cursor:pointer;font-family:'Tiro Devanagari Sanskrit',serif;font-size:0.93rem;width:100%;">🔐 लॉगिन करें</button>`;
      }
    }

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

  window.SmNav = { init };
})();
