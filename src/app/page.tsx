"use client";

import { useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { SummaryCard } from "@/components/SummaryCard";
import { AcademicRecordsNav } from "@/components/AcademicRecordsNav";
import { CurrentSemesterSection } from "@/components/CurrentSemesterSection";
import { AddEditCourseModal } from "@/components/AddEditCourseModal";
import { Sidebar } from "@/components/Sidebar";
import { DataActions } from "@/components/DataActions";
import { Toast } from "@/components/Toast";
import { Footer } from "@/components/Footer";
import { useAcademicData } from "@/hooks/useAcademicData";
import {
  calculateClassification,
  calculateOverallStats,
  calculateProgress,
  calculateSemesterStats,
} from "@/lib/calculations";
import { LEVELS, TOTAL_POSSIBLE_SEMESTERS } from "@/lib/constants";
import { Course, CourseDraft, Level, SemesterNumber } from "@/lib/types";
import { generateAcademicReportPdf } from "@/lib/pdf";
import { buildExportPayload, downloadJson, validateImportPayload } from "@/lib/importExport";
import { downloadTranscriptExcel } from "@/lib/transcriptExcel";
import { createClient } from "@/lib/supabase/client";

export default function HomePage() {
  const {
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
    importCourses,
  } = useAcademicData();

  const [selectedLevel, setSelectedLevel] = useState<Level>(100);
  const [selectedSemester, setSelectedSemester] = useState<SemesterNumber>(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const overall = useMemo(() => calculateOverallStats(courses), [courses]);
  const cgpa = overall.gpa;
  const classification = calculateClassification(cgpa);

  const completionByLevel = useMemo(() => {
    const map = {} as Record<Level, number>;
    for (const level of LEVELS) {
      const semestersWithCourses = new Set(
        courses.filter((c) => c.level === level).map((c) => c.semester)
      );
      map[level] = semestersWithCourses.size;
    }
    return map;
  }, [courses]);

  const completedSemestersCount = useMemo(
    () => LEVELS.reduce((sum, level) => sum + (completionByLevel[level] ?? 0), 0),
    [completionByLevel]
  );

  const progress = calculateProgress(completedSemestersCount, TOTAL_POSSIBLE_SEMESTERS);

  const currentSemesterCourses = useMemo(
    () => courses.filter((c) => c.level === selectedLevel && c.semester === selectedSemester),
    [courses, selectedLevel, selectedSemester]
  );
  const currentSemesterStats = useMemo(
    () => calculateSemesterStats(currentSemesterCourses),
    [currentSemesterCourses]
  );

  function openAddModal() {
    setEditingCourse(null);
    setModalOpen(true);
  }

  function openEditModal(course: Course) {
    setEditingCourse(course);
    setModalOpen(true);
  }

  async function handleSubmitCourse(draft: CourseDraft) {
    if (editingCourse) {
      await updateCourse(editingCourse.id, draft);
    } else {
      await addCourse(draft);
    }
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
  }

  function handleSaveAndPdf() {
    generateAcademicReportPdf({
      profile: {
        full_name: profile?.full_name ?? "",
        university: profile?.university ?? null,
        department: profile?.department ?? null,
        programme: profile?.programme ?? null,
      },
      courses,
      cgpa,
      totalCreditUnits: overall.totalCreditUnits,
      totalQualityPoints: overall.totalQualityPoints,
    });
    showMessage("Academic record saved successfully.");
  }

  function handleExport() {
    const payload = buildExportPayload(
      {
        fullName: profile?.full_name ?? "",
        email: profile?.email ?? "",
        university: profile?.university ?? null,
        department: profile?.department ?? null,
        programme: profile?.programme ?? null,
      },
      courses.map((c) => ({
        level: c.level,
        semester: c.semester,
        courseCode: c.courseCode,
        courseTitle: c.courseTitle,
        creditUnit: c.creditUnit,
        grade: c.grade,
      }))
    );
    downloadJson(payload);
  }

  async function handleExportTranscript() {
    try {
      await downloadTranscriptExcel(profile, courses);
      showMessage("Transcript exported to Excel successfully.");
    } catch (error) {
      console.error(error);
      showMessage("The transcript could not be exported. Please try again.");
    }
  }

  async function handleImportFile(file: File) {
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const result = validateImportPayload(json);
      if (!result.valid) {
        showMessage(result.errors[0] ?? "That file couldn't be imported.");
        return;
      }
      await importCourses(result.courses);
    } catch {
      showMessage("That file couldn't be read as valid JSON.");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-400">
        Loading your academic records…
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10">
      <Header
        profile={profile}
        isAuthenticated={!!user}
        saving={saving}
        onSaveAndPdf={handleSaveAndPdf}
        onLogout={handleLogout}
      />

      <main className="mx-auto max-w-6xl space-y-4 px-4 py-5 sm:px-6 sm:py-6">
        {isGuest && (
          <div className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-xs text-brand-700">
            You&apos;re currently browsing as a guest, your entries stay on this device.{" "}
            <a href="/signup" className="font-semibold underline">
              Create an account
            </a>{" "}
            to save them permanently.
          </div>
        )}

        <SummaryCard
          cgpa={cgpa}
          totalCreditUnits={overall.totalCreditUnits}
          totalQualityPoints={overall.totalQualityPoints}
          semestersCompleted={completedSemestersCount}
          progress={progress}
        />

        <AcademicRecordsNav
          selectedLevel={selectedLevel}
          selectedSemester={selectedSemester}
          completionByLevel={completionByLevel}
          onSelectLevel={setSelectedLevel}
          onSelectSemester={setSelectedSemester}
        />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
          <CurrentSemesterSection
            level={selectedLevel}
            semester={selectedSemester}
            courses={currentSemesterCourses}
            onAddCourse={openAddModal}
            onEditCourse={openEditModal}
          />
          <Sidebar
            cgpa={cgpa}
            classification={classification}
            totalCreditUnits={overall.totalCreditUnits}
            totalQualityPoints={overall.totalQualityPoints}
            currentSemesterStats={currentSemesterStats}
          />
        </div>

        <DataActions
          onDownloadReport={handleSaveAndPdf}
          onExport={handleExport}
          onExportTranscript={handleExportTranscript}
          onImportFile={handleImportFile}
        />
      </main>

      <Footer />

      <AddEditCourseModal
        open={modalOpen}
        course={editingCourse}
        defaultLevel={selectedLevel}
        defaultSemester={selectedSemester}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitCourse}
        onDelete={deleteCourse}
      />

      <Toast message={message} />
    </div>
  );
}
