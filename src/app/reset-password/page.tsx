"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/AuthCard";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-navy-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <AuthCard title="Set a new password" subtitle="Choose a new password for your account.">
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</div>}
        <label className="block text-xs font-medium text-slate-600">
          New Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block text-xs font-medium text-slate-600">
          Confirm New Password
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClass}
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-navy-800 disabled:opacity-60"
        >
          {loading ? "Updating…" : "Update Password"}
        </button>
      </form>
    </AuthCard>
  );
}
