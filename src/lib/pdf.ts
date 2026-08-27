import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { calculateClassification, calculateSemesterStats } from "./calculations";
import { APP_NAME, LEVELS, SEMESTER_LABELS, levelLabel } from "./constants";
import { Course, Profile } from "./types";

interface DocWithAutoTable extends jsPDF {
  lastAutoTable: { finalY: number };
}

export interface ReportData {
  profile: Pick<Profile, "full_name" | "university" | "department" | "programme">;
  courses: Course[];
  cgpa: number;
  totalCreditUnits: number;
  totalQualityPoints: number;
}

/** Builds and triggers a download of the academic report PDF. Client-side only. */
export function generateAcademicReportPdf({
  profile,
  courses,
  cgpa,
  totalCreditUnits,
  totalQualityPoints,
}: ReportData): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const marginX = 40;
  let y = 48;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(APP_NAME, marginX, y);
  y += 22;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const infoLines = [
    `Student: ${profile.full_name || "—"}`,
    `University: ${profile.university || "—"}`,
    `Department: ${profile.department || "—"}`,
    `Programme: ${profile.programme || "—"}`,
  ];
  infoLines.forEach((line) => {
    doc.text(line, marginX, y);
    y += 14;
  });

  y += 8;
  const classification = calculateClassification(cgpa);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`Current CGPA: ${cgpa.toFixed(2)} / 5.00`, marginX, y);
  y += 16;
  doc.text(`Degree Classification: ${classification}`, marginX, y);
  y += 24;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Academic Records", marginX, y);
  y += 10;

  for (const level of LEVELS) {
    for (const semester of [1, 2] as const) {
      const semesterCourses = courses.filter((c) => c.level === level && c.semester === semester);
      if (semesterCourses.length === 0) continue;

      const stats = calculateSemesterStats(semesterCourses);

      if (y > 740) {
        doc.addPage();
        y = 48;
      }

      y += 18;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`${levelLabel(level)} — ${SEMESTER_LABELS[semester]}`, marginX, y);

      autoTable(doc, {
        startY: y + 8,
        margin: { left: marginX, right: marginX },
        head: [["Course Code", "Course Title", "Unit", "Grade", "Quality Point"]],
        body: semesterCourses.map((c) => [
          c.courseCode,
          c.courseTitle,
          String(c.creditUnit),
          c.grade,
          String(c.qualityPoint),
        ]),
        styles: { fontSize: 9, cellPadding: 4 },
        headStyles: { fillColor: [21, 36, 68] },
        theme: "grid",
      });

      y = (doc as DocWithAutoTable).lastAutoTable.finalY + 8;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(
        `Credit units: ${stats.totalCreditUnits}   Quality points: ${stats.totalQualityPoints}   Semester GPA: ${stats.gpa.toFixed(2)}`,
        marginX,
        y
      );
      y += 10;
    }
  }

  if (y > 720) {
    doc.addPage();
    y = 48;
  }

  y += 24;
  doc.setDrawColor(200);
  doc.line(marginX, y, 555, y);
  y += 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Summary", marginX, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  [
    `Total Credit Units: ${totalCreditUnits}`,
    `Total Quality Points: ${totalQualityPoints}`,
    `Current CGPA: ${cgpa.toFixed(2)} / 5.00`,
    `Classification: ${classification}`,
  ].forEach((line) => {
    doc.text(line, marginX, y);
    y += 14;
  });

  const fileName = `${(profile.full_name || "academic-report").replace(/\s+/g, "-").toLowerCase()}-cgpa-report.pdf`;
  doc.save(fileName);
}
