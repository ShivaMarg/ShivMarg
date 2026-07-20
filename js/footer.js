/**
 * ==========================================================================
 *  ShivMarg — Global Site Footer  (/js/footer.js)
 * --------------------------------------------------------------------------
 *  Usage: add this single line just before </body> on every page —
 *      <script src="/js/footer.js"></script>
 *
 *  Same pattern as nav.js — this file injects its own <style>, builds the
 *  footer markup, and appends it to <body>. No other HTML needed on the page.
 *
 *  Theme: "Praveshdwar" — saffron / gold / maroon, temple-gateway aesthetic.
 *  Fonts: Cinzel Decorative (headings), Tiro Devanagari Sanskrit (shlokas),
 *         Mukta (Hindi/Devanagari body text).
 *
 *  ---- ✏️  EDIT ZONE ---------------------------------------------------
 *  All editable content (links, phone, email, social handles, year) lives
 *  in the CONFIG object right below. Update values there — you should not
 *  need to touch the rendering code beneath it.
 *  -----------------------------------------------------------------------
 */

(function () {
  "use strict";

  /* ======================================================================
   * ✏️ EDIT ZONE START — site-wide footer configuration
   * ==================================================================== */
  const CONFIG = {
    siteName: "शिवमार्ग",
    siteNameEn: "ShivMarg",
    tagline: "मंत्र, आरती, चालीसा और भक्ति का पावन मार्ग",
    taglineEn: "Your daily path to mantras, aarti & devotion",
    domain: "shivmarg.live",

    // Contact
    email: "shivmarg@shivmarg.live",
    phone: "", // e.g. "+91 98765 43210" — leave blank to hide

    // Social links — leave value as "" to hide that icon
    social: {
      facebook: "https://facebook.com/shivmarg",
      instagram: "https://instagram.com/shivmarg.live",
      youtube: "https://youtube.com/@shivmarg",
      twitter: "",
      whatsapp: "",
      telegram: "",
    },

    // Footer link columns
    columns: [
      {
        title: "त्वरित लिंक",
        titleEn: "Quick Links",
        links: [
          { label: "होम", href: "/" },
          { label: "हमारे बारे में", href: "/about/" },
          { label: "डैशबोर्ड", href: "/dashboard/" },
          { label: "मंत्र ट्रैकर", href: "/jaap-mala-tracker/" },
          { label: "पंचांग", href: "/Hindi-Panchang-Patra/" },
          { label: "लेख / ब्लॉग", href: "/aalekh/" },
          { label: "संपर्क करें", href: "/contact/" },
        ],
      },
      {
        title: "भक्ति सामग्री",
        titleEn: "Devotional Content",
        links: [
          { label: "मंत्र संग्रह", href: "/" },
          { label: "आरती संग्रह", href: "/aarti/" },
          { label: "चालीसा संग्रह", href: "/chalisa/" },
          { label: "स्तोत्र संग्रह", href: "/stotra/" },
          { label: "भजन संग्रह", href: "/bhajans/" },
          { label: "ज्योतिर्लिंग", href: "/shiva-mantras/Shiva-jyotirlinga-stotram/" },
        ],
      },
      {
        title: "मैथिली विरासत",
        titleEn: "Maithili Heritage",
        links: [
          { label: "विद्यापति गीत संग्रह", href: "/Vidyapati-Giti-Sangraha/" },
          { label: "मैथिली पंचांग", href: "/Maithili-Panchang-Patrika/" },
          { label: "सावन विशेष 2026", href: "/sawan-2026/" },
          { label: "मिथिला संस्कृति", href: "/mithila-culture/" },
        ],
      },
      {
        title: "जानकारी",
        titleEn: "Legal & Info",
        links: [
          { label: "गोपनीयता नीति", href: "/privacy-policy/" },
          { label: "नियम व शर्तें", href: "/terms-conditions/" },
          { label: "अस्वीकरण", href: "/disclaimer/" },
          { label: "साइटमैप", href: "/sitemap/" },
          { label: "सहायता", href: "/help/" },
          { label: "संपर्क करें", href: "/contact/" },
          { label: "हमारे बारे में", href: "/about/" },
          { label: "एफ़िलिएट डिस्क्लोजर", href: "/affiliate-disclosure/" },
        ],
      },
    ],

    // Copyright year — auto-updates, no need to edit
    year: new Date().getFullYear(),
  };
  /* ======================================================================
   * ✏️ EDIT ZONE END
   * ==================================================================== */

  /* ---------------------------------------------------------------------
   * Ensure brand fonts are present (safe no-op if nav.js already loaded them)
   * ------------------------------------------------------------------- */
  function ensureFonts() {
    if (document.getElementById("shivmarg-footer-fonts")) return;
    const link = document.createElement("link");
    link.id = "shivmarg-footer-fonts";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Tiro+Devanagari+Sanskrit&family=Mukta:wght@300;400;500;600;700;800&display=swap";
    document.head.appendChild(link);
  }

  /* ---------------------------------------------------------------------
   * Inline SVG icons (no external icon-font dependency)
   * ------------------------------------------------------------------- */
  const ICONS = {
    facebook:
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z"/></svg>',
    instagram:
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.72 3.72 0 0 1-1.38-.9 3.72 3.72 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16Zm0 1.62c-3.14 0-3.5.01-4.74.07-.98.04-1.51.21-1.86.35a3.1 3.1 0 0 0-1.15.75c-.35.35-.57.68-.75 1.15-.14.35-.31.88-.35 1.86-.06 1.24-.07 1.6-.07 4.74s.01 3.5.07 4.74c.04.98.21 1.51.35 1.86.18.47.4.8.75 1.15.35.35.68.57 1.15.75.35.14.88.31 1.86.35 1.24.06 1.6.07 4.74.07s3.5-.01 4.74-.07c.98-.04 1.51-.21 1.86-.35.47-.18.8-.4 1.15-.75.35-.35.57-.68.75-1.15.14-.35.31-.88.35-1.86.06-1.24.07-1.6.07-4.74s-.01-3.5-.07-4.74c-.04-.98-.21-1.51-.35-1.86a3.1 3.1 0 0 0-.75-1.15 3.1 3.1 0 0 0-1.15-.75c-.35-.14-.88-.31-1.86-.35-1.24-.06-1.6-.07-4.74-.07Zm0 4.13a4.09 4.09 0 1 1 0 8.18 4.09 4.09 0 0 1 0-8.18Zm0 6.75a2.66 2.66 0 1 0 0-5.32 2.66 2.66 0 0 0 0 5.32Zm5.2-6.92a.96.96 0 1 1-1.92 0 .96.96 0 0 1 1.92 0Z"/></svg>',
    youtube:
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.55A3.02 3.02 0 0 0 .5 6.19 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.12 2.14C4.5 20.5 12 20.5 12 20.5s7.5 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.81ZM9.6 15.6V8.4L15.8 12l-6.2 3.6Z"/></svg>',
    twitter:
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2H22l-7.2 8.24L23.2 22H16.9l-4.94-6.46L6.3 22H3.2l7.7-8.81L2.3 2h6.46l4.47 5.9L18.9 2Zm-1.1 18h1.72L7.3 3.9H5.46L17.8 20Z"/></svg>',
    whatsapp:
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.87.5 3.63 1.44 5.15L2 22l5.09-1.55a9.9 9.9 0 0 0 4.95 1.34h.01c5.46 0 9.91-4.45 9.91-9.9 0-2.64-1.03-5.13-2.9-7C17.19 3.03 14.68 2 12.04 2Zm0 1.7c2.2 0 4.26.86 5.81 2.41a8.14 8.14 0 0 1 2.4 5.8c0 4.53-3.69 8.2-8.22 8.2a8.2 8.2 0 0 1-4.18-1.15l-.3-.17-3.02.92.93-2.94-.19-.31a8.13 8.13 0 0 1-1.26-4.36c0-4.53 3.7-8.4 8.03-8.4Zm-4.5 4.35c-.16 0-.42.06-.64.3-.22.24-.85.83-.85 2.03 0 1.2.87 2.36.99 2.52.12.16 1.7 2.68 4.19 3.66 2.07.82 2.49.65 2.94.62.45-.04 1.46-.6 1.66-1.18.2-.58.2-1.08.14-1.18-.06-.1-.22-.16-.45-.28-.24-.12-1.46-.72-1.68-.8-.23-.08-.4-.12-.56.12-.16.24-.64.8-.79.97-.14.16-.29.18-.53.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.35-1.67-.14-.24-.02-.37.1-.49.12-.12.24-.29.36-.43.12-.14.16-.24.24-.4.08-.16.04-.31-.02-.43-.06-.12-.56-1.36-.78-1.86-.2-.5-.42-.42-.56-.43Z"/></svg>',
    telegram:
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.05 3.24 2.83 10.7c-1.3.52-1.3 1.24-.24 1.57l4.93 1.54 11.42-7.2c.54-.33 1.03-.15.62.21L10.7 15l-.36 5.03c.51 0 .74-.23 1.02-.5l2.45-2.37 5.09 3.75c.94.52 1.6.25 1.84-.87l3.33-15.7c.34-1.38-.53-2-1.02-1.9Z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18v12H3z"/><path d="m3 7 9 6 9-6"/></svg>',
    phone:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/></svg>',
  };

  function socialIcon(key, url) {
    if (!url) return "";
    return `<a class="sm-ftr-social-link" href="${url}" target="_blank" rel="noopener noreferrer" aria-label="${key}">${ICONS[key] || ""}</a>`;
  }

  /* ---------------------------------------------------------------------
   * Build column markup
   * ------------------------------------------------------------------- */
  function buildColumns() {
    return CONFIG.columns
      .map(
        (col) => `
      <div class="sm-ftr-col">
        <h4 class="sm-ftr-col-title">${col.title}<span>${col.titleEn}</span></h4>
        <ul class="sm-ftr-links">
          ${col.links.map((l) => `<li><a href="${l.href}">${l.label}</a></li>`).join("")}
        </ul>
      </div>`
      )
      .join("");
  }

  /* ---------------------------------------------------------------------
   * Full footer markup
   * ------------------------------------------------------------------- */
  function buildFooterHTML() {
    const contactBits = [];
    if (CONFIG.email) {
      contactBits.push(
        `<a href="mailto:${CONFIG.email}" class="sm-ftr-contact-item">${ICONS.mail}<span>${CONFIG.email}</span></a>`
      );
    }
    if (CONFIG.phone) {
      contactBits.push(
        `<a href="tel:${CONFIG.phone.replace(/\s/g, "")}" class="sm-ftr-contact-item">${ICONS.phone}<span>${CONFIG.phone}</span></a>`
      );
    }

    const socials = Object.entries(CONFIG.social)
      .map(([key, url]) => socialIcon(key, url))
      .join("");

    return `
    <div class="sm-ftr-gate">
      <svg viewBox="0 0 600 40" preserveAspectRatio="none" class="sm-ftr-gate-svg">
        <path d="M0,20 Q150,0 300,20 T600,20" fill="none" stroke="url(#smFtrGateGrad)" stroke-width="1.5"/>
        <circle cx="300" cy="20" r="5" fill="url(#smFtrGateGrad)"/>
        <defs>
          <linearGradient id="smFtrGateGrad" x1="0" x2="1">
            <stop offset="0%" stop-color="#D4AF37" stop-opacity="0"/>
            <stop offset="50%" stop-color="#D4AF37"/>
            <stop offset="100%" stop-color="#D4AF37" stop-opacity="0"/>
          </linearGradient>
        </defs>
      </svg>
    </div>

    <div class="sm-ftr-inner">
      <div class="sm-ftr-top">
        <div class="sm-ftr-brand">
          <a href="/" class="sm-ftr-logo">
            <span class="sm-ftr-logo-hi">${CONFIG.siteName}</span>
            <span class="sm-ftr-logo-en">${CONFIG.siteNameEn}</span>
          </a>
          <p class="sm-ftr-tagline">${CONFIG.tagline}</p>
          <p class="sm-ftr-tagline-en">${CONFIG.taglineEn}</p>

          <div class="sm-ftr-contacts">${contactBits.join("")}</div>

          ${socials ? `<div class="sm-ftr-socials">${socials}</div>` : ""}
        </div>

        <div class="sm-ftr-columns">
          ${buildColumns()}
        </div>
      </div>

      <div class="sm-ftr-divider"></div>

      <div class="sm-ftr-bottom">
        <p class="sm-ftr-copy">&copy; ${CONFIG.year} <strong>${CONFIG.siteNameEn}</strong> (${CONFIG.domain}). सर्वाधिकार सुरक्षित।</p>
        <p class="sm-ftr-made">🙏 श्रद्धा और सेवा भाव से निर्मित &mdash; Made with devotion in Mithila</p>
      </div>
    </div>`;
  }

  /* ---------------------------------------------------------------------
   * Styles — scoped under #shivmarg-footer to avoid clashing with page CSS
   * ------------------------------------------------------------------- */
  function buildFooterCSS() {
    return `
    #shivmarg-footer {
      --sm-saffron: #FF9933;
      --sm-saffron-dark: #E07B1A;
      --sm-gold: #D4AF37;
      --sm-maroon: #4A0E0E;
      --sm-maroon-deep: #2E0808;
      --sm-cream: #FFF7E8;
      --sm-text-soft: rgba(255, 247, 232, 0.75);
      --sm-text-faint: rgba(255, 247, 232, 0.5);

      position: relative;
      width: 100%;
      margin-top: 4rem;
      background: linear-gradient(180deg, var(--sm-maroon) 0%, var(--sm-maroon-deep) 100%);
      color: var(--sm-cream);
      font-family: 'Mukta', 'Tiro Devanagari Sanskrit', sans-serif;
      overflow: hidden;
      box-sizing: border-box;
    }
    #shivmarg-footer *, #shivmarg-footer *::before, #shivmarg-footer *::after {
      box-sizing: border-box;
    }

    #shivmarg-footer .sm-ftr-gate {
      width: 100%;
      padding: 0.5rem 0 0;
      background: rgba(0,0,0,0.15);
    }
    #shivmarg-footer .sm-ftr-gate-svg {
      display: block;
      width: 100%;
      height: 24px;
    }

    #shivmarg-footer .sm-ftr-inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 3rem 1.5rem 2rem;
    }

    #shivmarg-footer .sm-ftr-top {
      display: grid;
      grid-template-columns: 1.3fr 2.4fr;
      gap: 2.5rem;
    }

    /* ---- Brand block ---- */
    #shivmarg-footer .sm-ftr-logo {
      display: flex;
      flex-direction: column;
      text-decoration: none;
      margin-bottom: 0.9rem;
    }
    #shivmarg-footer .sm-ftr-logo-hi {
      font-family: 'Cinzel Decorative', serif;
      font-weight: 700;
      font-size: 1.6rem;
      background: linear-gradient(90deg, var(--sm-gold), var(--sm-saffron));
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      letter-spacing: 0.5px;
    }
    #shivmarg-footer .sm-ftr-logo-en {
      font-size: 0.7rem;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: var(--sm-text-faint);
      margin-top: 2px;
    }
    #shivmarg-footer .sm-ftr-tagline {
      font-size: 0.98rem;
      color: var(--sm-text-soft);
      margin: 0 0 0.15rem;
      line-height: 1.6;
    }
    #shivmarg-footer .sm-ftr-tagline-en {
      font-size: 0.78rem;
      font-style: italic;
      color: var(--sm-text-faint);
      margin: 0 0 1.3rem;
    }

    #shivmarg-footer .sm-ftr-contacts {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      margin-bottom: 1.2rem;
    }
    #shivmarg-footer .sm-ftr-contact-item {
      display: inline-flex;
      align-items: center;
      gap: 0.55rem;
      color: var(--sm-text-soft);
      text-decoration: none;
      font-size: 0.9rem;
      transition: color 0.2s ease;
      width: fit-content;
    }
    #shivmarg-footer .sm-ftr-contact-item:hover { color: var(--sm-gold); }
    #shivmarg-footer .sm-ftr-contact-item svg { width: 16px; height: 16px; flex-shrink: 0; }

    #shivmarg-footer .sm-ftr-socials {
      display: flex;
      gap: 0.7rem;
      flex-wrap: wrap;
    }
    #shivmarg-footer .sm-ftr-social-link {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(255, 153, 51, 0.12);
      border: 1px solid rgba(212, 175, 55, 0.35);
      color: var(--sm-gold);
      transition: all 0.25s ease;
    }
    #shivmarg-footer .sm-ftr-social-link svg { width: 16px; height: 16px; }
    #shivmarg-footer .sm-ftr-social-link:hover {
      background: linear-gradient(135deg, var(--sm-saffron), var(--sm-gold));
      color: var(--sm-maroon-deep);
      border-color: transparent;
      transform: translateY(-2px);
    }

    /* ---- Columns ---- */
    #shivmarg-footer .sm-ftr-columns {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
    }
    #shivmarg-footer .sm-ftr-col-title {
      font-family: 'Cinzel Decorative', serif;
      font-size: 0.92rem;
      font-weight: 700;
      color: var(--sm-gold);
      margin: 0 0 1rem;
      display: flex;
      flex-direction: column;
      letter-spacing: 0.3px;
    }
    #shivmarg-footer .sm-ftr-col-title span {
      font-family: 'Mukta', sans-serif;
      font-size: 0.62rem;
      font-weight: 400;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: var(--sm-text-faint);
      margin-top: 2px;
    }
    #shivmarg-footer .sm-ftr-links {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 0.55rem;
    }
    #shivmarg-footer .sm-ftr-links a {
      color: var(--sm-text-soft);
      text-decoration: none;
      font-size: 0.87rem;
      transition: color 0.2s ease, padding-left 0.2s ease;
      position: relative;
    }
    #shivmarg-footer .sm-ftr-links a:hover {
      color: var(--sm-saffron);
      padding-left: 6px;
    }

    /* ---- Divider & bottom bar ---- */
    #shivmarg-footer .sm-ftr-divider {
      height: 1px;
      margin: 2.5rem 0 1.3rem;
      background: linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent);
    }
    #shivmarg-footer .sm-ftr-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.6rem;
    }
    #shivmarg-footer .sm-ftr-copy,
    #shivmarg-footer .sm-ftr-made {
      margin: 0;
      font-size: 0.8rem;
      color: var(--sm-text-faint);
    }
    #shivmarg-footer .sm-ftr-copy strong { color: var(--sm-text-soft); }

    /* =====================================================================
       Responsive — tablet
       ===================================================================== */
    @media (max-width: 900px) {
      #shivmarg-footer .sm-ftr-top {
        grid-template-columns: 1fr;
        gap: 2.2rem;
      }
      #shivmarg-footer .sm-ftr-columns {
        grid-template-columns: repeat(2, 1fr);
        gap: 2rem 1.5rem;
      }
    }

    /* =====================================================================
       Responsive — mobile
       ===================================================================== */
    @media (max-width: 560px) {
      #shivmarg-footer { margin-top: 2.5rem; }
      #shivmarg-footer .sm-ftr-inner { padding: 2.2rem 1.2rem 1.5rem; }

      #shivmarg-footer .sm-ftr-brand { text-align: center; }
      #shivmarg-footer .sm-ftr-logo { align-items: center; }
      #shivmarg-footer .sm-ftr-contacts { align-items: center; }
      #shivmarg-footer .sm-ftr-contact-item { justify-content: center; }
      #shivmarg-footer .sm-ftr-socials { justify-content: center; }

      #shivmarg-footer .sm-ftr-columns {
        grid-template-columns: repeat(2, 1fr);
        gap: 1.8rem 1rem;
        text-align: left;
      }
      #shivmarg-footer .sm-ftr-col-title { font-size: 0.85rem; }
      #shivmarg-footer .sm-ftr-links a { font-size: 0.82rem; }

      #shivmarg-footer .sm-ftr-bottom {
        flex-direction: column;
        text-align: center;
      }
      #shivmarg-footer .sm-ftr-copy, #shivmarg-footer .sm-ftr-made {
        font-size: 0.72rem;
      }
    }

    @media (max-width: 380px) {
      #shivmarg-footer .sm-ftr-columns {
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem 0.8rem;
      }
      #shivmarg-footer .sm-ftr-logo-hi { font-size: 1.35rem; }
    }
    `;
  }

  /* ---------------------------------------------------------------------
   * Mount
   * ------------------------------------------------------------------- */
  function mountFooter() {
    if (document.getElementById("shivmarg-footer")) return; // avoid duplicates

    ensureFonts();

    const styleTag = document.createElement("style");
    styleTag.id = "shivmarg-footer-styles";
    styleTag.textContent = buildFooterCSS();
    document.head.appendChild(styleTag);

    const footer = document.createElement("footer");
    footer.id = "shivmarg-footer";
    footer.innerHTML = buildFooterHTML();
    document.body.appendChild(footer);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountFooter);
  } else {
    mountFooter();
  }
})();