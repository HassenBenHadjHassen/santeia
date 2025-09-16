// BloodSugarReading model implementation
import { BaseModel } from "./BaseModel";
import { BloodSugarReading as IBloodSugarReading, ReadingType } from "@/types";

export class BloodSugarReading extends BaseModel implements IBloodSugarReading {
  public userId: string;
  public value: number;
  public unit: string;
  public readingType: ReadingType;
  public notes?: string;
  public timestamp: Date;

  constructor(data: Partial<IBloodSugarReading> = {}) {
    super(data);
    this.userId = data.userId || "";
    this.value = data.value || 0;
    this.unit = data.unit || "mg/dL";
    this.readingType = data.readingType || ReadingType.RANDOM;
    this.notes = data.notes === null ? undefined : data.notes;
    this.timestamp = data.timestamp || new Date();
  }

  public validate(): boolean {
    return (
      !!this.userId &&
      this.value > 0 &&
      !!this.unit &&
      !!this.readingType &&
      this.timestamp instanceof Date
    );
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      userId: this.userId,
      value: this.value,
      unit: this.unit,
      readingType: this.readingType,
      notes: this.notes,
      timestamp: this.timestamp,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public fromJSON(data: Record<string, any>): this {
    this.id = data.id || this.id;
    this.userId = data.userId || this.userId;
    this.value = data.value || this.value;
    this.unit = data.unit || this.unit;
    this.readingType = data.readingType || this.readingType;
    this.notes = data.notes || this.notes;
    this.timestamp = data.timestamp ? new Date(data.timestamp) : this.timestamp;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : this.createdAt;
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : this.updatedAt;
    return this;
  }

  // Helper methods
  public isHigh(): boolean {
    // General guidelines for high blood sugar
    return this.value > 180; // mg/dL
  }

  public isLow(): boolean {
    // General guidelines for low blood sugar
    return this.value < 70; // mg/dL
  }

  public isInRange(): boolean {
    return !this.isHigh() && !this.isLow();
  }

  public getCategory(): "low" | "normal" | "high" {
    if (this.isLow()) return "low";
    if (this.isHigh()) return "high";
    return "normal";
  }

  public convertToMmolL(): number {
    if (this.unit === "mmol/L") return this.value;
    return this.value / 18; // Convert mg/dL to mmol/L
  }

  public convertToMgDl(): number {
    if (this.unit === "mg/dL") return this.value;
    return this.value * 18; // Convert mmol/L to mg/dL
  }
}
