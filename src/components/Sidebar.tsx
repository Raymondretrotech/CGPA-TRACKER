import { MAX_CGPA } from "@/lib/constants";
import { Stats } from "@/lib/calculations";

interface SidebarProps {
  cgpa: number;
  classification: string;
  totalCreditUnits: number;
  totalQualityPoints: number;
  currentSemesterStats: Stats;
}

export function Sidebar({
  cgpa,
  classification,
  totalCreditUnits,
  totalQualityPoints,
  currentSemesterStats,
}: SidebarProps) {
  const progressPct = Math.min(100, Math.max(0, (cgpa / MAX_CGPA) * 100));

  return (
    <aside className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Cumulative CGPA
        </p>
        <p className="mt-1 font-display text-3xl font-bold tabular-nums text-navy-900">
          {cgpa.toFixed(2)}
          <span className="text-base font-medium text-slate-400"> / 5.00</span>
        </p>
        <p className="mt-1 text-sm font-medium text-brand-600">{classification}</p>

        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-brand-500 transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-slate-400">Total CU</p>
            <p className="text-lg font-bold text-navy-900">{totalCreditUnits}</p>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-slate-400">Total QP</p>
            <p className="text-lg font-bold text-navy-900">{totalQualityPoints}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <p className="font-display text-sm font-bold text-navy-900">This semester</p>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-slate-500">Credit units</dt>
            <dd className="font-semibold text-navy-900">{currentSemesterStats.totalCreditUnits}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-slate-500">Quality points</dt>
            <dd className="font-semibold text-navy-900">{currentSemesterStats.totalQualityPoints}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-slate-500">Semester GPA</dt>
            <dd className="font-semibold text-navy-900">{currentSemesterStats.gpa.toFixed(2)}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <p className="font-display text-sm font-bold text-navy-900">The formula</p>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
          No averaging semester GPAs. The calculator uses the actual credit-weighted quality
          points from every semester.
        </p>
        <p className="mt-3 rounded-lg bg-navy-900 px-3 py-2 text-center font-display text-sm font-semibold tracking-tight text-white">
          CGPA = Total QP ÷ Total CU
        </p>
      </div>
    </aside>
  );
}
