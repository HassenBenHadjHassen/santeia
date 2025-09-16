// PhysicalActivity model implementation
import { BaseModel } from "./BaseModel";
import { PhysicalActivity as IPhysicalActivity } from "@/types";

export class PhysicalActivity extends BaseModel implements IPhysicalActivity {
  public userId: string;
  public activityType: string;
  public duration: number; // in minutes
  public intensity: string; // low, moderate, high
  public caloriesBurned?: number;
  public notes?: string;
  public timestamp: Date;

  constructor(data: Partial<IPhysicalActivity> = {}) {
    super(data);
    this.userId = data.userId || "";
    this.activityType = data.activityType || "";
    this.duration = data.duration || 0;
    this.intensity = data.intensity || "moderate";
    this.caloriesBurned = data.caloriesBurned;
    this.notes = data.notes;
    this.timestamp = data.timestamp || new Date();
  }

  public validate(): boolean {
    return (
      !!this.userId &&
      !!this.activityType &&
      this.duration > 0 &&
      !!this.intensity &&
      this.timestamp instanceof Date
    );
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      userId: this.userId,
      activityType: this.activityType,
      duration: this.duration,
      intensity: this.intensity,
      caloriesBurned: this.caloriesBurned,
      notes: this.notes,
      timestamp: this.timestamp,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public fromJSON(data: Record<string, any>): this {
    this.id = data.id || this.id;
    this.userId = data.userId || this.userId;
    this.activityType = data.activityType || this.activityType;
    this.duration = data.duration || this.duration;
    this.intensity = data.intensity || this.intensity;
    this.caloriesBurned = data.caloriesBurned || this.caloriesBurned;
    this.notes = data.notes || this.notes;
    this.timestamp = data.timestamp ? new Date(data.timestamp) : this.timestamp;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : this.createdAt;
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : this.updatedAt;
    return this;
  }

  // Helper methods
  public getIntensityLevel(): number {
    switch (this.intensity.toLowerCase()) {
      case "low":
        return 1;
      case "moderate":
        return 2;
      case "high":
        return 3;
      default:
        return 2;
    }
  }

  public getDurationInHours(): number {
    return this.duration / 60;
  }

  public isCardio(): boolean {
    const cardioActivities = [
      "running",
      "walking",
      "cycling",
      "swimming",
      "dancing",
      "aerobics",
      "jumping",
      "hiking",
      "elliptical",
      "rowing",
    ];
    return cardioActivities.some((activity) =>
      this.activityType.toLowerCase().includes(activity)
    );
  }

  public isStrength(): boolean {
    const strengthActivities = [
      "weight",
      "lifting",
      "strength",
      "resistance",
      "muscle",
      "gym",
      "push",
      "pull",
      "squat",
      "deadlift",
    ];
    return strengthActivities.some((activity) =>
      this.activityType.toLowerCase().includes(activity)
    );
  }

  public isFlexibility(): boolean {
    const flexibilityActivities = [
      "yoga",
      "stretching",
      "pilates",
      "flexibility",
      "mobility",
    ];
    return flexibilityActivities.some((activity) =>
      this.activityType.toLowerCase().includes(activity)
    );
  }

  public getActivityCategory():
    | "cardio"
    | "strength"
    | "flexibility"
    | "other" {
    if (this.isCardio()) return "cardio";
    if (this.isStrength()) return "strength";
    if (this.isFlexibility()) return "flexibility";
    return "other";
  }

  public estimateCaloriesBurned(weightKg?: number): number {
    if (this.caloriesBurned) return this.caloriesBurned;

    // Basic estimation based on activity type and intensity
    const baseCaloriesPerMinute = this.getBaseCaloriesPerMinute();
    const intensityMultiplier = this.getIntensityLevel();
    const weightMultiplier = weightKg ? weightKg / 70 : 1; // Assume 70kg as baseline

    return Math.round(
      baseCaloriesPerMinute *
        intensityMultiplier *
        weightMultiplier *
        this.duration
    );
  }

  private getBaseCaloriesPerMinute(): number {
    const activityCalories: Record<string, number> = {
      walking: 3,
      running: 8,
      cycling: 6,
      swimming: 7,
      dancing: 5,
      aerobics: 6,
      yoga: 2,
      weight: 4,
      hiking: 5,
      elliptical: 6,
      rowing: 7,
    };

    for (const [activity, calories] of Object.entries(activityCalories)) {
      if (this.activityType.toLowerCase().includes(activity)) {
        return calories;
      }
    }

    return 4; // Default moderate activity
  }
}
