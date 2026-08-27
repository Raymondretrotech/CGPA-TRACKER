import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-6 flex items-center justify-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-900 text-white">
            <GraduationCap size={18} />
          </span>
          <span className="font-display text-sm font-bold tracking-tight text-navy-900">
            {APP_NAME}
          </span>
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
          <h1 className="font-display text-lg font-bold text-navy-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          <div className="mt-5">{children}</div>
        </div>

        {footer && <div className="mt-4 text-center text-sm text-slate-500">{footer}</div>}
      </div>
    </div>
  );
}
