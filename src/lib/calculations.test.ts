import { describe, expect, it } from "vitest";
import {
  calculateCGPA,
  calculateClassification,
  calculateGradePoint,
  calculateOverallStats,
  calculateProgress,
  calculateQualityPoint,
  calculateSemesterStats,
} from "./calculations";

describe("calculateGradePoint", () => {
  it("maps A-F to the Nigerian 5-point scale", () => {
    expect(calculateGradePoint("A")).toBe(5);
    expect(calculateGradePoint("B")).toBe(4);
    expect(calculateGradePoint("C")).toBe(3);
    expect(calculateGradePoint("D")).toBe(2);
    expect(calculateGradePoint("E")).toBe(1);
    expect(calculateGradePoint("F")).toBe(0);
  });
});

describe("calculateQualityPoint", () => {
  it("multiplies credit unit by grade point", () => {
    expect(calculateQualityPoint(3, "A")).toBe(15);
    expect(calculateQualityPoint(4, "B")).toBe(16);
  });
});

describe("calculateSemesterStats", () => {
  it("computes credit-weighted GPA, not an average of grade points", () => {
    const courses = [
      { creditUnit: 3, qualityPoint: 15 }, // A
      { creditUnit: 3, qualityPoint: 12 }, // B
      { creditUnit: 4, qualityPoint: 8 }, // D — pulls the average down more than a simple mean would
    ];
    const stats = calculateSemesterStats(courses);
    expect(stats.totalCreditUnits).toBe(10);
    expect(stats.totalQualityPoints).toBe(35);
    expect(stats.gpa).toBe(3.5);
  });

  it("returns zeroed stats for an empty semester", () => {
    expect(calculateSemesterStats([])).toEqual({
      totalCreditUnits: 0,
      totalQualityPoints: 0,
      gpa: 0,
    });
  });
});

describe("CGPA never averages semester GPAs", () => {
  it("matches the worked example from the spec (157 / 38 = 4.13)", () => {
    const semester1 = [{ creditUnit: 18, qualityPoint: 72 }]; // GPA 4.00
    const semester2 = [{ creditUnit: 20, qualityPoint: 85 }]; // GPA 4.25
    const overall = calculateOverallStats([...semester1, ...semester2]);

    expect(overall.totalCreditUnits).toBe(38);
    expect(overall.totalQualityPoints).toBe(157);
    expect(overall.gpa).toBe(4.13);
    // Note: naively averaging the two semester GPAs (4.00 and 4.25) also rounds to
    // 4.13 here by coincidence, so the non-averaging behavior is asserted properly
    // in the next test, where semester sizes differ enough for the two methods to diverge.
  });

  it("diverges from naive semester-GPA averaging when semester sizes differ a lot", () => {
    const small = [{ creditUnit: 6, qualityPoint: 30 }]; // GPA 5.00, small semester
    const large = [{ creditUnit: 24, qualityPoint: 48 }]; // GPA 2.00, large semester
    const overall = calculateOverallStats([...small, ...large]);

    const naiveAverage = (5.0 + 2.0) / 2; // 3.5
    expect(overall.gpa).toBe(2.6);
    expect(overall.gpa).not.toBe(naiveAverage);
  });
});

describe("calculateCGPA", () => {
  it("divides total quality points by total credit units", () => {
    expect(calculateCGPA(150, 38)).toBe(3.95);
  });

  it("returns 0 when there are no credit units", () => {
    expect(calculateCGPA(0, 0)).toBe(0);
  });
});

describe("calculateClassification", () => {
  it("classifies across the full Nigerian degree scale", () => {
    expect(calculateClassification(4.75)).toBe("First Class");
    expect(calculateClassification(4.32)).toBe("Second Class Upper");
    expect(calculateClassification(2.9)).toBe("Second Class Lower");
    expect(calculateClassification(1.8)).toBe("Third Class");
    expect(calculateClassification(1.2)).toBe("Pass");
    expect(calculateClassification(0.4)).toBe("Fail");
  });
});

describe("calculateProgress", () => {
  it("computes completed semesters over 14 as a percentage", () => {
    expect(calculateProgress(4, 14)).toBe(29);
    expect(calculateProgress(0, 14)).toBe(0);
    expect(calculateProgress(14, 14)).toBe(100);
  });
});
