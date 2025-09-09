// User API Service
import { ApiClient } from "../client";
import type {
  User,
  LoginCredentials,
  SignupCredentials,
  AuthResponse,
  UserFilters,
  PaginationParams,
  PaginatedResponse,
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

  // User CRUD operations
  async createUser(userData: Partial<User>): Promise<User> {
    const response = await this.apiClient.post<User>("/users", userData);
    return response.data!;
  }

  async getUserById(id: string, token: string): Promise<User> {
    const response = await this.apiClient.authenticatedRequest<User>(
      `/users/${id}`,
      { method: "GET" },
      token
    );
    return response.data!;
  }

  async getAllUsers(
    filters?: UserFilters,
    pagination?: PaginationParams,
    token?: string
  ): Promise<PaginatedResponse<User>> {
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

  async updateUser(
    id: string,
    userData: Partial<User>,
    token: string
  ): Promise<User> {
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

  async deleteUser(id: string, token: string): Promise<void> {
    await this.apiClient.authenticatedRequest(
      `/users/${id}`,
      { method: "DELETE" },
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
