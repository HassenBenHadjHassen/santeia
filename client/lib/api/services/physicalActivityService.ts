// Physical Activity Service - Handles physical activity tracking operations
import { ApiClient } from "../client";
import type { RequestConfig, ServiceResponse } from "../types";

export interface PhysicalActivity {
  id: string;
  userId: string;
  name: string;
  description?: string;
  activityType:
    | "cardio"
    | "strength"
    | "flexibility"
    | "sports"
    | "walking"
    | "cycling"
    | "swimming"
    | "other";
  duration: number; // in minutes
  intensity: "low" | "moderate" | "high";
  caloriesBurned?: number;
  distance?: number; // in km
  heartRate?: number; // bpm
  timestamp: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePhysicalActivityRequest {
  name: string;
  description?: string;
  activityType:
    | "cardio"
    | "strength"
    | "flexibility"
    | "sports"
    | "walking"
    | "cycling"
    | "swimming"
    | "other";
  duration: number;
  intensity: "low" | "moderate" | "high";
  caloriesBurned?: number;
  distance?: number;
  heartRate?: number;
  timestamp?: Date;
  notes?: string;
}

export interface UpdatePhysicalActivityRequest {
  name?: string;
  description?: string;
  activityType?:
    | "cardio"
    | "strength"
    | "flexibility"
    | "sports"
    | "walking"
    | "cycling"
    | "swimming"
    | "other";
  duration?: number;
  intensity?: "low" | "moderate" | "high";
  caloriesBurned?: number;
  distance?: number;
  heartRate?: number;
  timestamp?: Date;
  notes?: string;
}

export interface PhysicalActivityFilters {
  activityType?: string;
  intensity?: string;
  startDate?: Date;
  endDate?: Date;
  minDuration?: number;
  maxDuration?: number;
  minCalories?: number;
  maxCalories?: number;
}

export class PhysicalActivityService {
  constructor(private client: ApiClient) {}

  // Create a new physical activity
  async createActivity(
    data: CreatePhysicalActivityRequest,
    token: string,
    config?: RequestConfig
  ): Promise<ServiceResponse<PhysicalActivity>> {
    return this.client.post("/physical-activities", data, {
      ...config,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Get physical activity by ID
  async getActivityById(
    id: string,
    token: string,
    config?: RequestConfig
  ): Promise<ServiceResponse<PhysicalActivity>> {
    return this.client.get(`/physical-activities/${id}`, {
      ...config,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Get all physical activities for user
  async getActivities(
    filters: PhysicalActivityFilters = {},
    pagination: any = {},
    token: string,
    config?: RequestConfig
  ): Promise<ServiceResponse<PhysicalActivity[]>> {
    const params = new URLSearchParams();

    if (filters.activityType)
      params.append("activityType", filters.activityType);
    if (filters.intensity) params.append("intensity", filters.intensity);
    if (filters.startDate)
      params.append("startDate", filters.startDate.toISOString());
    if (filters.endDate)
      params.append("endDate", filters.endDate.toISOString());
    if (filters.minDuration !== undefined)
      params.append("minDuration", filters.minDuration.toString());
    if (filters.maxDuration !== undefined)
      params.append("maxDuration", filters.maxDuration.toString());
    if (filters.minCalories !== undefined)
      params.append("minCalories", filters.minCalories.toString());
    if (filters.maxCalories !== undefined)
      params.append("maxCalories", filters.maxCalories.toString());

    // Add pagination params
    if (pagination.page) params.append("page", pagination.page.toString());
    if (pagination.limit) params.append("limit", pagination.limit.toString());
    if (pagination.sortBy) params.append("sortBy", pagination.sortBy);
    if (pagination.sortOrder) params.append("sortOrder", pagination.sortOrder);

    const queryString = params.toString();
    const url = queryString
      ? `/physical-activities?${queryString}`
      : "/physical-activities";

    return this.client.get(url, {
      ...config,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Update physical activity
  async updateActivity(
    id: string,
    data: UpdatePhysicalActivityRequest,
    token: string,
    config?: RequestConfig
  ): Promise<ServiceResponse<PhysicalActivity>> {
    return this.client.put(`/physical-activities/${id}`, data, {
      ...config,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Delete physical activity
  async deleteActivity(
    id: string,
    token: string,
    config?: RequestConfig
  ): Promise<ServiceResponse<boolean>> {
    return this.client.delete(`/physical-activities/${id}`, {
      ...config,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Get physical activity statistics
  async getStatistics(
    filters: PhysicalActivityFilters = {},
    token: string,
    config?: RequestConfig
  ): Promise<
    ServiceResponse<{
      totalDuration: number; // in minutes
      totalCalories: number;
      totalDistance: number; // in km
      averageDuration: number;
      averageCalories: number;
      totalActivities: number;
      byActivityType: Array<{
        activityType: string;
        count: number;
        duration: number;
        calories: number;
      }>;
      byIntensity: Array<{
        intensity: string;
        count: number;
        duration: number;
        calories: number;
      }>;
      trends: Array<{
        date: string;
        duration: number;
        calories: number;
        count: number;
      }>;
    }>
  > {
    const params = new URLSearchParams();

    if (filters.activityType)
      params.append("activityType", filters.activityType);
    if (filters.intensity) params.append("intensity", filters.intensity);
    if (filters.startDate)
      params.append("startDate", filters.startDate.toISOString());
    if (filters.endDate)
      params.append("endDate", filters.endDate.toISOString());
    if (filters.minDuration !== undefined)
      params.append("minDuration", filters.minDuration.toString());
    if (filters.maxDuration !== undefined)
      params.append("maxDuration", filters.maxDuration.toString());
    if (filters.minCalories !== undefined)
      params.append("minCalories", filters.minCalories.toString());
    if (filters.maxCalories !== undefined)
      params.append("maxCalories", filters.maxCalories.toString());

    const queryString = params.toString();
    const url = queryString
      ? `/physical-activities/statistics?${queryString}`
      : "/physical-activities/statistics";

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
