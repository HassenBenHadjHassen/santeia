// Base API Client
import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import { ApiError } from "./types";
import type { ApiResponse, RequestConfig } from "./types";

export class ApiClient {
  private axiosInstance: AxiosInstance;
  private defaultConfig: RequestConfig;

  constructor(baseURL: string, defaultConfig: RequestConfig = {}) {
    this.defaultConfig = {
      timeout: 10000,
      retries: 3,
      retryDelay: 1000,
      ...defaultConfig,
    };

    this.axiosInstance = axios.create({
      baseURL: baseURL.replace(/\/$/, ""), // Remove trailing slash
      timeout: this.defaultConfig.timeout,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add request interceptor for retry logic
    this.axiosInstance.interceptors.request.use(
      (config) => config,
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const config = error.config;

        // Check if we should retry
        if (
          config &&
          this.shouldRetry(error) &&
          (config.__retryCount || 0) < (this.defaultConfig.retries || 0)
        ) {
          config.__retryCount = (config.__retryCount || 0) + 1;

          // Wait before retrying
          await this.delay(this.defaultConfig.retryDelay || 1000);

          return this.axiosInstance(config);
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  getBaseURL(): string {
    return this.axiosInstance.defaults.baseURL || "";
  }

  private async makeRequest<T>(
    endpoint: string,
    options: AxiosRequestConfig & RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      retries = this.defaultConfig.retries,
      retryDelay = this.defaultConfig.retryDelay,
      ...requestOptions
    } = options;

    try {
      const response = await this.axiosInstance.request<T>({
        url: endpoint,
        ...requestOptions,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      throw error; // Error handling is done in the interceptor
    }
  }

  private async handleResponse<T>(
    response: AxiosResponse
  ): Promise<ApiResponse<T>> {
    const data = response.data;

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

    // Axios error structure
    if (error.response) {
      const status = error.response.status;
      return status >= 500 || status === 429;
    }

    // Network errors
    return (
      error.code === "ECONNABORTED" ||
      error.code === "ENOTFOUND" ||
      error.code === "ECONNREFUSED"
    );
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private handleError(error: any): ApiError {
    if (error instanceof ApiError) {
      return error;
    }

    // Axios error handling
    if (error.response) {
      const { status, data } = error.response;
      return new ApiError(
        data?.error || data?.message || "Request failed",
        status,
        data?.code,
        data
      );
    }

    if (error.code === "ECONNABORTED") {
      return new ApiError("Request timeout", 408);
    }

    if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
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
      data: data,
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
      data: data,
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
      data: data,
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
    options: AxiosRequestConfig & RequestConfig = {},
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
