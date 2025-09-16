// Alert model implementation
import { BaseModel } from "./BaseModel";
import { Alert as IAlert, AlertType } from "@/types";

export class Alert extends BaseModel implements IAlert {
  public userId: string;
  public type: AlertType;
  public title: string;
  public message: string;
  public isRead: boolean;
  public priority: string; // low, medium, high, urgent
  public data?: any; // Additional data for the alert

  constructor(data: Partial<IAlert> = {}) {
    super(data);
    this.userId = data.userId || "";
    this.type = data.type || "GENERAL_HEALTH";
    this.title = data.title || "";
    this.message = data.message || "";
    this.isRead = data.isRead ?? false;
    this.priority = data.priority || "medium";
    this.data = data.data;
  }

  public validate(): boolean {
    return (
      !!this.userId &&
      !!this.type &&
      !!this.title &&
      !!this.message &&
      typeof this.isRead === "boolean" &&
      !!this.priority
    );
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      userId: this.userId,
      type: this.type,
      title: this.title,
      message: this.message,
      isRead: this.isRead,
      priority: this.priority,
      data: this.data,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public fromJSON(data: Record<string, any>): this {
    this.id = data.id || this.id;
    this.userId = data.userId || this.userId;
    this.type = data.type || this.type;
    this.title = data.title || this.title;
    this.message = data.message || this.message;
    this.isRead = data.isRead ?? this.isRead;
    this.priority = data.priority || this.priority;
    this.data = data.data || this.data;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : this.createdAt;
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : this.updatedAt;
    return this;
  }

  // Helper methods
  public isUrgent(): boolean {
    return this.priority === "urgent";
  }

  public isHighPriority(): boolean {
    return this.priority === "high" || this.priority === "urgent";
  }

  public isBloodSugarAlert(): boolean {
    return this.type === "BLOOD_SUGAR_LOW" || this.type === "BLOOD_SUGAR_HIGH";
  }

  public isMedicationAlert(): boolean {
    return this.type === "MEDICATION_REMINDER";
  }

  public isMealAlert(): boolean {
    return this.type === "MEAL_REMINDER";
  }

  public isExerciseAlert(): boolean {
    return this.type === "EXERCISE_REMINDER";
  }

  public isAppointmentAlert(): boolean {
    return this.type === "APPOINTMENT_REMINDER";
  }

  public getPriorityLevel(): number {
    const priorityLevels: Record<string, number> = {
      low: 1,
      medium: 2,
      high: 3,
      urgent: 4,
    };
    return priorityLevels[this.priority] || 2;
  }

  public getIcon(): string {
    switch (this.type) {
      case "BLOOD_SUGAR_LOW":
        return "⚠️";
      case "BLOOD_SUGAR_HIGH":
        return "🔴";
      case "MEDICATION_REMINDER":
        return "💊";
      case "MEAL_REMINDER":
        return "🍽️";
      case "EXERCISE_REMINDER":
        return "🏃";
      case "APPOINTMENT_REMINDER":
        return "📅";
      case "GENERAL_HEALTH":
        return "ℹ️";
      default:
        return "📢";
    }
  }

  public getColorClass(): string {
    switch (this.priority) {
      case "urgent":
        return "text-red-600 bg-red-50 border-red-200";
      case "high":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "medium":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "low":
        return "text-gray-600 bg-gray-50 border-gray-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  }

  public markAsRead(): void {
    this.isRead = true;
    this.updateTimestamp();
  }

  public markAsUnread(): void {
    this.isRead = false;
    this.updateTimestamp();
  }

  public getAgeInHours(): number {
    return (Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60);
  }

  public isStale(): boolean {
    // Consider alerts stale after 24 hours
    return this.getAgeInHours() > 24;
  }

  public shouldEscalate(): boolean {
    // Escalate unread urgent alerts after 1 hour
    if (this.isUrgent() && !this.isRead) {
      return this.getAgeInHours() > 1;
    }

    // Escalate unread high priority alerts after 4 hours
    if (this.isHighPriority() && !this.isRead) {
      return this.getAgeInHours() > 4;
    }

    return false;
  }

  public getFormattedTimestamp(): string {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - this.createdAt.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  }
}
