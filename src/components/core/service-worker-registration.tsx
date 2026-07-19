"use client";

if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/service-worker.js").catch(() => {});
  });
}

export default function ServiceWorkerRegistration() {
  return null;
}
