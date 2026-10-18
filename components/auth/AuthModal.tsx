"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowRight,
  X,
  Shield,
  LogOut,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { user, profile, signOut } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset form errors when switching modes or closing
  useEffect(() => {
    setErrorMsg(null);
    setSuccessMsg(null);
  }, [mode, isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      onClose();
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const cleanName = displayName.trim() || email.split("@")[0];

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: cleanName,
          name: cleanName,
        },
      },
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else if (data.session) {
      // Auto signed in
      onClose();
    } else {
      // Confirmation required or ready
      setSuccessMsg("Account created successfully! You can now sign in.");
      setMode("signin");
      setPassword("");
      setConfirmPassword("");
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-fade-in overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-[440px] my-auto p-7 sm:p-9 rounded-[28px] bg-card border border-line shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-9 h-9 rounded-full border border-line flex items-center justify-center text-mute hover:text-ink hover:border-ink transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* If user is ALREADY logged in */}
        {user ? (
          <div className="text-center py-2">
            <div className="w-16 h-16 rounded-full bg-lime text-lime-ink font-bold text-[24px] flex items-center justify-center mx-auto mb-4 border border-line">
              {profile?.avatarInitial || "P"}
            </div>
            <h2 className="font-display font-bold text-[24px] text-ink mb-1">
              {profile?.displayName || "Player"}
            </h2>
            <p className="font-mono text-[13px] text-mute mb-6">{user.email}</p>

            <div className="p-4 rounded-[18px] bg-surface border border-line font-mono text-[13px] text-ink flex items-center justify-around mb-6">
              <div className="flex items-center gap-1.5 text-acc">
                <Shield className="w-4 h-4" />
                <span>Account Verified</span>
              </div>
            </div>

            <button
              onClick={async () => {
                await signOut();
                onClose();
              }}
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-full border border-line text-error font-semibold text-[15px] hover:bg-surface transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          /* Sign In / Sign Up Form */
          <div>
            {/* Mode Switcher Tabs */}
            <div className="flex items-center p-1 rounded-full bg-surface border border-line mb-6 max-w-[280px]">
              <button
                type="button"
                onClick={() => setMode("signin")}
                className={`flex-1 py-1.5 rounded-full font-mono text-[12px] font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  mode === "signin"
                    ? "bg-ink text-surface shadow-xs"
                    : "text-mute hover:text-ink"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`flex-1 py-1.5 rounded-full font-mono text-[12px] font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  mode === "signup"
                    ? "bg-ink text-surface shadow-xs"
                    : "text-mute hover:text-ink"
                }`}
              >
                Sign Up
              </button>
            </div>

            <h2 className="font-display font-bold text-[26px] text-ink leading-tight mb-2">
              {mode === "signin" ? "Welcome back" : "Create an account"}
            </h2>
            <p className="font-body text-[13.5px] text-mute leading-relaxed mb-6">
              {mode === "signin"
                ? "Sign in to keep your streak, sync scores, and claim rewards."
                : "Join Mind Break to save your daily streaks across devices."}
            </p>

            {/* Success message */}
            {successMsg && (
              <div className="flex items-center gap-2 p-3.5 rounded-[14px] bg-lime/20 border border-lime text-ink text-[13px] font-body mb-4 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-lime-ink shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Error message */}
            {errorMsg && (
              <div className="p-3.5 rounded-[14px] bg-error-bg/30 border border-error/30 text-error text-[13px] font-body mb-4 animate-fade-in">
                {errorMsg}
              </div>
            )}

            <form
              onSubmit={mode === "signin" ? handleSignIn : handleSignUp}
              className="space-y-3.5"
            >
              {/* Display Name (Only in Sign Up mode) */}
              {mode === "signup" && (
                <div>
                  <label
                    htmlFor="name-input"
                    className="block font-mono text-[11px] font-semibold text-mute uppercase tracking-wider mb-1"
                  >
                    Your Name
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-mute" />
                    <input
                      id="name-input"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Alex Taylor"
                      className="w-full pl-11 pr-4 py-3 rounded-[14px] bg-surface border border-line text-ink font-body text-[14px] focus:outline-none focus:border-ink transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Email Input */}
              <div>
                <label
                  htmlFor="email-input"
                  className="block font-mono text-[11px] font-semibold text-mute uppercase tracking-wider mb-1"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-mute" />
                  <input
                    id="email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@college.edu or name@work.com"
                    className="w-full pl-11 pr-4 py-3 rounded-[14px] bg-surface border border-line text-ink font-body text-[14px] focus:outline-none focus:border-ink transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password-input"
                  className="block font-mono text-[11px] font-semibold text-mute uppercase tracking-wider mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-mute" />
                  <input
                    id="password-input"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === "signup" ? "Min 6 characters" : "••••••••"}
                    className="w-full pl-11 pr-11 py-3 rounded-[14px] bg-surface border border-line text-ink font-body text-[14px] focus:outline-none focus:border-ink transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-mute hover:text-ink cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password (Only in Sign Up mode) */}
              {mode === "signup" && (
                <div>
                  <label
                    htmlFor="confirm-password-input"
                    className="block font-mono text-[11px] font-semibold text-mute uppercase tracking-wider mb-1"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-mute" />
                    <input
                      id="confirm-password-input"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full pl-11 pr-4 py-3 rounded-[14px] bg-surface border border-line text-ink font-body text-[14px] focus:outline-none focus:border-ink transition-colors"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 mt-4 py-3.5 rounded-full bg-acc text-ink font-bold text-[15px] shadow-sm hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
              >
                <span>
                  {loading
                    ? mode === "signin"
                      ? "Signing in..."
                      : "Creating account..."
                    : mode === "signin"
                    ? "Sign In"
                    : "Create Account"}
                </span>
                <ArrowRight className="w-4 h-4 stroke-[2.2]" />
              </button>
            </form>

            {/* Toggle Helper */}
            <div className="mt-5 text-center">
              {mode === "signin" ? (
                <p className="font-body text-[13px] text-mute">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className="font-semibold text-ink underline hover:text-acc transition-colors cursor-pointer"
                  >
                    Sign up now
                  </button>
                </p>
              ) : (
                <p className="font-body text-[13px] text-mute">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signin")}
                    className="font-semibold text-ink underline hover:text-acc transition-colors cursor-pointer"
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

