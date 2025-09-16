// PhysicalActivity repository for database operations
import { BaseRepository } from "./BaseRepository";
import { PhysicalActivity } from "@/models/PhysicalActivity";
import { PhysicalActivity as IPhysicalActivity } from "@/types";
import { PrismaClient } from "@prisma/client";

export class PhysicalActivityRepository extends BaseRepository<PhysicalActivity> {
  public async create(
    data: Partial<IPhysicalActivity>
  ): Promise<PhysicalActivity> {
    const activity = new PhysicalActivity(data);

    if (!activity.validate()) {
      throw new Error("Invalid physical activity data");
    }

    const created = await this.prisma.physicalActivity.create({
      data: {
        userId: activity.userId,
        activityType: activity.activityType,
        duration: activity.duration,
        intensity: activity.intensity,
        caloriesBurned: activity.caloriesBurned,
        notes: activity.notes,
        timestamp: activity.timestamp,
      },
    });

    return new PhysicalActivity({
      ...created,
      caloriesBurned: created.caloriesBurned ?? undefined,
      notes: created.notes ?? undefined,
    });
  }

  public async findById(id: string): Promise<PhysicalActivity | null> {
    const activity = await this.prisma.physicalActivity.findUnique({
      where: { id },
    });

    return activity
      ? new PhysicalActivity({
          ...activity,
          caloriesBurned: activity.caloriesBurned ?? undefined,
          notes: activity.notes ?? undefined,
        })
      : null;
  }

  public async findAll(
    filters: any = {},
    pagination: any = {}
  ): Promise<PhysicalActivity[]> {
    const {
      page = 1,
      limit = 10,
      sortBy = "timestamp",
      sortOrder = "desc",
    } = pagination;
    const skip = (page - 1) * limit;

    const activities = await this.prisma.physicalActivity.findMany({
      where: filters,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    });

    return activities.map(
      (activity) =>
        new PhysicalActivity({
          ...activity,
          caloriesBurned: activity.caloriesBurned ?? undefined,
          notes: activity.notes ?? undefined,
        })
    );
  }

  public async update(
    id: string,
    data: Partial<IPhysicalActivity>
  ): Promise<PhysicalActivity> {
    const updated = await this.prisma.physicalActivity.update({
      where: { id },
      data: {
        ...data,
      },
    });

    return new PhysicalActivity({
      ...updated,
      caloriesBurned: updated.caloriesBurned ?? undefined,
      notes: updated.notes ?? undefined,
    });
  }

  public async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.physicalActivity.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  // Specialized methods for physical activities
  public async findByUserId(
    userId: string,
    filters: any = {},
    pagination: any = {}
  ): Promise<PhysicalActivity[]> {
    return this.findAll({ userId, ...filters }, pagination);
  }

  public async findByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<PhysicalActivity[]> {
    return this.findAll({
      userId,
      timestamp: {
        gte: startDate,
        lte: endDate,
      },
    });
  }

  public async getActivitiesByDay(
    userId: string,
    date: Date
  ): Promise<PhysicalActivity[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.findByDateRange(userId, startOfDay, endOfDay);
  }

  public async getActivitiesByWeek(
    userId: string,
    startDate: Date
  ): Promise<PhysicalActivity[]> {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    return this.findByDateRange(userId, startDate, endDate);
  }

  public async getActivitiesByMonth(
    userId: string,
    year: number,
    month: number
  ): Promise<PhysicalActivity[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    return this.findByDateRange(userId, startDate, endDate);
  }

  public async getActivitiesByType(
    userId: string,
    activityType: string
  ): Promise<PhysicalActivity[]> {
    return this.findAll({
      userId,
      activityType: { contains: activityType, mode: "insensitive" },
    });
  }

  public async getActivitiesByIntensity(
    userId: string,
    intensity: string
  ): Promise<PhysicalActivity[]> {
    return this.findAll({
      userId,
      intensity: { equals: intensity, mode: "insensitive" },
    });
  }

  public async getTotalDurationByDay(
    userId: string,
    date: Date
  ): Promise<number> {
    const activities = await this.getActivitiesByDay(userId, date);
    return activities.reduce((total, activity) => total + activity.duration, 0);
  }

  public async getTotalDurationByWeek(
    userId: string,
    startDate: Date
  ): Promise<number> {
    const activities = await this.getActivitiesByWeek(userId, startDate);
    return activities.reduce((total, activity) => total + activity.duration, 0);
  }

  public async getTotalDurationByMonth(
    userId: string,
    year: number,
    month: number
  ): Promise<number> {
    const activities = await this.getActivitiesByMonth(userId, year, month);
    return activities.reduce((total, activity) => total + activity.duration, 0);
  }

  public async getTotalCaloriesBurnedByDay(
    userId: string,
    date: Date
  ): Promise<number> {
    const activities = await this.getActivitiesByDay(userId, date);
    return activities.reduce(
      (total, activity) => total + (activity.caloriesBurned || 0),
      0
    );
  }

  public async getTotalCaloriesBurnedByWeek(
    userId: string,
    startDate: Date
  ): Promise<number> {
    const activities = await this.getActivitiesByWeek(userId, startDate);
    return activities.reduce(
      (total, activity) => total + (activity.caloriesBurned || 0),
      0
    );
  }

  public async getTotalCaloriesBurnedByMonth(
    userId: string,
    year: number,
    month: number
  ): Promise<number> {
    const activities = await this.getActivitiesByMonth(userId, year, month);
    return activities.reduce(
      (total, activity) => total + (activity.caloriesBurned || 0),
      0
    );
  }

  public async getAverageDurationByDay(
    userId: string,
    days: number = 7
  ): Promise<number> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const activities = await this.findByDateRange(userId, startDate, endDate);

    if (activities.length === 0) return 0;

    const totalDuration = activities.reduce(
      (total, activity) => total + activity.duration,
      0
    );
    return Math.round((totalDuration / activities.length) * 100) / 100;
  }

  public async getActivityFrequency(
    userId: string,
    days: number = 30
  ): Promise<{
    cardio: number;
    strength: number;
    flexibility: number;
    other: number;
  }> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const activities = await this.findByDateRange(userId, startDate, endDate);

    const frequency = { cardio: 0, strength: 0, flexibility: 0, other: 0 };

    activities.forEach((activity) => {
      const category = activity.getActivityCategory();
      frequency[category]++;
    });

    return frequency;
  }

  public async getIntensityDistribution(
    userId: string,
    days: number = 30
  ): Promise<{
    low: number;
    moderate: number;
    high: number;
  }> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const activities = await this.findByDateRange(userId, startDate, endDate);

    const distribution = { low: 0, moderate: 0, high: 0 };

    activities.forEach((activity) => {
      const intensity = activity.intensity.toLowerCase();
      if (intensity === "low") distribution.low++;
      else if (intensity === "moderate") distribution.moderate++;
      else if (intensity === "high") distribution.high++;
    });

    return distribution;
  }

  public async getMostFrequentActivities(
    userId: string,
    limit: number = 5
  ): Promise<
    Array<{
      activityType: string;
      count: number;
      totalDuration: number;
      totalCalories: number;
    }>
  > {
    const activities = await this.findByUserId(userId);

    const activityMap = new Map<
      string,
      {
        count: number;
        totalDuration: number;
        totalCalories: number;
      }
    >();

    activities.forEach((activity) => {
      const key = activity.activityType.toLowerCase();
      const existing = activityMap.get(key) || {
        count: 0,
        totalDuration: 0,
        totalCalories: 0,
      };

      activityMap.set(key, {
        count: existing.count + 1,
        totalDuration: existing.totalDuration + activity.duration,
        totalCalories: existing.totalCalories + (activity.caloriesBurned || 0),
      });
    });

    return Array.from(activityMap.entries())
      .map(([activityType, stats]) => ({
        activityType,
        ...stats,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  public async getRecentActivities(
    userId: string,
    limit: number = 10
  ): Promise<PhysicalActivity[]> {
    return this.findAll(
      { userId },
      { limit, sortBy: "timestamp", sortOrder: "desc" }
    );
  }

  public async searchActivities(
    userId: string,
    query: string
  ): Promise<PhysicalActivity[]> {
    return this.findAll({
      userId,
      OR: [
        { activityType: { contains: query, mode: "insensitive" } },
        { notes: { contains: query, mode: "insensitive" } },
      ],
    });
  }

  public async getWeeklyActivityGoal(
    userId: string,
    goalMinutes: number = 150
  ): Promise<{
    current: number;
    goal: number;
    percentage: number;
    remaining: number;
  }> {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const activities = await this.findByDateRange(
      userId,
      startOfWeek,
      endOfWeek
    );
    const current = activities.reduce(
      (total, activity) => total + activity.duration,
      0
    );

    return {
      current,
      goal: goalMinutes,
      percentage: Math.round((current / goalMinutes) * 100),
      remaining: Math.max(0, goalMinutes - current),
    };
  }
}
