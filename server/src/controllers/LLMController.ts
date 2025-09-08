// LLM Controller for AI text generation
import { Request, Response, NextFunction } from "express";
import { BaseController } from "./BaseController";
import { LLMService } from "@/services/LLMService";

export class LLMController extends BaseController {
  private llmService: LLMService;

  constructor() {
    super();
    this.llmService = new LLMService();
  }

  public generateText = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const requiredFields = ["prompt", "userId"];
      const missingFields = this.validateRequired(req, requiredFields);

      if (missingFields.length > 0) {
        this.sendError(
          res,
          `Missing required fields: ${missingFields.join(", ")}`,
          400
        );
        return;
      }

      const llmRequest = {
        prompt: req.body.prompt,
        userId: req.body.userId,
        conversationId: req.body.conversationId,
        maxTokens: req.body.maxTokens || 512,
        temperature: req.body.temperature || 0.7,
        topP: req.body.topP || 0.9,
        repetitionPenalty: req.body.repetitionPenalty || 1.1,
      };

      const result = await this.llmService.generateText(llmRequest);
      this.sendServiceResponse(res, result);
    });
  };

  public getModelInfo = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    await this.handleRequest(req, res, next, async () => {
      const result = await this.llmService.getModelInfo();
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
