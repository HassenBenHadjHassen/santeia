// Authentication service for client-side API calls
import {
  userService,
  type User,
  type AuthResponse,
  type LoginCredentials,
  type SignupCredentials,
} from "./api";

class AuthService {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on initialization (only on client side)
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token");
    }
  }

  // Set authentication token
  setToken(token: string): void {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token);
    }
  }

  // Get current token
  getToken(): string | null {
    return this.token;
  }

  // Clear authentication data
  clearAuth(): void {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
    }
  }

  // Get current user data
  getCurrentUser(): User | null {
    if (typeof window === "undefined") return null;
    const userData = localStorage.getItem("user_data");
    return userData ? JSON.parse(userData) : null;
  }

  // Set user data
  setUser(user: User): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("user_data", JSON.stringify(user));
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await userService.login(credentials);
      this.setToken(response.token);
      this.setUser(response.user);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Signup user
  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    try {
      const response = await userService.signup(credentials);
      this.setToken(response.token);
      this.setUser(response.user);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Logout user
  logout(): void {
    this.clearAuth();
  }

  // Get headers with authentication token
  getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Make authenticated API request
  async authenticatedRequest(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const headers = {
      ...this.getAuthHeaders(),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // If token is invalid, clear auth
    if (response.status === 401 || response.status === 403) {
      this.clearAuth();
    }

    return response;
  }
}

// Export singleton instance
export const authService = new AuthService();
