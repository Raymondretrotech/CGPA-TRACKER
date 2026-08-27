import { Course } from "@/lib/types";

interface CourseTableProps {
  courses: Course[];
  onEditCourse: (course: Course) => void;
}

export function CourseTable({ courses, onEditCourse }: CourseTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
            <th className="px-4 py-2.5 font-medium">Course</th>
            <th className="px-4 py-2.5 text-right font-medium">Unit</th>
            <th className="px-4 py-2.5 text-right font-medium">Grade</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {courses.map((course) => (
            <tr key={course.id} className="transition hover:bg-slate-50/70">
              <td className="px-4 py-2.5">
                <button
                  onClick={() => onEditCourse(course)}
                  className="font-medium text-brand-600 hover:underline"
                  title={course.courseTitle}
                >
                  {course.courseCode}
                </button>
                <p className="truncate text-xs text-slate-400 sm:hidden">{course.courseTitle}</p>
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums text-slate-600">
                {course.creditUnit}
              </td>
              <td className="px-4 py-2.5 text-right">
                <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-slate-100 px-1.5 text-xs font-semibold text-navy-900">
                  {course.grade}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
