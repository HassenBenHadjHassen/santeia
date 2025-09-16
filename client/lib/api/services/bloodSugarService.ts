// Blood Sugar Service - Handles blood sugar reading operations
import { ApiClient } from "../client";
import type { RequestConfig, ServiceResponse } from "../types";

export interface BloodSugarReading {
  id: string;
  userId: string;
  value: number;
  unit: string;
  readingType: "fasting" | "before_meal" | "after_meal" | "bedtime" | "random";
  notes?: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBloodSugarReadingRequest {
  value: number;
  unit: "mg/dL" | "mmol/L";
  readingType: "fasting" | "before_meal" | "after_meal" | "bedtime" | "random";
  notes?: string;
  timestamp?: Date;
}

export interface UpdateBloodSugarReadingRequest {
  value?: number;
  unit?: "mg/dL" | "mmol/L";
  readingType?: "fasting" | "before_meal" | "after_meal" | "bedtime" | "random";
  notes?: string;
  timestamp?: Date;
}

export interface BloodSugarFilters {
  readingType?: string;
  startDate?: Date;
  endDate?: Date;
  minValue?: number;
  maxValue?: number;
}

export class BloodSugarService {
  constructor(private client: ApiClient) {}

  // Create a new blood sugar reading
  async createReading(
    data: CreateBloodSugarReadingRequest,
    token: string,
    config?: RequestConfig
  ): Promise<ServiceResponse<BloodSugarReading>> {
    return this.client.post("/blood-sugar", data, {
      ...config,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Get blood sugar reading by ID
  async getReadingById(
    id: string,
    token: string,
    config?: RequestConfig
  ): Promise<ServiceResponse<BloodSugarReading>> {
    return this.client.get(`/blood-sugar/${id}`, {
      ...config,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Get all blood sugar readings for user
  async getReadings(
    filters: BloodSugarFilters = {},
    pagination: any = {},
    token: string,
    config?: RequestConfig
  ): Promise<ServiceResponse<BloodSugarReading[]>> {
    const params = new URLSearchParams();

    if (filters.readingType) params.append("readingType", filters.readingType);
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
    const url = queryString ? `/blood-sugar?${queryString}` : "/blood-sugar";

    return this.client.get(url, {
      ...config,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Update blood sugar reading
  async updateReading(
    id: string,
    data: UpdateBloodSugarReadingRequest,
    token: string,
    config?: RequestConfig
  ): Promise<ServiceResponse<BloodSugarReading>> {
    return this.client.put(`/blood-sugar/${id}`, data, {
      ...config,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Delete blood sugar reading
  async deleteReading(
    id: string,
    token: string,
    config?: RequestConfig
  ): Promise<ServiceResponse<boolean>> {
    return this.client.delete(`/blood-sugar/${id}`, {
      ...config,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Get blood sugar statistics
  async getStatistics(
    filters: BloodSugarFilters = {},
    token: string,
    config?: RequestConfig
  ): Promise<
    ServiceResponse<{
      average: number;
      min: number;
      max: number;
      count: number;
      inRange: number;
      outOfRange: number;
      trends: Array<{ date: string; average: number; count: number }>;
    }>
  > {
    const params = new URLSearchParams();

    if (filters.readingType) params.append("readingType", filters.readingType);
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
      ? `/blood-sugar/statistics?${queryString}`
      : "/blood-sugar/statistics";

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
