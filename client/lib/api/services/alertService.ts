// Alert Service - Handles alert management operations
import { ApiClient } from "../client";
import type { RequestConfig, ServiceResponse } from "../types";

export type AlertType =
  | "BLOOD_SUGAR_LOW"
  | "BLOOD_SUGAR_HIGH"
  | "MEDICATION_REMINDER"
  | "MEAL_REMINDER"
  | "EXERCISE_REMINDER"
  | "APPOINTMENT_REMINDER"
  | "GENERAL_HEALTH";

export interface Alert {
  id: string;
  userId: string;
  type: AlertType;
  title: string;
  message: string;
  isRead: boolean;
  priority: "low" | "medium" | "high" | "urgent";
  data?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAlertRequest {
  type: AlertType;
  title: string;
  message: string;
  priority?: "low" | "medium" | "high" | "urgent";
  data?: Record<string, any>;
}

export interface CreateBloodSugarAlertRequest {
  isHigh: boolean;
  value: number;
  targetRange: {
    min: number;
    max: number;
  };
}

export interface CreateMedicationReminderRequest {
  medicationName: string;
  dosage: string;
  nextDoseTime: Date;
}

export interface CreateMealReminderRequest {
  mealType: string;
  message: string;
}

export interface AlertFilters {
  type?: AlertType;
  priority?: string;
  isRead?: boolean;
  startDate?: Date;
  endDate?: Date;
}

export class AlertService {
  constructor(private client: ApiClient) {}

  // Create a new alert
  async createAlert(
    data: CreateAlertRequest,
    token: string,
    config?: RequestConfig
  ): Promise<ServiceResponse<Alert>> {
    return this.client.post("/alerts", data, {
      ...config,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Create a blood sugar alert
  async createBloodSugarAlert(
    data: CreateBloodSugarAlertRequest,
    token: string,
    config?: RequestConfig
  ): Promise<ServiceResponse<Alert>> {
    return this.client.post("/alerts/blood-sugar", data, {
      ...config,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Create a medication reminder
  async createMedicationReminder(
    data: CreateMedicationReminderRequest,
    token: string,
    config?: RequestConfig
  ): Promise<ServiceResponse<Alert>> {
    return this.client.post("/alerts/medication-reminder", data, {
      ...config,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Create a meal reminder
  async createMealReminder(
    data: CreateMealReminderRequest,
    token: string,
    config?: RequestConfig
  ): Promise<ServiceResponse<Alert>> {
    return this.client.post("/alerts/meal-reminder", data, {
      ...config,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Get alert by ID
  async getAlertById(
    id: string,
    token: string,
    config?: RequestConfig
  ): Promise<ServiceResponse<Alert>> {
    return this.client.get(`/alerts/${id}`, {
      ...config,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Get all alerts for user
  async getAlerts(
    filters: AlertFilters = {},
    pagination: any = {},
    token: string,
    config?: RequestConfig
  ): Promise<ServiceResponse<Alert[]>> {
    const params = new URLSearchParams();

    if (filters.type) params.append("type", filters.type);
    if (filters.priority) params.append("priority", filters.priority);
    if (filters.isRead !== undefined)
      params.append("isRead", filters.isRead.toString());
    if (filters.startDate)
      params.append("startDate", filters.startDate.toISOString());
    if (filters.endDate)
      params.append("endDate", filters.endDate.toISOString());

    // Add pagination params
    if (pagination.page) params.append("page", pagination.page.toString());
    if (pagination.limit) params.append("limit", pagination.limit.toString());
    if (pagination.sortBy) params.append("sortBy", pagination.sortBy);
    if (pagination.sortOrder) params.append("sortOrder", pagination.sortOrder);

    const queryString = params.toString();
    const url = queryString ? `/alerts?${queryString}` : "/alerts";

    return this.client.get(url, {
      ...config,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Get unread alerts
  async getUnreadAlerts(
    token: string,
    config?: RequestConfig
  ): Promise<ServiceResponse<Alert[]>> {
    return this.client.get("/alerts/unread", {
      ...config,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Get read alerts
  async getReadAlerts(
    token: string,
    config?: RequestConfig
  ): Promise<ServiceResponse<Alert[]>> {
    return this.client.get("/alerts/read", {
      ...config,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Get alerts by type
  async getAlertsByType(
    type: AlertType,
    token: string,
    config?: RequestConfig
  ): Promise<ServiceResponse<Alert[]>> {
    return this.client.get(`/alerts/type/${type}`, {
      ...config,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Get alerts by priority
  async getAlertsByPriority(
    priority: string,
    token: string,
    config?: RequestConfig
  ): Promise<ServiceResponse<Alert[]>> {
    return this.client.get(`/alerts/priority/${priority}`, {
      ...config,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Get urgent alerts
  async getUrgentAlerts(
    token: string,
    config?: RequestConfig
  ): Promise<ServiceResponse<Alert[]>> {
    return this.client.get("/alerts/urgent", {
      ...config,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Get high priority alerts
  async getHighPriorityAlerts(
    token: string,
    config?: RequestConfig
  ): Promise<ServiceResponse<Alert[]>> {
    return this.client.get("/alerts/high-priority", {
      ...config,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Get recent alerts
  async getRecentAlerts(
    limit: number = 10,
    token: string,
    config?: RequestConfig
  ): Promise<ServiceResponse<Alert[]>> {
    return this.client.get(`/alerts/recent?limit=${limit}`, {
      ...config,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Mark alert as read
  async markAsRead(
    id: string,
    token: string,
    config?: RequestConfig
  ): Promise<ServiceResponse<Alert>> {
    return this.client.patch(
      `/alerts/${id}/read`,
      {},
      {
        ...config,
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  }

  // Mark alert as unread
  async markAsUnread(
    id: string,
    token: string,
    config?: RequestConfig
  ): Promise<ServiceResponse<Alert>> {
    return this.client.patch(
      `/alerts/${id}/unread`,
      {},
      {
        ...config,
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  }

  // Mark all alerts as read
  async markAllAsRead(
    token: string,
    config?: RequestConfig
  ): Promise<ServiceResponse<number>> {
    return this.client.patch(
      "/alerts/mark-all-read",
      {},
      {
        ...config,
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  }

  // Mark all alerts as unread
  async markAllAsUnread(
    token: string,
    config?: RequestConfig
  ): Promise<ServiceResponse<number>> {
    return this.client.patch(
      "/alerts/mark-all-unread",
      {},
      {
        ...config,
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  }

  // Delete alert
  async deleteAlert(
    id: string,
    token: string,
    config?: RequestConfig
  ): Promise<ServiceResponse<boolean>> {
    return this.client.delete(`/alerts/${id}`, {
      ...config,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Delete read alerts
  async deleteReadAlerts(
    token: string,
    config?: RequestConfig
  ): Promise<ServiceResponse<number>> {
    return this.client.delete("/alerts/read", {
      ...config,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Get alert counts
  async getAlertCounts(
    token: string,
    config?: RequestConfig
  ): Promise<
    ServiceResponse<{
      total: number;
      unread: number;
      read: number;
      urgent: number;
      high: number;
      medium: number;
      low: number;
      bloodSugar: number;
      medication: number;
      meal: number;
      exercise: number;
      appointment: number;
      general: number;
    }>
  > {
    return this.client.get("/alerts/counts", {
      ...config,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Get alert trends
  async getAlertTrends(
    days: number = 30,
    token: string,
    config?: RequestConfig
  ): Promise<
    ServiceResponse<{
      daily: Array<{ date: string; count: number }>;
      byType: Array<{ type: AlertType; count: number }>;
      byPriority: Array<{ priority: string; count: number }>;
    }>
  > {
    return this.client.get(`/alerts/trends?days=${days}`, {
      ...config,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Search alerts
  async searchAlerts(
    query: string,
    token: string,
    config?: RequestConfig
  ): Promise<ServiceResponse<Alert[]>> {
    return this.client.get(
      `/alerts/search?query=${encodeURIComponent(query)}`,
      {
        ...config,
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  }

  // Get alert summary
  async getAlertSummary(
    token: string,
    config?: RequestConfig
  ): Promise<
    ServiceResponse<{
      totalAlerts: number;
      unreadAlerts: number;
      urgentAlerts: number;
      recentAlerts: Alert[];
      needsAttention: Alert[];
    }>
  > {
    return this.client.get("/alerts/summary", {
      ...config,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Get alert insights
  async getAlertInsights(
    days: number = 7,
    token: string,
    config?: RequestConfig
  ): Promise<
    ServiceResponse<{
      totalAlerts: number;
      unreadAlerts: number;
      urgentAlerts: number;
      mostCommonType: AlertType | null;
      averageAlertsPerDay: number;
      recommendations: string[];
    }>
  > {
    return this.client.get(`/alerts/insights?days=${days}`, {
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
