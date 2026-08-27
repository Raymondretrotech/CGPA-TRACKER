"use client";

import { FormEvent, useEffect, useState } from "react";
import { Trash2, X } from "lucide-react";
import { CREDIT_UNIT_OPTIONS, GRADES, LEVELS, SEMESTER_LABELS, levelLabel } from "@/lib/constants";
import { Course, CourseDraft, Grade, Level, SemesterNumber } from "@/lib/types";

interface AddEditCourseModalProps {
  open: boolean;
  course: Course | null;
  defaultLevel: Level;
  defaultSemester: SemesterNumber;
  onClose: () => void;
  onSubmit: (draft: CourseDraft) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
}

const emptyForm = (level: Level, semester: SemesterNumber): CourseDraft => ({
  level,
  semester,
  courseCode: "",
  courseTitle: "",
  creditUnit: 3,
  grade: "A",
});

export function AddEditCourseModal({
  open,
  course,
  defaultLevel,
  defaultSemester,
  onClose,
  onSubmit,
  onDelete,
}: AddEditCourseModalProps) {
  const isEdit = Boolean(course);
  const [form, setForm] = useState<CourseDraft>(emptyForm(defaultLevel, defaultSemester));
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (course) {
      setForm({
        level: course.level,
        semester: course.semester,
        courseCode: course.courseCode,
        courseTitle: course.courseTitle,
        creditUnit: course.creditUnit,
        grade: course.grade,
      });
    } else {
      setForm(emptyForm(defaultLevel, defaultSemester));
    }
    setErrors([]);
  }, [open, course, defaultLevel, defaultSemester]);

  if (!open) return null;

  function validate(): string[] {
    const problems: string[] = [];
    if (!form.courseCode.trim()) problems.push("Course code is required.");
    if (!form.courseTitle.trim()) problems.push("Course title is required.");
    if (form.creditUnit < 1 || form.creditUnit > 10) problems.push("Credit unit must be between 1 and 10.");
    if (!GRADES.includes(form.grade)) problems.push("Select a valid grade.");
    return problems;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const problems = validate();
    if (problems.length > 0) {
      setErrors(problems);
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({ ...form, courseCode: form.courseCode.trim(), courseTitle: form.courseTitle.trim() });
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!course) return;
    setSubmitting(true);
    try {
      await onDelete(course.id);
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-navy-950/50 p-0 sm:items-center sm:p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 shadow-lg sm:rounded-2xl sm:p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-base font-bold text-navy-900">
              {isEdit ? "Edit course" : "Add course"}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Only the course details appear in the academic list.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        {errors.length > 0 && (
          <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
            <ul className="list-inside list-disc space-y-0.5">
              {errors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-medium text-slate-600">
              Level
              <select
                value={form.level}
                onChange={(e) => setForm((f) => ({ ...f, level: Number(e.target.value) as Level }))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-navy-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                {LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {levelLabel(level)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-xs font-medium text-slate-600">
              Semester
              <select
                value={form.semester}
                onChange={(e) =>
                  setForm((f) => ({ ...f, semester: Number(e.target.value) as SemesterNumber }))
                }
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-navy-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value={1}>{SEMESTER_LABELS[1]}</option>
                <option value={2}>{SEMESTER_LABELS[2]}</option>
              </select>
            </label>
          </div>

          <label className="block text-xs font-medium text-slate-600">
            Course code
            <input
              value={form.courseCode}
              onChange={(e) => setForm((f) => ({ ...f, courseCode: e.target.value }))}
              placeholder="CEE 553"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-navy-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </label>

          <label className="block text-xs font-medium text-slate-600">
            Course title
            <input
              value={form.courseTitle}
              onChange={(e) => setForm((f) => ({ ...f, courseTitle: e.target.value }))}
              placeholder="Computer Architecture"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-navy-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-medium text-slate-600">
              Credit unit
              <select
                value={form.creditUnit}
                onChange={(e) => setForm((f) => ({ ...f, creditUnit: Number(e.target.value) }))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-navy-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                {CREDIT_UNIT_OPTIONS.map((cu) => (
                  <option key={cu} value={cu}>
                    {cu}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-xs font-medium text-slate-600">
              Grade
              <select
                value={form.grade}
                onChange={(e) => setForm((f) => ({ ...f, grade: e.target.value as Grade }))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-navy-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                {GRADES.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-navy-800 disabled:opacity-60"
            >
              {isEdit ? "Save changes" : "+ Add course"}
            </button>
            {isEdit && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={submitting}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-red-200 px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
              >
                <Trash2 size={15} />
                <span className="hidden sm:inline">Delete</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
