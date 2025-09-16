// Meal model implementation
import { BaseModel } from "./BaseModel";
import { Meal as IMeal } from "@/types";

export class Meal extends BaseModel implements IMeal {
  public userId: string;
  public name: string;
  public description?: string;
  public carbohydrates?: number;
  public calories?: number;
  public protein?: number;
  public fat?: number;
  public fiber?: number;
  public sugar?: number;
  public timestamp: Date;

  constructor(data: Partial<IMeal> = {}) {
    super(data);
    this.userId = data.userId || "";
    this.name = data.name || "";
    this.description = data.description === null ? undefined : data.description;
    this.carbohydrates =
      data.carbohydrates === null ? undefined : data.carbohydrates;
    this.calories = data.calories === null ? undefined : data.calories;
    this.protein = data.protein === null ? undefined : data.protein;
    this.fat = data.fat === null ? undefined : data.fat;
    this.fiber = data.fiber === null ? undefined : data.fiber;
    this.sugar = data.sugar === null ? undefined : data.sugar;
    this.timestamp = data.timestamp || new Date();
  }

  public validate(): boolean {
    return !!this.userId && !!this.name && this.timestamp instanceof Date;
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      userId: this.userId,
      name: this.name,
      description: this.description,
      carbohydrates: this.carbohydrates,
      calories: this.calories,
      protein: this.protein,
      fat: this.fat,
      fiber: this.fiber,
      sugar: this.sugar,
      timestamp: this.timestamp,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public fromJSON(data: Record<string, any>): this {
    this.id = data.id || this.id;
    this.userId = data.userId || this.userId;
    this.name = data.name || this.name;
    this.description = data.description || this.description;
    this.carbohydrates = data.carbohydrates || this.carbohydrates;
    this.calories = data.calories || this.calories;
    this.protein = data.protein || this.protein;
    this.fat = data.fat || this.fat;
    this.fiber = data.fiber || this.fiber;
    this.sugar = data.sugar || this.sugar;
    this.timestamp = data.timestamp ? new Date(data.timestamp) : this.timestamp;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : this.createdAt;
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : this.updatedAt;
    return this;
  }

  // Helper methods
  public getTotalMacros(): {
    carbohydrates: number;
    calories: number;
    protein: number;
    fat: number;
    fiber: number;
    sugar: number;
  } {
    return {
      carbohydrates: this.carbohydrates || 0,
      calories: this.calories || 0,
      protein: this.protein || 0,
      fat: this.fat || 0,
      fiber: this.fiber || 0,
      sugar: this.sugar || 0,
    };
  }

  public getCarbohydrateRatio(): number {
    if (!this.carbohydrates || !this.calories) return 0;
    return (this.carbohydrates * 4) / this.calories; // Carbs provide 4 cal/g
  }

  public isHighCarb(): boolean {
    return (this.carbohydrates || 0) > 50; // grams
  }

  public isLowCarb(): boolean {
    return (this.carbohydrates || 0) < 20; // grams
  }

  public getMealType(): "breakfast" | "lunch" | "dinner" | "snack" {
    const hour = this.timestamp.getHours();
    if (hour >= 5 && hour < 11) return "breakfast";
    if (hour >= 11 && hour < 16) return "lunch";
    if (hour >= 16 && hour < 21) return "dinner";
    return "snack";
  }
}
