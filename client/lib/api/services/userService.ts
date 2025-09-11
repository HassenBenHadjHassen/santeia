// User API Service
import { ApiClient } from "../client";
import { authService } from "../../auth";
import type {
  User,
  LoginCredentials,
  SignupCredentials,
  AuthResponse,
  UserFilters,
  PaginationParams,
  PaginatedResponse,
  UpdateProfileRequest,
  OnboardingData,
} from "../types";

export class UserService {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  // Authentication methods
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.apiClient.post<AuthResponse>(
      "/users/login",
      credentials
    );
    return response.data!;
  }

  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    const response = await this.apiClient.post<AuthResponse>(
      "/users/signup",
      credentials
    );
    return response.data!;
  }

  // Authenticated: get current user profile
  async me(token: string): Promise<User> {
    const response = await this.apiClient.authenticatedRequest<User>(
      "/users/me",
      { method: "GET" },
      token
    );
    return response.data!;
  }

  // Update current user profile
  async updateProfile(profileData: UpdateProfileRequest): Promise<User> {
    const token = authService.getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await this.apiClient.authenticatedRequest<User>(
      "/users/me",
      {
        method: "PUT",
        body: JSON.stringify(profileData),
      },
      token
    );
    return response.data!;
  }

  // Save onboarding data
  async saveOnboarding(
    onboardingData: OnboardingData
  ): Promise<{ success: boolean; message: string }> {
    const token = authService.getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await this.apiClient.authenticatedRequest<{
      success: boolean;
      message: string;
    }>(
      "/users/onboarding",
      {
        method: "POST",
        body: JSON.stringify({ onboardingData }),
      },
      token
    );
    return response.data!;
  }

  // User CRUD operations
  async createUser(userData: Partial<User>): Promise<User> {
    const response = await this.apiClient.post<User>("/users", userData);
    return response.data!;
  }

  async getUserById(id: string): Promise<User> {
    const token = authService.getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await this.apiClient.authenticatedRequest<User>(
      `/users/${id}`,
      { method: "GET" },
      token
    );
    return response.data!;
  }

  async getAllUsers(
    filters?: UserFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<User>> {
    const token = authService.getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    if (pagination) {
      Object.entries(pagination).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const endpoint = `/users${queryString ? `?${queryString}` : ""}`;

    const response = await this.apiClient.authenticatedRequest<
      PaginatedResponse<User>
    >(endpoint, { method: "GET" }, token);
    return response.data!;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const token = authService.getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await this.apiClient.authenticatedRequest<User>(
      `/users/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(userData),
      },
      token
    );
    return response.data!;
  }

  async deleteUser(id: string): Promise<void> {
    const token = authService.getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    await this.apiClient.authenticatedRequest(
      `/users/${id}`,
      {
        method: "DELETE",
      },
      token
    );
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.apiClient.get<{
      status: string;
      timestamp: string;
    }>("/health");
    return response.data!;
  }
}
