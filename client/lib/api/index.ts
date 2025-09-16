// Main API Service - Centralized API management
import { ApiClient } from "./client";
import { UserService } from "./services/userService";
import { ConversationService } from "./services/conversationService";
import { LLMService } from "./services/llmService";
import { BloodSugarService } from "./services/bloodSugarService";
import { MealService } from "./services/mealService";
import { PhysicalActivityService } from "./services/physicalActivityService";
import { MedicationService } from "./services/medicationService";
import { HealthMetricService } from "./services/healthMetricService";
import { AlertService } from "./services/alertService";
import type { RequestConfig } from "./types";

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const defaultConfig: RequestConfig = {
  timeout: 15000,
  retries: 3,
  retryDelay: 1000,
};

// Create API client instance
const apiClient = new ApiClient(API_BASE_URL, defaultConfig);

// Create service instances
export const userService = new UserService(apiClient);
export const conversationService = new ConversationService(apiClient);
export const llmService = new LLMService(apiClient);
export const bloodSugarService = new BloodSugarService(apiClient);
export const mealService = new MealService(apiClient);
export const physicalActivityService = new PhysicalActivityService(apiClient);
export const medicationService = new MedicationService(apiClient);
export const healthMetricService = new HealthMetricService(apiClient);
export const alertService = new AlertService(apiClient);

// Export the API client for direct use if needed
export { apiClient };

// Export types
export * from "./types";

// Export individual services for specific use cases
export { UserService } from "./services/userService";
export { ConversationService } from "./services/conversationService";
export { LLMService } from "./services/llmService";
export { BloodSugarService } from "./services/bloodSugarService";
export { MealService } from "./services/mealService";
export { PhysicalActivityService } from "./services/physicalActivityService";
export { MedicationService } from "./services/medicationService";
export { HealthMetricService } from "./services/healthMetricService";
export { AlertService } from "./services/alertService";

// Main API class that provides access to all services
export class ApiService {
  public users: UserService;
  public conversations: ConversationService;
  public llm: LLMService;
  public bloodSugar: BloodSugarService;
  public meals: MealService;
  public physicalActivities: PhysicalActivityService;
  public medications: MedicationService;
  public healthMetrics: HealthMetricService;
  public alerts: AlertService;
  public client: ApiClient;

  constructor() {
    this.client = apiClient;
    this.users = userService;
    this.conversations = conversationService;
    this.llm = llmService;
    this.bloodSugar = bloodSugarService;
    this.meals = mealService;
    this.physicalActivities = physicalActivityService;
    this.medications = medicationService;
    this.healthMetrics = healthMetricService;
    this.alerts = alertService;
  }

  // Health check for all services
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.users.healthCheck();
  }

  // Set authentication token for all services
  setAuthToken(token: string): void {
    // This would be handled by the individual services when making requests
    // The token is passed to each authenticated request
  }

  // Clear authentication
  clearAuth(): void {
    // This would be handled by the individual services
  }
}

// Export singleton instance
export const api = new ApiService();
