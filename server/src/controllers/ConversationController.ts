// Conversation Controller for chat management
import { Request, Response, NextFunction } from "express";
import { BaseController } from "./BaseController";
import { ConversationService } from "@/services/ConversationService";

export class ConversationController extends BaseController {
	private readonly conversationService: ConversationService;

	constructor() {
		super();
		this.conversationService = new ConversationService();
	}

	public create = async (
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> => {
		await this.handleRequest(req, res, next, async () => {
			const requiredFields = ["title", "userId"];
			const missingFields = this.validateRequired(req, requiredFields);

			if (missingFields.length > 0) {
				this.sendError(
					res,
					`Missing required fields: ${missingFields.join(", ")}`,
					400
				);
				return;
			}

			const conversationData = {
				title: req.body.title,
				userId: req.body.userId,
			};

			const result = await this.conversationService.createConversation(
				conversationData
			);
			this.sendServiceResponse(res, result, 201);
		});
	};

	public findById = async (
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> => {
		await this.handleRequest(req, res, next, async () => {
			const { id } = req.params;
			const userId = req.query.userId as string;

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
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> => {
		await this.handleRequest(req, res, next, async () => {
			const userId = req.query.userId as string;
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
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> => {
		try {
			await this.handleRequest(req, res, next, async () => {
				const requiredFields = ["content", "conversationId", "userId"];
				const missingFields = this.validateRequired(req, requiredFields);

				if (missingFields.length > 0) {
					this.sendError(
						res,
						`Missing required fields: ${missingFields.join(", ")}`,
						400
					);
					return;
				}

				const messageData = {
					content: req.body.content,
					conversationId: req.body.conversationId,
					userId: req.body.userId,
				};

				const result = await this.conversationService.sendMessage(messageData);
				this.sendServiceResponse(res, result);
			});
		} catch (error) {
			console.error(error);
		}
	};

	public update = async (
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> => {
		await this.handleRequest(req, res, next, async () => {
			const { id } = req.params;
			const userId = req.body.userId;

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

	public delete = async (
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> => {
		await this.handleRequest(req, res, next, async () => {
			const { id } = req.params;
			const userId = req.query.userId as string;

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
