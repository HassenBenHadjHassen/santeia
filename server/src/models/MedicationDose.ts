// MedicationDose model implementation
import { BaseModel } from "./BaseModel";
import { MedicationDose as IMedicationDose } from "@/types";

export class MedicationDose extends BaseModel implements IMedicationDose {
  public medicationId: string;
  public userId: string;
  public dosage: string;
  public unit: string;
  public takenAt: Date;
  public notes?: string;

  constructor(data: Partial<IMedicationDose> = {}) {
    super(data);
    this.medicationId = data.medicationId || "";
    this.userId = data.userId || "";
    this.dosage = data.dosage || "";
    this.unit = data.unit || "";
    this.takenAt = data.takenAt || new Date();
    this.notes = data.notes === null ? undefined : data.notes;
  }

  public validate(): boolean {
    return (
      !!this.medicationId &&
      !!this.userId &&
      !!this.dosage &&
      !!this.unit &&
      this.takenAt instanceof Date
    );
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      medicationId: this.medicationId,
      userId: this.userId,
      dosage: this.dosage,
      unit: this.unit,
      takenAt: this.takenAt,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public fromJSON(data: Record<string, any>): this {
    this.id = data.id || this.id;
    this.medicationId = data.medicationId || this.medicationId;
    this.userId = data.userId || this.userId;
    this.dosage = data.dosage || this.dosage;
    this.unit = data.unit || this.unit;
    this.takenAt = data.takenAt ? new Date(data.takenAt) : this.takenAt;
    this.notes = data.notes || this.notes;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : this.createdAt;
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : this.updatedAt;
    return this;
  }

  // Helper methods
  public getDosageNumeric(): number {
    const match = this.dosage.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  }

  public getFormattedDosage(): string {
    return `${this.dosage} ${this.unit}`;
  }

  public getTimeSinceTaken(): number {
    return Date.now() - this.takenAt.getTime();
  }

  public getTimeSinceTakenInMinutes(): number {
    return Math.floor(this.getTimeSinceTaken() / (1000 * 60));
  }

  public getTimeSinceTakenInHours(): number {
    return Math.floor(this.getTimeSinceTakenInMinutes() / 60);
  }

  public getTimeSinceTakenInDays(): number {
    return Math.floor(this.getTimeSinceTakenInHours() / 24);
  }

  public getFormattedTimeSinceTaken(): string {
    const minutes = this.getTimeSinceTakenInMinutes();

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;

    const hours = this.getTimeSinceTakenInHours();
    if (hours < 24) return `${hours}h ago`;

    const days = this.getTimeSinceTakenInDays();
    return `${days}d ago`;
  }

  public isRecent(): boolean {
    // Consider doses taken within the last 2 hours as recent
    return this.getTimeSinceTakenInHours() < 2;
  }

  public isToday(): boolean {
    const today = new Date();
    const takenDate = new Date(this.takenAt);

    return (
      takenDate.getDate() === today.getDate() &&
      takenDate.getMonth() === today.getMonth() &&
      takenDate.getFullYear() === today.getFullYear()
    );
  }

  public isThisWeek(): boolean {
    const now = new Date();
    const takenDate = new Date(this.takenAt);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return takenDate >= weekAgo;
  }

  public isThisMonth(): boolean {
    const now = new Date();
    const takenDate = new Date(this.takenAt);

    return (
      takenDate.getMonth() === now.getMonth() &&
      takenDate.getFullYear() === now.getFullYear()
    );
  }

  public getTimeOfDay(): "morning" | "afternoon" | "evening" | "night" {
    const hour = this.takenAt.getHours();

    if (hour >= 5 && hour < 12) return "morning";
    if (hour >= 12 && hour < 17) return "afternoon";
    if (hour >= 17 && hour < 21) return "evening";
    return "night";
  }

  public wasTakenOnTime(
    expectedTime?: Date,
    toleranceMinutes: number = 30
  ): boolean {
    if (!expectedTime) return true;

    const diffInMinutes = Math.abs(
      (this.takenAt.getTime() - expectedTime.getTime()) / (1000 * 60)
    );

    return diffInMinutes <= toleranceMinutes;
  }

  public getAdherenceScore(
    expectedTime?: Date,
    toleranceMinutes: number = 30
  ): number {
    if (!expectedTime) return 100;

    const diffInMinutes = Math.abs(
      (this.takenAt.getTime() - expectedTime.getTime()) / (1000 * 60)
    );

    if (diffInMinutes <= toleranceMinutes) return 100;

    // Decrease score based on how far off the time is
    const maxTolerance = toleranceMinutes * 3; // 3x tolerance for 0 score
    const score = Math.max(
      0,
      100 - ((diffInMinutes - toleranceMinutes) / maxTolerance) * 100
    );

    return Math.round(score);
  }
}
