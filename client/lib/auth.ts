// Authentication service for client-side API calls
const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://your-api-domain.com/api"
    : "http://localhost:3001/api";

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
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
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Login failed");
    }

    if (data.success) {
      this.setToken(data.data.token);
      this.setUser(data.data.user);
    }

    return data.data;
  }

  // Signup user
  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/users/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Signup failed");
    }

    if (data.success) {
      this.setToken(data.data.token);
      this.setUser(data.data.user);
    }

    return data.data;
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
