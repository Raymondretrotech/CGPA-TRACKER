"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthCard } from "@/components/AuthCard";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-navy-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    university: "",
    department: "",
    programme: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.fullName,
          university: form.university,
          department: form.department,
          programme: form.programme,
        },
      },
    });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      router.push("/");
      router.refresh();
    } else {
      setNotice("Check your email to confirm your account, then sign in.");
    }
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Track your GPA and CGPA from 100L to 700L."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brand-600 hover:underline">
            Sign In
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</div>}
        {notice && (
          <div className="rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-700">{notice}</div>
        )}

        <label className="block text-xs font-medium text-slate-600">
          Full Name
          <input
            required
            value={form.fullName}
            onChange={(e) => set("fullName", e.target.value)}
            className={inputClass}
          />
        </label>

        <label className="block text-xs font-medium text-slate-600">
          Email
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            className={inputClass}
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-xs font-medium text-slate-600">
            Password
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block text-xs font-medium text-slate-600">
            Confirm Password
            <input
              type="password"
              required
              value={form.confirmPassword}
              onChange={(e) => set("confirmPassword", e.target.value)}
              className={inputClass}
            />
          </label>
        </div>

        <label className="block text-xs font-medium text-slate-600">
          University
          <input
            required
            value={form.university}
            onChange={(e) => set("university", e.target.value)}
            className={inputClass}
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-xs font-medium text-slate-600">
            Department
            <input
              required
              value={form.department}
              onChange={(e) => set("department", e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block text-xs font-medium text-slate-600">
            Programme
            <input
              required
              value={form.programme}
              onChange={(e) => set("programme", e.target.value)}
              className={inputClass}
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-navy-800 disabled:opacity-60"
        >
          {loading ? "Creating account…" : "Create Account"}
        </button>
      </form>
    </AuthCard>
  );
}
