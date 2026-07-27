"use client";

import { useCallback, useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

type NavigatorWithStandalone = Navigator & { standalone?: boolean };

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(true);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      const installed =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as NavigatorWithStandalone).standalone === true;
      setIsInstalled(installed);
      setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));
    });

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      active = false;
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const installApp = useCallback(async () => {
    if (isIOS) {
      window.alert(
        "To install MM Laptop Center:\n\n1. Tap the Share button\n2. Tap “Add to Home Screen”\n3. Tap “Add”",
      );
      return;
    }

    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  }, [deferredPrompt, isIOS]);

  return {
    canInstall: !isInstalled && (Boolean(deferredPrompt) || isIOS),
    installApp,
    isInstalled,
  };
}
