"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { calculateGradePoint, calculateQualityPoint } from "@/lib/calculations";
import { Course, CourseDraft, Profile } from "@/lib/types";

const GUEST_STORAGE_KEY = "cgpa-tracker-guest-courses";

function readGuestStorage(): Course[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(GUEST_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Course[]) : [];
  } catch {
    return [];
  }
}

function writeGuestStorage(courses: Course[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(courses));
}

function courseFromDraft(draft: CourseDraft, id: string, semesterId: string): Course {
  const gradePoint = calculateGradePoint(draft.grade);
  return {
    id,
    semesterId,
    level: draft.level,
    semester: draft.semester,
    courseCode: draft.courseCode,
    courseTitle: draft.courseTitle,
    creditUnit: draft.creditUnit,
    grade: draft.grade,
    gradePoint,
    qualityPoint: calculateQualityPoint(draft.creditUnit, draft.grade),
  };
}

type CourseJoinRow = {
  id: string;
  semester_id: string;
  course_code: string;
  course_title: string;
  credit_unit: number;
  grade: Course["grade"];
  grade_point: number;
  quality_point: number;
  semesters: { level: number; semester: number } | { level: number; semester: number }[] | null;
};

function flattenCourseRow(row: CourseJoinRow): Course | null {
  const semesterInfo = Array.isArray(row.semesters) ? row.semesters[0] : row.semesters;
  if (!semesterInfo) return null;
  return {
    id: row.id,
    semesterId: row.semester_id,
    level: semesterInfo.level as Course["level"],
    semester: semesterInfo.semester as Course["semester"],
    courseCode: row.course_code,
    courseTitle: row.course_title,
    creditUnit: row.credit_unit,
    grade: row.grade,
    gradePoint: row.grade_point,
    qualityPoint: row.quality_point,
  };
}

export function useAcademicData() {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const migratingRef = useRef(false);

  const showMessage = useCallback((text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage((current) => (current === text ? null : current)), 4000);
  }, []);

  const fetchAccountData = useCallback(
    async (userId: string) => {
      const [{ data: profileRow }, { data: courseRows }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
        supabase
          .from("courses")
          .select(
            "id, semester_id, course_code, course_title, credit_unit, grade, grade_point, quality_point, semesters(level, semester)"
          )
          .eq("user_id", userId)
          .order("created_at", { ascending: true }),
      ]);

      if (profileRow) setProfile(profileRow as Profile);
      if (courseRows) {
        const flattened = (courseRows as unknown as CourseJoinRow[])
          .map(flattenCourseRow)
          .filter((c): c is Course => c !== null);
        setCourses(flattened);
      }
    },
    [supabase]
  );

  const migrateGuestCourses = useCallback(
    async (userId: string) => {
      const guestCourses = readGuestStorage();
      if (guestCourses.length === 0 || migratingRef.current) return;
      migratingRef.current = true;
      try {
        for (const course of guestCourses) {
          const { data: semesterRow, error: semesterError } = await supabase
            .from("semesters")
            .upsert(
              { user_id: userId, level: course.level, semester: course.semester },
              { onConflict: "user_id,level,semester" }
            )
            .select("id")
            .single();
          if (semesterError || !semesterRow) continue;

          await supabase.from("courses").insert({
            user_id: userId,
            semester_id: semesterRow.id,
            course_code: course.courseCode,
            course_title: course.courseTitle,
            credit_unit: course.creditUnit,
            grade: course.grade,
          });
        }
        window.localStorage.removeItem(GUEST_STORAGE_KEY);
        showMessage("Your saved courses were added to your account.");
      } finally {
        migratingRef.current = false;
      }
    },
    [supabase, showMessage]
  );

  useEffect(() => {
    let active = true;

    async function init() {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!active) return;

      if (currentUser) {
        setUser(currentUser);
        await migrateGuestCourses(currentUser.id);
        await fetchAccountData(currentUser.id);
      } else {
        setCourses(readGuestStorage());
      }
      setLoading(false);
    }

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user);
        await migrateGuestCourses(session.user.id);
        await fetchAccountData(session.user.id);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
        setCourses(readGuestStorage());
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isGuest = !user;

  const addCourse = useCallback(
    async (draft: CourseDraft) => {
      if (!user) {
        const newCourse = courseFromDraft(draft, crypto.randomUUID(), "guest");
        setCourses((prev) => {
          const next = [...prev, newCourse];
          writeGuestStorage(next);
          return next;
        });
        showMessage("Course added.");
        return;
      }

      setSaving(true);
      try {
        const { data: semesterRow, error: semesterError } = await supabase
          .from("semesters")
          .upsert(
            { user_id: user.id, level: draft.level, semester: draft.semester },
            { onConflict: "user_id,level,semester" }
          )
          .select("id")
          .single();
        if (semesterError || !semesterRow) throw semesterError;

        const { data: courseRow, error: courseError } = await supabase
          .from("courses")
          .insert({
            user_id: user.id,
            semester_id: semesterRow.id,
            course_code: draft.courseCode,
            course_title: draft.courseTitle,
            credit_unit: draft.creditUnit,
            grade: draft.grade,
          })
          .select("id, semester_id, course_code, course_title, credit_unit, grade, grade_point, quality_point")
          .single();
        if (courseError || !courseRow) throw courseError;

        setCourses((prev) => [
          ...prev,
          {
            id: courseRow.id,
            semesterId: courseRow.semester_id,
            level: draft.level,
            semester: draft.semester,
            courseCode: courseRow.course_code,
            courseTitle: courseRow.course_title,
            creditUnit: courseRow.credit_unit,
            grade: courseRow.grade,
            gradePoint: courseRow.grade_point,
            qualityPoint: courseRow.quality_point,
          },
        ]);
        showMessage("Course added.");
      } finally {
        setSaving(false);
      }
    },
    [supabase, user, showMessage]
  );

  const updateCourse = useCallback(
    async (id: string, draft: CourseDraft) => {
      if (!user) {
        setCourses((prev) => {
          const next = prev.map((c) => (c.id === id ? courseFromDraft(draft, id, "guest") : c));
          writeGuestStorage(next);
          return next;
        });
        showMessage("Course updated.");
        return;
      }

      setSaving(true);
      try {
        const { data: semesterRow, error: semesterError } = await supabase
          .from("semesters")
          .upsert(
            { user_id: user.id, level: draft.level, semester: draft.semester },
            { onConflict: "user_id,level,semester" }
          )
          .select("id")
          .single();
        if (semesterError || !semesterRow) throw semesterError;

        const { data: courseRow, error: courseError } = await supabase
          .from("courses")
          .update({
            semester_id: semesterRow.id,
            course_code: draft.courseCode,
            course_title: draft.courseTitle,
            credit_unit: draft.creditUnit,
            grade: draft.grade,
          })
          .eq("id", id)
          .select("id, semester_id, course_code, course_title, credit_unit, grade, grade_point, quality_point")
          .single();
        if (courseError || !courseRow) throw courseError;

        setCourses((prev) =>
          prev.map((c) =>
            c.id === id
              ? {
                  id: courseRow.id,
                  semesterId: courseRow.semester_id,
                  level: draft.level,
                  semester: draft.semester,
                  courseCode: courseRow.course_code,
                  courseTitle: courseRow.course_title,
                  creditUnit: courseRow.credit_unit,
                  grade: courseRow.grade,
                  gradePoint: courseRow.grade_point,
                  qualityPoint: courseRow.quality_point,
                }
              : c
          )
        );
        showMessage("Course updated.");
      } finally {
        setSaving(false);
      }
    },
    [supabase, user, showMessage]
  );

  const deleteCourse = useCallback(
    async (id: string) => {
      if (!user) {
        setCourses((prev) => {
          const next = prev.filter((c) => c.id !== id);
          writeGuestStorage(next);
          return next;
        });
        showMessage("Course deleted.");
        return;
      }

      setSaving(true);
      try {
        await supabase.from("courses").delete().eq("id", id);
        setCourses((prev) => prev.filter((c) => c.id !== id));
        showMessage("Course deleted.");
      } finally {
        setSaving(false);
      }
    },
    [supabase, user, showMessage]
  );

  const updateProfile = useCallback(
    async (partial: Partial<Pick<Profile, "full_name" | "university" | "department" | "programme">>) => {
      if (!user) return;
      setSaving(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .update(partial)
          .eq("id", user.id)
          .select("*")
          .single();
        if (!error && data) {
          setProfile(data as Profile);
          showMessage("Profile updated.");
        }
      } finally {
        setSaving(false);
      }
    },
    [supabase, user, showMessage]
  );

  const refresh = useCallback(async () => {
    if (user) await fetchAccountData(user.id);
  }, [user, fetchAccountData]);

  /** Bulk-applies validated imported courses. All-or-nothing at the caller's
   * validation step — this just persists whatever it's given. */
  const importCourses = useCallback(
    async (imported: CourseDraft[]) => {
      if (!user) {
        const withIds = imported.map((draft) => courseFromDraft(draft, crypto.randomUUID(), "guest"));
        setCourses((prev) => {
          const next = [...prev, ...withIds];
          writeGuestStorage(next);
          return next;
        });
        showMessage("Academic data imported successfully.");
        return;
      }

      setSaving(true);
      try {
        for (const draft of imported) {
          const { data: semesterRow } = await supabase
            .from("semesters")
            .upsert(
              { user_id: user.id, level: draft.level, semester: draft.semester },
              { onConflict: "user_id,level,semester" }
            )
            .select("id")
            .single();
          if (!semesterRow) continue;
          await supabase.from("courses").insert({
            user_id: user.id,
            semester_id: semesterRow.id,
            course_code: draft.courseCode,
            course_title: draft.courseTitle,
            credit_unit: draft.creditUnit,
            grade: draft.grade,
          });
        }
        await fetchAccountData(user.id);
        showMessage("Academic data imported successfully.");
      } finally {
        setSaving(false);
      }
    },
    [supabase, user, showMessage, fetchAccountData]
  );

  return {
    user,
    profile,
    courses,
    loading,
    saving,
    isGuest,
    message,
    showMessage,
    addCourse,
    updateCourse,
    deleteCourse,
    updateProfile,
    importCourses,
    refresh,
  };
}
