// Conversation routes
import { Router, Router as ExpressRouter } from "express";
import { ConversationController } from "@/controllers/ConversationController";
import { generalRateLimit } from "@/middleware/security";
import { validateRequest, commonSchemas } from "@/middleware/validation";
import { requireAuth } from "@/middleware/auth";

const router: ExpressRouter = Router();
const conversationController = new ConversationController();

// Apply rate limiting to all conversation routes
router.use(generalRateLimit);

// Apply authentication to all conversation routes
router.use(requireAuth);

// Conversation routes
router.post(
  "/",
  validateRequest({ body: commonSchemas.conversation.create }),
  conversationController.create
);
router.get("/", conversationController.findAll);
router.get("/:id", conversationController.findById);
router.post(
  "/:id/messages",
  validateRequest({ body: commonSchemas.conversation.sendMessage }),
  conversationController.sendMessage
);
router.put("/:id", conversationController.update);
router.delete("/:id", conversationController.delete);

export default router;
