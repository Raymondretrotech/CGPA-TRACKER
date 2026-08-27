"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthCard } from "@/components/AuthCard";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-navy-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <AuthCard
      title="Sign in"
      subtitle="Access your saved academic records."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-brand-600 hover:underline">
            Create Account
          </Link>
        </>
      }
    >
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
        <label className="block text-xs font-medium text-slate-600">
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            placeholder="••••••••"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-navy-800 disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>
        <div className="text-center">
          <Link href="/forgot-password" className="text-xs font-medium text-slate-500 hover:text-brand-600">
            Forgot Password?
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}
