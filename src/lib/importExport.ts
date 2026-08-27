import { GRADES, LEVELS } from "./constants";
import { Grade, Level, SemesterNumber } from "./types";

export interface ExportedCourse {
  level: Level;
  semester: SemesterNumber;
  courseCode: string;
  courseTitle: string;
  creditUnit: number;
  grade: Grade;
}

export interface ExportedProfile {
  fullName: string;
  email: string;
  university: string | null;
  department: string | null;
  programme: string | null;
}

export interface ExportedData {
  appName: string;
  exportedAt: string;
  profile: ExportedProfile;
  courses: ExportedCourse[];
}

export function buildExportPayload(profile: ExportedProfile, courses: ExportedCourse[]): ExportedData {
  return {
    appName: "CGPA CUMULATIVE TRACKER",
    exportedAt: new Date().toISOString(),
    profile,
    courses,
  };
}

export function downloadJson(data: ExportedData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${(data.profile.fullName || "cgpa-tracker").trim().replace(/\s+/g, "-").toLowerCase() || "cgpa-tracker"}-export.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export interface ValidationResult {
  valid: boolean;
  courses: ExportedCourse[];
  errors: string[];
}

/** Validates an imported file fully before anything is applied, so a malformed
 * file can never partially corrupt existing records. */
export function validateImportPayload(raw: unknown): ValidationResult {
  if (typeof raw !== "object" || raw === null) {
    return { valid: false, courses: [], errors: ["File is not a valid JSON object."] };
  }

  const data = raw as Record<string, unknown>;
  if (!Array.isArray(data.courses)) {
    return { valid: false, courses: [], errors: ["File is missing a 'courses' array."] };
  }

  const errors: string[] = [];
  const validCourses: ExportedCourse[] = [];

  data.courses.forEach((entry, index) => {
    if (typeof entry !== "object" || entry === null) {
      errors.push(`Course ${index + 1}: not a valid object.`);
      return;
    }
    const c = entry as Record<string, unknown>;
    const level = Number(c.level) as Level;
    const semester = Number(c.semester) as SemesterNumber;
    const creditUnit = Number(c.creditUnit);
    const grade = c.grade as Grade;
    const courseCode = String(c.courseCode ?? "").trim();
    const courseTitle = String(c.courseTitle ?? "").trim();

    if (!LEVELS.includes(level)) {
      errors.push(`Course ${index + 1}: invalid level "${String(c.level)}".`);
    } else if (![1, 2].includes(semester)) {
      errors.push(`Course ${index + 1}: invalid semester "${String(c.semester)}".`);
    } else if (!courseCode) {
      errors.push(`Course ${index + 1}: missing course code.`);
    } else if (!courseTitle) {
      errors.push(`Course ${index + 1}: missing course title.`);
    } else if (!Number.isInteger(creditUnit) || creditUnit < 1 || creditUnit > 10) {
      errors.push(`Course ${index + 1}: credit unit must be a whole number between 1 and 10.`);
    } else if (!GRADES.includes(grade)) {
      errors.push(`Course ${index + 1}: invalid grade "${String(c.grade)}".`);
    } else {
      validCourses.push({ level, semester, courseCode, courseTitle, creditUnit, grade });
    }
  });

  return { valid: errors.length === 0, courses: validCourses, errors };
}
