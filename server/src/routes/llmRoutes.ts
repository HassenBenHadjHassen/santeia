// LLM routes
import { Router } from "express";
import { LLMController } from "@/controllers/LLMController";
import { generalRateLimit } from "@/middleware/security";
import { validateRequest, commonSchemas } from "@/middleware/validation";

const router = Router();
const llmController = new LLMController();

// Apply rate limiting to all LLM routes
router.use(generalRateLimit);

// LLM routes
router.post(
  "/generate",
  validateRequest({ body: commonSchemas.llm.generate }),
  llmController.generateText
);
router.get("/model-info", llmController.getModelInfo);

export default router;
