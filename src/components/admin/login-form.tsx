"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiMail, FiLock, FiKey } from "react-icons/fi";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetMode, setResetMode] = useState(false);
  const [resetStep, setResetStep] = useState<"request" | "confirm">("request");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) setError("Invalid email or password");
      else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const endpoint = resetStep === "request" ? "/api/admin/password-reset/request" : "/api/admin/password-reset/confirm";
      const body = resetStep === "request" ? { email } : { email, otp, newPassword };
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Password reset failed");
      if (resetStep === "request") setResetStep("confirm");
      else {
        setResetMode(false);
        setResetStep("request");
        setPassword("");
        setOtp("");
        setNewPassword("");
        setError("Password updated. You can now sign in.");
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fcf5e8]">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#0a0a0a]">MM Laptop Center Admin</h1>
          <p className="text-gray-500 mt-2">Sign in to your account</p>
        </div>
        {resetMode ? <form onSubmit={handleReset} className="space-y-6">
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="h-5 w-5 text-gray-400" />
              </div>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d8a928] focus:border-transparent" placeholder="admin@example.com" required />
            </div>
          </div>
          {resetStep === "confirm" && <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email code</label>
            <div className="relative"><FiKey className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" /><input inputMode="numeric" value={otp} onChange={(event) => setOtp(event.target.value)} className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg" placeholder="6-digit code" required /></div>
          </div>}
          {resetStep === "confirm" && <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New password</label>
            <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-lg" minLength={6} required />
          </div>}
          {resetStep === "request" && <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-gray-400" />
              </div>
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d8a928] focus:border-transparent" placeholder="••••••••" required />
            </div>
          </div>}
          <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-[#d8a928] text-white font-medium rounded-lg hover:bg-[#b8923f] focus:outline-none focus:ring-2 focus:ring-[#d8a928] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Please wait..." : resetStep === "request" ? "Send reset code" : "Update password"}
          </button>
          <button type="button" className="w-full text-sm text-gray-600 hover:underline" onClick={() => { setResetMode(false); setResetStep("request"); setError(""); }}>Back to sign in</button>
        </form> : <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Email</label><div className="relative"><FiMail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg" required /></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Password</label><div className="relative"><FiLock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" /><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg" required /></div></div>
          <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-[#d8a928] text-white font-medium rounded-lg disabled:opacity-50">{loading ? "Signing in..." : "Sign In"}</button>
          <button type="button" className="w-full text-sm text-gray-600 hover:underline" onClick={() => { setResetMode(true); setError(""); }}>Forgot password?</button>
        </form>}
      </div>
    </div>
  );
}
