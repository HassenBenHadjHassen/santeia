// HealthMetricController for handling health metric related requests
import { Request, Response, NextFunction } from "express";
import { BaseController } from "./BaseController";
import { HealthMetricService } from "@/services/HealthMetricService";
import { MetricType } from "@/types";

export class HealthMetricController extends BaseController {
  private healthMetricService: HealthMetricService;

  constructor() {
    super();
    this.healthMetricService = new HealthMetricService();
  }

  public createMetric = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const requiredFields = ["metricType", "value", "unit"];
      const missingFields = this.validateRequired(req, requiredFields);

      if (missingFields.length > 0) {
        this.sendError(
          res,
          `Missing required fields: ${missingFields.join(", ")}`,
          400
        );
        return;
      }

      const { metricType, value, unit, notes, timestamp } = req.body;
      const userId = (req as any).user?.userId;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      if (!Object.values(MetricType).includes(metricType)) {
        this.sendError(res, "Invalid metric type", 400);
        return;
      }

      if (value < 0) {
        this.sendError(res, "Value must be non-negative", 400);
        return;
      }

      const result = await this.healthMetricService.createMetric(userId, {
        metricType,
        value,
        unit,
        notes,
        timestamp: timestamp ? new Date(timestamp) : undefined,
      });

      this.sendServiceResponse(res, result);
    });
  };

  public getMetricById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const { id } = req.params;

      if (!id) {
        this.sendError(res, "Metric ID is required", 400);
        return;
      }

      const result = await this.healthMetricService.getMetricById(id);
      this.sendServiceResponse(res, result);
    });
  };

  public getMetricsByUser = async (
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
        metricType,
        startDate,
        endDate,
      } = req.query;

      const filters: any = {};
      if (metricType) filters.metricType = metricType;
      if (startDate && endDate) {
        filters.timestamp = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string),
        };
      }

      const pagination = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sortBy: sortBy as string,
        sortOrder: sortOrder as "asc" | "desc",
      };

      const result = await this.healthMetricService.getMetricsByUser(
        userId,
        filters,
        pagination
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getMetricsByType = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;
      const { metricType } = req.params;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      if (!Object.values(MetricType).includes(metricType as MetricType)) {
        this.sendError(res, "Invalid metric type", 400);
        return;
      }

      const result = await this.healthMetricService.getMetricsByType(
        userId,
        metricType as MetricType
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getLatestMetric = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;
      const { metricType } = req.params;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      if (!Object.values(MetricType).includes(metricType as MetricType)) {
        this.sendError(res, "Invalid metric type", 400);
        return;
      }

      const result = await this.healthMetricService.getLatestMetric(
        userId,
        metricType as MetricType
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getMetricsByDateRange = async (
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

      const result = await this.healthMetricService.getMetricsByDateRange(
        userId,
        new Date(startDate as string),
        new Date(endDate as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getMetricsByDay = async (
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

      const result = await this.healthMetricService.getMetricsByDay(
        userId,
        new Date(date as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getWeightHistory = async (
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

      const result = await this.healthMetricService.getWeightHistory(
        userId,
        parseInt(days as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getBloodPressureHistory = async (
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

      const result = await this.healthMetricService.getBloodPressureHistory(
        userId,
        parseInt(days as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getCholesterolHistory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;
      const { days = 90 } = req.query;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      const result = await this.healthMetricService.getCholesterolHistory(
        userId,
        parseInt(days as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getHeartRateHistory = async (
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

      const result = await this.healthMetricService.getHeartRateHistory(
        userId,
        parseInt(days as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getBMITrend = async (
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

      const result = await this.healthMetricService.getBMITrend(
        userId,
        parseInt(days as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getMetricStats = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;
      const { metricType, days = 30 } = req.query;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      if (
        !metricType ||
        !Object.values(MetricType).includes(metricType as MetricType)
      ) {
        this.sendError(res, "Valid metric type is required", 400);
        return;
      }

      const result = await this.healthMetricService.getMetricStats(
        userId,
        metricType as MetricType,
        parseInt(days as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getMetricsRequiringAttention = async (
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

      const result =
        await this.healthMetricService.getMetricsRequiringAttention(userId);
      this.sendServiceResponse(res, result);
    });
  };

  public getNormalRangeMetrics = async (
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

      const result = await this.healthMetricService.getNormalRangeMetrics(
        userId
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getMetricCategories = async (
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

      const result = await this.healthMetricService.getMetricCategories(userId);
      this.sendServiceResponse(res, result);
    });
  };

  public getRecentMetrics = async (
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

      const result = await this.healthMetricService.getRecentMetrics(
        userId,
        parseInt(limit as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public searchMetrics = async (
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

      const result = await this.healthMetricService.searchMetrics(
        userId,
        query as string
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getMetricSummary = async (
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

      const result = await this.healthMetricService.getMetricSummary(userId);
      this.sendServiceResponse(res, result);
    });
  };

  public updateMetric = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const { id } = req.params;
      const { metricType, value, unit, notes, timestamp } = req.body;

      if (!id) {
        this.sendError(res, "Metric ID is required", 400);
        return;
      }

      if (metricType && !Object.values(MetricType).includes(metricType)) {
        this.sendError(res, "Invalid metric type", 400);
        return;
      }

      if (value !== undefined && value < 0) {
        this.sendError(res, "Value must be non-negative", 400);
        return;
      }

      const result = await this.healthMetricService.updateMetric(id, {
        metricType,
        value,
        unit,
        notes,
        timestamp: timestamp ? new Date(timestamp) : undefined,
      });
      this.sendServiceResponse(res, result);
    });
  };

  public deleteMetric = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const { id } = req.params;

      if (!id) {
        this.sendError(res, "Metric ID is required", 400);
        return;
      }

      const result = await this.healthMetricService.deleteMetric(id);
      this.sendServiceResponse(res, result);
    });
  };

  public getHealthInsights = async (
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

      const result = await this.healthMetricService.getHealthInsights(
        userId,
        parseInt(days as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getMetricTargets = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const result = await this.healthMetricService.getMetricTargets();
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
