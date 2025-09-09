// Base API Client
import { ApiError } from "./types";
import type { ApiResponse, RequestConfig } from "./types";

export class ApiClient {
  private baseURL: string;
  private defaultConfig: RequestConfig;

  constructor(baseURL: string, defaultConfig: RequestConfig = {}) {
    this.baseURL = baseURL.replace(/\/$/, ""); // Remove trailing slash
    this.defaultConfig = {
      timeout: 10000,
      retries: 3,
      retryDelay: 1000,
      ...defaultConfig,
    };
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit & RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      timeout = this.defaultConfig.timeout,
      retries = this.defaultConfig.retries,
      retryDelay = this.defaultConfig.retryDelay,
      ...requestOptions
    } = options;

    const url = `${this.baseURL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await this.executeRequest(url, {
        ...requestOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return await this.handleResponse<T>(response);
    } catch (error) {
      clearTimeout(timeoutId);

      if ((retries ?? 0) > 0 && this.shouldRetry(error)) {
        await this.delay(retryDelay ?? 1000);
        return this.makeRequest<T>(endpoint, {
          ...options,
          retries: (retries ?? 0) - 1,
        });
      }

      throw this.handleError(error);
    }
  }

  private async executeRequest(
    url: string,
    options: RequestInit
  ): Promise<Response> {
    const defaultHeaders = {
      "Content-Type": "application/json",
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    return response;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.error || data.message || "Request failed",
        response.status,
        data.code,
        data
      );
    }

    return {
      success: data.success ?? true,
      data: data.data,
      message: data.message,
      statusCode: response.status,
    };
  }

  private shouldRetry(error: any): boolean {
    if (error instanceof ApiError) {
      return error.statusCode >= 500 || error.statusCode === 429;
    }
    return error.name === "AbortError" || error.name === "TypeError";
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private handleError(error: any): ApiError {
    if (error instanceof ApiError) {
      return error;
    }

    if (error.name === "AbortError") {
      return new ApiError("Request timeout", 408);
    }

    if (error.name === "TypeError") {
      return new ApiError("Network error", 0);
    }

    return new ApiError(error.message || "Unknown error occurred", 500);
  }

  // HTTP Methods
  async get<T>(
    endpoint: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: "GET", ...config });
  }

  async post<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    });
  }

  async put<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    });
  }

  async patch<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    });
  }

  async delete<T>(
    endpoint: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: "DELETE", ...config });
  }

  // Authenticated requests
  async authenticatedRequest<T>(
    endpoint: string,
    options: RequestInit & RequestConfig = {},
    token?: string
  ): Promise<ApiResponse<T>> {
    const headers = {
      ...options.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    return this.makeRequest<T>(endpoint, {
      ...options,
      headers: headers as Record<string, string>,
    });
  }
}
