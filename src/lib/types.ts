export type Grade = "A" | "B" | "C" | "D" | "E" | "F";
export type SemesterNumber = 1 | 2;
export type Level = 100 | 200 | 300 | 400 | 500 | 600 | 700;

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  university: string | null;
  department: string | null;
  programme: string | null;
  created_at: string;
  updated_at: string;
}

export interface SemesterRow {
  id: string;
  user_id: string;
  level: Level;
  semester: SemesterNumber;
  created_at: string;
  updated_at: string;
}

export interface CourseRow {
  id: string;
  user_id: string;
  semester_id: string;
  course_code: string;
  course_title: string;
  credit_unit: number;
  grade: Grade;
  grade_point: number;
  quality_point: number;
  created_at: string;
  updated_at: string;
}

/** A course flattened with its level/semester for easy client-side use. */
export interface Course {
  id: string;
  semesterId: string;
  level: Level;
  semester: SemesterNumber;
  courseCode: string;
  courseTitle: string;
  creditUnit: number;
  grade: Grade;
  gradePoint: number;
  qualityPoint: number;
}

export interface CourseDraft {
  id?: string;
  level: Level;
  semester: SemesterNumber;
  courseCode: string;
  courseTitle: string;
  creditUnit: number;
  grade: Grade;
}
