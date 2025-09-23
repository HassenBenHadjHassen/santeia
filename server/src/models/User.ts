// User model implementation
import { BaseModel } from "./BaseModel";
import { User as IUser } from "@/types";

export class User extends BaseModel implements IUser {
  public email: string;
  public name: string;
  public role: "ADMIN" | "USER" | "MODERATOR";
  public isActive: boolean;
  public password: string | null;
  public onboardingCompleted: boolean;
  // Onboarding data
  public dateOfBirth: string | null;
  // Profile health fields
  public heightCm: number | null;
  public weightKg: number | null;
  public bloodPressureSystolic: number | null;
  public bloodPressureDiastolic: number | null;
  public heartRate: number | null;
  public diabetesType: string | null;
  public diagnosisDate: string | null;
  public currentMedications: string[];
  public bloodSugarTargets: {
    fasting: string;
    beforeMeals: string;
    afterMeals: string;
    bedtime: string;
  } | null;
  public activityLevel: string | null;
  public dietaryPreferences: string[];
  public emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  } | null;

  constructor(data: Partial<IUser> = {}) {
    super(data);
    this.email = data.email || "";
    this.name = data.name || "";
    this.role = data.role || "USER";
    this.isActive = data.isActive ?? true;
    this.password = data.password ?? null;
    this.onboardingCompleted = data.onboardingCompleted ?? false;
    // Initialize onboarding data
    this.dateOfBirth = data.dateOfBirth ?? null;
    this.heightCm = (data as any).heightCm ?? null;
    this.weightKg = (data as any).weightKg ?? null;
    this.bloodPressureSystolic = (data as any).bloodPressureSystolic ?? null;
    this.bloodPressureDiastolic = (data as any).bloodPressureDiastolic ?? null;
    this.heartRate = (data as any).heartRate ?? null;
    this.diabetesType = data.diabetesType ?? null;
    this.diagnosisDate = data.diagnosisDate ?? null;
    this.currentMedications = data.currentMedications ?? [];
    this.bloodSugarTargets = data.bloodSugarTargets ?? null;
    this.activityLevel = data.activityLevel ?? null;
    this.dietaryPreferences = data.dietaryPreferences ?? [];
    this.emergencyContact = data.emergencyContact ?? null;
  }

  public validate(): boolean {
    return !!(
      this.email &&
      this.name &&
      this.isValidEmail(this.email) &&
      this.role &&
      typeof this.isActive === "boolean"
    );
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      role: this.role,
      isActive: this.isActive,
      password: this.password,
      onboardingCompleted: this.onboardingCompleted,
      dateOfBirth: this.dateOfBirth,
      heightCm: this.heightCm,
      weightKg: this.weightKg,
      bloodPressureSystolic: this.bloodPressureSystolic,
      bloodPressureDiastolic: this.bloodPressureDiastolic,
      heartRate: this.heartRate,
      diabetesType: this.diabetesType,
      diagnosisDate: this.diagnosisDate,
      currentMedications: this.currentMedications,
      bloodSugarTargets: this.bloodSugarTargets,
      activityLevel: this.activityLevel,
      dietaryPreferences: this.dietaryPreferences,
      emergencyContact: this.emergencyContact,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public fromJSON(data: Record<string, any>): this {
    this.id = data.id || this.id;
    this.email = data.email || this.email;
    this.name = data.name || this.name;
    this.role = data.role || this.role;
    this.isActive = data.isActive ?? this.isActive;
    this.password = data.password ?? this.password;
    this.onboardingCompleted =
      data.onboardingCompleted ?? this.onboardingCompleted;
    this.dateOfBirth = data.dateOfBirth ?? this.dateOfBirth;
    this.heightCm = (data as any).heightCm ?? this.heightCm;
    this.weightKg = (data as any).weightKg ?? this.weightKg;
    this.bloodPressureSystolic =
      (data as any).bloodPressureSystolic ?? this.bloodPressureSystolic;
    this.bloodPressureDiastolic =
      (data as any).bloodPressureDiastolic ?? this.bloodPressureDiastolic;
    this.heartRate = (data as any).heartRate ?? this.heartRate;
    this.diabetesType = data.diabetesType ?? this.diabetesType;
    this.diagnosisDate = data.diagnosisDate ?? this.diagnosisDate;
    this.currentMedications =
      data.currentMedications ?? this.currentMedications;
    this.bloodSugarTargets = data.bloodSugarTargets ?? this.bloodSugarTargets;
    this.activityLevel = data.activityLevel ?? this.activityLevel;
    this.dietaryPreferences =
      data.dietaryPreferences ?? this.dietaryPreferences;
    this.emergencyContact = data.emergencyContact ?? this.emergencyContact;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : this.createdAt;
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : this.updatedAt;
    return this;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  public setRole(role: "ADMIN" | "USER" | "MODERATOR"): void {
    this.role = role;
    this.updateTimestamp();
  }

  public activate(): void {
    this.isActive = true;
    this.updateTimestamp();
  }

  public deactivate(): void {
    this.isActive = false;
    this.updateTimestamp();
  }
}
