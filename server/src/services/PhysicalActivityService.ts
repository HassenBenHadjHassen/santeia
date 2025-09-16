// PhysicalActivityService for business logic
import { PhysicalActivityRepository } from "@/repositories/PhysicalActivityRepository";
import { PhysicalActivity } from "@/models/PhysicalActivity";
import { CreatePhysicalActivityRequest, ServiceResponse } from "@/types";

export class PhysicalActivityService {
  private activityRepository: PhysicalActivityRepository;

  constructor() {
    this.activityRepository = new PhysicalActivityRepository();
  }

  public async createActivity(
    userId: string,
    data: CreatePhysicalActivityRequest
  ): Promise<ServiceResponse<PhysicalActivity>> {
    try {
      const activity = await this.activityRepository.create({
        userId,
        ...data,
      });

      return {
        success: true,
        data: activity,
        message: "Physical activity recorded successfully",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create physical activity",
      };
    }
  }

  public async getActivityById(
    id: string
  ): Promise<ServiceResponse<PhysicalActivity>> {
    try {
      const activity = await this.activityRepository.findById(id);

      if (!activity) {
        return {
          success: false,
          error: "Physical activity not found",
        };
      }

      return {
        success: true,
        data: activity,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get physical activity",
      };
    }
  }

  public async getActivitiesByUser(
    userId: string,
    filters: any = {},
    pagination: any = {}
  ): Promise<ServiceResponse<PhysicalActivity[]>> {
    try {
      const activities = await this.activityRepository.findByUserId(
        userId,
        filters,
        pagination
      );

      return {
        success: true,
        data: activities,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get physical activities",
      };
    }
  }

  public async getActivitiesByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ServiceResponse<PhysicalActivity[]>> {
    try {
      const activities = await this.activityRepository.findByDateRange(
        userId,
        startDate,
        endDate
      );

      return {
        success: true,
        data: activities,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get activities by date range",
      };
    }
  }

  public async getActivitiesByDay(
    userId: string,
    date: Date
  ): Promise<ServiceResponse<PhysicalActivity[]>> {
    try {
      const activities = await this.activityRepository.getActivitiesByDay(
        userId,
        date
      );

      return {
        success: true,
        data: activities,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get daily activities",
      };
    }
  }

  public async getActivitiesByWeek(
    userId: string,
    startDate: Date
  ): Promise<ServiceResponse<PhysicalActivity[]>> {
    try {
      const activities = await this.activityRepository.getActivitiesByWeek(
        userId,
        startDate
      );

      return {
        success: true,
        data: activities,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get weekly activities",
      };
    }
  }

  public async getActivitiesByMonth(
    userId: string,
    year: number,
    month: number
  ): Promise<ServiceResponse<PhysicalActivity[]>> {
    try {
      const activities = await this.activityRepository.getActivitiesByMonth(
        userId,
        year,
        month
      );

      return {
        success: true,
        data: activities,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get monthly activities",
      };
    }
  }

  public async getActivitiesByType(
    userId: string,
    activityType: string
  ): Promise<ServiceResponse<PhysicalActivity[]>> {
    try {
      const activities = await this.activityRepository.getActivitiesByType(
        userId,
        activityType
      );

      return {
        success: true,
        data: activities,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get activities by type",
      };
    }
  }

  public async getActivitiesByIntensity(
    userId: string,
    intensity: string
  ): Promise<ServiceResponse<PhysicalActivity[]>> {
    try {
      const activities = await this.activityRepository.getActivitiesByIntensity(
        userId,
        intensity
      );

      return {
        success: true,
        data: activities,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get activities by intensity",
      };
    }
  }

  public async getTotalDurationByDay(
    userId: string,
    date: Date
  ): Promise<ServiceResponse<number>> {
    try {
      const duration = await this.activityRepository.getTotalDurationByDay(
        userId,
        date
      );

      return {
        success: true,
        data: duration,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get daily duration",
      };
    }
  }

  public async getTotalDurationByWeek(
    userId: string,
    startDate: Date
  ): Promise<ServiceResponse<number>> {
    try {
      const duration = await this.activityRepository.getTotalDurationByWeek(
        userId,
        startDate
      );

      return {
        success: true,
        data: duration,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get weekly duration",
      };
    }
  }

  public async getTotalDurationByMonth(
    userId: string,
    year: number,
    month: number
  ): Promise<ServiceResponse<number>> {
    try {
      const duration = await this.activityRepository.getTotalDurationByMonth(
        userId,
        year,
        month
      );

      return {
        success: true,
        data: duration,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get monthly duration",
      };
    }
  }

  public async getTotalCaloriesBurnedByDay(
    userId: string,
    date: Date
  ): Promise<ServiceResponse<number>> {
    try {
      const calories =
        await this.activityRepository.getTotalCaloriesBurnedByDay(userId, date);

      return {
        success: true,
        data: calories,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get daily calories burned",
      };
    }
  }

  public async getTotalCaloriesBurnedByWeek(
    userId: string,
    startDate: Date
  ): Promise<ServiceResponse<number>> {
    try {
      const calories =
        await this.activityRepository.getTotalCaloriesBurnedByWeek(
          userId,
          startDate
        );

      return {
        success: true,
        data: calories,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get weekly calories burned",
      };
    }
  }

  public async getTotalCaloriesBurnedByMonth(
    userId: string,
    year: number,
    month: number
  ): Promise<ServiceResponse<number>> {
    try {
      const calories =
        await this.activityRepository.getTotalCaloriesBurnedByMonth(
          userId,
          year,
          month
        );

      return {
        success: true,
        data: calories,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get monthly calories burned",
      };
    }
  }

  public async getAverageDurationByDay(
    userId: string,
    days: number = 7
  ): Promise<ServiceResponse<number>> {
    try {
      const average = await this.activityRepository.getAverageDurationByDay(
        userId,
        days
      );

      return {
        success: true,
        data: average,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get average daily duration",
      };
    }
  }

  public async getActivityFrequency(
    userId: string,
    days: number = 30
  ): Promise<
    ServiceResponse<{
      cardio: number;
      strength: number;
      flexibility: number;
      other: number;
    }>
  > {
    try {
      const frequency = await this.activityRepository.getActivityFrequency(
        userId,
        days
      );

      return {
        success: true,
        data: frequency,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get activity frequency",
      };
    }
  }

  public async getIntensityDistribution(
    userId: string,
    days: number = 30
  ): Promise<
    ServiceResponse<{
      low: number;
      moderate: number;
      high: number;
    }>
  > {
    try {
      const distribution =
        await this.activityRepository.getIntensityDistribution(userId, days);

      return {
        success: true,
        data: distribution,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get intensity distribution",
      };
    }
  }

  public async getMostFrequentActivities(
    userId: string,
    limit: number = 5
  ): Promise<
    ServiceResponse<
      Array<{
        activityType: string;
        count: number;
        totalDuration: number;
        totalCalories: number;
      }>
    >
  > {
    try {
      const activities =
        await this.activityRepository.getMostFrequentActivities(userId, limit);

      return {
        success: true,
        data: activities,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get most frequent activities",
      };
    }
  }

  public async getRecentActivities(
    userId: string,
    limit: number = 10
  ): Promise<ServiceResponse<PhysicalActivity[]>> {
    try {
      const activities = await this.activityRepository.getRecentActivities(
        userId,
        limit
      );

      return {
        success: true,
        data: activities,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get recent activities",
      };
    }
  }

  public async searchActivities(
    userId: string,
    query: string
  ): Promise<ServiceResponse<PhysicalActivity[]>> {
    try {
      const activities = await this.activityRepository.searchActivities(
        userId,
        query
      );

      return {
        success: true,
        data: activities,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to search activities",
      };
    }
  }

  public async getWeeklyActivityGoal(
    userId: string,
    goalMinutes: number = 150
  ): Promise<
    ServiceResponse<{
      current: number;
      goal: number;
      percentage: number;
      remaining: number;
    }>
  > {
    try {
      const goal = await this.activityRepository.getWeeklyActivityGoal(
        userId,
        goalMinutes
      );

      return {
        success: true,
        data: goal,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get weekly activity goal",
      };
    }
  }

  public async updateActivity(
    id: string,
    data: Partial<CreatePhysicalActivityRequest>
  ): Promise<ServiceResponse<PhysicalActivity>> {
    try {
      const activity = await this.activityRepository.update(id, data);

      if (!activity) {
        return {
          success: false,
          error: "Physical activity not found",
        };
      }

      return {
        success: true,
        data: activity,
        message: "Physical activity updated successfully",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update physical activity",
      };
    }
  }

  public async deleteActivity(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const success = await this.activityRepository.delete(id);

      if (!success) {
        return {
          success: false,
          error: "Failed to delete physical activity",
        };
      }

      return {
        success: true,
        data: true,
        message: "Physical activity deleted successfully",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete physical activity",
      };
    }
  }

  public async getActivityInsights(
    userId: string,
    days: number = 7
  ): Promise<
    ServiceResponse<{
      totalDuration: number;
      averageDailyDuration: number;
      totalCaloriesBurned: number;
      averageDailyCalories: number;
      activityFrequency: {
        cardio: number;
        strength: number;
        flexibility: number;
        other: number;
      };
      intensityDistribution: {
        low: number;
        moderate: number;
        high: number;
      };
      weeklyGoalProgress: {
        current: number;
        goal: number;
        percentage: number;
        remaining: number;
      };
      recommendations: string[];
    }>
  > {
    try {
      const [
        totalDuration,
        averageDailyDuration,
        totalCaloriesBurned,
        averageDailyCalories,
        activityFrequency,
        intensityDistribution,
        weeklyGoalProgress,
      ] = await Promise.all([
        this.activityRepository.getTotalDurationByWeek(
          userId,
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ),
        this.activityRepository.getAverageDurationByDay(userId, days),
        this.activityRepository.getTotalCaloriesBurnedByWeek(
          userId,
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ),
        this.activityRepository
          .getTotalCaloriesBurnedByWeek(
            userId,
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          )
          .then((calories) => calories / 7),
        this.activityRepository.getActivityFrequency(userId, days),
        this.activityRepository.getIntensityDistribution(userId, days),
        this.activityRepository.getWeeklyActivityGoal(userId, 150),
      ]);

      const recommendations: string[] = [];

      if (weeklyGoalProgress.percentage < 50) {
        recommendations.push(
          "Consider increasing your physical activity to meet the recommended 150 minutes per week"
        );
      } else if (weeklyGoalProgress.percentage >= 100) {
        recommendations.push(
          "Great job! You're meeting your weekly activity goals"
        );
      }

      if (activityFrequency.cardio < 3) {
        recommendations.push(
          "Try to include more cardiovascular activities like walking, running, or cycling"
        );
      }

      if (activityFrequency.strength < 2) {
        recommendations.push(
          "Consider adding strength training exercises to your routine"
        );
      }

      if (activityFrequency.flexibility < 2) {
        recommendations.push(
          "Include flexibility exercises like yoga or stretching for better overall health"
        );
      }

      if (
        intensityDistribution.low >
        intensityDistribution.high + intensityDistribution.moderate
      ) {
        recommendations.push(
          "Try to increase the intensity of your workouts for better health benefits"
        );
      }

      return {
        success: true,
        data: {
          totalDuration,
          averageDailyDuration,
          totalCaloriesBurned,
          averageDailyCalories,
          activityFrequency,
          intensityDistribution,
          weeklyGoalProgress,
          recommendations,
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get activity insights",
      };
    }
  }

  public async getActivitySuggestions(
    userId: string,
    activityType: "cardio" | "strength" | "flexibility" | "mixed",
    duration: number = 30
  ): Promise<
    ServiceResponse<{
      suggestions: string[];
      duration: number;
      intensity: string;
      caloriesEstimate: number;
    }>
  > {
    try {
      const suggestions: string[] = [];
      let intensity = "moderate";
      let caloriesEstimate = 150;

      switch (activityType) {
        case "cardio":
          intensity = "moderate";
          caloriesEstimate = Math.round(duration * 6); // 6 cal/min for moderate cardio
          suggestions.push(
            "Brisk walking",
            "Jogging or running",
            "Cycling",
            "Swimming",
            "Dancing",
            "Aerobics",
            "Elliptical machine",
            "Rowing machine"
          );
          break;
        case "strength":
          intensity = "moderate";
          caloriesEstimate = Math.round(duration * 4); // 4 cal/min for strength training
          suggestions.push(
            "Bodyweight exercises (push-ups, squats, lunges)",
            "Weight training",
            "Resistance band exercises",
            "Yoga with strength focus",
            "Pilates",
            "CrossFit",
            "Functional training"
          );
          break;
        case "flexibility":
          intensity = "low";
          caloriesEstimate = Math.round(duration * 2); // 2 cal/min for flexibility
          suggestions.push(
            "Yoga",
            "Stretching routine",
            "Pilates",
            "Tai Chi",
            "Flexibility exercises",
            "Mobility work"
          );
          break;
        case "mixed":
          intensity = "moderate";
          caloriesEstimate = Math.round(duration * 5); // 5 cal/min for mixed activities
          suggestions.push(
            "Circuit training",
            "HIIT (High-Intensity Interval Training)",
            "CrossFit",
            "Boot camp",
            "Mixed martial arts",
            "Functional fitness"
          );
          break;
      }

      return {
        success: true,
        data: {
          suggestions,
          duration,
          intensity,
          caloriesEstimate,
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get activity suggestions",
      };
    }
  }
}
