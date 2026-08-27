"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiMail, FiLock, FiKey, FiArrowLeft, FiCheckCircle } from "react-icons/fi";

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
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password. Please check your credentials.");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("An error occurred during sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetRequest = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/admin/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      let data: { error?: string; message?: string } = {};
      try {
        data = await response.json();
      } catch {
        // Fallback for non-JSON responses
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset code. Please try again.");
      }

      setResetStep("confirm");
      setSuccessMessage(data.message || `A 6-digit verification code was sent to ${email.trim()}.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to send reset code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetConfirm = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match.");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/admin/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim(),
          newPassword,
        }),
      });

      let data: { error?: string; message?: string } = {};
      try {
        data = await response.json();
      } catch {
        // Fallback for non-JSON responses
      }

      if (!response.ok) {
        throw new Error(data.error || "Password reset failed. Please verify your OTP code.");
      }

      setResetMode(false);
      setResetStep("request");
      setPassword("");
      setOtp("");
      setNewPassword("");
      setConfirmNewPassword("");
      setSuccessMessage("Password successfully updated! You can now sign in with your new password.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Password reset failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fcf5e8] px-4 py-8">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-amber-100/60">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#0a0a0a]">MM Laptop Center Admin</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {resetMode
              ? resetStep === "request"
                ? "Reset your admin password"
                : "Enter verification code"
              : "Sign in to access your admin dashboard"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-start gap-2">
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-3.5 bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg flex items-start gap-2">
            <FiCheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {resetMode ? (
          resetStep === "request" ? (
            <form onSubmit={handleResetRequest} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Admin Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <FiMail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#d8a928] focus:border-[#d8a928] outline-none transition"
                    placeholder="info.mmlaptopcenter@gmail.com"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1.5">
                  We will send a 6-digit verification code to this email address.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-[#d8a928] text-white font-medium rounded-lg hover:bg-[#b8923f] focus:outline-none focus:ring-2 focus:ring-[#d8a928] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer shadow-sm"
              >
                {loading ? "Sending verification code..." : "Send Reset Code"}
              </button>

              <button
                type="button"
                className="w-full flex items-center justify-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition py-1"
                onClick={() => {
                  setResetMode(false);
                  setResetStep("request");
                  setError("");
                  setSuccessMessage("");
                }}
              >
                <FiArrowLeft className="h-4 w-4" />
                Back to sign in
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetConfirm} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Admin Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <FiMail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 bg-gray-50 text-gray-600 rounded-lg text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">6-Digit Verification Code</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <FiKey className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={otp}
                    onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm tracking-widest font-mono font-bold focus:ring-2 focus:ring-[#d8a928] focus:border-[#d8a928] outline-none transition"
                    placeholder="123456"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <FiLock className="h-5 w-5" />
                  </div>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#d8a928] focus:border-[#d8a928] outline-none transition"
                    placeholder="Enter new password (min 6 chars)"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <FiLock className="h-5 w-5" />
                  </div>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(event) => setConfirmNewPassword(event.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#d8a928] focus:border-[#d8a928] outline-none transition"
                    placeholder="Repeat new password"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-[#d8a928] text-white font-medium rounded-lg hover:bg-[#b8923f] focus:outline-none focus:ring-2 focus:ring-[#d8a928] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer shadow-sm"
              >
                {loading ? "Updating password..." : "Update Password"}
              </button>

              <div className="flex items-center justify-between text-sm pt-1">
                <button
                  type="button"
                  className="text-amber-700 hover:underline"
                  onClick={() => {
                    setResetStep("request");
                    setOtp("");
                    setError("");
                  }}
                >
                  Resend code
                </button>
                <button
                  type="button"
                  className="text-gray-600 hover:underline"
                  onClick={() => {
                    setResetMode(false);
                    setResetStep("request");
                    setError("");
                  }}
                >
                  Back to sign in
                </button>
              </div>
            </form>
          )
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Admin Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <FiMail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#d8a928] focus:border-[#d8a928] outline-none transition"
                  placeholder="info.mmlaptopcenter@gmail.com"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <button
                  type="button"
                  className="text-xs text-[#d8a928] hover:text-[#b8923f] font-medium transition"
                  onClick={() => {
                    setResetMode(true);
                    setResetStep("request");
                    setError("");
                    setSuccessMessage("");
                  }}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <FiLock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#d8a928] focus:border-[#d8a928] outline-none transition"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#d8a928] text-white font-medium rounded-lg hover:bg-[#b8923f] focus:outline-none focus:ring-2 focus:ring-[#d8a928] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer shadow-sm"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
