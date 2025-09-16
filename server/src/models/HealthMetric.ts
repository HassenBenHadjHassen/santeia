// HealthMetric model implementation
import { BaseModel } from "./BaseModel";
import { HealthMetric as IHealthMetric, MetricType } from "@/types";

export class HealthMetric extends BaseModel implements IHealthMetric {
  public userId: string;
  public metricType: MetricType;
  public value: number;
  public unit: string;
  public notes?: string;
  public timestamp: Date;

  constructor(data: Partial<IHealthMetric> = {}) {
    super(data);
    this.userId = data.userId || "";
    this.metricType = data.metricType || "WEIGHT";
    this.value = data.value || 0;
    this.unit = data.unit || "";
    this.notes = data.notes;
    this.timestamp = data.timestamp || new Date();
  }

  public validate(): boolean {
    return (
      !!this.userId &&
      !!this.metricType &&
      this.value >= 0 &&
      !!this.unit &&
      this.timestamp instanceof Date
    );
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      userId: this.userId,
      metricType: this.metricType,
      value: this.value,
      unit: this.unit,
      notes: this.notes,
      timestamp: this.timestamp,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public fromJSON(data: Record<string, any>): this {
    this.id = data.id || this.id;
    this.userId = data.userId || this.userId;
    this.metricType = data.metricType || this.metricType;
    this.value = data.value || this.value;
    this.unit = data.unit || this.unit;
    this.notes = data.notes || this.notes;
    this.timestamp = data.timestamp ? new Date(data.timestamp) : this.timestamp;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : this.createdAt;
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : this.updatedAt;
    return this;
  }

  // Helper methods
  public isWeight(): boolean {
    return this.metricType === "WEIGHT";
  }

  public isBloodPressure(): boolean {
    return (
      this.metricType === "BLOOD_PRESSURE_SYSTOLIC" ||
      this.metricType === "BLOOD_PRESSURE_DIASTOLIC"
    );
  }

  public isCholesterol(): boolean {
    return (
      this.metricType.includes("CHOLESTEROL") ||
      this.metricType === "TRIGLYCERIDES"
    );
  }

  public isHeartRate(): boolean {
    return this.metricType === "HEART_RATE";
  }

  public isBMI(): boolean {
    return this.metricType === "BMI";
  }

  public getCategory(): "normal" | "elevated" | "high" | "low" {
    switch (this.metricType) {
      case "WEIGHT":
        return this.getWeightCategory();
      case "BLOOD_PRESSURE_SYSTOLIC":
        return this.getBloodPressureCategory();
      case "BLOOD_PRESSURE_DIASTOLIC":
        return this.getBloodPressureDiastolicCategory();
      case "CHOLESTEROL_TOTAL":
        return this.getTotalCholesterolCategory();
      case "CHOLESTEROL_HDL":
        return this.getHDLCholesterolCategory();
      case "CHOLESTEROL_LDL":
        return this.getLDLCholesterolCategory();
      case "TRIGLYCERIDES":
        return this.getTriglyceridesCategory();
      case "HEART_RATE":
        return this.getHeartRateCategory();
      case "BMI":
        return this.getBMICategory();
      default:
        return "normal";
    }
  }

  private getWeightCategory(): "normal" | "elevated" | "high" | "low" {
    // This would need height context for BMI calculation
    // For now, return normal as we don't have height
    return "normal";
  }

  private getBloodPressureCategory(): "normal" | "elevated" | "high" | "low" {
    if (this.value < 120) return "normal";
    if (this.value < 130) return "elevated";
    if (this.value < 140) return "high";
    return "high";
  }

  private getBloodPressureDiastolicCategory():
    | "normal"
    | "elevated"
    | "high"
    | "low" {
    if (this.value < 80) return "normal";
    if (this.value < 90) return "elevated";
    return "high";
  }

  private getTotalCholesterolCategory():
    | "normal"
    | "elevated"
    | "high"
    | "low" {
    if (this.value < 200) return "normal";
    if (this.value < 240) return "elevated";
    return "high";
  }

  private getHDLCholesterolCategory(): "normal" | "elevated" | "high" | "low" {
    if (this.value < 40) return "low";
    if (this.value < 60) return "normal";
    return "high";
  }

  private getLDLCholesterolCategory(): "normal" | "elevated" | "high" | "low" {
    if (this.value < 100) return "normal";
    if (this.value < 160) return "elevated";
    return "high";
  }

  private getTriglyceridesCategory(): "normal" | "elevated" | "high" | "low" {
    if (this.value < 150) return "normal";
    if (this.value < 200) return "elevated";
    return "high";
  }

  private getHeartRateCategory(): "normal" | "elevated" | "high" | "low" {
    if (this.value < 60) return "low";
    if (this.value < 100) return "normal";
    if (this.value < 120) return "elevated";
    return "high";
  }

  private getBMICategory(): "normal" | "elevated" | "high" | "low" {
    if (this.value < 18.5) return "low";
    if (this.value < 25) return "normal";
    if (this.value < 30) return "elevated";
    return "high";
  }

  public getFormattedValue(): string {
    return `${this.value} ${this.unit}`;
  }

  public getDisplayName(): string {
    const displayNames: Record<MetricType, string> = {
      WEIGHT: "Weight",
      BLOOD_PRESSURE_SYSTOLIC: "Systolic Blood Pressure",
      BLOOD_PRESSURE_DIASTOLIC: "Diastolic Blood Pressure",
      CHOLESTEROL_TOTAL: "Total Cholesterol",
      CHOLESTEROL_HDL: "HDL Cholesterol",
      CHOLESTEROL_LDL: "LDL Cholesterol",
      TRIGLYCERIDES: "Triglycerides",
      HEART_RATE: "Heart Rate",
      BMI: "Body Mass Index",
    };

    return displayNames[this.metricType] || this.metricType;
  }

  public isWithinNormalRange(): boolean {
    return this.getCategory() === "normal";
  }

  public requiresAttention(): boolean {
    const category = this.getCategory();
    return category === "high" || category === "low";
  }
}
