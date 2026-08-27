import { Plus } from "lucide-react";
import { SEMESTER_LABELS, levelLabel } from "@/lib/constants";
import { Course, Level, SemesterNumber } from "@/lib/types";
import { CourseTable } from "./CourseTable";
import { EmptyState } from "./EmptyState";

interface CurrentSemesterSectionProps {
  level: Level;
  semester: SemesterNumber;
  courses: Course[];
  onAddCourse: () => void;
  onEditCourse: (course: Course) => void;
}

export function CurrentSemesterSection({
  level,
  semester,
  courses,
  onAddCourse,
  onEditCourse,
}: CurrentSemesterSectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:p-5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        Current Semester
      </p>
      <p className="font-display text-base font-bold text-navy-900">
        {levelLabel(level)} <span className="font-medium text-slate-500">{SEMESTER_LABELS[semester]}</span>
      </p>
      <p className="mt-1 text-xs text-slate-500">
        Your courses stay compact. Tap any course code to view or edit its details.
      </p>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-navy-900">Courses</p>
        {courses.length > 0 && (
          <button
            onClick={onAddCourse}
            className="flex items-center gap-1.5 rounded-lg bg-navy-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-navy-800"
          >
            <Plus size={14} />
            Add course
          </button>
        )}
      </div>

      <div className="mt-3">
        {courses.length === 0 ? (
          <EmptyState onAddCourse={onAddCourse} />
        ) : (
          <CourseTable courses={courses} onEditCourse={onEditCourse} />
        )}
      </div>
    </section>
  );
}
