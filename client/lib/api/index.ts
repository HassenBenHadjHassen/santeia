// Main API Service - Centralized API management
import { ApiClient } from "./client";
import { UserService } from "./services/userService";
import { ConversationService } from "./services/conversationService";
import { LLMService } from "./services/llmService";
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

// Export the API client for direct use if needed
export { apiClient };

// Export types
export * from "./types";

// Export individual services for specific use cases
export { UserService } from "./services/userService";
export { ConversationService } from "./services/conversationService";
export { LLMService } from "./services/llmService";

// Main API class that provides access to all services
export class ApiService {
  public users: UserService;
  public conversations: ConversationService;
  public llm: LLMService;
  public client: ApiClient;

  constructor() {
    this.client = apiClient;
    this.users = userService;
    this.conversations = conversationService;
    this.llm = llmService;
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
