import { DEFAULT_CLASSIFICATION, ClassificationRule, GRADE_POINTS } from "./constants";
import { Course, Grade } from "./types";

/** Rounds to 2 decimal places for display only — never round before this step. */
export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateGradePoint(grade: Grade): number {
  return GRADE_POINTS[grade];
}

export function calculateQualityPoint(creditUnit: number, grade: Grade): number {
  return creditUnit * calculateGradePoint(grade);
}

export interface Stats {
  totalCreditUnits: number;
  totalQualityPoints: number;
  gpa: number;
}

const EMPTY_STATS: Stats = { totalCreditUnits: 0, totalQualityPoints: 0, gpa: 0 };

/**
 * Credit-weighted GPA over any set of courses: total quality points over
 * total credit units, rounded only at the very end.
 */
export function calculateSemesterStats(courses: Pick<Course, "creditUnit" | "qualityPoint">[]): Stats {
  if (courses.length === 0) return EMPTY_STATS;
  const totalCreditUnits = courses.reduce((sum, c) => sum + c.creditUnit, 0);
  const totalQualityPoints = courses.reduce((sum, c) => sum + c.qualityPoint, 0);
  const gpa = totalCreditUnits > 0 ? totalQualityPoints / totalCreditUnits : 0;
  return { totalCreditUnits, totalQualityPoints, gpa: round2(gpa) };
}

/**
 * CGPA is always computed from the raw totals across every saved course,
 * never by averaging individual semester GPAs.
 */
export function calculateOverallStats(allCourses: Pick<Course, "creditUnit" | "qualityPoint">[]): Stats {
  return calculateSemesterStats(allCourses);
}

export function calculateCGPA(totalQualityPoints: number, totalCreditUnits: number): number {
  if (totalCreditUnits <= 0) return 0;
  return round2(totalQualityPoints / totalCreditUnits);
}

export function calculateClassification(
  cgpa: number,
  rules: ClassificationRule[] = DEFAULT_CLASSIFICATION
): string {
  const match = rules.find((rule) => cgpa >= rule.min && cgpa <= rule.max);
  return match ? match.label : "Not Classified";
}

export function calculateProgress(completedSemesters: number, totalSemesters: number): number {
  if (totalSemesters <= 0) return 0;
  return Math.round((completedSemesters / totalSemesters) * 100);
}
