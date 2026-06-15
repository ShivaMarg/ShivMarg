(function () {
  "use strict";

  const API_BASE = "https://www.api.shivmarg.live";
  let installPrompt = null;

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

  async function enableNotifications(button) {
    try {
      button.disabled = true;
      button.textContent = "Enabling...";
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

      const response = await fetch(`${API_BASE}/api/notifications/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          platform: navigator.userAgentData?.platform || navigator.platform || "web"
        })
      });
      if (!response.ok) throw new Error("Could not save notification token");
      localStorage.setItem("sm_notifications_enabled", "1");
      button.textContent = "Notifications enabled";
      setTimeout(() => button.remove(), 1800);
    } catch (error) {
      console.warn("[ShivMarg PWA]", error);
      button.disabled = false;
      button.textContent = "Enable notifications";
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
