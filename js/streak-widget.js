/**
 * ═══════════════════════════════════════════════════════════
 *  ShivaMarg Streak Widget  — streak-widget.js
 *  Include this on EVERY page:
 *    <script src="/js/streak-widget.js"></script>
 *
 *  Works for both anonymous visitors and logged-in users.
 *  Shows a toast notification on the right for 5 seconds when
 *  a new streak day is recorded.
 * ═══════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  const API_BASE        = "https://www.api.shivmarg.live"; // ← change if needed
  const TOKEN_KEY       = "sm_streak_token";           // localStorage key for anon token
  const LAST_PING_KEY   = "sm_last_ping_date";         // avoid double-pinging same day
  const DOT_HIDDEN_KEY  = "sm_streak_dot_hidden";       // user closed the persistent badge

  // ── Motivational messages (rotated by streak milestone) ──────────────────
  const MESSAGES = [
    { min: 1,   max: 1,   msg: "🕉 आपकी आध्यात्मिक यात्रा शुरू हुई!",       sub: "पहला दिन — सबसे महत्वपूर्ण कदम!" },
    { min: 2,   max: 3,   msg: "🔥 लगातार {n} दिन!",                          sub: "निरंतरता ही सफलता की कुंजी है।" },
    { min: 4,   max: 6,   msg: "✨ {n} दिनों की साधना!",                       sub: "आपकी भक्ति अटूट है।" },
    { min: 7,   max: 7,   msg: "🌟 एक पूरा सप्ताह!",                           sub: "7 दिन — आप सच्चे साधक हैं!" },
    { min: 8,   max: 13,  msg: "💫 {n} दिनों की निरंतर साधना!",               sub: "शिव की कृपा आप पर है।" },
    { min: 14,  max: 14,  msg: "🪔 दो सप्ताह की भक्ति!",                      sub: "14 दिन — अविश्वसनीय समर्पण!" },
    { min: 15,  max: 20,  msg: "🙏 {n} दिन — ज्ञान की यात्रा जारी है!",       sub: "ॐ नमः शिवाय 🕉" },
    { min: 21,  max: 21,  msg: "🏆 21 दिन — आदत बन गई!",                      sub: "विज्ञान कहता है — 21 दिन में संस्कार!" },
    { min: 22,  max: 29,  msg: "🔱 {n} दिनों की अखंड साधना!",                 sub: "त्रिशूल की तरह दृढ़ हैं आप!" },
    { min: 30,  max: 30,  msg: "🌙 एक पूरा महीना!",                            sub: "30 दिन — आप ShivaMarg के सच्चे अनुयायी हैं!" },
    { min: 31,  max: 99,  msg: "⚡ {n} दिन — अद्भुत!",                        sub: "आपकी भक्ति प्रेरणा है।" },
    { min: 100, max: 999, msg: "🌺 {n} दिन — किंवदंती!",                       sub: "शत दिवस — आप ShivaMarg के स्तंभ हैं!" },
  ];

  function getMessage(streak) {
    const entry = MESSAGES.find(m => streak >= m.min && streak <= m.max)
                  || MESSAGES[MESSAGES.length - 1];
    return {
      msg: entry.msg.replace("{n}", streak),
      sub: entry.sub,
    };
  }

  // ── Token management ─────────────────────────────────────────────────────
  function getAnonToken() {
    let token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      token = crypto.randomUUID
        ? crypto.randomUUID()
        : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
            const r = (Math.random() * 16) | 0;
            return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
          });
      localStorage.setItem(TOKEN_KEY, token);
    }
    return token;
  }

  // ── Auth helpers ─────────────────────────────────────────────────────────
  function getAuthToken() {
    // Adjust this key to match wherever your app stores the JWT
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("sm_token") ||
      null
    );
  }

  function isLoggedIn() {
    return !!getAuthToken();
  }

  // ── Avoid double-pinging in the same calendar day ────────────────────────
  function alreadyPingedToday() {
    const lastPing = localStorage.getItem(LAST_PING_KEY);
    if (!lastPing) return false;
    const lastDate = new Date(lastPing).toDateString();
    const today    = new Date().toDateString();
    return lastDate === today;
  }

  function markPingedToday() {
    localStorage.setItem(LAST_PING_KEY, new Date().toISOString());
  }

  // ── Persistent-dot dismiss state ──────────────────────────────────────────
  function isDotHidden() {
    return localStorage.getItem(DOT_HIDDEN_KEY) === "1";
  }

  function hideDotForever() {
    localStorage.setItem(DOT_HIDDEN_KEY, "1");
    if (dotEl) { dotEl.remove(); dotEl = null; }
  }

  // ── Toast UI ─────────────────────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById("sm-streak-styles")) return;
    const style = document.createElement("style");
    style.id    = "sm-streak-styles";
    style.textContent = `
      #sm-streak-toast {
        position: fixed;
        right: -380px;
        top: 80px;
        z-index: 99999;
        width: 320px;
        background: linear-gradient(145deg, #1e0d04, #3d1a08);
        border: 1px solid rgba(181,69,27,0.5);
        border-left: 4px solid #b5451b;
        border-radius: 14px;
        padding: 18px 20px 16px;
        box-shadow: 0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(181,69,27,0.15);
        font-family: 'Georgia', serif;
        transition: right 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
        cursor: pointer;
        user-select: none;
      }
      #sm-streak-toast.sm-visible {
        right: 20px;
      }
      #sm-streak-toast .sm-top-row {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 10px;
      }
      #sm-streak-toast .sm-flame-badge {
        background: linear-gradient(135deg, #b5451b, #e07b39);
        border-radius: 50%;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        flex-shrink: 0;
        box-shadow: 0 4px 14px rgba(181,69,27,0.5);
      }
      #sm-streak-toast .sm-streak-info {
        flex: 1;
        min-width: 0;
      }
      #sm-streak-toast .sm-streak-num {
        color: #e07b39;
        font-size: 26px;
        font-weight: 700;
        line-height: 1;
        letter-spacing: -0.5px;
      }
      #sm-streak-toast .sm-streak-label {
        color: rgba(255,255,255,0.45);
        font-size: 10px;
        letter-spacing: 2px;
        text-transform: uppercase;
        margin-top: 2px;
      }
      #sm-streak-toast .sm-close-btn {
        color: rgba(255,255,255,0.25);
        font-size: 16px;
        background: none;
        border: none;
        cursor: pointer;
        padding: 2px 6px;
        line-height: 1;
        flex-shrink: 0;
        transition: color 0.2s;
      }
      #sm-streak-toast .sm-close-btn:hover {
        color: rgba(255,255,255,0.6);
      }
      #sm-streak-toast .sm-divider {
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(224,123,57,0.3), transparent);
        margin: 0 0 10px;
      }
      #sm-streak-toast .sm-main-msg {
        color: #f5e6cc;
        font-size: 14px;
        font-weight: 600;
        line-height: 1.4;
        margin-bottom: 4px;
      }
      #sm-streak-toast .sm-sub-msg {
        color: rgba(224,165,80,0.7);
        font-size: 11px;
        line-height: 1.5;
      }
      #sm-streak-toast .sm-progress-bar-wrap {
        margin-top: 12px;
        height: 4px;
        background: rgba(255,255,255,0.08);
        border-radius: 2px;
        overflow: hidden;
      }
      #sm-streak-toast .sm-progress-bar {
        height: 100%;
        background: linear-gradient(90deg, #b5451b, #e07b39);
        border-radius: 2px;
        width: 100%;
        animation: sm-drain 5s linear forwards;
      }
      @keyframes sm-drain {
        from { width: 100%; }
        to   { width: 0%; }
      }
      /* small dot indicator that persists on page (bottom-right) */
      #sm-streak-dot {
        position: fixed;
        bottom: 100px; /* moved up a bit from 24px — tweak to taste */
        right: 24px;
        z-index: 9998;
        background: linear-gradient(135deg, #1e0d04, #3d1a08);
        border: 1px solid rgba(181,69,27,0.5);
        border-radius: 40px;
        padding: 8px 14px;
        display: flex;
        align-items: center;
        gap: 7px;
        font-family: 'Georgia', serif;
        cursor: pointer;
        box-shadow: 0 4px 16px rgba(0,0,0,0.4);
        transition: transform 0.2s, box-shadow 0.2s;
        opacity: 0;
        pointer-events: none;
      }
      #sm-streak-dot.sm-dot-visible {
        opacity: 1;
        pointer-events: auto;
      }
      #sm-streak-dot:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0,0,0,0.5);
      }
      #sm-streak-dot .sm-dot-fire {
        font-size: 16px;
      }
      #sm-streak-dot .sm-dot-count {
        color: #e07b39;
        font-size: 14px;
        font-weight: 700;
      }
      #sm-streak-dot .sm-dot-label {
        color: rgba(255,255,255,0.4);
        font-size: 10px;
        letter-spacing: 1px;
        text-transform: uppercase;
      }
      #sm-streak-dot .sm-dot-close-btn {
        color: rgba(255,255,255,0.25);
        font-size: 13px;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0 0 0 4px;
        margin-left: 2px;
        line-height: 1;
        flex-shrink: 0;
        transition: color 0.2s;
      }
      #sm-streak-dot .sm-dot-close-btn:hover {
        color: rgba(255,255,255,0.7);
      }
      @media (max-width: 480px) {
        #sm-streak-toast {
          width: calc(100vw - 32px);
          right: -110%;
        }
        #sm-streak-toast.sm-visible {
          right: 16px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  let toastTimer    = null;
  let toastEl       = null;
  let dotEl         = null;
  let currentStreak = 0;

  function buildToast(streak) {
    if (toastEl) toastEl.remove();

    const { msg, sub } = getMessage(streak);
    const el = document.createElement("div");
    el.id = "sm-streak-toast";
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");

    const flameIcon = streak >= 7 ? "🔱" : streak >= 3 ? "🔥" : "🕉";

    el.innerHTML = `
      <div class="sm-top-row">
        <div class="sm-flame-badge">${flameIcon}</div>
        <div class="sm-streak-info">
          <div class="sm-streak-num">${streak} <span style="font-size:13px;color:rgba(224,165,80,0.6);">🔥</span></div>
          <div class="sm-streak-label">दिन की साधना</div>
        </div>
        <button class="sm-close-btn" aria-label="बंद करें">✕</button>
      </div>
      <div class="sm-divider"></div>
      <div class="sm-main-msg">${msg}</div>
      <div class="sm-sub-msg">${sub}</div>
      <div class="sm-progress-bar-wrap">
        <div class="sm-progress-bar"></div>
      </div>
    `;

    document.body.appendChild(el);
    toastEl = el;

    // Slide in after short delay (let page render first)
    setTimeout(() => el.classList.add("sm-visible"), 300);

    // Close button
    el.querySelector(".sm-close-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      hideToast();
    });

    // Click anywhere on toast also dismisses
    el.addEventListener("click", hideToast);

    // Auto-hide after 5s
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, 5000);
  }

  function hideToast() {
    if (!toastEl) return;
    clearTimeout(toastTimer);
    toastEl.style.right = "-380px";
    setTimeout(() => {
      if (toastEl) { toastEl.remove(); toastEl = null; }
    }, 450);
  }

  function buildDot(streak) {
    if (isDotHidden()) return; // user already closed the badge — respect that

    if (dotEl) { dotEl.remove(); dotEl = null; }

    const el = document.createElement("div");
    el.id = "sm-streak-dot";
    el.title = `आपकी साधना: ${streak} दिन`;
    el.innerHTML = `
      <span class="sm-dot-fire">🔥</span>
      <span class="sm-dot-count">${streak}</span>
      <span class="sm-dot-label">Streak</span>
      <button class="sm-dot-close-btn" aria-label="हटाएं">✕</button>
    `;
    document.body.appendChild(el);
    dotEl = el;

    // Show after toast would hide (so they don't overlap)
    setTimeout(() => el.classList.add("sm-dot-visible"), 5500);

    // Clicking dot re-shows toast
    el.addEventListener("click", () => {
      if (currentStreak > 0) buildToast(currentStreak);
    });

    // Clicking the cross permanently hides the badge for this visitor
    el.querySelector(".sm-dot-close-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      hideDotForever();
    });
  }

  // ── API calls ─────────────────────────────────────────────────────────────
  async function pingStreak() {
    const authToken = getAuthToken();
    const anonToken = getAnonToken();

    const headers = { "Content-Type": "application/json" };
    if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

    const body = authToken ? {} : { token: anonToken };

    try {
      const res  = await fetch(`${API_BASE}/api/streak/ping`, {
        method:  "POST",
        headers,
        body:    JSON.stringify(body),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.warn("[ShivaMarg Streak] ping failed:", e);
      return null;
    }
  }

  async function claimStreak(anonToken) {
    const authToken = getAuthToken();
    if (!authToken || !anonToken) return;

    try {
      await fetch(`${API_BASE}/api/streak/claim`, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({ token: anonToken }),
      });
    } catch (e) {
      console.warn("[ShivaMarg Streak] claim failed:", e);
    }
  }

  // ── Main init ─────────────────────────────────────────────────────────────
  async function init() {
    injectStyles();

    // If user just logged in and we have an anon token → claim it first
    if (isLoggedIn()) {
      const anonToken = localStorage.getItem(TOKEN_KEY);
      if (anonToken) {
        await claimStreak(anonToken);
        // Clean up the anon token now that it's claimed
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(LAST_PING_KEY); // allow ping to fire after claim
      }
    }

    // Avoid spamming the API — only ping once per calendar day
    // (Still show the persistent dot if streak is known)
    if (alreadyPingedToday()) {
      // Just show the dot silently with the last-known streak
      const lastStreak = parseInt(localStorage.getItem("sm_streak_val") || "0", 10);
      if (lastStreak > 0) {
        currentStreak = lastStreak;
        buildDot(lastStreak);
      }
      return;
    }

    const data = await pingStreak();
    if (!data) return;

    const { streak, is_new_day, token } = data;
    currentStreak = streak;

    // Persist anon token if server returned one (shouldn't change but just in case)
    if (token) localStorage.setItem(TOKEN_KEY, token);

    // Save streak value for same-day revisits
    localStorage.setItem("sm_streak_val", String(streak));

    // Mark today as pinged
    markPingedToday();

    // Always show persistent dot
    buildDot(streak);

    // Only show toast on new streak day
    if (is_new_day) {
      buildToast(streak);
    }
  }

  // ── Run after DOM is ready ────────────────────────────────────────────────
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // ── Public API (optional — call from your auth code after login) ──────────
  window.ShivaMargStreak = {
    /**
     * Call this right after a successful login/signup:
     *   ShivaMargStreak.onLogin();
     * It will claim the anonymous streak and refresh.
     */
    onLogin: async function () {
      const anonToken = localStorage.getItem(TOKEN_KEY);
      if (anonToken) {
        await claimStreak(anonToken);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(LAST_PING_KEY);
      }
      // Re-run init so streak is refreshed after login
      await init();
    },
  };
})();
