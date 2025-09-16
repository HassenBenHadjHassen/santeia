// Common types and interfaces for the application

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User extends BaseEntity {
  email: string;
  name: string;
  role: "ADMIN" | "USER" | "MODERATOR";
  isActive: boolean;
  password: string | null;
  onboardingCompleted: boolean;
  // Onboarding data
  dateOfBirth: string | null;
  diabetesType: string | null;
  diagnosisDate: string | null;
  currentMedications: string[];
  bloodSugarTargets: {
    fasting: string;
    beforeMeals: string;
    afterMeals: string;
    bedtime: string;
  } | null;
  activityLevel: string | null;
  dietaryPreferences: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  } | null;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  validationErrors?: ValidationError[];
}

export interface Conversation extends BaseEntity {
  title: string;
  userId: string;
  messages?: Message[];
}

export interface Message extends BaseEntity {
  content: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  conversationId: string;
  userId: string;
}

export interface LLMRequest extends BaseEntity {
  model: string;
  prompt: string;
  response?: string;
  tokens?: number;
  cost?: number;
  duration?: number;
  userId: string;
}

export interface OnboardingData {
  diabetesType: string;
  diagnosisDate: string;
  currentMedications: string[];
  bloodSugarTargets: {
    fasting: string;
    beforeMeals: string;
    afterMeals: string;
    bedtime: string;
  };
  activityLevel: string;
  dietaryPreferences: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

// New health-related types
export type ReadingType =
  | "FASTING"
  | "BEFORE_MEAL"
  | "AFTER_MEAL"
  | "BEDTIME"
  | "RANDOM"
  | "POST_EXERCISE";
export type MetricType =
  | "WEIGHT"
  | "BLOOD_PRESSURE_SYSTOLIC"
  | "BLOOD_PRESSURE_DIASTOLIC"
  | "CHOLESTEROL_TOTAL"
  | "CHOLESTEROL_HDL"
  | "CHOLESTEROL_LDL"
  | "TRIGLYCERIDES"
  | "HEART_RATE"
  | "BMI";
export type AlertType =
  | "BLOOD_SUGAR_LOW"
  | "BLOOD_SUGAR_HIGH"
  | "MEDICATION_REMINDER"
  | "MEAL_REMINDER"
  | "EXERCISE_REMINDER"
  | "APPOINTMENT_REMINDER"
  | "GENERAL_HEALTH";

export interface BloodSugarReading extends BaseEntity {
  userId: string;
  value: number;
  unit: string;
  readingType: ReadingType;
  notes?: string;
  timestamp: Date;
}

export interface Meal extends BaseEntity {
  userId: string;
  name: string;
  description?: string;
  carbohydrates?: number;
  calories?: number;
  protein?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  timestamp: Date;
}

export interface PhysicalActivity extends BaseEntity {
  userId: string;
  activityType: string;
  duration: number; // in minutes
  intensity: string; // low, moderate, high
  caloriesBurned?: number;
  notes?: string;
  timestamp: Date;
}

export interface Medication extends BaseEntity {
  userId: string;
  name: string;
  type: string; // insulin, oral, other
  dosage: string;
  unit: string; // units, mg, etc.
  frequency: string; // daily, twice daily, etc.
  instructions?: string;
  isActive: boolean;
}

export interface MedicationDose extends BaseEntity {
  medicationId: string;
  userId: string;
  dosage: string;
  unit: string;
  takenAt: Date;
  notes?: string;
}

export interface HealthMetric extends BaseEntity {
  userId: string;
  metricType: MetricType;
  value: number;
  unit: string;
  notes?: string;
  timestamp: Date;
}

export interface Alert extends BaseEntity {
  userId: string;
  type: AlertType;
  title: string;
  message: string;
  isRead: boolean;
  priority: string; // low, medium, high, urgent
  data?: any; // Additional data for the alert
}

// Request/Response types for API
export interface CreateBloodSugarReadingRequest {
  value: number;
  unit?: string;
  readingType: ReadingType;
  notes?: string;
  timestamp?: Date;
}

export interface CreateMealRequest {
  name: string;
  description?: string;
  carbohydrates?: number;
  calories?: number;
  protein?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  timestamp?: Date;
}

export interface CreatePhysicalActivityRequest {
  activityType: string;
  duration: number;
  intensity: string;
  caloriesBurned?: number;
  notes?: string;
  timestamp?: Date;
}

export interface CreateMedicationRequest {
  name: string;
  type: string;
  dosage: string;
  unit: string;
  frequency: string;
  instructions?: string;
}

export interface CreateHealthMetricRequest {
  metricType: MetricType;
  value: number;
  unit: string;
  notes?: string;
  timestamp?: Date;
}

export interface BloodSugarStats {
  average: number;
  min: number;
  max: number;
  count: number;
  trend: "up" | "down" | "stable";
  inRange: number; // percentage
}

export interface HbA1cEstimate {
  estimated: number;
  confidence: "low" | "medium" | "high";
  basedOnReadings: number;
  timeRange: {
    from: Date;
    to: Date;
  };
}
