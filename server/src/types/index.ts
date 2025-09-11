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
  // Onboarding data
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
