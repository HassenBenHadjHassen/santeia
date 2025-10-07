import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
  alerts: any[];
  aiSummary: string;
  startDate: string;
  endDate: string;
}

interface TranslationStrings {
  aiSummaryTitle: string;
  bloodSugarTitle: string;
  mealsTitle: string;
  activitiesTitle: string;
  medicationsTitle: string;
  healthMetricsTitle: string;
  alertsTitle: string;
  summaryTitle: string;
  trendsTitle: string;
}

export class PDFExportService {
  private doc: jsPDF;

  constructor() {
    this.doc = new jsPDF();
  }

  async generateHealthReport(
    data: ReportData,
    translations?: TranslationStrings
  ): Promise<Blob> {
    this.doc = new jsPDF();

    // Add header
    this.addHeader(data.user, data.startDate, data.endDate);

    // Add AI summary section
    this.addAISummary(data.aiSummary, translations?.aiSummaryTitle);

    // Add summary section
    this.addSummary(data, translations?.summaryTitle);

    // Add blood sugar section with trends
    this.addBloodSugarSection(
      data.bloodSugarReadings,
      translations?.bloodSugarTitle
    );
    this.addBloodSugarTrends(
      data.bloodSugarReadings,
      translations?.trendsTitle
    );

    // Add meals section
    this.addMealsSection(data.meals, translations?.mealsTitle);

    // Add activities section
    this.addActivitiesSection(data.activities, translations?.activitiesTitle);

    // Add medications section
    this.addMedicationsSection(
      data.medications,
      translations?.medicationsTitle
    );

    // Add health metrics section
    this.addHealthMetricsSection(
      data.healthMetrics,
      translations?.healthMetricsTitle
    );

    // Add alerts section
    this.addAlertsSection(data.alerts, translations?.alertsTitle);

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

  private addSummary(data: ReportData, title?: string) {
    this.doc.setFontSize(14);
    this.doc.setFont("helvetica", "bold");
    // Get the final Y position from the AI summary section
    const lastTableY = (this.doc as any).lastAutoTable
      ? (this.doc as any).lastAutoTable.finalY
      : 100; // Default fallback
    this.doc.text(title || "Summary", 20, lastTableY + 20);

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

    this.doc.setFontSize(11);
    this.doc.setFont("helvetica", "normal");

    let yPos = lastTableY + 30;

    // Blood sugar insights
    if (yPos > 250) {
      this.doc.addPage();
      yPos = 20;
    }
    this.doc.text(`Average Blood Sugar: ${avgBloodSugar} mg/dL`, 20, yPos);
    yPos += 10;

    // Blood sugar range analysis
    const bloodSugarValues = data.bloodSugarReadings.map((r) => r.value);
    if (bloodSugarValues.length > 0) {
      const minBS = Math.min(...bloodSugarValues);
      const maxBS = Math.max(...bloodSugarValues);
      if (yPos > 250) {
        this.doc.addPage();
        yPos = 20;
      }
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
    if (yPos > 250) {
      this.doc.addPage();
      yPos = 20;
    }
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
    if (yPos > 250) {
      this.doc.addPage();
      yPos = 20;
    }
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

    // AI and conversation insights
    this.doc.setFont("helvetica", "bold");
    this.doc.text("AI & Digital Health Summary:", 20, yPos);
    yPos += 10;
    this.doc.setFont("helvetica", "normal");

    this.doc.text(`Health Alerts: ${data.alerts.length}`, 20, yPos);
    yPos += 10;

    if (data.alerts.length > 0) {
      const highPriorityAlerts = data.alerts.filter(
        (a) => (a.priority || "medium") === "high"
      ).length;
      if (highPriorityAlerts > 0) {
        this.doc.text(`High Priority Alerts: ${highPriorityAlerts}`, 20, yPos);
        yPos += 10;
      }
    }

    this.doc.setLineWidth(0.3);
    this.doc.line(20, yPos + 5, 190, yPos + 5);

    // Update the lastAutoTable position so other sections know where to start
    (this.doc as any).lastAutoTable = { finalY: yPos + 15 };
  }

  private addAISummary(aiSummary: string, title?: string) {
    if (!aiSummary) return;

    // Clean up AI summary to remove any remaining unwanted content
    let cleanSummary = aiSummary
      .replace(/^(Hello\.?\s*|Hi there\.?\s*)/i, "")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(
        /\s*If you notice concerning changes, please discuss them with your healthcare provider\.?\s*/gi,
        ""
      )
      .trim();

    this.doc.setFontSize(14);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(title || "AI Health Summary", 20, 100);

    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "normal");

    // Split the summary into lines that fit the page width
    const maxWidth = 170;
    const lines = this.doc.splitTextToSize(cleanSummary, maxWidth);

    let yPos = 110;
    lines.forEach((line: string) => {
      // Check if we need a new page
      if (yPos > 250) {
        this.doc.addPage();
        yPos = 20;
      }
      this.doc.text(line, 20, yPos);
      yPos += 5;
    });

    this.doc.setLineWidth(0.3);
    this.doc.line(20, yPos + 5, 190, yPos + 5);

    // Update the lastAutoTable position so other sections know where to start
    (this.doc as any).lastAutoTable = { finalY: yPos + 15 };
  }

  private addBloodSugarSection(readings: BloodSugarReading[], title?: string) {
    if (readings.length === 0) return;

    this.doc.setFontSize(14);
    this.doc.setFont("helvetica", "bold");
    const lastTableY = (this.doc as any).lastAutoTable
      ? (this.doc as any).lastAutoTable.finalY
      : 130;
    this.doc.text(title || "Blood Sugar Readings", 20, lastTableY + 20);

    const tableData = readings.map((reading) => [
      this.formatDate(reading.timestamp),
      reading.value.toString(),
      reading.unit,
      reading.readingType,
      reading.notes || "",
    ]);

    autoTable(this.doc, {
      head: [["Date", "Value", "Unit", "Type", "Notes"]],
      body: tableData,
      startY: lastTableY + 30,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [66, 139, 202] },
    });
  }

  private addBloodSugarTrends(readings: BloodSugarReading[], title?: string) {
    if (readings.length < 2) return;

    this.doc.setFontSize(14);
    this.doc.setFont("helvetica", "bold");
    const lastTableY = (this.doc as any).lastAutoTable
      ? (this.doc as any).lastAutoTable.finalY
      : 140;
    this.doc.text(title || "Blood Sugar Trends", 20, lastTableY + 20);

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

    this.doc.setFontSize(11);
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

  private addMealsSection(meals: Meal[], title?: string) {
    if (meals.length === 0) return;

    this.doc.setFontSize(14);
    this.doc.setFont("helvetica", "bold");
    const lastTableY = (this.doc as any).lastAutoTable
      ? (this.doc as any).lastAutoTable.finalY
      : 140;
    this.doc.text(title || "Meals", 20, lastTableY + 20);

    const tableData = meals.map((meal) => [
      this.formatDate(meal.timestamp),
      meal.name,
      meal.mealType,
      (meal.calories || 0).toString(),
      (meal.carbohydrates || 0).toString(),
      (meal.proteins || 0).toString(),
      (meal.fats || 0).toString(),
    ]);

    autoTable(this.doc, {
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
      styles: { fontSize: 9 },
      headStyles: { fillColor: [40, 167, 69] },
    });
  }

  private addActivitiesSection(activities: PhysicalActivity[], title?: string) {
    if (activities.length === 0) return;

    this.doc.setFontSize(14);
    this.doc.setFont("helvetica", "bold");
    const lastTableY = (this.doc as any).lastAutoTable
      ? (this.doc as any).lastAutoTable.finalY
      : 140;
    this.doc.text(title || "Physical Activities", 20, lastTableY + 20);

    const tableData = activities.map((activity) => [
      this.formatDate(activity.timestamp),
      activity.name,
      activity.activityType,
      activity.duration.toString(),
      (activity.caloriesBurned || 0).toString(),
      activity.notes || "",
    ]);

    autoTable(this.doc, {
      head: [
        ["Date", "Name", "Type", "Duration (min)", "Calories Burned", "Notes"],
      ],
      body: tableData,
      startY: lastTableY + 30,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [255, 193, 7] },
    });
  }

  private addMedicationsSection(medications: Medication[], title?: string) {
    if (medications.length === 0) return;

    this.doc.setFontSize(14);
    this.doc.setFont("helvetica", "bold");
    const lastTableY = (this.doc as any).lastAutoTable
      ? (this.doc as any).lastAutoTable.finalY
      : 140;
    this.doc.text(title || "Medications", 20, lastTableY + 20);

    const tableData = medications.map((medication) => [
      medication.name,
      medication.type,
      `${medication.dosage} ${medication.unit}`,
      medication.frequency,
      this.formatDate(medication.startDate),
      medication.endDate ? this.formatDate(medication.endDate) : "Ongoing",
      medication.instructions || "",
    ]);

    autoTable(this.doc, {
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
      styles: { fontSize: 9 },
      headStyles: { fillColor: [220, 53, 69] },
    });
  }

  private addHealthMetricsSection(metrics: HealthMetric[], title?: string) {
    if (metrics.length === 0) return;

    this.doc.setFontSize(14);
    this.doc.setFont("helvetica", "bold");
    const lastTableY = (this.doc as any).lastAutoTable
      ? (this.doc as any).lastAutoTable.finalY
      : 140;
    this.doc.text(title || "Health Metrics", 20, lastTableY + 20);

    const tableData = metrics.map((metric) => [
      this.formatDate(metric.timestamp),
      this.formatMetricType(metric.metricType),
      metric.value,
      metric.unit,
      metric.notes || "",
    ]);

    autoTable(this.doc, {
      head: [["Date", "Type", "Value", "Unit", "Notes"]],
      body: tableData,
      startY: lastTableY + 30,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [108, 117, 125] },
    });
  }

  private addAlertsSection(alerts: any[], title?: string) {
    if (alerts.length === 0) return;

    this.doc.setFontSize(14);
    this.doc.setFont("helvetica", "bold");
    const lastTableY = (this.doc as any).lastAutoTable
      ? (this.doc as any).lastAutoTable.finalY
      : 140;
    this.doc.text(
      title || "Health Alerts & Recommendations",
      20,
      lastTableY + 20
    );

    // Show recent alerts
    const recentAlerts = alerts.slice(0, 10);
    let yPos = lastTableY + 35;

    this.doc.setFontSize(11);
    this.doc.setFont("helvetica", "normal");

    recentAlerts.forEach((alert, index) => {
      // Alert priority color
      const priority = alert.priority || "medium";
      const priorityColor =
        priority === "high"
          ? [220, 53, 69]
          : priority === "medium"
          ? [255, 193, 7]
          : [40, 167, 69];

      this.doc.setFillColor(
        priorityColor[0],
        priorityColor[1],
        priorityColor[2]
      );
      this.doc.rect(15, yPos - 2, 3, 3, "F");

      this.doc.setFont("helvetica", "bold");
      this.doc.text(`${alert.title}`, 25, yPos);
      yPos += 6;

      this.doc.setFont("helvetica", "normal");
      this.doc.text(
        `Priority: ${(alert.priority || "medium").toUpperCase()}`,
        25,
        yPos
      );
      yPos += 4;
      this.doc.text(`Date: ${this.formatDate(alert.createdAt)}`, 25, yPos);
      yPos += 4;

      // Alert message
      const message =
        alert.message.substring(0, 150) +
        (alert.message.length > 150 ? "..." : "");
      this.doc.text(`Message: ${message}`, 25, yPos);
      yPos += 8;
    });

    if (alerts.length > 10) {
      this.doc.text(`... and ${alerts.length - 10} more alerts`, 20, yPos);
    }
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

  private formatMetricType(metricType: string | undefined): string {
    if (!metricType) return "UNKNOWN";

    const typeMap: { [key: string]: string } = {
      // Database enum values (uppercase)
      WEIGHT: "Weight",
      BLOOD_PRESSURE_SYSTOLIC: "Systolic BP",
      BLOOD_PRESSURE_DIASTOLIC: "Diastolic BP",
      CHOLESTEROL_TOTAL: "Total Cholesterol",
      CHOLESTEROL_HDL: "HDL Cholesterol",
      CHOLESTEROL_LDL: "LDL Cholesterol",
      TRIGLYCERIDES: "Triglycerides",
      HEART_RATE: "Heart Rate",
      BMI: "BMI",
      // Frontend API types (lowercase)
      weight: "Weight",
      height: "Height",
      bmi: "BMI",
      temperature: "Temperature",
      heart_rate: "Heart Rate",
      blood_pressure: "Blood Pressure",
      cholesterol: "Cholesterol",
    };

    // Debug: log the actual metric type to see what we're getting
    console.log(
      "Metric type received:",
      metricType,
      "Type:",
      typeof metricType
    );
    console.log("Available keys in typeMap:", Object.keys(typeMap));

    const result =
      typeMap[metricType] || metricType.replace("_", " ").toUpperCase();
    console.log("Result:", result);

    return result;
  }
}

export const pdfExportService = new PDFExportService();
