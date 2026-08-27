import { NotebookPen, Plus } from "lucide-react";

interface EmptyStateProps {
  onAddCourse: () => void;
}

export function EmptyState({ onAddCourse }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-400 shadow-card">
        <NotebookPen size={18} />
      </span>
      <p className="mt-3 text-sm font-semibold text-navy-900">No courses yet</p>
      <p className="mt-1 max-w-xs text-xs text-slate-500">
        No courses added yet. Tap Add course to begin this semester.
      </p>
      <button
        onClick={onAddCourse}
        className="mt-4 flex items-center gap-1.5 rounded-lg bg-navy-900 px-4 py-2 text-xs font-medium text-white transition hover:bg-navy-800"
      >
        <Plus size={14} />
        Add course
      </button>
    </div>
  );
}
