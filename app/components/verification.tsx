"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function VerifyEmail() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const resendEmail = async () => {
    if (!email || loading || countdown > 0) return;

    setLoading(true);

    const supabase = createClient();

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Verification email sent successfully!");

    // 60 seconds cooldown
    setCountdown(60);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button
        onClick={resendEmail}
        disabled={loading || countdown > 0}
      >
        {loading
          ? "Sending..."
          : countdown > 0
          ? `Resend in ${countdown}s`
          : "Resend Verification Email"}
      </button>
    </div>
  );
}