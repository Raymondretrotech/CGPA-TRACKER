interface SummaryCardProps {
  cgpa: number;
  totalCreditUnits: number;
  totalQualityPoints: number;
  semestersCompleted: number;
  progress: number;
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-white/5 px-4 py-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-300">{label}</p>
      <p className="mt-1 font-display text-xl font-bold text-white sm:text-2xl">{value}</p>
    </div>
  );
}

export function SummaryCard({
  cgpa,
  totalCreditUnits,
  totalQualityPoints,
  semestersCompleted,
  progress,
}: SummaryCardProps) {
  return (
    <section className="rounded-2xl bg-navy-900 p-5 text-white shadow-card sm:p-8">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        <div className="max-w-xl">
          <span className="inline-flex items-center rounded-full bg-brand-500/20 px-3 py-1 text-[11px] font-medium text-brand-200">
            Accurate cumulative calculation
          </span>
          <h1 className="mt-3 font-display text-2xl font-bold leading-tight sm:text-3xl">
            Know your real CGPA.
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            Add your courses semester by semester. Every credit unit and quality point counts
            toward one true cumulative result.
          </p>
        </div>

        <div className="shrink-0 rounded-xl bg-white/10 px-6 py-4 text-center lg:text-right">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-300">
            Current CGPA
          </p>
          <p className="mt-1 font-display text-4xl font-bold tabular-nums sm:text-5xl">
            {cgpa.toFixed(2)}
            <span className="text-lg font-medium text-slate-300"> / 5.00</span>
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Total CU" value={totalCreditUnits} />
        <Stat label="Total QP" value={totalQualityPoints} />
        <Stat label="Semesters" value={semestersCompleted} />
        <Stat label="Progress" value={`${progress}%`} />
      </div>
    </section>
  );
}
