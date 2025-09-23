// BloodSugarController for handling blood sugar related requests
import { Request, Response, NextFunction } from "express";
import { BaseController } from "./BaseController";
import { BloodSugarService } from "@/services/BloodSugarService";
import { ReadingType } from "@/types";

export class BloodSugarController extends BaseController {
  private bloodSugarService: BloodSugarService;

  constructor() {
    super();
    this.bloodSugarService = new BloodSugarService();
  }

  public createReading = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const requiredFields = ["value", "readingType"];
      const missingFields = this.validateRequired(req, requiredFields);

      if (missingFields.length > 0) {
        this.sendError(
          res,
          `Missing required fields: ${missingFields.join(", ")}`,
          400
        );
        return;
      }

      const { value, unit = "mg/dL", readingType, notes, timestamp } = req.body;
      const userId = (req as any).user?.userId;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      const normalizedType = (
        typeof readingType === "string"
          ? readingType.toUpperCase()
          : readingType
      ) as ReadingType;

      if (!Object.values(ReadingType).includes(normalizedType)) {
        this.sendError(res, "Invalid reading type", 400);
        return;
      }

      if (value <= 0 || value > 1000) {
        this.sendError(
          res,
          "Blood sugar value must be between 0 and 1000",
          400
        );
        return;
      }

      const result = await this.bloodSugarService.createReading(userId, {
        value,
        unit,
        readingType: normalizedType,
        notes,
        timestamp: timestamp ? new Date(timestamp) : undefined,
      });

      this.sendServiceResponse(res, result);
    });
  };

  public getReadingById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const { id } = req.params;

      if (!id) {
        this.sendError(res, "Reading ID is required", 400);
        return;
      }

      const result = await this.bloodSugarService.getReadingById(id);
      this.sendServiceResponse(res, result);
    });
  };

  public getReadingsByUser = async (
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
        readingType,
        startDate,
        endDate,
      } = req.query;

      const filters: any = {};
      if (readingType) filters.readingType = readingType;
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

      const result = await this.bloodSugarService.getReadingsByUser(
        userId,
        filters,
        pagination
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getReadingsByType = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;
      const { readingType } = req.params;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      if (!Object.values(ReadingType).includes(readingType as ReadingType)) {
        this.sendError(res, "Invalid reading type", 400);
        return;
      }

      const {
        page = 1,
        limit = 10,
        sortBy = "timestamp",
        sortOrder = "desc",
      } = req.query;

      const pagination = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sortBy: sortBy as string,
        sortOrder: sortOrder as "asc" | "desc",
      };

      const result = await this.bloodSugarService.getReadingsByType(
        userId,
        readingType as ReadingType,
        pagination
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getReadingsByDateRange = async (
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

      const result = await this.bloodSugarService.getReadingsByDateRange(
        userId,
        new Date(startDate as string),
        new Date(endDate as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getLatestReading = async (
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

      const result = await this.bloodSugarService.getLatestReading(userId);
      this.sendServiceResponse(res, result);
    });
  };

  public getStats = async (
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

      const result = await this.bloodSugarService.getStats(
        userId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      this.sendServiceResponse(res, result);
    });
  };

  public estimateHbA1c = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;
      const { months = 3 } = req.query;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      const result = await this.bloodSugarService.estimateHbA1c(
        userId,
        parseInt(months as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getReadingsByDay = async (
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

      const result = await this.bloodSugarService.getReadingsByDay(
        userId,
        new Date(date as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getReadingsByWeek = async (
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

      const result = await this.bloodSugarService.getReadingsByWeek(
        userId,
        new Date(startDate as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getReadingsByMonth = async (
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

      const result = await this.bloodSugarService.getReadingsByMonth(
        userId,
        parseInt(year as string),
        parseInt(month as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getHighReadings = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;
      const { threshold = 180 } = req.query;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      const result = await this.bloodSugarService.getHighReadings(
        userId,
        parseInt(threshold as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getLowReadings = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;
      const { threshold = 70 } = req.query;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      const result = await this.bloodSugarService.getLowReadings(
        userId,
        parseInt(threshold as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public getInRangeReadings = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = (req as any).user?.userId;
      const { min = 70, max = 180 } = req.query;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      const result = await this.bloodSugarService.getInRangeReadings(
        userId,
        parseInt(min as string),
        parseInt(max as string)
      );
      this.sendServiceResponse(res, result);
    });
  };

  public updateReading = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const { id } = req.params;
      const { value, unit, readingType, notes, timestamp } = req.body;

      if (!id) {
        this.sendError(res, "Reading ID is required", 400);
        return;
      }

      if (value !== undefined && (value <= 0 || value > 1000)) {
        this.sendError(
          res,
          "Blood sugar value must be between 0 and 1000",
          400
        );
        return;
      }

      if (readingType && !Object.values(ReadingType).includes(readingType)) {
        this.sendError(res, "Invalid reading type", 400);
        return;
      }

      const result = await this.bloodSugarService.updateReading(id, {
        value,
        unit,
        readingType,
        notes,
        timestamp: timestamp ? new Date(timestamp) : undefined,
      });
      this.sendServiceResponse(res, result);
    });
  };

  public deleteReading = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const { id } = req.params;

      if (!id) {
        this.sendError(res, "Reading ID is required", 400);
        return;
      }

      const result = await this.bloodSugarService.deleteReading(id);
      this.sendServiceResponse(res, result);
    });
  };

  public getReadingInsights = async (
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

      const result = await this.bloodSugarService.getReadingInsights(
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
