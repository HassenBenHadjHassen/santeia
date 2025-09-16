// Medication model implementation
import { BaseModel } from "./BaseModel";
import { Medication as IMedication } from "@/types";

export class Medication extends BaseModel implements IMedication {
  public userId: string;
  public name: string;
  public type: string; // insulin, oral, other
  public dosage: string;
  public unit: string; // units, mg, etc.
  public frequency: string; // daily, twice daily, etc.
  public instructions?: string;
  public isActive: boolean;

  constructor(data: Partial<IMedication> = {}) {
    super(data);
    this.userId = data.userId || "";
    this.name = data.name || "";
    this.type = data.type || "other";
    this.dosage = data.dosage || "";
    this.unit = data.unit || "";
    this.frequency = data.frequency || "daily";
    this.instructions =
      data.instructions === null ? undefined : data.instructions;
    this.isActive = data.isActive ?? true;
  }

  public validate(): boolean {
    return (
      !!this.userId &&
      !!this.name &&
      !!this.type &&
      !!this.dosage &&
      !!this.unit &&
      !!this.frequency &&
      typeof this.isActive === "boolean"
    );
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      userId: this.userId,
      name: this.name,
      type: this.type,
      dosage: this.dosage,
      unit: this.unit,
      frequency: this.frequency,
      instructions: this.instructions,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public fromJSON(data: Record<string, any>): this {
    this.id = data.id || this.id;
    this.userId = data.userId || this.userId;
    this.name = data.name || this.name;
    this.type = data.type || this.type;
    this.dosage = data.dosage || this.dosage;
    this.unit = data.unit || this.unit;
    this.frequency = data.frequency || this.frequency;
    this.instructions = data.instructions || this.instructions;
    this.isActive = data.isActive ?? this.isActive;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : this.createdAt;
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : this.updatedAt;
    return this;
  }

  // Helper methods
  public isInsulin(): boolean {
    return this.type.toLowerCase() === "insulin";
  }

  public isOral(): boolean {
    return this.type.toLowerCase() === "oral";
  }

  public getFrequencyInTimesPerDay(): number {
    const frequencyMap: Record<string, number> = {
      "once daily": 1,
      daily: 1,
      "twice daily": 2,
      "three times daily": 3,
      "four times daily": 4,
      "as needed": 0,
      prn: 0,
    };

    return frequencyMap[this.frequency.toLowerCase()] || 1;
  }

  public getNextDoseTime(): Date | null {
    if (!this.isActive) return null;

    const now = new Date();
    const timesPerDay = this.getFrequencyInTimesPerDay();

    if (timesPerDay === 0) return null; // As needed medications

    const hoursBetweenDoses = 24 / timesPerDay;
    const nextDose = new Date(
      now.getTime() + hoursBetweenDoses * 60 * 60 * 1000
    );

    return nextDose;
  }

  public getDosageNumeric(): number {
    const match = this.dosage.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  }

  public getFormattedDosage(): string {
    return `${this.dosage} ${this.unit}`;
  }

  public getFormattedFrequency(): string {
    return this.frequency;
  }

  public isHighFrequency(): boolean {
    return this.getFrequencyInTimesPerDay() >= 3;
  }

  public requiresMealTiming(): boolean {
    const mealTimingMedications = [
      "insulin",
      "metformin",
      "sulfonylurea",
      "meglitinide",
    ];

    return mealTimingMedications.some(
      (med) =>
        this.name.toLowerCase().includes(med) ||
        this.type.toLowerCase().includes(med)
    );
  }

  public getStorageInstructions(): string {
    if (this.isInsulin()) {
      return "Store in refrigerator. Do not freeze. Keep away from direct heat and light.";
    }

    if (
      this.type.toLowerCase().includes("tablet") ||
      this.type.toLowerCase().includes("capsule")
    ) {
      return "Store at room temperature in a dry place. Keep away from moisture and heat.";
    }

    return "Follow storage instructions on the medication label.";
  }
}
