// PhysicalActivityController for handling physical activity related requests
import { Request, Response, NextFunction } from "express";
import { BaseController } from "./BaseController";
import { PhysicalActivityService } from "@/services/PhysicalActivityService";

export class PhysicalActivityController extends BaseController {
  private activityService: PhysicalActivityService;

  constructor() {
    super();
    this.activityService = new PhysicalActivityService();
  }

  public createActivity = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const requiredFields = ["activityType", "duration", "intensity"];
      const missingFields = this.validateRequired(req, requiredFields);

      if (missingFields.length > 0) {
        this.sendError(
          res,
          `Missing required fields: ${missingFields.join(", ")}`,
          400
        );
        return;
      }

      const {
        activityType,
        duration,
        intensity,
        caloriesBurned,
        notes,
        timestamp,
      } = req.body;
      const userId = (req as any).user?.userId;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      if (duration <= 0 || duration > 1440) {
        this.sendError(res, "Duration must be between 1 and 1440 minutes", 400);
        return;
      }

      const validIntensities = ["low", "moderate", "high"];
      if (!validIntensities.includes(intensity)) {
        this.sendError(
          res,
          "Intensity must be one of: low, moderate, high",
          400
        );
        return;
      }

      if (
        caloriesBurned !== undefined &&
        (caloriesBurned < 0 || caloriesBurned > 5000)
      ) {
        this.sendError(res, "Calories burned must be between 0 and 5000", 400);
        return;
      }

      const result = await this.activityService.createActivity(userId, {
        activityType,
        duration,
        intensity,
        caloriesBurned,
        notes,
        timestamp: timestamp ? new Date(timestamp) : undefined,
      });

      this.sendServiceResponse(res, result);
    });
  };

  public getActivityById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const { id } = req.params;

      if (!id) {
        this.sendError(res, "Activity ID is required", 400);
        return;
      }

      const result = await this.activityService.getActivityById(id);
      this.sendServiceResponse(res, result);
    });
  };

  public getActivitiesByUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      const {
        page = 1,
        limit = 10,
        sortBy = "timestamp",
        sortOrder = "desc",
        startDate,
        endDate,
        activityType,
        intensity,
      } = req.query;

      const filters: any = {};
      if (startDate && endDate) {
        filters.timestamp = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string),
        };
      }
      if (activityType)
        filters.activityType = { contains: activityType, mode: "insensitive" };
      if (intensity) filters.intensity = intensity;

      const pagination = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sortBy: sortBy as string,
        sortOrder: sortOrder as "asc" | "desc",
      };

      const result = await this.activityService.getActivitiesByUser(
        userId,
        filters,
        pagination
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getActivitiesByDateRange = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;
      const { startDate, endDate } = req.query;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      if (!startDate || !endDate) {
        this.sendError(res, "Start date and end date are required", 400);
        return;
      }

      const result = await this.activityService.getActivitiesByDateRange(
        userId,
        new Date(startDate as string),
        new Date(endDate as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getActivitiesByDay = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;
      const { date } = req.query;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      if (!date) {
        this.sendError(res, "Date is required", 400);
        return;
      }

      const result = await this.activityService.getActivitiesByDay(
        userId,
        new Date(date as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getActivitiesByWeek = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;
      const { startDate } = req.query;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      if (!startDate) {
        this.sendError(res, "Start date is required", 400);
        return;
      }

      const result = await this.activityService.getActivitiesByWeek(
        userId,
        new Date(startDate as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getActivitiesByMonth = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;
      const { year, month } = req.query;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      if (!year || !month) {
        this.sendError(res, "Year and month are required", 400);
        return;
      }

      const result = await this.activityService.getActivitiesByMonth(
        userId,
        parseInt(year as string),
        parseInt(month as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getActivitiesByType = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;
      const { activityType } = req.params;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      if (!activityType) {
        this.sendError(res, "Activity type is required", 400);
        return;
      }

      const result = await this.activityService.getActivitiesByType(
        userId,
        activityType
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getActivitiesByIntensity = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;
      const { intensity } = req.params;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      const validIntensities = ["low", "moderate", "high"];
      if (!intensity || !validIntensities.includes(intensity)) {
        this.sendError(
          res,
          "Valid intensity is required (low, moderate, high)",
          400
        );
        return;
      }

      const result = await this.activityService.getActivitiesByIntensity(
        userId,
        intensity
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getTotalDurationByDay = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;
      const { date } = req.query;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      if (!date) {
        this.sendError(res, "Date is required", 400);
        return;
      }

      const result = await this.activityService.getTotalDurationByDay(
        userId,
        new Date(date as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getTotalDurationByWeek = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;
      const { startDate } = req.query;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      if (!startDate) {
        this.sendError(res, "Start date is required", 400);
        return;
      }

      const result = await this.activityService.getTotalDurationByWeek(
        userId,
        new Date(startDate as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getTotalDurationByMonth = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;
      const { year, month } = req.query;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      if (!year || !month) {
        this.sendError(res, "Year and month are required", 400);
        return;
      }

      const result = await this.activityService.getTotalDurationByMonth(
        userId,
        parseInt(year as string),
        parseInt(month as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getTotalCaloriesBurnedByDay = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;
      const { date } = req.query;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      if (!date) {
        this.sendError(res, "Date is required", 400);
        return;
      }

      const result = await this.activityService.getTotalCaloriesBurnedByDay(
        userId,
        new Date(date as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getTotalCaloriesBurnedByWeek = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;
      const { startDate } = req.query;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      if (!startDate) {
        this.sendError(res, "Start date is required", 400);
        return;
      }

      const result = await this.activityService.getTotalCaloriesBurnedByWeek(
        userId,
        new Date(startDate as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getTotalCaloriesBurnedByMonth = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;
      const { year, month } = req.query;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      if (!year || !month) {
        this.sendError(res, "Year and month are required", 400);
        return;
      }

      const result = await this.activityService.getTotalCaloriesBurnedByMonth(
        userId,
        parseInt(year as string),
        parseInt(month as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getAverageDurationByDay = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;
      const { days = 7 } = req.query;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      const result = await this.activityService.getAverageDurationByDay(
        userId,
        parseInt(days as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getActivityFrequency = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;
      const { days = 30 } = req.query;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      const result = await this.activityService.getActivityFrequency(
        userId,
        parseInt(days as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getIntensityDistribution = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;
      const { days = 30 } = req.query;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      const result = await this.activityService.getIntensityDistribution(
        userId,
        parseInt(days as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getMostFrequentActivities = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;
      const { limit = 5 } = req.query;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      const result = await this.activityService.getMostFrequentActivities(
        userId,
        parseInt(limit as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getRecentActivities = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;
      const { limit = 10 } = req.query;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      const result = await this.activityService.getRecentActivities(
        userId,
        parseInt(limit as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public searchActivities = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;
      const { query } = req.query;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      if (!query) {
        this.sendError(res, "Search query is required", 400);
        return;
      }

      const result = await this.activityService.searchActivities(
        userId,
        query as string
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getWeeklyActivityGoal = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;
      const { goalMinutes = 150 } = req.query;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      const result = await this.activityService.getWeeklyActivityGoal(
        userId,
        parseInt(goalMinutes as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public updateActivity = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const { id } = req.params;
      const {
        activityType,
        duration,
        intensity,
        caloriesBurned,
        notes,
        timestamp,
      } = req.body;

      if (!id) {
        this.sendError(res, "Activity ID is required", 400);
        return;
      }

      if (duration !== undefined && (duration <= 0 || duration > 1440)) {
        this.sendError(res, "Duration must be between 1 and 1440 minutes", 400);
        return;
      }

      if (intensity) {
        const validIntensities = ["low", "moderate", "high"];
        if (!validIntensities.includes(intensity)) {
          this.sendError(
            res,
            "Intensity must be one of: low, moderate, high",
            400
          );
          return;
        }
      }

      if (
        caloriesBurned !== undefined &&
        (caloriesBurned < 0 || caloriesBurned > 5000)
      ) {
        this.sendError(res, "Calories burned must be between 0 and 5000", 400);
        return;
      }

      const result = await this.activityService.updateActivity(id, {
        activityType,
        duration,
        intensity,
        caloriesBurned,
        notes,
        timestamp: timestamp ? new Date(timestamp) : undefined,
      });
      this.sendServiceResponse(res, result);
    });
  };

  public deleteActivity = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const { id } = req.params;

      if (!id) {
        this.sendError(res, "Activity ID is required", 400);
        return;
      }

      const result = await this.activityService.deleteActivity(id);
      this.sendServiceResponse(res, result);
    });
  };

  public getActivityInsights = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;
      const { days = 7 } = req.query;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      const result = await this.activityService.getActivityInsights(
        userId,
        parseInt(days as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getActivitySuggestions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;
      const { activityType, duration = 30 } = req.query;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      const validActivityTypes = ["cardio", "strength", "flexibility", "mixed"];
      if (
        !activityType ||
        !validActivityTypes.includes(activityType as string)
      ) {
        this.sendError(
          res,
          "Valid activity type is required (cardio, strength, flexibility, mixed)",
          400
        );
        return;
      }

      const result = await this.activityService.getActivitySuggestions(
        userId,
        activityType as any,
        parseInt(duration as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  // Abstract methods from BaseController (not used in this controller)
  public create = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    this.sendError(res, "Method not implemented", 501);
  };

  public findById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    this.sendError(res, "Method not implemented", 501);
  };

  public findAll = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    this.sendError(res, "Method not implemented", 501);
  };

  public update = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    this.sendError(res, "Method not implemented", 501);
  };

  public delete = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    this.sendError(res, "Method not implemented", 501);
  };
}
