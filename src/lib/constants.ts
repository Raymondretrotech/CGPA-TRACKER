import { Grade, Level } from "./types";

export const APP_NAME = "CGPA CUMULATIVE TRACKER";

export const LEVELS: Level[] = [100, 200, 300, 400, 500, 600, 700];

export const SEMESTER_LABELS: Record<1 | 2, string> = {
  1: "First Semester",
  2: "Second Semester",
};

export const GRADES: Grade[] = ["A", "B", "C", "D", "E", "F"];

export const GRADE_POINTS: Record<Grade, number> = {
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  E: 1,
  F: 0,
};

export const CREDIT_UNIT_OPTIONS = Array.from({ length: 10 }, (_, i) => i + 1);

export const TOTAL_POSSIBLE_SEMESTERS = LEVELS.length * 2;

export const MAX_CGPA = 5.0;

/** Kept as data so a different classification scale can be swapped in later. */
export interface ClassificationRule {
  min: number;
  max: number;
  label: string;
}

export const DEFAULT_CLASSIFICATION: ClassificationRule[] = [
  { min: 4.5, max: 5.0, label: "First Class" },
  { min: 3.5, max: 4.49, label: "Second Class Upper" },
  { min: 2.4, max: 3.49, label: "Second Class Lower" },
  { min: 1.5, max: 2.39, label: "Third Class" },
  { min: 1.0, max: 1.49, label: "Pass" },
  { min: 0.0, max: 0.99, label: "Fail" },
];

export function levelLabel(level: Level): string {
  return `${level}L`;
}
