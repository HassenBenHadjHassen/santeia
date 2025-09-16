// Alert repository for database operations
import { BaseRepository } from "./BaseRepository";
import { Alert } from "@/models/Alert";
import { Alert as IAlert, AlertType } from "@/types";
import { PrismaClient } from "@prisma/client";

export class AlertRepository extends BaseRepository<Alert> {
  public async create(data: Partial<IAlert>): Promise<Alert> {
    const alert = new Alert(data);

    if (!alert.validate()) {
      throw new Error("Invalid alert data");
    }

    const created = await this.prisma.alert.create({
      data: {
        userId: alert.userId,
        type: alert.type,
        title: alert.title,
        message: alert.message,
        isRead: alert.isRead,
        priority: alert.priority,
        data: alert.data,
      },
    });

    return new Alert({
      ...created,
      type: created.type as AlertType,
    });
  }

  public async findById(id: string): Promise<Alert | null> {
    const alert = await this.prisma.alert.findUnique({
      where: { id },
    });

    return alert
      ? new Alert({
          ...alert,
          type: alert.type as AlertType,
        })
      : null;
  }

  public async findAll(
    filters: any = {},
    pagination: any = {}
  ): Promise<Alert[]> {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = pagination;
    const skip = (page - 1) * limit;

    const alerts = await this.prisma.alert.findMany({
      where: filters,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    });

    return alerts.map(
      (alert) =>
        new Alert({
          ...alert,
          type: alert.type as AlertType,
        })
    );
  }

  public async update(
    id: string,
    data: Partial<IAlert>
  ): Promise<Alert | null> {
    const updated = await this.prisma.alert.update({
      where: { id },
      data: {
        ...data,
      },
    });

    return new Alert({
      ...updated,
      type: updated.type as AlertType,
    });
  }

  public async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.alert.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  // Specialized methods for alerts
  public async findByUserId(
    userId: string,
    filters: any = {},
    pagination: any = {}
  ): Promise<Alert[]> {
    return this.findAll({ userId, ...filters }, pagination);
  }

  public async getUnreadAlerts(userId: string): Promise<Alert[]> {
    return this.findAll({ userId, isRead: false });
  }

  public async getReadAlerts(userId: string): Promise<Alert[]> {
    return this.findAll({ userId, isRead: true });
  }

  public async getAlertsByType(
    userId: string,
    type: AlertType
  ): Promise<Alert[]> {
    return this.findAll({ userId, type });
  }

  public async getAlertsByPriority(
    userId: string,
    priority: string
  ): Promise<Alert[]> {
    return this.findAll({ userId, priority });
  }

  public async getUrgentAlerts(userId: string): Promise<Alert[]> {
    return this.findAll({ userId, priority: "urgent" });
  }

  public async getHighPriorityAlerts(userId: string): Promise<Alert[]> {
    return this.findAll({
      userId,
      priority: { in: ["high", "urgent"] },
    });
  }

  public async getBloodSugarAlerts(userId: string): Promise<Alert[]> {
    return this.findAll({
      userId,
      type: { in: ["BLOOD_SUGAR_LOW", "BLOOD_SUGAR_HIGH"] },
    });
  }

  public async getMedicationAlerts(userId: string): Promise<Alert[]> {
    return this.findAll({ userId, type: "MEDICATION_REMINDER" });
  }

  public async getMealAlerts(userId: string): Promise<Alert[]> {
    return this.findAll({ userId, type: "MEAL_REMINDER" });
  }

  public async getExerciseAlerts(userId: string): Promise<Alert[]> {
    return this.findAll({ userId, type: "EXERCISE_REMINDER" });
  }

  public async getAppointmentAlerts(userId: string): Promise<Alert[]> {
    return this.findAll({ userId, type: "APPOINTMENT_REMINDER" });
  }

  public async getGeneralHealthAlerts(userId: string): Promise<Alert[]> {
    return this.findAll({ userId, type: "GENERAL_HEALTH" });
  }

  public async getRecentAlerts(
    userId: string,
    limit: number = 10
  ): Promise<Alert[]> {
    return this.findAll(
      { userId },
      { limit, sortBy: "createdAt", sortOrder: "desc" }
    );
  }

  public async getStaleAlerts(userId: string): Promise<Alert[]> {
    const alerts = await this.findByUserId(userId);
    return alerts.filter((alert) => alert.isStale());
  }

  public async getEscalatedAlerts(userId: string): Promise<Alert[]> {
    const alerts = await this.findByUserId(userId);
    return alerts.filter((alert) => alert.shouldEscalate());
  }

  public async markAsRead(id: string): Promise<Alert | null> {
    return this.update(id, { isRead: true });
  }

  public async markAsUnread(id: string): Promise<Alert | null> {
    return this.update(id, { isRead: false });
  }

  public async markAllAsRead(userId: string): Promise<number> {
    const result = await this.prisma.alert.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return result.count;
  }

  public async markAllAsUnread(userId: string): Promise<number> {
    const result = await this.prisma.alert.updateMany({
      where: { userId, isRead: true },
      data: { isRead: false },
    });

    return result.count;
  }

  public async deleteReadAlerts(userId: string): Promise<number> {
    const result = await this.prisma.alert.deleteMany({
      where: { userId, isRead: true },
    });

    return result.count;
  }

  public async deleteStaleAlerts(userId: string): Promise<number> {
    const staleAlerts = await this.getStaleAlerts(userId);
    const ids = staleAlerts.map((alert) => alert.id);

    if (ids.length === 0) return 0;

    const result = await this.prisma.alert.deleteMany({
      where: { id: { in: ids } },
    });

    return result.count;
  }

  public async getAlertCounts(userId: string): Promise<{
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
  }> {
    const alerts = await this.findByUserId(userId);

    return {
      total: alerts.length,
      unread: alerts.filter((a) => !a.isRead).length,
      read: alerts.filter((a) => a.isRead).length,
      urgent: alerts.filter((a) => a.isUrgent()).length,
      high: alerts.filter((a) => a.isHighPriority()).length,
      medium: alerts.filter((a) => a.priority === "medium").length,
      low: alerts.filter((a) => a.priority === "low").length,
      bloodSugar: alerts.filter((a) => a.isBloodSugarAlert()).length,
      medication: alerts.filter((a) => a.isMedicationAlert()).length,
      meal: alerts.filter((a) => a.isMealAlert()).length,
      exercise: alerts.filter((a) => a.isExerciseAlert()).length,
      appointment: alerts.filter((a) => a.isAppointmentAlert()).length,
      general: alerts.filter((a) => a.type === "GENERAL_HEALTH").length,
    };
  }

  public async getAlertTrends(
    userId: string,
    days: number = 30
  ): Promise<{
    daily: Array<{ date: string; count: number }>;
    byType: Array<{ type: AlertType; count: number }>;
    byPriority: Array<{ priority: string; count: number }>;
  }> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const alerts = await this.findAll({
      userId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    });

    // Daily trends
    const dailyMap = new Map<string, number>();
    alerts.forEach((alert) => {
      const date = alert.createdAt.toISOString().split("T")[0];
      dailyMap.set(date, (dailyMap.get(date) || 0) + 1);
    });

    const daily = Array.from(dailyMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // By type
    const typeMap = new Map<AlertType, number>();
    alerts.forEach((alert) => {
      typeMap.set(alert.type, (typeMap.get(alert.type) || 0) + 1);
    });

    const byType = Array.from(typeMap.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    // By priority
    const priorityMap = new Map<string, number>();
    alerts.forEach((alert) => {
      priorityMap.set(
        alert.priority,
        (priorityMap.get(alert.priority) || 0) + 1
      );
    });

    const byPriority = Array.from(priorityMap.entries())
      .map(([priority, count]) => ({ priority, count }))
      .sort((a, b) => b.count - a.count);

    return { daily, byType, byPriority };
  }

  public async searchAlerts(userId: string, query: string): Promise<Alert[]> {
    return this.findAll({
      userId,
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { message: { contains: query, mode: "insensitive" } },
      ],
    });
  }

  public async getAlertSummary(userId: string): Promise<{
    totalAlerts: number;
    unreadAlerts: number;
    urgentAlerts: number;
    recentAlerts: Alert[];
    needsAttention: Alert[];
  }> {
    const [counts, recentAlerts, unreadAlerts] = await Promise.all([
      this.getAlertCounts(userId),
      this.getRecentAlerts(userId, 5),
      this.getUnreadAlerts(userId),
    ]);

    const needsAttention = unreadAlerts.filter(
      (alert) => alert.isUrgent() || alert.shouldEscalate()
    );

    return {
      totalAlerts: counts.total,
      unreadAlerts: counts.unread,
      urgentAlerts: counts.urgent,
      recentAlerts,
      needsAttention,
    };
  }

  public async createBloodSugarAlert(
    userId: string,
    isHigh: boolean,
    value: number,
    targetRange: { min: number; max: number }
  ): Promise<Alert> {
    const alert = new Alert({
      userId,
      type: isHigh ? AlertType.BLOOD_SUGAR_HIGH : AlertType.BLOOD_SUGAR_LOW,
      title: isHigh ? "High Blood Sugar Alert" : "Low Blood Sugar Alert",
      message: isHigh
        ? `Your blood sugar is ${value} mg/dL, which is above the target range of ${targetRange.min}-${targetRange.max} mg/dL. Please check with your healthcare provider.`
        : `Your blood sugar is ${value} mg/dL, which is below the target range of ${targetRange.min}-${targetRange.max} mg/dL. Please have a snack and monitor closely.`,
      priority: isHigh ? "high" : "urgent",
      data: { value, targetRange, isHigh },
    });

    return this.create(alert);
  }

  public async createMedicationReminder(
    userId: string,
    medicationName: string,
    dosage: string,
    nextDoseTime: Date
  ): Promise<Alert> {
    const alert = new Alert({
      userId,
      type: AlertType.MEDICATION_REMINDER,
      title: "Medication Reminder",
      message: `Time to take your ${medicationName} (${dosage}).`,
      priority: "medium",
      data: { medicationName, dosage, nextDoseTime },
    });

    return this.create(alert);
  }

  public async createMealReminder(
    userId: string,
    mealType: string,
    message: string
  ): Promise<Alert> {
    const alert = new Alert({
      userId,
      type: AlertType.MEAL_REMINDER,
      title: `${mealType} Reminder`,
      message,
      priority: "low",
      data: { mealType },
    });

    return this.create(alert);
  }
}
