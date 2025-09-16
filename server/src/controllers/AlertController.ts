// AlertController for handling alert related requests
import { Request, Response, NextFunction } from "express";
import { BaseController } from "./BaseController";
import { AlertService } from "@/services/AlertService";
import { AlertType } from "@/types";

export class AlertController extends BaseController {
  private alertService: AlertService;

  constructor() {
    super();
    this.alertService = new AlertService();
  }

  public createAlert = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const requiredFields = ["type", "title", "message"];
      const missingFields = this.validateRequired(req, requiredFields);

      if (missingFields.length > 0) {
        this.sendError(
          res,
          `Missing required fields: ${missingFields.join(", ")}`,
          400
        );
        return;
      }

      const { type, title, message, priority = "medium", data } = req.body;
      const userId = (req as any).user?.userId;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      if (!Object.values(AlertType).includes(type)) {
        this.sendError(res, "Invalid alert type", 400);
        return;
      }

      const validPriorities = ["low", "medium", "high", "urgent"];
      if (!validPriorities.includes(priority)) {
        this.sendError(
          res,
          "Priority must be one of: low, medium, high, urgent",
          400
        );
        return;
      }

      const result = await this.alertService.createAlert(
        userId,
        type,
        title,
        message,
        priority,
        data
      );

      this.sendServiceResponse(res, result);
    });
  };

  public getAlertById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const { id } = req.params;

      if (!id) {
        this.sendError(res, "Alert ID is required", 400);
        return;
      }

      const result = await this.alertService.getAlertById(id);
      this.sendServiceResponse(res, result);
    });
  };

  public getAlertsByUser = async (
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
        sortBy = "createdAt",
        sortOrder = "desc",
        type,
        priority,
        isRead,
      } = req.query;

      const filters: any = {};
      if (type) filters.type = type;
      if (priority) filters.priority = priority;
      if (isRead !== undefined) filters.isRead = isRead === "true";

      const pagination = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sortBy: sortBy as string,
        sortOrder: sortOrder as "asc" | "desc",
      };

      const result = await this.alertService.getAlertsByUser(
        userId,
        filters,
        pagination
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getUnreadAlerts = async (
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

      const result = await this.alertService.getUnreadAlerts(userId);
      this.sendServiceResponse(res, result);
    });
  };

  public getReadAlerts = async (
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

      const result = await this.alertService.getReadAlerts(userId);
      this.sendServiceResponse(res, result);
    });
  };

  public getAlertsByType = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;
      const { type } = req.params;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      if (!Object.values(AlertType).includes(type as AlertType)) {
        this.sendError(res, "Invalid alert type", 400);
        return;
      }

      const result = await this.alertService.getAlertsByType(
        userId,
        type as AlertType
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getAlertsByPriority = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;
      const { priority } = req.params;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      const validPriorities = ["low", "medium", "high", "urgent"];
      if (!priority || !validPriorities.includes(priority)) {
        this.sendError(
          res,
          "Valid priority is required (low, medium, high, urgent)",
          400
        );
        return;
      }

      const result = await this.alertService.getAlertsByPriority(
        userId,
        priority
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getUrgentAlerts = async (
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

      const result = await this.alertService.getUrgentAlerts(userId);
      this.sendServiceResponse(res, result);
    });
  };

  public getHighPriorityAlerts = async (
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

      const result = await this.alertService.getHighPriorityAlerts(userId);
      this.sendServiceResponse(res, result);
    });
  };

  public getBloodSugarAlerts = async (
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

      const result = await this.alertService.getBloodSugarAlerts(userId);
      this.sendServiceResponse(res, result);
    });
  };

  public getMedicationAlerts = async (
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

      const result = await this.alertService.getMedicationAlerts(userId);
      this.sendServiceResponse(res, result);
    });
  };

  public getMealAlerts = async (
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

      const result = await this.alertService.getMealAlerts(userId);
      this.sendServiceResponse(res, result);
    });
  };

  public getExerciseAlerts = async (
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

      const result = await this.alertService.getExerciseAlerts(userId);
      this.sendServiceResponse(res, result);
    });
  };

  public getAppointmentAlerts = async (
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

      const result = await this.alertService.getAppointmentAlerts(userId);
      this.sendServiceResponse(res, result);
    });
  };

  public getGeneralHealthAlerts = async (
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

      const result = await this.alertService.getGeneralHealthAlerts(userId);
      this.sendServiceResponse(res, result);
    });
  };

  public getRecentAlerts = async (
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

      const result = await this.alertService.getRecentAlerts(
        userId,
        parseInt(limit as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getStaleAlerts = async (
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

      const result = await this.alertService.getStaleAlerts(userId);
      this.sendServiceResponse(res, result);
    });
  };

  public getEscalatedAlerts = async (
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

      const result = await this.alertService.getEscalatedAlerts(userId);
      this.sendServiceResponse(res, result);
    });
  };

  public markAsRead = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const { id } = req.params;

      if (!id) {
        this.sendError(res, "Alert ID is required", 400);
        return;
      }

      const result = await this.alertService.markAsRead(id);
      this.sendServiceResponse(res, result);
    });
  };

  public markAsUnread = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const { id } = req.params;

      if (!id) {
        this.sendError(res, "Alert ID is required", 400);
        return;
      }

      const result = await this.alertService.markAsUnread(id);
      this.sendServiceResponse(res, result);
    });
  };

  public markAllAsRead = async (
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

      const result = await this.alertService.markAllAsRead(userId);
      this.sendServiceResponse(res, result);
    });
  };

  public markAllAsUnread = async (
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

      const result = await this.alertService.markAllAsUnread(userId);
      this.sendServiceResponse(res, result);
    });
  };

  public deleteReadAlerts = async (
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

      const result = await this.alertService.deleteReadAlerts(userId);
      this.sendServiceResponse(res, result);
    });
  };

  public deleteStaleAlerts = async (
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

      const result = await this.alertService.deleteStaleAlerts(userId);
      this.sendServiceResponse(res, result);
    });
  };

  public getAlertCounts = async (
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

      const result = await this.alertService.getAlertCounts(userId);
      this.sendServiceResponse(res, result);
    });
  };

  public getAlertTrends = async (
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

      const result = await this.alertService.getAlertTrends(
        userId,
        parseInt(days as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public searchAlerts = async (
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

      const result = await this.alertService.searchAlerts(
        userId,
        query as string
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getAlertSummary = async (
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

      const result = await this.alertService.getAlertSummary(userId);
      this.sendServiceResponse(res, result);
    });
  };

  public createBloodSugarAlert = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const requiredFields = ["isHigh", "value", "targetRange"];
      const missingFields = this.validateRequired(req, requiredFields);

      if (missingFields.length > 0) {
        this.sendError(
          res,
          `Missing required fields: ${missingFields.join(", ")}`,
          400
        );
        return;
      }

      const { isHigh, value, targetRange } = req.body;
      const userId = (req as any).user?.userId;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      if (typeof isHigh !== "boolean") {
        this.sendError(res, "isHigh must be a boolean", 400);
        return;
      }

      if (typeof value !== "number" || value < 0 || value > 1000) {
        this.sendError(res, "Value must be a number between 0 and 1000", 400);
        return;
      }

      if (
        !targetRange ||
        typeof targetRange.min !== "number" ||
        typeof targetRange.max !== "number"
      ) {
        this.sendError(res, "Target range must have min and max numbers", 400);
        return;
      }

      const result = await this.alertService.createBloodSugarAlert(
        userId,
        isHigh,
        value,
        targetRange
      );
      this.sendServiceResponse(res, result);
    });
  };

  public createMedicationReminder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const requiredFields = ["medicationName", "dosage", "nextDoseTime"];
      const missingFields = this.validateRequired(req, requiredFields);

      if (missingFields.length > 0) {
        this.sendError(
          res,
          `Missing required fields: ${missingFields.join(", ")}`,
          400
        );
        return;
      }

      const { medicationName, dosage, nextDoseTime } = req.body;
      const userId = (req as any).user?.userId;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      const result = await this.alertService.createMedicationReminder(
        userId,
        medicationName,
        dosage,
        new Date(nextDoseTime)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public createMealReminder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const requiredFields = ["mealType", "message"];
      const missingFields = this.validateRequired(req, requiredFields);

      if (missingFields.length > 0) {
        this.sendError(
          res,
          `Missing required fields: ${missingFields.join(", ")}`,
          400
        );
        return;
      }

      const { mealType, message } = req.body;
      const userId = (req as any).user?.userId;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      const result = await this.alertService.createMealReminder(
        userId,
        mealType,
        message
      );
      this.sendServiceResponse(res, result);
    });
  };

  public deleteAlert = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const { id } = req.params;

      if (!id) {
        this.sendError(res, "Alert ID is required", 400);
        return;
      }

      const result = await this.alertService.deleteAlert(id);
      this.sendServiceResponse(res, result);
    });
  };

  public getAlertInsights = async (
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

      const result = await this.alertService.getAlertInsights(
        userId,
        parseInt(days as string)
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
