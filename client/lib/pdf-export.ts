import jsPDF from "jspdf";
import "jspdf-autotable";
import type { User } from "./api/types";
import type { BloodSugarReading } from "./api/services/bloodSugarService";
import type { Meal } from "./api/services/mealService";
import type { PhysicalActivity } from "./api/services/physicalActivityService";
import type { Medication } from "./api/services/medicationService";
import type { HealthMetric } from "./api/services/healthMetricService";

// Extend jsPDF type to include autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface ReportData {
  user: User;
  bloodSugarReadings: BloodSugarReading[];
  meals: Meal[];
  activities: PhysicalActivity[];
  medications: Medication[];
  healthMetrics: HealthMetric[];
  startDate: string;
  endDate: string;
}

export class PDFExportService {
  private doc: jsPDF;

  constructor() {
    this.doc = new jsPDF();
  }

  async generateHealthReport(data: ReportData): Promise<Blob> {
    this.doc = new jsPDF();

    // Add header
    this.addHeader(data.user, data.startDate, data.endDate);

    // Add summary section
    this.addSummary(data);

    // Add blood sugar section with trends
    this.addBloodSugarSection(data.bloodSugarReadings);
    this.addBloodSugarTrends(data.bloodSugarReadings);

    // Add meals section
    this.addMealsSection(data.meals);

    // Add activities section
    this.addActivitiesSection(data.activities);

    // Add medications section
    this.addMedicationsSection(data.medications);

    // Add health metrics section
    this.addHealthMetricsSection(data.healthMetrics);

    // Add footer
    this.addFooter();

    return this.doc.output("blob");
  }

  private addHeader(user: User, startDate: string, endDate: string) {
    // Title
    this.doc.setFontSize(20);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Health Report", 20, 30);

    // Patient info
    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(`Patient: ${user.name}`, 20, 45);
    this.doc.text(`Email: ${user.email}`, 20, 55);
    this.doc.text(
      `Diabetes Type: ${user.diabetesType || "Not specified"}`,
      20,
      65
    );
    this.doc.text(
      `Report Period: ${this.formatDate(startDate)} - ${this.formatDate(
        endDate
      )}`,
      20,
      75
    );

    // Add line
    this.doc.setLineWidth(0.5);
    this.doc.line(20, 85, 190, 85);
  }

  private addSummary(data: ReportData) {
    this.doc.setFontSize(14);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Summary", 20, 100);

    // Calculate summary statistics
    const avgBloodSugar = this.calculateAverageBloodSugar(
      data.bloodSugarReadings
    );
    const totalCalories = data.meals.reduce(
      (sum, meal) => sum + (meal.calories || 0),
      0
    );
    const totalCaloriesBurned = data.activities.reduce(
      (sum, activity) => sum + (activity.caloriesBurned || 0),
      0
    );
    const netCalories = totalCalories - totalCaloriesBurned;

    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "normal");

    let yPos = 110;

    // Blood sugar insights
    this.doc.text(`Average Blood Sugar: ${avgBloodSugar} mg/dL`, 20, yPos);
    yPos += 10;

    // Blood sugar range analysis
    const bloodSugarValues = data.bloodSugarReadings.map((r) => r.value);
    if (bloodSugarValues.length > 0) {
      const minBS = Math.min(...bloodSugarValues);
      const maxBS = Math.max(...bloodSugarValues);
      this.doc.text(`Blood Sugar Range: ${minBS} - ${maxBS} mg/dL`, 20, yPos);
      yPos += 10;

      // Add blood sugar status
      if (avgBloodSugar < 100) {
        this.doc.text("✓ Blood sugar levels are in normal range", 20, yPos);
      } else if (avgBloodSugar < 126) {
        this.doc.text(
          "⚠ Blood sugar levels are in pre-diabetic range",
          20,
          yPos
        );
      } else {
        this.doc.text("⚠ Blood sugar levels are in diabetic range", 20, yPos);
      }
      yPos += 15;
    }

    // Nutrition insights
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Nutrition Summary:", 20, yPos);
    yPos += 10;
    this.doc.setFont("helvetica", "normal");

    this.doc.text(
      `Total Calories Consumed: ${totalCalories.toFixed(0)}`,
      20,
      yPos
    );
    yPos += 10;
    this.doc.text(
      `Total Calories Burned: ${totalCaloriesBurned.toFixed(0)}`,
      20,
      yPos
    );
    yPos += 10;
    this.doc.text(`Net Calories: ${netCalories.toFixed(0)}`, 20, yPos);
    yPos += 10;

    // Activity insights
    const totalActivityMinutes = data.activities.reduce(
      (sum, activity) => sum + activity.duration,
      0
    );
    const avgActivityMinutes =
      data.activities.length > 0
        ? totalActivityMinutes / data.activities.length
        : 0;
    this.doc.text(
      `Total Activity Time: ${totalActivityMinutes} minutes`,
      20,
      yPos
    );
    yPos += 10;
    this.doc.text(
      `Average Activity Duration: ${avgActivityMinutes.toFixed(1)} minutes`,
      20,
      yPos
    );
    yPos += 15;

    // Medication insights
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Medication Summary:", 20, yPos);
    yPos += 10;
    this.doc.setFont("helvetica", "normal");

    this.doc.text(`Active Medications: ${data.medications.length}`, 20, yPos);
    yPos += 10;

    // Health metrics insights
    if (data.healthMetrics.length > 0) {
      this.doc.setFont("helvetica", "bold");
      this.doc.text("Health Metrics Summary:", 20, yPos);
      yPos += 10;
      this.doc.setFont("helvetica", "normal");

      const metricTypes = [...new Set(data.healthMetrics.map((m) => m.type))];
      this.doc.text(`Tracked Metrics: ${metricTypes.join(", ")}`, 20, yPos);
      yPos += 10;
    }

    this.doc.setLineWidth(0.3);
    this.doc.line(20, yPos + 5, 190, yPos + 5);
  }

  private addBloodSugarSection(readings: BloodSugarReading[]) {
    if (readings.length === 0) return;

    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Blood Sugar Readings", 20, 130);

    const tableData = readings.map((reading) => [
      this.formatDate(reading.timestamp),
      reading.value.toString(),
      reading.unit,
      reading.readingType,
      reading.notes || "",
    ]);

    (this.doc as any).autoTable({
      head: [["Date", "Value", "Unit", "Type", "Notes"]],
      body: tableData,
      startY: 140,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] },
    });
  }

  private addBloodSugarTrends(readings: BloodSugarReading[]) {
    if (readings.length < 2) return;

    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "bold");
    const lastTableY = (this.doc as any).lastAutoTable
      ? (this.doc as any).lastAutoTable.finalY
      : 140;
    this.doc.text("Blood Sugar Trends", 20, lastTableY + 20);

    // Calculate trends
    const sortedReadings = readings.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const fastingReadings = sortedReadings.filter(
      (r) => r.readingType === "fasting"
    );
    const beforeMealReadings = sortedReadings.filter(
      (r) => r.readingType === "before_meal"
    );
    const afterMealReadings = sortedReadings.filter(
      (r) => r.readingType === "after_meal"
    );

    let yPos = lastTableY + 35;

    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "normal");

    if (fastingReadings.length > 0) {
      const avgFasting =
        fastingReadings.reduce((sum, r) => sum + r.value, 0) /
        fastingReadings.length;
      this.doc.text(
        `Average Fasting: ${avgFasting.toFixed(1)} ${fastingReadings[0].unit}`,
        20,
        yPos
      );
      yPos += 10;
    }

    if (beforeMealReadings.length > 0) {
      const avgBeforeMeal =
        beforeMealReadings.reduce((sum, r) => sum + r.value, 0) /
        beforeMealReadings.length;
      this.doc.text(
        `Average Before Meals: ${avgBeforeMeal.toFixed(1)} ${
          beforeMealReadings[0].unit
        }`,
        20,
        yPos
      );
      yPos += 10;
    }

    if (afterMealReadings.length > 0) {
      const avgAfterMeal =
        afterMealReadings.reduce((sum, r) => sum + r.value, 0) /
        afterMealReadings.length;
      this.doc.text(
        `Average After Meals: ${avgAfterMeal.toFixed(1)} ${
          afterMealReadings[0].unit
        }`,
        20,
        yPos
      );
      yPos += 10;
    }

    // Add trend analysis
    const firstWeek = sortedReadings.slice(
      0,
      Math.min(7, sortedReadings.length)
    );
    const lastWeek = sortedReadings.slice(-Math.min(7, sortedReadings.length));

    if (firstWeek.length > 0 && lastWeek.length > 0) {
      const firstWeekAvg =
        firstWeek.reduce((sum, r) => sum + r.value, 0) / firstWeek.length;
      const lastWeekAvg =
        lastWeek.reduce((sum, r) => sum + r.value, 0) / lastWeek.length;
      const trend = lastWeekAvg - firstWeekAvg;

      yPos += 5;
      this.doc.setFont("helvetica", "bold");
      this.doc.text("Trend Analysis:", 20, yPos);
      yPos += 10;

      this.doc.setFont("helvetica", "normal");
      if (Math.abs(trend) < 5) {
        this.doc.text("Blood sugar levels are stable", 20, yPos);
      } else if (trend > 0) {
        this.doc.text(
          `Blood sugar levels increased by ${trend.toFixed(1)} ${
            readings[0].unit
          } on average`,
          20,
          yPos
        );
      } else {
        this.doc.text(
          `Blood sugar levels decreased by ${Math.abs(trend).toFixed(1)} ${
            readings[0].unit
          } on average`,
          20,
          yPos
        );
      }
    }
  }

  private addMealsSection(meals: Meal[]) {
    if (meals.length === 0) return;

    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "bold");
    const lastTableY = (this.doc as any).lastAutoTable
      ? (this.doc as any).lastAutoTable.finalY
      : 140;
    this.doc.text("Meals", 20, lastTableY + 20);

    const tableData = meals.map((meal) => [
      this.formatDate(meal.timestamp),
      meal.name,
      meal.mealType,
      (meal.calories || 0).toString(),
      (meal.carbohydrates || 0).toString(),
      (meal.proteins || 0).toString(),
      (meal.fats || 0).toString(),
    ]);

    (this.doc as any).autoTable({
      head: [
        [
          "Date",
          "Name",
          "Type",
          "Calories",
          "Carbs (g)",
          "Protein (g)",
          "Fat (g)",
        ],
      ],
      body: tableData,
      startY: lastTableY + 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [40, 167, 69] },
    });
  }

  private addActivitiesSection(activities: PhysicalActivity[]) {
    if (activities.length === 0) return;

    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "bold");
    const lastTableY = (this.doc as any).lastAutoTable
      ? (this.doc as any).lastAutoTable.finalY
      : 140;
    this.doc.text("Physical Activities", 20, lastTableY + 20);

    const tableData = activities.map((activity) => [
      this.formatDate(activity.timestamp),
      activity.name,
      activity.activityType,
      activity.duration.toString(),
      (activity.caloriesBurned || 0).toString(),
      activity.notes || "",
    ]);

    (this.doc as any).autoTable({
      head: [
        ["Date", "Name", "Type", "Duration (min)", "Calories Burned", "Notes"],
      ],
      body: tableData,
      startY: lastTableY + 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [255, 193, 7] },
    });
  }

  private addMedicationsSection(medications: Medication[]) {
    if (medications.length === 0) return;

    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "bold");
    const lastTableY = (this.doc as any).lastAutoTable
      ? (this.doc as any).lastAutoTable.finalY
      : 140;
    this.doc.text("Medications", 20, lastTableY + 20);

    const tableData = medications.map((medication) => [
      medication.name,
      medication.type,
      `${medication.dosage} ${medication.unit}`,
      medication.frequency,
      this.formatDate(medication.startDate),
      medication.endDate ? this.formatDate(medication.endDate) : "Ongoing",
      medication.instructions || "",
    ]);

    (this.doc as any).autoTable({
      head: [
        [
          "Name",
          "Type",
          "Dosage",
          "Frequency",
          "Start Date",
          "End Date",
          "Instructions",
        ],
      ],
      body: tableData,
      startY: lastTableY + 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [220, 53, 69] },
    });
  }

  private addHealthMetricsSection(metrics: HealthMetric[]) {
    if (metrics.length === 0) return;

    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "bold");
    const lastTableY = (this.doc as any).lastAutoTable
      ? (this.doc as any).lastAutoTable.finalY
      : 140;
    this.doc.text("Health Metrics", 20, lastTableY + 20);

    const tableData = metrics.map((metric) => [
      this.formatDate(metric.timestamp),
      metric.type.replace("_", " ").toUpperCase(),
      metric.value,
      metric.unit,
      metric.notes || "",
    ]);

    (this.doc as any).autoTable({
      head: [["Date", "Type", "Value", "Unit", "Notes"]],
      body: tableData,
      startY: lastTableY + 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [108, 117, 125] },
    });
  }

  private addFooter() {
    const pageCount = this.doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.setFont("helvetica", "normal");
      this.doc.text(
        `Generated on ${new Date().toLocaleDateString()} - Page ${i} of ${pageCount}`,
        20,
        this.doc.internal.pageSize.height - 10
      );
    }
  }

  private calculateAverageBloodSugar(readings: BloodSugarReading[]): number {
    if (readings.length === 0) return 0;
    const sum = readings.reduce((acc, reading) => acc + reading.value, 0);
    return Math.round(sum / readings.length);
  }

  private formatDate(dateInput: string | Date): string {
    const date =
      typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}

export const pdfExportService = new PDFExportService();
