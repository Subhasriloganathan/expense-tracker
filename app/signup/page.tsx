
"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // -------------------------
  // SIGN UP
  // -------------------------
  const handleSignup = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    // Prevent double click
    if (loading || signupSuccess) {
      return;
    }

    setError("");
    setMessage("");

    const cleanEmail = email.trim();

    // Validation
    if (!cleanEmail || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: signupError } =
        await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            emailRedirectTo:
              `${window.location.origin}/auth/callback`,
          },
        });

      if (signupError) {
        setError(signupError.message);
        return;
      }

      if (data.user) {
        setSignupSuccess(true);

        setMessage(
          "Account created successfully! Please check your email and verify your account."
        );

        setPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // RESEND VERIFICATION EMAIL
  // -------------------------
  const handleResend = async () => {
    if (loading || resendCooldown > 0 || !email.trim()) {
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const { error: resendError } =
        await supabase.auth.resend({
          type: "signup",
          email: email.trim(),
          options: {
            emailRedirectTo:
              `${window.location.origin}/auth/callback`,
          },
        });

      if (resendError) {
        setError(resendError.message);
        return;
      }

      setMessage("Verification email sent successfully!");

      // Start 60 second cooldown
      setResendCooldown(60);

      const timer = setInterval(() => {
        setResendCooldown((previous) => {
          if (previous <= 1) {
            clearInterval(timer);
            return 0;
          }

          return previous - 1;
        });
      }, 1000);
    } catch (err) {
      console.error("Resend error:", err);
      setError("Unable to resend verification email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-10">

      {/* Background Glow */}
      <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />

      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-purple-600/20 blur-3xl" />

      {/* Card */}
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-80px)] max-w-md items-center justify-center">

        <div className="w-full rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">

          {/* Logo */}
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-2xl text-white shadow-lg shadow-blue-600/20">
            ✦
          </div>

          {/* Title */}
          <h1 className="text-center text-3xl font-bold text-white">
            Create Account
          </h1>

          <p className="mb-8 mt-2 text-center text-sm text-slate-400">
            Create your account to get started
          </p>

          {!signupSuccess ? (
            <form
              onSubmit={handleSignup}
              className="space-y-5"
            >

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Email Address
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="Enter your email"
                  disabled={loading}
                  autoComplete="email"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Enter your password"
                  disabled={loading}
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Confirm Password
                </label>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  placeholder="Confirm your password"
                  disabled={loading}
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  ⚠️ {error}
                </div>
              )}

              {/* Create Account */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:from-blue-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
          ) : (
            /* Verification Section */
            <div className="space-y-5">

              {/* Success */}
              <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-5 text-center">
                <div className="mb-3 text-4xl">
                  📧
                </div>

                <h2 className="text-lg font-semibold text-green-300">
                  Check Your Email
                </h2>

                <p className="mt-2 break-all text-sm leading-6 text-green-200/80">
                  We sent a verification link to:
                </p>

                <p className="mt-1 break-all text-sm font-semibold text-white">
                  {email}
                </p>
              </div>

              {/* Message */}
              {message && (
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-center text-sm text-blue-300">
                  {message}
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  ⚠️ {error}
                </div>
              )}

              {/* Resend */}
              <button
                type="button"
                onClick={handleResend}
                disabled={
                  loading || resendCooldown > 0
                }
                className="w-full rounded-xl border border-blue-500/30 bg-blue-500/10 py-3 text-sm font-semibold text-blue-300 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Sending..."
                  : resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : "Resend Verification Email"}
              </button>

              {/* Login */}
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-semibold text-white transition hover:from-blue-500 hover:to-indigo-500"
              >
                Go to Login
              </button>
            </div>
          )}

          {/* Login Link */}
          {!signupSuccess && (
            <div className="mt-7 text-center">
              <p className="text-sm text-slate-400">
                Already have an account?
              </p>

              <button
                type="button"
                onClick={() => router.push("/login")}
                disabled={loading}
                className="mt-2 font-semibold text-blue-400 transition hover:text-blue-300 disabled:opacity-50"
              >
                Login
              </button>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
