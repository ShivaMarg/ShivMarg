/**
 * ShivMarg Navigation Module — v2.0
 * New theme: Deep Indigo + Terracotta + Brass Gold
 * Include on all pages: <script src="/js/nav.js" defer></script>
 */

(function () {
  'use strict';

  /* ── PWA loader ── */
  if (!document.querySelector('script[src="/js/pwa.js"]')) {
    const s = document.createElement('script');
    s.src = '/js/pwa.js'; s.defer = true;
    document.head.appendChild(s);
  }

  /* ── Google Fonts (Yatra One for Hindi display, Tiro for body, Cinzel for labels) ── */
  if (!document.querySelector('link[data-sm-fonts]')) {
    const lnk = document.createElement('link');
    lnk.rel = 'stylesheet';
    lnk.setAttribute('data-sm-fonts', '1');
    lnk.href = 'https://fonts.googleapis.com/css2?family=Yatra+One&family=Tiro+Devanagari+Sanskrit:ital@0;1&family=Cinzel:wght@500;700&display=swap';
    document.head.appendChild(lnk);
  }

  /* ─────────────────────────────────────────────
     NAV HTML
  ───────────────────────────────────────────── */
  const NAV_HTML = `
<nav id="sm-navbar" role="navigation" aria-label="मुख्य नेविगेशन">
  <div class="nav-container">

    <!-- LOGO -->
    <a href="/" class="sm-logo" aria-label="ShivMarg होमपेज">
      <span class="logo-dot" aria-hidden="true"></span>
      Shiv<em>Marg</em>
    </a>

    <!-- DESKTOP CENTER LINKS -->
    <div class="nav-center" role="menubar">
      <div class="nav-links">

        <div class="nav-dropdown">
          <button class="nav-btn" data-menu="d-shiv" aria-haspopup="true" aria-expanded="false" type="button">
            <span class="btn-icon" aria-hidden="true">🕉</span> शिव स्तोत्र
          </button>
          <div class="dropdown-panel" id="d-shiv" role="menu">
            <div class="dp-label">✦ मंत्र ✦</div>
            <a href="/shiva-mantras" role="menuitem">शिव मंत्र</a>
            <a href="/shiva-mantras/Shiva-mahamrityunjaya-mantra/" role="menuitem">महामृत्युंजय मंत्र</a>
            <a href="#" role="menuitem">निर्वाणपटकम्</a>
            <div class="dp-divider"></div>
            <div class="dp-label">✦ आरती ✦</div>
            <a href="#" role="menuitem">शिव आरती</a>
            <a href="#" role="menuitem">महा आरती</a>
          </div>
        </div>

        <div class="nav-dropdown">
          <button class="nav-btn" data-menu="d-shakti" type="button" aria-haspopup="true" aria-expanded="false">
            <span class="btn-icon" aria-hidden="true">🌺</span> शक्ति
          </button>
          <div class="dropdown-panel" id="d-shakti" role="menu">
            <div class="dp-label">✦ माता दुर्गा ✦</div>
            <a href="/durga-mantras/" role="menuitem">माँ दुर्गा मंत्र</a>
            <a href="#" role="menuitem">अष्टोत्तर शतनाम</a>
            <div class="dp-divider"></div>
            <div class="dp-label">✦ देवी काली ✦</div>
            <a href="/maha-kali-mantra/" role="menuitem">माँ काली मंत्र</a>
            <a href="#" role="menuitem">कालिका स्तोत्र</a>
          </div>
        </div>

        <div class="nav-dropdown">
          <button class="nav-btn" data-menu="d-vishnu" type="button" aria-haspopup="true" aria-expanded="false">
            <span class="btn-icon" aria-hidden="true">🪷</span> विष्णु
          </button>
          <div class="dropdown-panel" id="d-vishnu" role="menu">
            <div class="dp-label">✦ भगवान विष्णु ✦</div>
            <a href="/bhagvan-vishnu-mantra/" role="menuitem">विष्णु मंत्र</a>
            <a href="#" role="menuitem">विष्णु सहस्रनाम</a>
          </div>
        </div>

        <div class="nav-dropdown">
          <button class="nav-btn" data-menu="d-ram" type="button" aria-haspopup="true" aria-expanded="false">
            <span class="btn-icon" aria-hidden="true">🏹</span> राम-हनुमान
          </button>
          <div class="dropdown-panel" id="d-ram" role="menu">
            <div class="dp-label">✦ श्री राम ✦</div>
            <a href="/Shri-ram-mantra/" role="menuitem">राम मंत्र</a>
            <a href="#" role="menuitem">राम रक्षा स्तोत्र</a>
            <div class="dp-divider"></div>
            <div class="dp-label">✦ हनुमान जी ✦</div>
            <a href="/hanumanji/" role="menuitem">हनुमान मंत्र</a>
            <a href="#" role="menuitem">हनुमान चालीसा</a>
          </div>
        </div>

        <div class="nav-dropdown">
          <button class="nav-btn" data-menu="d-krishna" type="button" aria-haspopup="true" aria-expanded="false">
            <span class="btn-icon" aria-hidden="true">🦚</span> कृष्ण
          </button>
          <div class="dropdown-panel" id="d-krishna" role="menu">
            <div class="dp-label">✦ श्री कृष्ण ✦</div>
            <a href="/Krishna-Mahamantras/" role="menuitem">कृष्ण महामंत्र</a>
            <a href="#" role="menuitem">कृष्ण भजन</a>
            <div class="dp-divider"></div>
            <div class="dp-label">✦ मैथिली गीत ✦</div>
            <a href="/Vidyapati-Geet-Sangrah/" role="menuitem">विद्यापति गीत संग्रह</a>
          </div>
        </div>

        <div class="nav-dropdown">
          <button class="nav-btn" data-menu="d-articles" type="button" aria-haspopup="true" aria-expanded="false">
            <span class="btn-icon" aria-hidden="true">✍️</span> आलेख
          </button>
          <div class="dropdown-panel" id="d-articles" role="menu">
            <div class="dp-label">✦ लेख ✦</div>
            <a href="/aalekh" role="menuitem">आलेख</a>
            <a href="/article_editor" role="menuitem">नया लेख लिखें</a>
            <a href="/become_author/" role="menuitem">लेख संपादित करें</a>
          </div>
        </div>

      </div>
    </div>

    <!-- RIGHT: Search + Auth -->
    <div class="nav-right">
      <div class="search-wrap">
        <input class="nav-search" type="search" placeholder="खोजें…" aria-label="खोजें">
        <span class="search-icon" aria-hidden="true">⌕</span>
      </div>
      <div id="nav-auth-widget"></div>
    </div>

    <!-- HAMBURGER (Mobile) -->
    <button class="hamburger" id="sm-hamburger" aria-label="मेनू खोलें" aria-expanded="false" aria-controls="sm-mobile-drawer" type="button">
      <span></span><span></span><span></span>
    </button>

  </div>

  <!-- MOBILE DRAWER -->
  <div class="mobile-drawer" id="sm-mobile-drawer" role="dialog" aria-label="मोबाइल नेविगेशन" aria-hidden="true">
    <div class="drawer-inner">

      <!-- User strip -->
      <div class="drawer-user" id="sm-drawer-user">
        <!-- populated by JS -->
      </div>

      <!-- Mandala strip -->
      <div class="mandala-strip" aria-hidden="true"><span>✦ ॐ ✦</span></div>

      <!-- Nav sections -->
      <div class="drawer-sections" id="sm-drawer-sections">
        <!-- populated by JS -->
      </div>

      <!-- Bottom actions -->
      <div class="drawer-actions" id="sm-drawer-actions">
        <!-- populated by JS -->
      </div>

    </div>
  </div>
</nav>`;

  /* ─────────────────────────────────────────────
     STYLES
  ───────────────────────────────────────────── */
  const NAV_STYLES = `
/* ── Design tokens ── */
#sm-navbar {
  --ink:        #1C0F2E;
  --ink2:       #2B1A45;
  --terra:      #C04B0A;
  --terra-l:    #E06030;
  --terra-d:    #8C2E00;
  --brass:      #B8881A;
  --brass-l:    #D4A830;
  --brass-d:    #7A5A0A;
  --cream:      #F7F0E6;
  --cream2:     #EDE3D4;
  --muted:      rgba(28,15,46,0.55);
  --muted2:     rgba(28,15,46,0.30);
  --border:     rgba(184,136,26,0.22);
  --shadow:     rgba(28,15,46,0.18);
}

/* ── Base ── */
#sm-navbar * { box-sizing: border-box; }

#sm-navbar {
  position: sticky; top: 0; z-index: 200;
  background: var(--ink);
  height: 64px;
  display: flex; align-items: center;
  border-bottom: 1px solid var(--border);
}
#sm-navbar::after {
  content: '';
  position: absolute; bottom: -3px; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, transparent, var(--terra), var(--brass), var(--terra), transparent);
  pointer-events: none;
}

/* ── Container ── */
#sm-navbar .nav-container {
  display: flex; align-items: center; width: 100%;
  padding: 0 24px; gap: 16px;
}

/* ── LOGO ── */
#sm-navbar .sm-logo {
  display: flex; align-items: center; gap: 9px;
  text-decoration: none;
  font-family: 'Cinzel', serif; font-size: 1.25rem; font-weight: 700;
  color: var(--brass-l); letter-spacing: 1px;
  flex-shrink: 0;
  transition: color 0.2s;
}
#sm-navbar .sm-logo em { color: var(--terra-l); font-style: normal; }
#sm-navbar .sm-logo:hover { color: #EABF50; }
#sm-navbar .logo-dot {
  width: 9px; height: 9px; border-radius: 50%;
  background: var(--terra);
  box-shadow: 0 0 0 2px rgba(192,75,10,0.25);
  flex-shrink: 0;
  transition: background 0.2s;
}
#sm-navbar .sm-logo:hover .logo-dot { background: var(--terra-l); }

/* ── NAV CENTER ── */
#sm-navbar .nav-center { flex: 1; display: flex; align-items: center; overflow: hidden; }
#sm-navbar .nav-links  { display: flex; align-items: center; }

/* ── NAV BUTTONS ── */
#sm-navbar .nav-btn {
  display: flex; align-items: center; gap: 6px;
  height: 64px; padding: 0 14px;
  font-family: 'Cinzel', serif; font-size: 0.68rem; letter-spacing: 1.5px;
  text-transform: uppercase; white-space: nowrap;
  color: rgba(212,168,48,0.7);
  background: none; border: none; border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: color 0.2s, border-bottom-color 0.2s, background 0.2s;
}
#sm-navbar .nav-btn .btn-icon { font-size: 0.85rem; }
#sm-navbar .nav-btn::after {
  content: '▾'; font-size: 0.5rem; margin-left: 4px;
  color: var(--brass); opacity: 0.6;
  transition: transform 0.28s ease;
}
#sm-navbar .nav-btn:hover,
#sm-navbar .nav-btn[aria-expanded="true"] {
  color: var(--brass-l);
  background: rgba(184,136,26,0.06);
  border-bottom-color: var(--terra);
}
#sm-navbar .nav-btn[aria-expanded="true"]::after { transform: rotate(180deg); }

/* ── DROPDOWN PANEL ── */
#sm-navbar .nav-dropdown { position: relative; }
#sm-navbar .dropdown-panel {
  position: absolute; top: 64px; left: 0;
  min-width: 240px;
  background: var(--ink2);
  border: 1px solid var(--border);
  border-top: 2px solid var(--terra);
  border-radius: 0 0 10px 10px;
  max-height: 0; overflow: hidden; opacity: 0;
  transition: max-height 0.35s ease, opacity 0.3s ease;
  z-index: 1000;
  box-shadow: 0 20px 40px rgba(28,15,46,0.5);
}
#sm-navbar .dropdown-panel.open { max-height: 520px; opacity: 1; }

#sm-navbar .dropdown-panel a {
  display: block; padding: 11px 20px;
  font-family: 'Tiro Devanagari Sanskrit', serif; font-size: 0.92rem;
  color: rgba(237,227,212,0.7); text-decoration: none;
  border-bottom: 1px solid rgba(184,136,26,0.1);
  transition: color 0.15s, padding-left 0.15s, background 0.15s;
}
#sm-navbar .dropdown-panel a:last-child { border-bottom: none; }
#sm-navbar .dropdown-panel a:hover {
  color: var(--brass-l);
  padding-left: 28px;
  background: rgba(184,136,26,0.06);
}
#sm-navbar .dp-label {
  padding: 10px 20px 6px;
  font-family: 'Cinzel', serif; font-size: 0.57rem; letter-spacing: 3px;
  color: var(--terra-l); text-transform: uppercase; font-weight: 700;
}
#sm-navbar .dp-divider {
  height: 1px; margin: 4px 0;
  background: rgba(184,136,26,0.15);
}

/* ── NAV RIGHT ── */
#sm-navbar .nav-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }

/* ── SEARCH ── */
#sm-navbar .search-wrap { position: relative; display: flex; align-items: center; }
#sm-navbar .nav-search {
  background: rgba(237,227,212,0.06);
  border: 1px solid var(--border);
  color: var(--cream);
  padding: 7px 12px 7px 32px;
  font-family: 'Cinzel', serif; font-size: 0.66rem; letter-spacing: 0.8px;
  border-radius: 20px; width: 160px; outline: none;
  transition: width 0.3s ease, border-color 0.2s, background 0.2s;
}
#sm-navbar .nav-search::placeholder { color: rgba(237,227,212,0.3); }
#sm-navbar .nav-search:focus {
  border-color: var(--brass);
  background: rgba(237,227,212,0.1);
  width: 200px;
}
#sm-navbar .search-icon {
  position: absolute; left: 11px;
  font-size: 1rem; color: rgba(184,136,26,0.5);
  pointer-events: none; line-height: 1;
}

/* ── AUTH BUTTONS (desktop) ── */
#sm-navbar .auth-btn {
  font-family: 'Cinzel', serif; font-size: 0.63rem; letter-spacing: 1.5px;
  text-transform: uppercase; padding: 7px 16px; white-space: nowrap;
  border-radius: 20px; border: 1px solid var(--border);
  color: rgba(212,168,48,0.8); background: transparent; cursor: pointer;
  transition: all 0.2s;
}
#sm-navbar .auth-btn:hover { border-color: var(--brass); color: var(--brass-l); background: rgba(184,136,26,0.08); }
#sm-navbar .auth-btn.primary {
  background: var(--terra); border-color: var(--terra); color: #fff;
  box-shadow: 0 2px 0 var(--terra-d);
}
#sm-navbar .auth-btn.primary:hover { background: var(--terra-l); border-color: var(--terra-l); }
#sm-navbar .auth-btn.primary:active { transform: translateY(2px); box-shadow: none; }

/* ── USER CHIP (desktop) ── */
#sm-navbar .user-chip {
  display: flex; align-items: center; gap: 10px;
  background: rgba(237,227,212,0.06);
  border: 1px solid var(--border);
  padding: 5px 14px 5px 6px; border-radius: 24px; cursor: pointer;
  position: relative; transition: all 0.2s;
}
#sm-navbar .user-chip:hover { background: rgba(237,227,212,0.1); border-color: var(--brass); }
#sm-navbar .avatar {
  width: 30px; height: 30px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Cinzel', serif; font-size: 0.72rem; font-weight: 700; color: #fff;
  background: linear-gradient(135deg, var(--terra), var(--brass));
  flex-shrink: 0;
}
#sm-navbar .user-name {
  font-family: 'Cinzel', serif; font-size: 0.65rem; letter-spacing: 0.8px;
  color: var(--brass-l); max-width: 120px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

/* ── USER DROPDOWN ── */
#sm-navbar .user-menu {
  position: absolute; top: calc(100% + 10px); right: 0;
  background: var(--ink2);
  border: 1px solid var(--border);
  border-top: 2px solid var(--terra);
  border-radius: 0 0 10px 10px; min-width: 180px;
  max-height: 0; overflow: hidden; opacity: 0;
  transition: max-height 0.3s ease, opacity 0.28s ease;
  box-shadow: 0 20px 40px rgba(28,15,46,0.5);
  z-index: 1001;
}
#sm-navbar .user-menu.open { max-height: 260px; opacity: 1; }
#sm-navbar .user-menu a,
#sm-navbar .user-menu button {
  display: block; width: 100%; padding: 11px 18px;
  font-family: 'Cinzel', serif; font-size: 0.63rem; letter-spacing: 1px;
  color: rgba(237,227,212,0.7); text-decoration: none;
  border: none; background: none; text-align: left; cursor: pointer;
  border-bottom: 1px solid rgba(184,136,26,0.1);
  transition: all 0.15s;
}
#sm-navbar .user-menu a:last-child,
#sm-navbar .user-menu button:last-child { border-bottom: none; }
#sm-navbar .user-menu a:hover,
#sm-navbar .user-menu button:hover { background: rgba(184,136,26,0.07); color: var(--brass-l); padding-left: 22px; }
#sm-navbar .logout-btn { color: #E07070 !important; }
#sm-navbar .logout-btn:hover { background: rgba(224,112,112,0.07) !important; color: #FF8A8A !important; }

/* ── HAMBURGER ── */
#sm-navbar .hamburger {
  display: none; flex-direction: column; align-items: center; justify-content: center;
  gap: 5.5px; width: 40px; height: 40px; border-radius: 10px;
  background: rgba(184,136,26,0.1); border: 1px solid rgba(184,136,26,0.22);
  cursor: pointer; margin-left: auto;
  transition: background 0.2s, border-color 0.2s;
}
#sm-navbar .hamburger span {
  width: 18px; height: 1.5px; background: var(--brass-l);
  border-radius: 2px; transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
  transform-origin: center;
}
#sm-navbar .hamburger[aria-expanded="true"] { background: rgba(192,75,10,0.12); border-color: rgba(192,75,10,0.35); }
#sm-navbar .hamburger[aria-expanded="true"] span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
#sm-navbar .hamburger[aria-expanded="true"] span:nth-child(2) { opacity: 0; transform: scaleX(0); }
#sm-navbar .hamburger[aria-expanded="true"] span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

/* ─────────────────────────────────────────────
   MOBILE DRAWER — 3D perspective unfold
───────────────────────────────────────────── */
#sm-navbar .mobile-drawer {
  position: fixed; top: 64px; left: 0; right: 0;
  z-index: 198;
  pointer-events: none;
  /* 3D unfold: origin at top, rotates down */
  transform-origin: top center;
  transform: perspective(900px) rotateX(-10deg) scaleY(0.85);
  opacity: 0;
  transition:
    transform 0.38s cubic-bezier(0.4, 0, 0.2, 1),
    opacity   0.3s ease;
}
#sm-navbar .mobile-drawer.open {
  transform: perspective(900px) rotateX(0deg) scaleY(1);
  opacity: 1;
  pointer-events: auto;
}

#sm-navbar .drawer-inner {
  background: var(--cream);
  max-height: calc(100dvh - 64px);
  overflow-y: auto; overflow-x: hidden;
  border-radius: 0 0 20px 20px;
  box-shadow: 0 28px 60px rgba(28,15,46,0.28);
}

/* ── Drawer: user strip ── */
#sm-navbar .drawer-user {
  background: var(--ink);
  padding: 18px 20px;
  display: flex; align-items: center; gap: 14px;
}
#sm-navbar .du-avatar {
  width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, var(--terra), var(--brass));
  font-family: 'Tiro Devanagari Sanskrit', serif; font-size: 1rem; color: #fff;
  box-shadow: 0 3px 10px rgba(192,75,10,0.4);
}
#sm-navbar .du-info { display: flex; flex-direction: column; gap: 3px; }
#sm-navbar .du-name {
  font-family: 'Cinzel', serif; font-size: 0.72rem; letter-spacing: 0.8px;
  color: var(--brass-l);
}
#sm-navbar .du-sub {
  font-family: 'Tiro Devanagari Sanskrit', serif; font-size: 0.7rem;
  color: rgba(237,227,212,0.4);
}
#sm-navbar .du-action {
  margin-left: auto; padding: 7px 16px; border-radius: 20px;
  background: rgba(192,75,10,0.18); border: 1px solid rgba(192,75,10,0.4);
  font-family: 'Cinzel', serif; font-size: 0.6rem; letter-spacing: 1px;
  color: var(--terra-l); cursor: pointer; white-space: nowrap;
  text-transform: uppercase; text-decoration: none;
  transition: background 0.2s;
}
#sm-navbar .du-action:hover { background: rgba(192,75,10,0.28); }
#sm-navbar .du-action.secondary {
  background: rgba(184,136,26,0.12); border-color: rgba(184,136,26,0.35);
  color: var(--brass-l);
}

/* ── Mandala strip ── */
#sm-navbar .mandala-strip {
  display: flex; align-items: center; height: 28px;
  background: var(--cream2);
  border-top: 1px solid rgba(184,136,26,0.15);
  border-bottom: 1px solid rgba(184,136,26,0.15);
  padding: 0 20px;
}
#sm-navbar .mandala-strip::before,
#sm-navbar .mandala-strip::after {
  content: ''; flex: 1; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(184,136,26,0.45), transparent);
}
#sm-navbar .mandala-strip span {
  font-family: 'Tiro Devanagari Sanskrit', serif;
  font-size: 0.65rem; color: var(--brass); padding: 0 14px; letter-spacing: 3px;
}

/* ── Drawer: section label ── */
#sm-navbar .drawer-section-label {
  padding: 14px 20px 6px;
  display: flex; align-items: center; gap: 10px;
  font-family: 'Cinzel', serif; font-size: 0.58rem; letter-spacing: 3px;
  color: var(--terra); text-transform: uppercase; font-weight: 700;
}
#sm-navbar .drawer-section-label::after {
  content: ''; flex: 1; height: 1px;
  background: linear-gradient(90deg, rgba(192,75,10,0.3), transparent);
}

/* ── Drawer: menu item — 3D press card ── */
#sm-navbar .drawer-item {
  display: flex; align-items: center; gap: 14px;
  padding: 11px 20px 11px 20px;
  text-decoration: none; cursor: pointer;
  border-bottom: 1px solid rgba(28,15,46,0.07);
  transition: background 0.15s;
  position: relative;
}
#sm-navbar .drawer-item:hover { background: rgba(192,75,10,0.04); }
#sm-navbar .drawer-item:active { background: rgba(192,75,10,0.08); }

#sm-navbar .di-icon {
  width: 38px; height: 38px; border-radius: 10px;
  background: var(--cream2);
  border: 1px solid rgba(184,136,26,0.2);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.05rem; flex-shrink: 0;
  /* 3D pressed look */
  box-shadow: 0 3px 0 rgba(184,136,26,0.18), 0 1px 4px rgba(28
