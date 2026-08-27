"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { AuthCard } from "@/components/AuthCard";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-navy-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo:
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback?next=/reset-password`
          : undefined,
    });
    setLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  }

  return (
    <AuthCard
      title="Forgot Password?"
      subtitle="Enter your email and we'll send you a reset link."
      footer={
        <Link href="/login" className="font-semibold text-brand-600 hover:underline">
          Back to Sign In
        </Link>
      }
    >
      {sent ? (
        <div className="rounded-lg bg-brand-50 px-3 py-3 text-sm text-brand-700">
          If an account exists for {email}, a password reset link is on its way.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</div>
          )}
          <label className="block text-xs font-medium text-slate-600">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="you@university.edu"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-navy-800 disabled:opacity-60"
          >
            {loading ? "Sending…" : "Send Reset Link"}
          </button>
        </form>
      )}
    </AuthCard>
  );
}
