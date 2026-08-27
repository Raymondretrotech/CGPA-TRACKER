import clsx from "clsx";
import { LEVELS, SEMESTER_LABELS, levelLabel } from "@/lib/constants";
import { Level, SemesterNumber } from "@/lib/types";

interface AcademicRecordsNavProps {
  selectedLevel: Level;
  selectedSemester: SemesterNumber;
  completionByLevel: Record<Level, number>;
  onSelectLevel: (level: Level) => void;
  onSelectSemester: (semester: SemesterNumber) => void;
}

export function AcademicRecordsNav({
  selectedLevel,
  selectedSemester,
  completionByLevel,
  onSelectLevel,
  onSelectSemester,
}: AcademicRecordsNavProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:p-5">
      <p className="font-display text-sm font-bold text-navy-900">Academic Records</p>
      <p className="text-xs text-slate-500">Choose your level, then choose the semester</p>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {LEVELS.map((level) => {
          const active = level === selectedLevel;
          return (
            <button
              key={level}
              onClick={() => onSelectLevel(level)}
              className={clsx(
                "flex min-w-[4.5rem] shrink-0 flex-col items-center rounded-xl border px-3 py-2 text-center transition",
                active
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              )}
            >
              <span className="text-sm font-semibold">{levelLabel(level)}</span>
              <span className="text-[11px] text-slate-400">{completionByLevel[level] ?? 0}/2</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold text-navy-900">{levelLabel(selectedLevel)}</p>
        <div className="mt-2 flex gap-2">
          {([1, 2] as SemesterNumber[]).map((semester) => {
            const active = semester === selectedSemester;
            return (
              <button
                key={semester}
                onClick={() => onSelectSemester(semester)}
                className={clsx(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition sm:text-sm",
                  active
                    ? "bg-navy-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {SEMESTER_LABELS[semester]}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
