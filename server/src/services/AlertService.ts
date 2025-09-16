// AlertService for business logic
import { AlertRepository } from "@/repositories/AlertRepository";
import { Alert } from "@/models/Alert";
import { AlertType, ServiceResponse } from "@/types";

export class AlertService {
  private alertRepository: AlertRepository;

  constructor() {
    this.alertRepository = new AlertRepository();
  }

  public async createAlert(
    userId: string,
    type: AlertType,
    title: string,
    message: string,
    priority: string = "medium",
    data?: any
  ): Promise<ServiceResponse<Alert>> {
    try {
      const alert = await this.alertRepository.create({
        userId,
        type,
        title,
        message,
        priority,
        data,
      });

      return {
        success: true,
        data: alert,
        message: "Alert created successfully",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create alert",
      };
    }
  }

  public async getAlertById(id: string): Promise<ServiceResponse<Alert>> {
    try {
      const alert = await this.alertRepository.findById(id);

      if (!alert) {
        return {
          success: false,
          error: "Alert not found",
        };
      }

      return {
        success: true,
        data: alert,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get alert",
      };
    }
  }

  public async getAlertsByUser(
    userId: string,
    filters: any = {},
    pagination: any = {}
  ): Promise<ServiceResponse<Alert[]>> {
    try {
      const alerts = await this.alertRepository.findByUserId(
        userId,
        filters,
        pagination
      );

      return {
        success: true,
        data: alerts,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get alerts",
      };
    }
  }

  public async getUnreadAlerts(
    userId: string
  ): Promise<ServiceResponse<Alert[]>> {
    try {
      const alerts = await this.alertRepository.getUnreadAlerts(userId);

      return {
        success: true,
        data: alerts,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get unread alerts",
      };
    }
  }

  public async getReadAlerts(
    userId: string
  ): Promise<ServiceResponse<Alert[]>> {
    try {
      const alerts = await this.alertRepository.getReadAlerts(userId);

      return {
        success: true,
        data: alerts,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get read alerts",
      };
    }
  }

  public async getAlertsByType(
    userId: string,
    type: AlertType
  ): Promise<ServiceResponse<Alert[]>> {
    try {
      const alerts = await this.alertRepository.getAlertsByType(userId, type);

      return {
        success: true,
        data: alerts,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get alerts by type",
      };
    }
  }

  public async getAlertsByPriority(
    userId: string,
    priority: string
  ): Promise<ServiceResponse<Alert[]>> {
    try {
      const alerts = await this.alertRepository.getAlertsByPriority(
        userId,
        priority
      );

      return {
        success: true,
        data: alerts,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get alerts by priority",
      };
    }
  }

  public async getUrgentAlerts(
    userId: string
  ): Promise<ServiceResponse<Alert[]>> {
    try {
      const alerts = await this.alertRepository.getUrgentAlerts(userId);

      return {
        success: true,
        data: alerts,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get urgent alerts",
      };
    }
  }

  public async getHighPriorityAlerts(
    userId: string
  ): Promise<ServiceResponse<Alert[]>> {
    try {
      const alerts = await this.alertRepository.getHighPriorityAlerts(userId);

      return {
        success: true,
        data: alerts,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get high priority alerts",
      };
    }
  }

  public async getBloodSugarAlerts(
    userId: string
  ): Promise<ServiceResponse<Alert[]>> {
    try {
      const alerts = await this.alertRepository.getBloodSugarAlerts(userId);

      return {
        success: true,
        data: alerts,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get blood sugar alerts",
      };
    }
  }

  public async getMedicationAlerts(
    userId: string
  ): Promise<ServiceResponse<Alert[]>> {
    try {
      const alerts = await this.alertRepository.getMedicationAlerts(userId);

      return {
        success: true,
        data: alerts,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get medication alerts",
      };
    }
  }

  public async getMealAlerts(
    userId: string
  ): Promise<ServiceResponse<Alert[]>> {
    try {
      const alerts = await this.alertRepository.getMealAlerts(userId);

      return {
        success: true,
        data: alerts,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get meal alerts",
      };
    }
  }

  public async getExerciseAlerts(
    userId: string
  ): Promise<ServiceResponse<Alert[]>> {
    try {
      const alerts = await this.alertRepository.getExerciseAlerts(userId);

      return {
        success: true,
        data: alerts,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get exercise alerts",
      };
    }
  }

  public async getAppointmentAlerts(
    userId: string
  ): Promise<ServiceResponse<Alert[]>> {
    try {
      const alerts = await this.alertRepository.getAppointmentAlerts(userId);

      return {
        success: true,
        data: alerts,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get appointment alerts",
      };
    }
  }

  public async getGeneralHealthAlerts(
    userId: string
  ): Promise<ServiceResponse<Alert[]>> {
    try {
      const alerts = await this.alertRepository.getGeneralHealthAlerts(userId);

      return {
        success: true,
        data: alerts,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get general health alerts",
      };
    }
  }

  public async getRecentAlerts(
    userId: string,
    limit: number = 10
  ): Promise<ServiceResponse<Alert[]>> {
    try {
      const alerts = await this.alertRepository.getRecentAlerts(userId, limit);

      return {
        success: true,
        data: alerts,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get recent alerts",
      };
    }
  }

  public async getStaleAlerts(
    userId: string
  ): Promise<ServiceResponse<Alert[]>> {
    try {
      const alerts = await this.alertRepository.getStaleAlerts(userId);

      return {
        success: true,
        data: alerts,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get stale alerts",
      };
    }
  }

  public async getEscalatedAlerts(
    userId: string
  ): Promise<ServiceResponse<Alert[]>> {
    try {
      const alerts = await this.alertRepository.getEscalatedAlerts(userId);

      return {
        success: true,
        data: alerts,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get escalated alerts",
      };
    }
  }

  public async markAsRead(id: string): Promise<ServiceResponse<Alert>> {
    try {
      const alert = await this.alertRepository.markAsRead(id);

      if (!alert) {
        return {
          success: false,
          error: "Alert not found",
        };
      }

      return {
        success: true,
        data: alert,
        message: "Alert marked as read",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to mark alert as read",
      };
    }
  }

  public async markAsUnread(id: string): Promise<ServiceResponse<Alert>> {
    try {
      const alert = await this.alertRepository.markAsUnread(id);

      if (!alert) {
        return {
          success: false,
          error: "Alert not found",
        };
      }

      return {
        success: true,
        data: alert,
        message: "Alert marked as unread",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to mark alert as unread",
      };
    }
  }

  public async markAllAsRead(userId: string): Promise<ServiceResponse<number>> {
    try {
      const count = await this.alertRepository.markAllAsRead(userId);

      return {
        success: true,
        data: count,
        message: `${count} alerts marked as read`,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to mark all alerts as read",
      };
    }
  }

  public async markAllAsUnread(
    userId: string
  ): Promise<ServiceResponse<number>> {
    try {
      const count = await this.alertRepository.markAllAsUnread(userId);

      return {
        success: true,
        data: count,
        message: `${count} alerts marked as unread`,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to mark all alerts as unread",
      };
    }
  }

  public async deleteReadAlerts(
    userId: string
  ): Promise<ServiceResponse<number>> {
    try {
      const count = await this.alertRepository.deleteReadAlerts(userId);

      return {
        success: true,
        data: count,
        message: `${count} read alerts deleted`,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete read alerts",
      };
    }
  }

  public async deleteStaleAlerts(
    userId: string
  ): Promise<ServiceResponse<number>> {
    try {
      const count = await this.alertRepository.deleteStaleAlerts(userId);

      return {
        success: true,
        data: count,
        message: `${count} stale alerts deleted`,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete stale alerts",
      };
    }
  }

  public async getAlertCounts(userId: string): Promise<
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
    try {
      const counts = await this.alertRepository.getAlertCounts(userId);

      return {
        success: true,
        data: counts,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get alert counts",
      };
    }
  }

  public async getAlertTrends(
    userId: string,
    days: number = 30
  ): Promise<
    ServiceResponse<{
      daily: Array<{ date: string; count: number }>;
      byType: Array<{ type: AlertType; count: number }>;
      byPriority: Array<{ priority: string; count: number }>;
    }>
  > {
    try {
      const trends = await this.alertRepository.getAlertTrends(userId, days);

      return {
        success: true,
        data: trends,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get alert trends",
      };
    }
  }

  public async searchAlerts(
    userId: string,
    query: string
  ): Promise<ServiceResponse<Alert[]>> {
    try {
      const alerts = await this.alertRepository.searchAlerts(userId, query);

      return {
        success: true,
        data: alerts,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to search alerts",
      };
    }
  }

  public async getAlertSummary(userId: string): Promise<
    ServiceResponse<{
      totalAlerts: number;
      unreadAlerts: number;
      urgentAlerts: number;
      recentAlerts: Alert[];
      needsAttention: Alert[];
    }>
  > {
    try {
      const summary = await this.alertRepository.getAlertSummary(userId);

      return {
        success: true,
        data: summary,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get alert summary",
      };
    }
  }

  public async createBloodSugarAlert(
    userId: string,
    isHigh: boolean,
    value: number,
    targetRange: { min: number; max: number }
  ): Promise<ServiceResponse<Alert>> {
    try {
      const alert = await this.alertRepository.createBloodSugarAlert(
        userId,
        isHigh,
        value,
        targetRange
      );

      return {
        success: true,
        data: alert,
        message: "Blood sugar alert created successfully",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create blood sugar alert",
      };
    }
  }

  public async createMedicationReminder(
    userId: string,
    medicationName: string,
    dosage: string,
    nextDoseTime: Date
  ): Promise<ServiceResponse<Alert>> {
    try {
      const alert = await this.alertRepository.createMedicationReminder(
        userId,
        medicationName,
        dosage,
        nextDoseTime
      );

      return {
        success: true,
        data: alert,
        message: "Medication reminder created successfully",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create medication reminder",
      };
    }
  }

  public async createMealReminder(
    userId: string,
    mealType: string,
    message: string
  ): Promise<ServiceResponse<Alert>> {
    try {
      const alert = await this.alertRepository.createMealReminder(
        userId,
        mealType,
        message
      );

      return {
        success: true,
        data: alert,
        message: "Meal reminder created successfully",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create meal reminder",
      };
    }
  }

  public async deleteAlert(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const success = await this.alertRepository.delete(id);

      if (!success) {
        return {
          success: false,
          error: "Failed to delete alert",
        };
      }

      return {
        success: true,
        data: true,
        message: "Alert deleted successfully",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete alert",
      };
    }
  }

  public async getAlertInsights(
    userId: string,
    days: number = 7
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
    try {
      const [counts, trends] = await Promise.all([
        this.alertRepository.getAlertCounts(userId),
        this.alertRepository.getAlertTrends(userId, days),
      ]);

      const mostCommonType =
        trends.byType.length > 0 ? trends.byType[0].type : null;
      const averageAlertsPerDay =
        trends.daily.length > 0
          ? trends.daily.reduce((sum, day) => sum + day.count, 0) /
            trends.daily.length
          : 0;

      const recommendations: string[] = [];

      if (counts.urgent > 0) {
        recommendations.push(
          "You have urgent alerts that require immediate attention"
        );
      }

      if (counts.unread > 10) {
        recommendations.push(
          "Consider reviewing and organizing your unread alerts"
        );
      }

      if (counts.bloodSugar > 5) {
        recommendations.push(
          "You have many blood sugar alerts. Consider reviewing your diabetes management plan"
        );
      }

      if (counts.medication > 3) {
        recommendations.push(
          "You have several medication reminders. Consider setting up a medication schedule"
        );
      }

      if (averageAlertsPerDay > 5) {
        recommendations.push(
          "You're receiving many alerts daily. Consider adjusting your alert preferences"
        );
      }

      return {
        success: true,
        data: {
          totalAlerts: counts.total,
          unreadAlerts: counts.unread,
          urgentAlerts: counts.urgent,
          mostCommonType,
          averageAlertsPerDay: Math.round(averageAlertsPerDay * 100) / 100,
          recommendations,
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get alert insights",
      };
    }
  }
}
