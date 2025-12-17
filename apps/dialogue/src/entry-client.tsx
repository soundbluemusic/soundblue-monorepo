// @refresh reload
import { mount, StartClient } from "@solidjs/start/client";

mount(() => <StartClient />, document.getElementById("app")!);

// Register Service Worker for PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        if (import.meta.env.DEV) {
          console.log("SW registered:", registration.scope);
        }
      })
      .catch((error: Error) => {
        console.error("Service Worker registration failed:", error.message);
        // Dispatch custom event for app to handle offline unavailability
        window.dispatchEvent(
          new CustomEvent("sw-registration-failed", { detail: { error } })
        );
      });
  });
}
