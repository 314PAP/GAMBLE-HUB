/**
 * Service Worker registration and update notification banner.
 */

export function showUpdateNotification() {
  const existing = document.getElementById("update-notification");
  if (existing) return;

  const notification = document.createElement("div");
  notification.id = "update-notification";
  notification.className =
    "fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-xl bg-neon-purple text-white font-bold text-sm shadow-lg flex items-center gap-3";
  notification.innerHTML = `
    <span>🎮</span>
    <span>Nová verze k dispozici</span>
    <button id="btn-sw-reload" class="ml-2 px-3 py-1 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-xs">
      Obnovit
    </button>
    <button onclick="this.closest('#update-notification').remove()" class="ml-1 text-white/70 hover:text-white" aria-label="Zavřít">
      ✕
    </button>
  `;
  document.body.appendChild(notification);

  const reloadBtn = document.getElementById("btn-sw-reload");
  if (reloadBtn) {
    reloadBtn.addEventListener("click", async () => {
      if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg && reg.waiting) {
          let reloaded = false;
          const doReload = () => {
            if (!reloaded) {
              reloaded = true;
              window.location.reload();
            }
          };
          navigator.serviceWorker.addEventListener("controllerchange", doReload, { once: true });
          reg.waiting.postMessage({ type: "SKIP_WAITING" });
          setTimeout(doReload, 500);
          return;
        }
      }
      window.location.reload();
    });
  }

  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 30000);
}

export function initServiceWorker() {
  if (!("serviceWorker" in navigator) || import.meta.env.DEV) return;

  const registerSW = async () => {
    try {
      const existingRegistrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of existingRegistrations) {
        if (registration.scope !== `${window.location.origin}/`) {
          await registration.unregister();
        }
      }

      const swPath = `${import.meta.env.BASE_URL}sw.js`;
      const baseUrl = import.meta.env.BASE_URL || "/";
      const registration = await navigator.serviceWorker.register(swPath, { scope: baseUrl });

      const checkForUpdates = async () => {
        try {
          const ready = await navigator.serviceWorker.ready;
          await ready.update();
        } catch (e) {
          console.warn("SW update check failed:", e);
        }
      };

      setTimeout(checkForUpdates, 5000);
      setInterval(checkForUpdates, 4 * 60 * 60 * 1000);

      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              showUpdateNotification();
            }
          });
        }
      });
    } catch (err) {
      console.warn("Service worker registration failed:", err);
    }
  };

  if (document.readyState === "complete") {
    registerSW();
  } else {
    window.addEventListener("load", registerSW);
  }
}
