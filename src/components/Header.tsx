"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, GraduationCap, LogOut, Save, User as UserIcon } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { Profile } from "@/lib/types";

interface HeaderProps {
  profile: Profile | null;
  isAuthenticated: boolean;
  saving: boolean;
  onSaveAndPdf: () => void;
  onLogout: () => void;
}

export function Header({ profile, isAuthenticated, saving, onSaveAndPdf, onLogout }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-900 text-white">
            <GraduationCap size={18} />
          </span>
          <div className="leading-tight">
            <p className="font-display text-sm font-bold tracking-tight text-navy-900 sm:text-base">
              {APP_NAME}
            </p>
            <p className="text-[11px] text-slate-500">Accurate cumulative calculator</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSaveAndPdf}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-navy-900 shadow-card transition hover:bg-slate-50 disabled:opacity-60 sm:text-sm"
          >
            <Save size={15} />
            <span className="hidden sm:inline">Save &amp; PDF</span>
          </button>

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-lg bg-navy-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-navy-800 sm:text-sm"
              >
                <UserIcon size={15} />
                <span className="hidden max-w-[9rem] truncate sm:inline">
                  {profile?.full_name || "My Account"}
                </span>
                <ChevronDown size={14} />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
                    <p className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      My Account
                    </p>
                    <div className="mt-2 space-y-1 px-1 text-sm">
                      <p className="font-medium text-navy-900">{profile?.full_name || "—"}</p>
                      <p className="text-slate-500">{profile?.email}</p>
                    </div>
                    <div className="mt-3 space-y-1 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                      <p>
                        <span className="text-slate-400">University: </span>
                        {profile?.university || "—"}
                      </p>
                      <p>
                        <span className="text-slate-400">Department: </span>
                        {profile?.department || "—"}
                      </p>
                      <p>
                        <span className="text-slate-400">Programme: </span>
                        {profile?.programme || "—"}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onLogout();
                      }}
                      className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut size={14} />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-navy-900 px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-navy-800 sm:text-sm"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
