"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiMail, FiLock, FiEye, FiEyeOff, FiSun, FiMoon } from "react-icons/fi";
import { GiPoolTriangle } from "react-icons/gi";
import { saveUser, getStoredUser } from "@/lib/storage/auth.storage";
import { useTheme } from "@/context/ThemeContext";
import type { ClubUser } from "@/types";

// ================================================================
// DUMMY ACCOUNTS — Replace with real API call in Phase 2
// Phase 2 → POST /api/auth/login  { email, password }
// ================================================================
const DUMMY_ACCOUNTS: ClubUser[] = [
  {
    email: "ali@club.com",
    club_name: "Ali's Snooker Club",
    owner_name: "Ali Khan",
    location: "Karachi",
    tables: 8,
  },
  {
    email: "hassan@club.com",
    club_name: "Hassan's Snooker Hall",
    owner_name: "Hassan Ali",
    location: "Lahore",
    tables: 10,
  },
];

const DUMMY_PASSWORD = "password123";

// ================================================================
// LOGIN PAGE
// ================================================================
export default function LoginPage() {
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Avoid hydration flash
  useEffect(() => {
    setMounted(true);
    // If already logged in → go to dashboard
    const user = getStoredUser();
    if (user) router.push("/dashboard");
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulate network delay
    // PHASE 2 → replace with: const res = await fetch('/api/auth/login', { method:'POST', body: JSON.stringify({ email, password }) })
    await new Promise((res) => setTimeout(res, 900));

    const account = DUMMY_ACCOUNTS.find((a) => a.email === email);

    if (account && password === DUMMY_PASSWORD) {
      saveUser(account);
      router.push("/dashboard");
    } else {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <main className="relative min-h-screen bg-theme-primary flex items-center justify-center p-4 overflow-hidden">
      {/* ── Animated background blobs ─────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="
          absolute -top-40 -left-40 w-96 h-96 rounded-full
          bg-blue-500/8 dark:bg-blue-500/10
          blur-3xl animate-pulse
        "
        />
        <div
          className="
          absolute -bottom-40 -right-40 w-96 h-96 rounded-full
          bg-blue-700/8 dark:bg-blue-700/10
          blur-3xl animate-pulse
        "
          style={{ animationDelay: "1s" }}
        />
        <div
          className="
          absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-64 h-64 rounded-full
          bg-indigo-500/5 dark:bg-indigo-500/8
          blur-3xl animate-pulse
        "
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* ── Theme toggle (top right) ──────────────────────── */}
      <button
        onClick={toggleTheme}
        className="
          absolute top-5 right-5 p-2.5 rounded-xl
          bg-theme-card border border-theme
          text-theme-secondary hover:text-theme-primary
          transition-all duration-200 hover:scale-105
          shadow-sm
        "
        title="Toggle theme"
      >
        {isDark ? (
          <FiSun className="text-base text-yellow-400" />
        ) : (
          <FiMoon className="text-base text-blue-500" />
        )}
      </button>

      {/* ── Login card ───────────────────────────────────── */}
      <div className="relative w-full max-w-md animate-fade-in-scale">
        {/* Glowing border effect */}
        <div
          className="
          absolute -inset-px rounded-2xl
          bg-gradient-to-br from-blue-500/20 via-transparent to-blue-700/20
          dark:from-blue-500/30 dark:to-blue-700/30
          blur-sm
        "
        />

        <div
          className="
          relative
          bg-white/90 dark:bg-slate-900/90
          backdrop-blur-xl
          border border-slate-200 dark:border-slate-700/60
          rounded-2xl p-8 shadow-2xl
        "
        >
          {/* ── Logo & title ─────────────────────────────── */}
          <div className="text-center mb-8">
            {/* Logo icon with ring */}
            <div className="relative inline-flex mb-5">
              <div
                className="
                w-16 h-16 rounded-2xl flex items-center justify-center
                bg-gradient-to-br from-blue-500 to-blue-700
                shadow-xl shadow-blue-500/30
              "
              >
                <GiPoolTriangle className="text-white text-3xl" />
              </div>
              {/* Pulse ring */}
              <span
                className="
                absolute inset-0 rounded-2xl
                border-2 border-blue-500/40
                animate-ping
              "
                style={{ animationDuration: "2s" }}
              />
            </div>

            <h1 className="text-2xl font-bold text-theme-primary">
              Welcome Back
            </h1>
            <p className="text-theme-secondary text-sm mt-1.5">
              Login to your club dashboard
            </p>
          </div>

          {/* ── Error message ─────────────────────────────── */}
          {error && (
            <div
              className="
              mb-5 px-4 py-3 rounded-xl text-sm
              bg-red-500/10 border border-red-500/30
              text-red-500 dark:text-red-400
              animate-fade-in flex items-center gap-2
            "
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              {error}
            </div>
          )}

          {/* ── Form ─────────────────────────────────────── */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-theme-primary mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <FiMail
                  className="
                  absolute left-3.5 top-1/2 -translate-y-1/2
                  text-theme-muted text-base
                "
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@club.com"
                  required
                  className="
                    w-full pl-10 pr-4 py-3 rounded-xl text-sm
                    bg-slate-50 dark:bg-slate-800/50
                    border border-slate-200 dark:border-slate-700/50
                    text-theme-primary placeholder:text-theme-muted
                    focus:outline-none focus:border-blue-500
                    focus:ring-2 focus:ring-blue-500/15
                    transition-all duration-200
                  "
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-theme-primary mb-1.5">
                Password
              </label>
              <div className="relative">
                <FiLock
                  className="
                  absolute left-3.5 top-1/2 -translate-y-1/2
                  text-theme-muted text-base
                "
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="
                    w-full pl-10 pr-12 py-3 rounded-xl text-sm
                    bg-slate-50 dark:bg-slate-800/50
                    border border-slate-200 dark:border-slate-700/50
                    text-theme-primary placeholder:text-theme-muted
                    focus:outline-none focus:border-blue-500
                    focus:ring-2 focus:ring-blue-500/15
                    transition-all duration-200
                  "
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="
                    absolute right-3.5 top-1/2 -translate-y-1/2
                    text-theme-muted hover:text-theme-primary
                    transition-colors duration-200
                  "
                >
                  {showPassword ? (
                    <FiEyeOff className="text-base" />
                  ) : (
                    <FiEye className="text-base" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full py-3 rounded-xl text-sm font-semibold
                text-white transition-all duration-200
                bg-gradient-to-r from-blue-600 to-blue-700
                hover:from-blue-500 hover:to-blue-600
                disabled:opacity-60 disabled:cursor-not-allowed
                shadow-lg shadow-blue-500/25
                hover:shadow-xl hover:shadow-blue-500/30
                hover:-translate-y-0.5 active:translate-y-0
                flex items-center justify-center gap-2 mt-2
              "
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login to Dashboard"
              )}
            </button>
          </form>

          {/* ── Test credentials ──────────────────────────── */}
          <div
            className="
            mt-6 p-4 rounded-xl
            bg-blue-500/5 dark:bg-blue-500/8
            border border-blue-500/15 dark:border-blue-500/20
          "
          >
            <p className="text-blue-600 dark:text-blue-400 text-xs font-semibold mb-2.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Test Credentials
            </p>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-theme-muted text-xs">Email</span>
                <span className="text-theme-primary text-xs font-mono font-medium">
                  ali@club.com
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-theme-muted text-xs">Password</span>
                <span className="text-theme-primary text-xs font-mono font-medium">
                  password123
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer note ──────────────────────────────────── */}
        <p className="text-center text-theme-muted text-sm mt-5">
          Access is granted after purchasing a subscription
        </p>
      </div>
    </main>
  );
}
