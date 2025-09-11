// Conversation Controller for chat management
import { Request, Response, NextFunction } from "express";
import { BaseController } from "./BaseController";
import { ConversationService } from "@/services/ConversationService";
import { AuthRequest } from "@/middleware/auth";

export class ConversationController extends BaseController {
  private readonly conversationService: ConversationService;

  constructor() {
    super();
    this.conversationService = new ConversationService();
  }

  public create = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const requiredFields = ["title"];
      const missingFields = this.validateRequired(req, requiredFields);

      if (missingFields.length > 0) {
        this.sendError(
          res,
          `Missing required fields: ${missingFields.join(", ")}`,
          400
        );
        return;
      }

      const userId = req.user?.userId;
      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      const conversationData = {
        title: req.body.title,
        userId: userId,
      };

      const result = await this.conversationService.createConversation(
        conversationData
      );
      this.sendServiceResponse(res, result, 201);
    });
  };

  public findById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!id) {
        this.sendError(res, "Conversation ID is required", 400);
        return;
      }

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      const result = await this.conversationService.getConversation(id, userId);
      this.sendServiceResponse(res, result);
    });
  };

  public findAll = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const userId = req.user?.userId;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      const result = await this.conversationService.getUserConversations(
        userId,
        limit,
        offset
      );
      this.sendServiceResponse(res, result);
    });
  };

  public sendMessage = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await this.handleRequest(req, res, next, async () => {
        const requiredFields = ["content", "conversationId"];
        const missingFields = this.validateRequired(req, requiredFields);

        if (missingFields.length > 0) {
          this.sendError(
            res,
            `Missing required fields: ${missingFields.join(", ")}`,
            400
          );
          return;
        }

        const userId = req.user?.userId;
        if (!userId) {
          this.sendError(res, "User ID is required", 400);
          return;
        }

        const messageData = {
          content: req.body.content,
          conversationId: req.body.conversationId,
          userId: userId,
        };

        const result = await this.conversationService.sendMessage(messageData);
        this.sendServiceResponse(res, result);
      });
    } catch (error) {
      console.error(error);
    }
  };

  public sendMessageStream = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const requiredFields = ["content", "conversationId"];
      const missingFields = this.validateRequired(req, requiredFields);

      if (missingFields.length > 0) {
        this.sendError(
          res,
          `Missing required fields: ${missingFields.join(", ")}`,
          400
        );
        return;
      }

      const userId = req.user?.userId;
      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      // Set headers for streaming
      res.setHeader("Content-Type", "text/plain");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const messageData = {
        content: req.body.content,
        conversationId: req.body.conversationId,
        userId: userId,
      };

      const result = await this.conversationService.sendMessageStream(
        messageData,
        res
      );
    } catch (error) {
      console.error("Streaming error:", error);
      res.status(500).json({
        success: false,
        error: "Streaming failed",
        statusCode: 500,
      });
    }
  };

  public update = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!id) {
        this.sendError(res, "Conversation ID is required", 400);
        return;
      }

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      // For now, only allow updating the title
      if (req.body.title) {
        // This would require implementing updateConversation in the service
        this.sendError(res, "Conversation update not implemented", 501);
        return;
      }

      this.sendError(res, "No valid update data provided", 400);
    });
  };

  public generateTitle = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      if (!req.user?.userId) {
        this.sendError(res, "Authentication required", 401);
        return;
      }

      const { conversationId } = req.params;
      if (!conversationId) {
        this.sendError(res, "Conversation ID is required", 400);
        return;
      }

      const result = await this.conversationService.generateAndUpdateTitle(
        conversationId,
        req.user.userId
      );

      if (!result.success) {
        this.sendError(res, result.error || "Failed to generate title", 400);
        return;
      }

      this.sendServiceResponse(res, result);
    });
  };

  public delete = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!id) {
        this.sendError(res, "Conversation ID is required", 400);
        return;
      }

      if (!userId) {
        this.sendError(res, "User ID is required", 400);
        return;
      }

      const result = await this.conversationService.deleteConversation(
        id,
        userId
      );
      this.sendServiceResponse(res, result);
    });
  };
}
