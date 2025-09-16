// API Types and Interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Onboarding data
  diabetesType?: string;
  diagnosisDate?: string;
  currentMedications?: string[];
  bloodSugarTargets?: {
    fasting: string;
    beforeMeals: string;
    afterMeals: string;
    bedtime: string;
  };
  activityLevel?: string;
  dietaryPreferences?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface UserFilters {
  role?: string;
  isActive?: boolean;
  search?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
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

export interface SaveOnboardingRequest {
  onboardingData: OnboardingData;
}

// Conversation Types
export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: string;
  conversationId: string;
}

export interface Conversation {
  id: string;
  title: string;
  userId: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateConversationRequest {
  title: string;
}

export interface SendMessageRequest {
  content: string;
  conversationId: string;
}

export interface SendMessageResponse {
  message: Message;
  response: Message;
}

export interface ConversationFilters {
  userId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

// LLM Types
export interface LLMGenerateRequest {
  prompt: string;
  userId: string;
  conversationId?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  repetitionPenalty?: number;
}

export interface LLMGenerateResponse {
  text: string;
  tokens: number;
  duration: number;
  cost?: number;
}

export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  provider: string;
  capabilities: string[];
}

export interface UsageStats {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  averageResponseTime: number;
}

export interface RecentRequest {
  id: string;
  model: string;
  prompt: string;
  response: string;
  tokens: number;
  cost: number;
  duration: number;
  createdAt: string;
}

// Error Types
export class ApiError extends Error {
  public statusCode: number;
  public code?: string;
  public details?: any;

  constructor(
    message: string,
    statusCode: number,
    code?: string,
    details?: any
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

// Request Configuration
export interface RequestConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
  // Axios specific options
  validateStatus?: (status: number) => boolean;
  responseType?:
    | "json"
    | "text"
    | "blob"
    | "arraybuffer"
    | "document"
    | "stream";
  withCredentials?: boolean;
}

// Health Data Types
export type AlertType =
  | "BLOOD_SUGAR_LOW"
  | "BLOOD_SUGAR_HIGH"
  | "MEDICATION_REMINDER"
  | "MEAL_REMINDER"
  | "EXERCISE_REMINDER"
  | "APPOINTMENT_REMINDER"
  | "GENERAL_HEALTH";

export type ReadingType =
  | "fasting"
  | "before_meal"
  | "after_meal"
  | "bedtime"
  | "random";
export type MealType = "breakfast" | "lunch" | "dinner" | "snack";
export type ActivityType =
  | "cardio"
  | "strength"
  | "flexibility"
  | "sports"
  | "walking"
  | "cycling"
  | "swimming"
  | "other";
export type Intensity = "low" | "moderate" | "high";
export type MedicationType =
  | "oral"
  | "injection"
  | "inhaler"
  | "topical"
  | "other";
export type Frequency = "daily" | "weekly" | "monthly" | "as_needed";
export type HealthMetricType =
  | "weight"
  | "height"
  | "bmi"
  | "temperature"
  | "heart_rate"
  | "blood_pressure"
  | "cholesterol";
export type Priority = "low" | "medium" | "high" | "urgent";

// Re-export service response type for convenience
export type ServiceResponse<T> = ApiResponse<T>;
