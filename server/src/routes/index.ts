// Main routes index
import { Router, Router as ExpressRouter } from "express";
import userRoutes from "./userRoutes";
import llmRoutes from "./llmRoutes";
import conversationRoutes from "./conversationRoutes";

const router: ExpressRouter = Router();

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    statusCode: 200,
  });
});

// API routes
router.use("/users", userRoutes);
router.use("/llm", llmRoutes);
router.use("/conversations", conversationRoutes);

// API info endpoint
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "SanteIA API Server",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      users: "/api/users",
      llm: "/api/llm",
      conversations: "/api/conversations",
    },
    statusCode: 200,
  });
});

export default router;
