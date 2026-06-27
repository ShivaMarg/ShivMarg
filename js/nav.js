/**
 * ShivMarg Navigation Module — v2.1
 * Theme: Deep Indigo + Terracotta + Brass Gold
 * Include on all pages: <script src="/js/nav.js" defer></script>
 *
 * CHANGELOG (v2.1):
 *  - Mobile drawer: categories now open a sliding sub-panel showing all
 *    sub-mantras (mirrors desktop dropdown content) instead of redirecting.
 *  - Mobile drawer: login/register buttons moved to the TOP user strip.
 *  - Real profile photo support (avatar_url / photo / profile_photo from
 *    backend) for both desktop chip and mobile drawer, with letter-avatar
 *    fallback.
 *  - Logged-in users now see quick-access chips (गतिविधि/प्रोफ़ाइल/पसंद/सेटिंग्स)
 *    directly in the mobile drawer.
 *  - Added: in-drawer search box, quick links footer (होम/संपर्क/गोपनीयता).
 */

(function () {
  'use strict';

  /* ── PWA loader ── */
  if (!document.querySelector('script[src="/js/pwa.js"]')) {
    const s = document.createElement('script');
    s.src = '/js/pwa.js'; s.defer = true;
    document.head.appendChild(s);
  }

  /* ── Google Fonts ── */
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

      <!-- User strip (login buttons live HERE for guests — top of drawer) -->
      <div class="drawer-user" id="sm-drawer-user">
        <!-- populated by JS -->
      </div>

      <!-- Logged-in quick chips -->
      <div class="du-chips" id="sm-drawer-chips">
        <!-- populated by JS -->
      </div>

      <!-- Sliding views: main category list <-> sub-menu -->
      <div class="drawer-views" id="sm-drawer-views">
        <!-- populated by JS -->
      </div>

      <!-- Bottom actions (logged-in: नया लेख / लॉगआउट) -->
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
/* AFTER */
#sm-navbar .nav-center { flex: 1; min-width: 0; display: flex; align-items: center; overflow: hidden; }
#sm-navbar .nav-links  { display: flex; align-items: center; flex-wrap: nowrap; min-width: 0; }

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
  transition: all 0.2s; text-decoration: none; display: inline-flex; align-items: center;
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
#sm-navbar .avatar.avatar-photo,
#sm-navbar .du-avatar.avatar-photo {
  object-fit: cover; background: none; padding: 0;
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

/* ── Drawer: user strip (top) ── */
#sm-navbar .drawer-user {
  background: var(--ink);
  padding: 18px 20px;
  display: flex; align-items: center; gap: 14px;
  flex-wrap: wrap;
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

/* Guest login/register — TOP of drawer */
#sm-navbar .du-guest-btns { display: flex; gap: 8px; margin-left: auto; }
#sm-navbar .du-guest-btns button {
  padding: 9px 16px; border-radius: 18px; font-family: 'Cinzel', serif;
  font-size: 0.6rem; letter-spacing: 1px; text-transform: uppercase;
  cursor: pointer; border: 1px solid; white-space: nowrap;
}
#sm-navbar .gb-login { background: var(--terra); border-color: var(--terra); color: #fff; }
#sm-navbar .gb-login:active { transform: translateY(1px); }
#sm-navbar .gb-register { background: transparent; border-color: rgba(184,136,26,0.4); color: var(--brass-l); }

/* Logged-in quick chips */
#sm-navbar .du-chips {
  display: flex; gap: 8px; padding: 0 20px 16px; flex-wrap: wrap;
  background: var(--ink);
}
#sm-navbar .du-chip {
  font-family: 'Tiro Devanagari Sanskrit', serif; font-size: 0.74rem;
  color: rgba(237,227,212,0.78); background: rgba(237,227,212,0.07);
  border: 1px solid rgba(184,136,26,0.22); padding: 7px 13px; border-radius: 14px;
  text-decoration: none; display: flex; align-items: center; gap: 5px;
  transition: all 0.15s;
}
#sm-navbar .du-chip:hover { background: rgba(184,136,26,0.18); color: var(--brass-l); }

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

/* ── In-drawer search ── */
#sm-navbar .drawer-search { padding: 16px 20px 4px; }
#sm-navbar .drawer-search input {
  width: 100%; padding: 11px 16px; border-radius: 20px;
  border: 1px solid rgba(184,136,26,0.28); background: rgba(255,255,255,0.65);
  font-family: 'Tiro Devanagari Sanskrit', serif; font-size: 0.88rem;
  color: var(--ink); outline: none;
}
#sm-navbar .drawer-search input:focus { border-color: var(--terra); background: #fff; }

/* ── Sliding category <-> sub-menu views ── */
#sm-navbar .drawer-views {
  display: flex; width: 200%;
  transition: transform 0.32s cubic-bezier(0.4,0,0.2,1);
}
#sm-navbar .drawer-views.show-sub { transform: translateX(-50%); }
#sm-navbar .drawer-view { width: 50%; flex-shrink: 0; }

#sm-navbar .sub-header {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 16px; background: var(--cream2);
  border-bottom: 1px solid rgba(184,136,26,0.2);
}
#sm-navbar .sub-back {
  background: none; border: none; cursor: pointer;
  font-family: 'Cinzel', serif; font-size: 0.62rem; letter-spacing: 1px;
  text-transform: uppercase; color: var(--terra); padding: 7px 12px;
  border-radius: 14px; display: flex; align-items: center; gap: 4px;
}
#sm-navbar .sub-back:hover { background: rgba(192,75,10,0.08); }
#sm-navbar .sub-title {
  font-family: 'Tiro Devanagari Sanskrit', serif; font-size: 1rem;
  color: var(--ink); font-weight: 600;
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
  padding: 11px 20px;
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
  box-shadow: 0 3px 0 rgba(184,136,26,0.18), 0 1px 4px rgba(28,15,46,0.1);
  transition: box-shadow 0.15s, transform 0.15s;
}
#sm-navbar .drawer-item:active .di-icon {
  box-shadow: 0 0 0 rgba(184,136,26,0.18);
  transform: translateY(2px);
}
#sm-navbar .di-text { display: flex; flex-direction: column; gap: 2px; }
#sm-navbar .di-hi {
  font-family: 'Tiro Devanagari Sanskrit', serif;
  font-size: 0.93rem; color: var(--ink); font-weight: 600;
}
#sm-navbar .di-en {
  font-family: 'Cinzel', serif; font-size: 0.54rem; letter-spacing: 1.5px;
  color: var(--muted); text-transform: uppercase;
}
#sm-navbar .di-arrow {
  margin-left: auto; font-size: 1rem; color: var(--muted2);
  transition: transform 0.15s;
}
#sm-navbar .drawer-item:hover .di-arrow { transform: translateX(4px); }

#sm-navbar .drawer-item.accent .di-icon {
  background: rgba(192,75,10,0.1); border-color: rgba(192,75,10,0.3);
}
#sm-navbar .drawer-item.accent .di-hi { color: var(--terra); }

/* ── Quick links footer (main view) ── */
#sm-navbar .drawer-quicklinks {
  display: flex; justify-content: space-around; flex-wrap: wrap;
  padding: 14px 16px 26px; background: var(--cream2);
  border-top: 1px solid rgba(184,136,26,0.15);
}
#sm-navbar .ql-link {
  font-family: 'Cinzel', serif; font-size: 0.58rem; letter-spacing: 1px;
  color: var(--muted); text-decoration: none; text-transform: uppercase;
  padding: 6px 8px;
}
#sm-navbar .ql-link:hover { color: var(--terra); }

/* ── Drawer: bottom action strip (logged-in only) ── */
#sm-navbar .drawer-actions:not(:empty) {
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
  padding: 16px 20px 28px;
  border-top: 1px solid rgba(184,136,26,0.15);
  background: var(--cream2);
}
#sm-navbar .da-btn {
  padding: 12px; border-radius: 10px; text-align: center;
  font-family: 'Cinzel', serif; font-size: 0.63rem; letter-spacing: 1.5px;
  text-transform: uppercase; cursor: pointer; border: 1px solid; text-decoration: none;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
#sm-navbar .da-btn.ghost {
  background: transparent; border-color: rgba(28,15,46,0.18); color: var(--muted);
}
#sm-navbar .da-btn.ghost:hover { background: rgba(28,15,46,0.05); }
#sm-navbar .da-btn.cta {
  background: var(--terra); border-color: var(--terra); color: #fff;
  box-shadow: 0 4px 0 var(--terra-d), 0 4px 10px rgba(192,75,10,0.3);
}
#sm-navbar .da-btn.cta:hover { background: var(--terra-l); }
#sm-navbar .da-btn.cta:active { box-shadow: none; transform: translateY(3px); }

/* ── RESPONSIVE ── */
@media (max-width: 980px) {
  #sm-navbar .nav-btn { padding: 0 10px; font-size: 0.63rem; letter-spacing: 1px; }
  #sm-navbar .nav-search { width: 120px; }
  #sm-navbar .nav-search:focus { width: 150px; }
}
@media (max-width: 800px) {
  #sm-navbar .nav-center { display: none; }
  #sm-navbar .nav-right .auth-btn { display: none; }
  #sm-navbar .nav-right .user-chip { display: none; }
  #sm-navbar .nav-right .search-wrap { display: none; }
  #sm-navbar .hamburger { display: flex; }
}
@media (max-width: 480px) {
  #sm-navbar { height: 56px; }
  #sm-navbar .mobile-drawer { top: 56px; }
  #sm-navbar .drawer-inner { max-height: calc(100dvh - 56px); }
  #sm-navbar .sm-logo { font-size: 1.05rem; }
  #sm-navbar .drawer-user { flex-wrap: wrap; }
  #sm-navbar .du-guest-btns { margin-left: 0; width: 100%; }
  #sm-navbar .du-guest-btns button { flex: 1; }
  /* ADD inside @media (max-width: 480px) */
  #sm-navbar .nav-btn { height: 56px; }
  #sm-navbar .dropdown-panel { top: 56px; }
}
`;

  /* ─────────────────────────────────────────────
     MENU DATA — single source for desktop dropdowns'
     content AND mobile sliding sub-menus.
  ───────────────────────────────────────────── */
  const MENU_DATA = [
    {
      id: 'shiv', icon: '🕉', label: 'शिव स्तोत्र',
      groups: [
        { label: 'मंत्र', items: [
          { hi: 'शिव मंत्र', url: '/shiva-mantras' },
          { hi: 'महामृत्युंजय मंत्र', url: '/shiva-mantras/Shiva-mahamrityunjaya-mantra/' },
          { hi: 'निर्वाणपटकम्', url: '#' },
        ]},
        { label: 'आरती', items: [
          { hi: 'शिव आरती', url: '#' },
          { hi: 'महा आरती', url: '#' },
        ]},
      ]
    },
    {
      id: 'shakti', icon: '🌺', label: 'शक्ति',
      groups: [
        { label: 'माता दुर्गा', items: [
          { hi: 'माँ दुर्गा मंत्र', url: '/durga-mantras/' },
          { hi: 'अष्टोत्तर शतनाम', url: '#' },
        ]},
        { label: 'देवी काली', items: [
          { hi: 'माँ काली मंत्र', url: '/maha-kali-mantra/' },
          { hi: 'कालिका स्तोत्र', url: '#' },
        ]},
      ]
    },
    {
      id: 'vishnu', icon: '🪷', label: 'विष्णु',
      groups: [
        { label: 'भगवान विष्णु', items: [
          { hi: 'विष्णु मंत्र', url: '/bhagvan-vishnu-mantra/' },
          { hi: 'विष्णु सहस्रनाम', url: '#' },
        ]},
      ]
    },
    {
      id: 'ram', icon: '🏹', label: 'राम-हनुमान',
      groups: [
        { label: 'श्री राम', items: [
          { hi: 'राम मंत्र', url: '/Shri-ram-mantra/' },
          { hi: 'राम रक्षा स्तोत्र', url: '#' },
        ]},
        { label: 'हनुमान जी', items: [
          { hi: 'हनुमान मंत्र', url: '/hanumanji/' },
          { hi: 'हनुमान चालीसा', url: '#' },
        ]},
      ]
    },
    {
      id: 'krishna', icon: '🦚', label: 'कृष्ण',
      groups: [
        { label: 'श्री कृष्ण', items: [
          { hi: 'कृष्ण महामंत्र', url: '/Krishna-Mahamantras/' },
          { hi: 'कृष्ण भजन', url: '#' },
        ]},
        { label: 'मैथिली गीत', items: [
          { hi: 'विद्यापति गीत संग्रह', url: '/Vidyapati-Geet-Sangrah/' },
        ]},
      ]
    },
    {
      id: 'articles', icon: '✍️', label: 'आलेख',
      groups: [
        { label: 'लेख', items: [
          { hi: 'आलेख', url: '/aalekh' },
          { hi: 'नया लेख लिखें', url: '/article_editor' },
          { hi: 'लेख संपादित करें', url: '/become_author/' },
        ]},
      ]
    },
  ];

  /* ─────────────────────────────────────────────
     INIT
  ───────────────────────────────────────────── */
  function init() {
    injectStyles();
    injectNav();
    setupDesktopDropdowns();
    setupMobileDrawer();
    setupAuth();
  }

  function injectStyles() {
    if (!document.getElementById('sm-nav-styles')) {
      const style = document.createElement('style');
      style.id = 'sm-nav-styles';
      style.textContent = NAV_STYLES;
      document.head.appendChild(style);
    }
  }

  function injectNav() {
    if (!document.getElementById('sm-navbar')) {
      const wrap = document.createElement('div');
      wrap.innerHTML = NAV_HTML;
      document.body.insertBefore(wrap.firstElementChild, document.body.firstChild);
    }
  }

  /* ─────────────────────────────────────────────
     DESKTOP DROPDOWNS
  ───────────────────────────────────────────── */
  function setupDesktopDropdowns() {
    const buttons = document.querySelectorAll('#sm-navbar .nav-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const menuId = btn.getAttribute('data-menu');
        const panel  = document.getElementById(menuId);
        const isOpen = panel.classList.contains('open');

        closeAllDesktop();
        if (!isOpen) {
          panel.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });

    document.addEventListener('click', e => {
      if (!e.target.closest('#sm-navbar .nav-dropdown')) closeAllDesktop();
    });
  }

  function closeAllDesktop() {
    document.querySelectorAll('#sm-navbar .dropdown-panel').forEach(p => p.classList.remove('open'));
    document.querySelectorAll('#sm-navbar .nav-btn').forEach(b => b.setAttribute('aria-expanded', 'false'));
    const um = document.querySelector('#sm-navbar .user-menu');
    if (um) um.classList.remove('open');
  }

  /* ─────────────────────────────────────────────
     MOBILE DRAWER
  ───────────────────────────────────────────── */
  function setupMobileDrawer() {
    buildDrawerContent();

    const ham    = document.getElementById('sm-hamburger');
    const drawer = document.getElementById('sm-mobile-drawer');
    if (!ham || !drawer) return;

    ham.addEventListener('click', () => {
      const open = drawer.classList.toggle('open');
      ham.setAttribute('aria-expanded', open ? 'true' : 'false');
      drawer.setAttribute('aria-hidden',  open ? 'false' : 'true');
      document.body.style.overflow = open ? 'hidden' : '';
      if (!open) closeSubmenu();
    });

    document.addEventListener('click', e => {
      if (!e.target.closest('#sm-navbar')) closeDrawer();
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeDrawer();
    });
  }

  function closeDrawer() {
    const ham    = document.getElementById('sm-hamburger');
    const drawer = document.getElementById('sm-mobile-drawer');
    if (!drawer) return;
    drawer.classList.remove('open');
    if (ham) ham.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    closeSubmenu();
  }

  /* Build the two sliding views: main category list + sub-menu */
  function buildDrawerContent() {
    const viewsEl = document.getElementById('sm-drawer-views');
    if (!viewsEl) return;

    let mainHtml = `
      <div class="drawer-search">
        <input type="search" placeholder="खोजें…" aria-label="खोजें" id="sm-drawer-search-input">
      </div>
      <div class="mandala-strip" aria-hidden="true"><span>✦ ॐ ✦</span></div>
    `;

    MENU_DATA.forEach(cat => {
      mainHtml += `
        <div class="drawer-item cat-item" data-cat="${cat.id}" role="button" tabindex="0">
          <div class="di-icon" aria-hidden="true">${cat.icon}</div>
          <div class="di-text">
            <span class="di-hi">${cat.label}</span>
          </div>
          <span class="di-arrow" aria-hidden="true">›</span>
        </div>`;
    });

    mainHtml += `
      <div class="drawer-quicklinks">
        <a href="/" class="ql-link">होम</a>
        <a href="/contact" class="ql-link">संपर्क</a>
        <a href="/privacy-policy" class="ql-link">गोपनीयता</a>
      </div>`;

    const subHtml = `
      <div class="sub-header">
        <button class="sub-back" id="sm-sub-back" type="button">‹ वापस</button>
        <span class="sub-title" id="sm-sub-title"></span>
      </div>
      <div id="sm-sub-content"></div>
    `;

    viewsEl.innerHTML = `
      <div class="drawer-view drawer-view-main">${mainHtml}</div>
      <div class="drawer-view drawer-view-sub">${subHtml}</div>
    `;

    viewsEl.querySelectorAll('.cat-item').forEach(row => {
      const open = () => openSubmenu(row.getAttribute('data-cat'));
      row.addEventListener('click', open);
      row.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
      });
    });

    const backBtn = document.getElementById('sm-sub-back');
    if (backBtn) backBtn.addEventListener('click', closeSubmenu);
  }

  function openSubmenu(catId) {
    const cat = MENU_DATA.find(c => c.id === catId);
    const content = document.getElementById('sm-sub-content');
    const title    = document.getElementById('sm-sub-title');
    const viewsEl  = document.getElementById('sm-drawer-views');
    if (!cat || !content || !title || !viewsEl) return;

    title.textContent = cat.label;
    let html = '';
    cat.groups.forEach(group => {
      html += `<div class="drawer-section-label">${group.label}</div>`;
      group.items.forEach(item => {
        html += `
          <a href="${item.url}" class="drawer-item">
            <div class="di-text"><span class="di-hi">${item.hi}</span></div>
            <span class="di-arrow" aria-hidden="true">›</span>
          </a>`;
      });
    });
    content.innerHTML = html;
    viewsEl.classList.add('show-sub');
  }

  function closeSubmenu() {
    const viewsEl = document.getElementById('sm-drawer-views');
    if (viewsEl) viewsEl.classList.remove('show-sub');
  }

  /* ─────────────────────────────────────────────
     AUTH — wired to SmAuth
  ───────────────────────────────────────────── */
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
            page_url:    window.location.href,
            page_title:  document.title,
            referrer:    document.referrer
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
    const user = window.SmAuth?.getUser?.();
    renderDesktopAuth(user);
    renderDrawerAuth(user);
  }

  /* Build an avatar — real photo if backend provides one, else letter avatar */
  function getAvatarHTML(user, sizeClass) {
    const photo =
      user.avatar_url || user.photo || user.profile_photo || user.avatar_photo ||
      (user.avatar && user.avatar.length > 2 ? user.avatar : null);

    if (photo) {
      return `<img src="${photo}" alt="${user.username}" class="${sizeClass} avatar-photo">`;
    }

    const avatarChar = (user.avatar && user.avatar.length === 1) ? user.avatar : (user.username || '?')[0];
    const avatarBg = window.SmAuth?.getAvatarBg
      ? window.SmAuth.getAvatarBg(avatarChar)
      : 'linear-gradient(135deg,#C04B0A,#B8881A)';
    return `<div class="${sizeClass}" style="background:${avatarBg}">${avatarChar.toUpperCase()}</div>`;
  }

  /* ── Desktop auth ── */
  function renderDesktopAuth(user) {
    const widget = document.getElementById('nav-auth-widget');
    if (!widget) return;

    if (user) {
      widget.innerHTML = `
        <div class="user-chip" id="sm-user-chip" role="button" tabindex="0"
             aria-haspopup="true" aria-label="${user.username} - अकाउंट मेनू">
          ${getAvatarHTML(user, 'avatar')}
          <span class="user-name">${user.username}</span>
          <div class="user-menu" id="sm-user-menu" role="menu">
            <a href="/user/${user.username}/myactivity" role="menuitem">मेरी गतिविधि</a>
            <a href="/profile/${user.username}" role="menuitem">प्रोफ़ाइल</a>
            <a href="/favorites.html" role="menuitem">❤️ पसंद</a>
            <a href="/article_editor" role="menuitem">नया लेख लिखें</a>
            <a href="/settings.html" role="menuitem">⚙️ सेटिंग्स</a>
            <button class="logout-btn" type="button" role="menuitem"
                    onclick="event.stopPropagation();window.SmAuth.logout()">🚪 लॉगआउट</button>
          </div>
        </div>`;

      const chip = document.getElementById('sm-user-chip');
      const menu = document.getElementById('sm-user-menu');
      chip.addEventListener('click', e => {
        e.stopPropagation();
        menu.classList.toggle('open');
      });
      document.addEventListener('click', () => menu.classList.remove('open'));

    } else {
      widget.innerHTML = `
        <button class="auth-btn" type="button"
                onclick="window.SmAuth._switchTab('register');window.SmAuth._openModal()">
          खाता बनाएँ
        </button>
        <button class="auth-btn primary" type="button"
                onclick="window.SmAuth._switchTab('login');window.SmAuth._openModal()">
          लॉगिन
        </button>`;
    }
  }

  /* ── Drawer auth (top of mobile menu) ── */
  function renderDrawerAuth(user) {
    const el        = document.getElementById('sm-drawer-user');
    const chipsEl   = document.getElementById('sm-drawer-chips');
    const actionsEl = document.getElementById('sm-drawer-actions');
    if (!el) return;

    if (user) {
      el.innerHTML = `
        ${getAvatarHTML(user, 'du-avatar')}
        <div class="du-info">
          <div class="du-name">${user.username}</div>
          <div class="du-sub">ShivMarg भक्त</div>
        </div>`;

      if (chipsEl) chipsEl.innerHTML = `
        <a href="/user/${user.username}/myactivity" class="du-chip">📊 गतिविधि</a>
        <a href="/profile/${user.username}" class="du-chip">👤 प्रोफ़ाइल</a>
        <a href="/favorites.html" class="du-chip">❤️ पसंद</a>
        <a href="/settings.html" class="du-chip">⚙️ सेटिंग्स</a>`;

      if (actionsEl) actionsEl.innerHTML = `
        <a href="/article_editor" class="da-btn ghost">नया लेख</a>
        <button class="da-btn cta" type="button"
                onclick="window.SmAuth.logout()">लॉगआउट</button>`;

    } else {
      // Guest: login/register buttons sit right here, at the TOP of the drawer
      el.innerHTML = `
        <div class="du-avatar">ॐ</div>
        <div class="du-info">
          <div class="du-name">अतिथि देवो भव</div>
          <div class="du-sub">लॉगिन करें या खाता बनाएं</div>
        </div>
        <div class="du-guest-btns">
          <button class="gb-register" type="button"
                  onclick="window.SmAuth._switchTab('register');window.SmAuth._openModal()">
            खाता बनाएँ
          </button>
          <button class="gb-login" type="button"
                  onclick="window.SmAuth._switchTab('login');window.SmAuth._openModal()">
            लॉगिन
          </button>
        </div>`;

      if (chipsEl) chipsEl.innerHTML = '';
      if (actionsEl) actionsEl.innerHTML = '';
    }
  }

  /* ─────────────────────────────────────────────
     PUBLIC API
  ───────────────────────────────────────────── */
  window.SmNav = {
    refresh() {
      renderNavAuth();
    }
  };

  /* ─────────────────────────────────────────────
     BOOTSTRAP
  ───────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();