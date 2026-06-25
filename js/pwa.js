(function () {
  "use strict";

  const API_BASE = "https://www.api.shivmarg.live";
  let installPrompt = null;
  let firebaseInitialized = false;

  function addButton(id, label, bottom, onClick) {
    if (document.getElementById(id)) return;
    const button = document.createElement("button");
    button.id = id;
    button.type = "button";
    button.textContent = label;
    button.style.cssText =
      `position:fixed;right:16px;bottom:${bottom}px;z-index:8000;border:0;` +
      "border-radius:999px;padding:11px 16px;background:#ff6f00;color:#fff;" +
      "font:600 14px system-ui;box-shadow:0 5px 20px rgba(0,0,0,.3);cursor:pointer";
    button.addEventListener("click", onClick);
    document.body.appendChild(button);
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) return resolve();
      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function configured() {
    const config = window.SHIVMARG_FIREBASE_CONFIG;
    return config && !Object.values(config).some((value) => String(value).startsWith("YOUR_"));
  }

  /* ── IN-APP NOTIFICATION TOAST ─────────────────── */
  function showInAppNotification(title, body, url) {
    const div = document.createElement("div");
    div.style.cssText =
      "position:fixed;bottom:1.5rem;left:1rem;right:1rem;max-width:360px;margin:auto;" +
      "z-index:9999;background:#fff;border:1.5px solid #ff6f00;border-radius:14px;" +
      "box-shadow:0 4px 20px rgba(0,0,0,.15);padding:.85rem 1rem;" +
      "display:flex;align-items:flex-start;gap:.75rem;animation:smSlideIn .3s ease;cursor:pointer";
    div.innerHTML = `
      <div style="font-size:1.4rem">🔔</div>
      <div style="flex:1">
        <div style="font-weight:700;font-size:.9rem;margin-bottom:.2rem">${title || "शिव मार्ग"}</div>
        <div style="font-size:.82rem;color:#666">${body || ""}</div>
      </div>
      <button onclick="this.parentElement.remove()" 
        style="background:none;border:none;cursor:pointer;font-size:1rem;color:#999">✕</button>
    `;
    if (url) div.addEventListener("click", (e) => {
      if (e.target.tagName === "BUTTON") return;
      window.location.href = url;
    });

    // Add animation keyframe once
    if (!document.getElementById("sm-notif-style")) {
      const style = document.createElement("style");
      style.id = "sm-notif-style";
      style.textContent = `@keyframes smSlideIn{from{transform:translateY(120%);opacity:0}to{transform:translateY(0);opacity:1}}`;
      document.head.appendChild(style);
    }

    document.body.appendChild(div);
    setTimeout(() => div.remove(), 5000);
  }

  /* ── LOAD FIREBASE + LISTEN FOR FOREGROUND MESSAGES ── */
  async function initFirebaseMessaging() {
    if (firebaseInitialized) return;
    firebaseInitialized = true;
    try {
      await loadScript("/firebase-config.js");
      if (!configured()) return;

      await loadScript("https://www.gstatic.com/firebasejs/11.0.1/firebase-app-compat.js");
      await loadScript("https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging-compat.js");


      if (!firebase.apps.length) firebase.initializeApp(window.SHIVMARG_FIREBASE_CONFIG);

      const messaging = firebase.messaging();

      // Foreground: show in-app toast when tab is open
      messaging.onMessage((payload) => {
        const { title, body, url } = payload.data || {};
        showInAppNotification(title, body, url);
      });

    } catch (e) {
      console.warn("[ShivMarg PWA] Firebase messaging init failed", e);
    }
  }

  async function enableNotifications(button = null) {
    try {
      if (button) {
        button.disabled = true;
        button.textContent = "Enabling...";
    }
      await loadScript("/firebase-config.js");
      if (!configured() || String(window.SHIVMARG_FIREBASE_VAPID_KEY).startsWith("YOUR_")) {
        throw new Error("Firebase web configuration is not set");
      }
      await loadScript("https://www.gstatic.com/firebasejs/11.0.1/firebase-app-compat.js");
      await loadScript("https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging-compat.js");

      if (!firebase.apps.length) firebase.initializeApp(window.SHIVMARG_FIREBASE_CONFIG);
      const permission = await Notification.requestPermission();
      if (permission !== "granted") throw new Error("Notification permission was not granted");

      const registration = await navigator.serviceWorker.ready;
      const token = await firebase.messaging().getToken({
        vapidKey: window.SHIVMARG_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: registration
      });
      if (!token) throw new Error("Firebase did not return a notification token");

      // Save token with auth header if logged in
      const authToken = localStorage.getItem("sm_token");
      const response = await fetch(`${API_BASE}/api/notifications/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { "Authorization": `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({
          token,
          platform: navigator.userAgentData?.platform || navigator.platform || "web"
        })
      });
      if (!response.ok) throw new Error("Could not save notification token");

      localStorage.setItem("sm_notifications_enabled", "1");
      localStorage.setItem("sm_fcm_token", token);

      // Start listening for foreground messages
      firebase.messaging().onMessage((payload) => {
        const { title, body, url } = payload.data || {};
        showInAppNotification(title, body, url);
      });

      if (button) {
          button.textContent = "✓ Notifications enabled";
          setTimeout(() => button.remove(), 1800);
      }
    } catch (error) {
      console.warn("[ShivMarg PWA]", error);
      if (button) {
      button.disabled = false;
      button.textContent = "Enable notifications";
    }
    }
  }
  

  async function init() {
    if (!("serviceWorker" in navigator)) return;
    try {
      await navigator.serviceWorker.register("/service-worker.js", { scope: "/" });
    } catch (error) {
      console.warn("[ShivMarg PWA] Service worker registration failed", error);
      return;
    }

    // If notifications already enabled → init Firebase for foreground messages
    if (Notification.permission === "granted") {
      initFirebaseMessaging();

      if (!localStorage.getItem("sm_fcm_token")) {
          console.log("Generating new FCM token...");
          await enableNotifications();
      }
  }

    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      installPrompt = event;
      addButton("sm-install-app", "Install ShivMarg", 16, async (clickEvent) => {
        const button = clickEvent.currentTarget;
        if (!installPrompt) return;
        await installPrompt.prompt();
        await installPrompt.userChoice;
        installPrompt = null;
        button.remove();
      });
    });

window.registerNotificationTokenAfterLogin = async function () {
    const authToken = localStorage.getItem("sm_token");
    const token = localStorage.getItem("sm_fcm_token");

    if (!authToken || !token) {
        console.log("No auth token or FCM token available");
        return;
    }

    try {
        const response = await fetch("https://www.api.shivmarg.live/api/notifications/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({
                token,
                platform: navigator.userAgentData?.platform || navigator.platform || "web"
            })
        });

        console.log("Notification token linked:", response.status);
    } catch (e) {
        console.error("Failed to register notification token", e);
    }
};

    if ("Notification" in window && Notification.permission === "default" &&
        localStorage.getItem("sm_notifications_enabled") !== "1") {
      addButton("sm-enable-notifications", "Enable notifications", 68, (event) => {
        enableNotifications(event.currentTarget);
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();