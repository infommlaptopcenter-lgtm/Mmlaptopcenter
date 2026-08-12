"use client";

import { useEffect } from "react";

type BadgeNavigator = Navigator & {
  setAppBadge?: (contents?: number) => Promise<void>;
  clearAppBadge?: () => Promise<void>;
};

export default function OrderAppBadge() {
  useEffect(() => {
    const badgeNavigator = navigator as BadgeNavigator;
    if (!badgeNavigator.setAppBadge) return;

    const updateBadge = async () => {
      try {
        const response = await fetch("/api/admin/orders?status=pending&limit=1", { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json();
        const pending = Number(data.pagination?.total ?? 0);
        if (pending > 0) await badgeNavigator.setAppBadge?.(pending);
        else await badgeNavigator.clearAppBadge?.();
      } catch {
        // App badges are best-effort and are not supported by every mobile browser.
      }
    };

    void updateBadge();
    const interval = window.setInterval(() => void updateBadge(), 60_000);
    const onVisibilityChange = () => { if (document.visibilityState === "visible") void updateBadge(); };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return null;
}
