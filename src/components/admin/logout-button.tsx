"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { FiLogOut } from "react-icons/fi";

export function LogoutButton({ compact = false }: { compact?: boolean }) {
  const [loading, setLoading] = useState(false);

  async function logout() {
    if (loading) return;
    setLoading(true);
    try {
      await signOut({ redirect: false });
      window.location.assign("/admin/login");
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-lg bg-red-500/20 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-500/30 disabled:cursor-wait disabled:opacity-60"
    >
      <FiLogOut className="h-4 w-4" />
      <span className={compact ? "hidden sm:inline" : undefined}>{loading ? "Signing out..." : "Logout"}</span>
    </button>
  );
}
