// Health Metric Service - Handles health metrics tracking operations
import { ApiClient } from "../client";
import type { RequestConfig, ServiceResponse } from "../types";

export interface HealthMetric {
  id: string;
  userId: string;
  type:
    | "weight"
    | "height"
    | "bmi"
    | "temperature"
    | "heart_rate"
    | "blood_pressure"
    | "cholesterol";
  value: string;
  unit: string;
  timestamp: Date;
  notes?: string;
  additionalData?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateHealthMetricRequest {
  type:
    | "weight"
    | "height"
    | "bmi"
    | "temperature"
    | "heart_rate"
    | "blood_pressure"
    | "cholesterol";
  value: string;
  unit: string;
  timestamp?: Date;
  notes?: string;
  additionalData?: Record<string, any>;
}

export interface UpdateHealthMetricRequest {
  type?:
    | "weight"
    | "height"
    | "bmi"
    | "temperature"
    | "heart_rate"
    | "blood_pressure"
    | "cholesterol";
  value?: string;
  unit?: string;
  timestamp?: Date;
  notes?: string;
  additionalData?: Record<string, any>;
}

export interface HealthMetricFilters {
  type?: string;
  startDate?: Date;
  endDate?: Date;
  minValue?: number;
  maxValue?: number;
}

export class HealthMetricService {
  constructor(private client: ApiClient) {}

  // Create a new health metric
  async createMetric(
    data: CreateHealthMetricRequest,
    token: string,
    config?: RequestConfig
  ): Promise<ServiceResponse<HealthMetric>> {
    return this.client.post("/health-metrics", data, {
      ...config,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Get health metric by ID
  async getMetricById(
    id: string,
    token: string,
    config?: RequestConfig
  ): Promise<ServiceResponse<HealthMetric>> {
    return this.client.get(`/health-metrics/${id}`, {
      ...config,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Get all health metrics for user
  async getMetrics(
    filters: HealthMetricFilters = {},
    pagination: any = {},
    token: string,
    config?: RequestConfig
  ): Promise<ServiceResponse<HealthMetric[]>> {
    const params = new URLSearchParams();

    if (filters.type) params.append("type", filters.type);
    if (filters.startDate)
      params.append("startDate", filters.startDate.toISOString());
    if (filters.endDate)
      params.append("endDate", filters.endDate.toISOString());
    if (filters.minValue !== undefined)
      params.append("minValue", filters.minValue.toString());
    if (filters.maxValue !== undefined)
      params.append("maxValue", filters.maxValue.toString());

    // Add pagination params
    if (pagination.page) params.append("page", pagination.page.toString());
    if (pagination.limit) params.append("limit", pagination.limit.toString());
    if (pagination.sortBy) params.append("sortBy", pagination.sortBy);
    if (pagination.sortOrder) params.append("sortOrder", pagination.sortOrder);

    const queryString = params.toString();
    const url = queryString
      ? `/health-metrics?${queryString}`
      : "/health-metrics";

    return this.client.get(url, {
      ...config,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Update health metric
  async updateMetric(
    id: string,
    data: UpdateHealthMetricRequest,
    token: string,
    config?: RequestConfig
  ): Promise<ServiceResponse<HealthMetric>> {
    return this.client.put(`/health-metrics/${id}`, data, {
      ...config,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Delete health metric
  async deleteMetric(
    id: string,
    token: string,
    config?: RequestConfig
  ): Promise<ServiceResponse<boolean>> {
    return this.client.delete(`/health-metrics/${id}`, {
      ...config,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Get health metrics by type
  async getMetricsByType(
    type: string,
    filters: Omit<HealthMetricFilters, "type"> = {},
    pagination: any = {},
    token: string,
    config?: RequestConfig
  ): Promise<ServiceResponse<HealthMetric[]>> {
    const params = new URLSearchParams();

    if (filters.startDate)
      params.append("startDate", filters.startDate.toISOString());
    if (filters.endDate)
      params.append("endDate", filters.endDate.toISOString());
    if (filters.minValue !== undefined)
      params.append("minValue", filters.minValue.toString());
    if (filters.maxValue !== undefined)
      params.append("maxValue", filters.maxValue.toString());

    // Add pagination params
    if (pagination.page) params.append("page", pagination.page.toString());
    if (pagination.limit) params.append("limit", pagination.limit.toString());
    if (pagination.sortBy) params.append("sortBy", pagination.sortBy);
    if (pagination.sortOrder) params.append("sortOrder", pagination.sortOrder);

    const queryString = params.toString();
    const url = queryString
      ? `/health-metrics/type/${type}?${queryString}`
      : `/health-metrics/type/${type}`;

    return this.client.get(url, {
      ...config,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Get health metrics statistics
  async getStatistics(
    filters: HealthMetricFilters = {},
    token: string,
    config?: RequestConfig
  ): Promise<
    ServiceResponse<{
      totalMetrics: number;
      byType: Array<{
        type: string;
        count: number;
        latestValue?: string;
        latestUnit?: string;
      }>;
      trends: Array<{
        date: string;
        metrics: Record<string, { value: string; unit: string }>;
      }>;
      insights: Array<{
        type: string;
        insight: string;
        recommendation?: string;
      }>;
    }>
  > {
    const params = new URLSearchParams();

    if (filters.type) params.append("type", filters.type);
    if (filters.startDate)
      params.append("startDate", filters.startDate.toISOString());
    if (filters.endDate)
      params.append("endDate", filters.endDate.toISOString());
    if (filters.minValue !== undefined)
      params.append("minValue", filters.minValue.toString());
    if (filters.maxValue !== undefined)
      params.append("maxValue", filters.maxValue.toString());

    const queryString = params.toString();
    const url = queryString
      ? `/health-metrics/statistics?${queryString}`
      : "/health-metrics/statistics";

    return this.client.get(url, {
      ...config,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Get latest health metrics
  async getLatestMetrics(
    types?: string[],
    token: string,
    config?: RequestConfig
  ): Promise<ServiceResponse<HealthMetric[]>> {
    const params = new URLSearchParams();

    if (types && types.length > 0) {
      types.forEach((type) => params.append("types", type));
    }

    const queryString = params.toString();
    const url = queryString
      ? `/health-metrics/latest?${queryString}`
      : "/health-metrics/latest";

    return this.client.get(url, {
      ...config,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Health check
  async healthCheck(
    config?: RequestConfig
  ): Promise<ServiceResponse<{ status: string; timestamp: string }>> {
    return this.client.get("/health", config);
  }
}
