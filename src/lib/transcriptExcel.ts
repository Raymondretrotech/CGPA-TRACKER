import type { Course, Profile } from "./types";
import { calculateSemesterStats } from "./calculations";

const TEMPLATE_URL = "/transcript-template.xlsx";

const YEAR_CONFIG = [
  { level: 100, yearRow: 8, firstHeaderRow: 9, columnHeaderRow: 10, firstStart: 11, firstEnd: 20, totalRow: 23, secondStart: 11, secondEnd: 20 },
  { level: 200, yearRow: 25, firstHeaderRow: 26, columnHeaderRow: 27, firstStart: 28, firstEnd: 36, totalRow: 39, secondStart: 28, secondEnd: 36 },
  { level: 300, yearRow: 41, firstHeaderRow: 42, columnHeaderRow: 43, firstStart: 44, firstEnd: 53, totalRow: 56, secondStart: 44, secondEnd: 53 },
  { level: 400, yearRow: 58, firstHeaderRow: 59, columnHeaderRow: 60, firstStart: 61, firstEnd: 70, totalRow: 73, secondStart: 61, secondEnd: 70 },
  { level: 500, yearRow: 75, firstHeaderRow: 76, columnHeaderRow: 77, firstStart: 78, firstEnd: 85, totalRow: 88, secondStart: 78, secondEnd: 85 },
] as const;

function cleanFileName(value: string): string {
  return value.trim().replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "") || "cgpa-transcript";
}

function setCell(ws: any, address: string, value: unknown) {
  ws[address] = { ...(ws[address] ?? {}), v: value };
}

function clearCell(ws: any, address: string) {
  if (ws[address]) {
    ws[address].v = undefined;
    delete ws[address].w;
  }
}

function clearCourseRow(ws: any, row: number, offset: 0 | 6) {
  for (let column = 0; column < 5; column += 1) {
    const letter = String.fromCharCode("A".charCodeAt(0) + offset + column);
    clearCell(ws, `${letter}${row}`);
  }
}

function writeCourse(ws: any, row: number, offset: 0 | 6, course: Course) {
  const values = [course.courseCode, course.courseTitle, course.creditUnit, course.grade, course.qualityPoint];
  values.forEach((value, index) => {
    const letter = String.fromCharCode("A".charCodeAt(0) + offset + index);
    setCell(ws, `${letter}${row}`, value);
  });
}

function writeSemester(ws: any, startRow: number, endRow: number, offset: 0 | 6, courses: Course[], totalRow: number) {
  for (let row = startRow; row <= endRow; row += 1) clearCourseRow(ws, row, offset);

  const visibleCourses = courses.slice(0, endRow - startRow + 1);
  visibleCourses.forEach((course, index) => writeCourse(ws, startRow + index, offset, course));

  const stats = calculateSemesterStats(courses);
  setCell(ws, `${String.fromCharCode("A".charCodeAt(0) + offset)}${totalRow}`, "TOTAL");
  setCell(ws, `${String.fromCharCode("A".charCodeAt(0) + offset + 2)}${totalRow}`, stats.totalCreditUnits);
  setCell(ws, `${String.fromCharCode("A".charCodeAt(0) + offset + 4)}${totalRow}`, stats.totalQualityPoints);
}

export async function downloadTranscriptExcel(profile: Profile | null, courses: Course[]): Promise<void> {
  // This module is only called from a client component. Loading the library here
  // keeps the Excel implementation out of the initial application bundle.
  const XLSX = await import("xlsx-js-style");

  const response = await fetch(TEMPLATE_URL);
  if (!response.ok) throw new Error("Transcript template could not be loaded.");

  const buffer = await response.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", cellStyles: true });
  const ws = workbook.Sheets[workbook.SheetNames[0]];

  // Identity section. Fields not currently collected by the app are intentionally blank.
  setCell(ws, "A1", profile?.university || "");
  setCell(ws, "A2", profile?.programme ? profile.programme.toUpperCase() : "");
  setCell(ws, "A3", profile?.department ? `DEPARTMENT: ${profile.department.toUpperCase()}` : "DEPARTMENT:");
  setCell(ws, "B5", profile?.full_name || "");
  setCell(ws, "E5", "");
  setCell(ws, "H5", "");
  setCell(ws, "B6", "");
  setCell(ws, "E6", "");
  setCell(ws, "H6", "");
  setCell(ws, "K6", "");

  const ordered = [...courses].sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level;
    if (a.semester !== b.semester) return a.semester - b.semester;
    return a.courseCode.localeCompare(b.courseCode);
  });

  for (const config of YEAR_CONFIG) {
    const first = ordered.filter((course) => course.level === config.level && course.semester === 1);
    const second = ordered.filter((course) => course.level === config.level && course.semester === 2);

    const ordinal = config.level === 100 ? "1st" : config.level === 200 ? "2nd" : config.level === 300 ? "3rd" : `${config.level / 100}th`;
    setCell(ws, `A${config.yearRow}`, `${ordinal} YEAR`);
    setCell(ws, `G${config.yearRow}`, "");

    writeSemester(ws, config.firstStart, config.firstEnd, 0, first, config.totalRow);
    writeSemester(ws, config.secondStart, config.secondEnd, 6, second, config.totalRow);
  }

  // Summary section: TCH = total credit units, TGP = total quality points.
  const levelTotals = YEAR_CONFIG.map((config) => {
    const levelCourses = ordered.filter((course) => course.level === config.level);
    const stats = calculateSemesterStats(levelCourses);
    return stats;
  });
  const overall = calculateSemesterStats(ordered);

  levelTotals.forEach((stats, index) => {
    setCell(ws, `${String.fromCharCode("B".charCodeAt(0) + index)}93`, stats.totalCreditUnits);
    setCell(ws, `${String.fromCharCode("B".charCodeAt(0) + index)}94`, stats.totalQualityPoints);
  });
  setCell(ws, "G93", overall.totalCreditUnits);
  setCell(ws, "G94", overall.totalQualityPoints);
  setCell(ws, "H95", overall.gpa.toFixed(2));

  const fileName = `${cleanFileName(profile?.full_name || "student")}_Transcript.xlsx`;
  XLSX.writeFile(workbook, fileName, { bookType: "xlsx" });
}
