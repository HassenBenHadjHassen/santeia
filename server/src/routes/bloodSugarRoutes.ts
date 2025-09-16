// Blood sugar routes
import { Router, Router as ExpressRouter } from "express";
import { BloodSugarController } from "@/controllers/BloodSugarController";
import { authenticateToken } from "@/middleware/auth";
import { generalRateLimit } from "@/middleware/security";
import { validateRequest, commonSchemas } from "@/middleware/validation";

const router: ExpressRouter = Router();
const bloodSugarController = new BloodSugarController();

// Apply authentication and rate limiting to all routes
router.use(authenticateToken);
router.use(generalRateLimit);

// Blood sugar reading routes
router.post(
  "/",
  validateRequest({ body: commonSchemas.bloodSugar.createReading }),
  bloodSugarController.createReading
);

router.get("/", bloodSugarController.getReadingsByUser);
router.get("/:id", bloodSugarController.getReadingById);
router.get("/type/:readingType", bloodSugarController.getReadingsByType);
router.get("/date-range", bloodSugarController.getReadingsByDateRange);
router.get("/latest", bloodSugarController.getLatestReading);
router.get("/day", bloodSugarController.getReadingsByDay);
router.get("/week", bloodSugarController.getReadingsByWeek);
router.get("/month", bloodSugarController.getReadingsByMonth);
router.get("/high", bloodSugarController.getHighReadings);
router.get("/low", bloodSugarController.getLowReadings);
router.get("/in-range", bloodSugarController.getInRangeReadings);
router.put("/:id", bloodSugarController.updateReading);
router.delete("/:id", bloodSugarController.deleteReading);

// Statistics and insights
router.get("/stats", bloodSugarController.getStats);
router.get("/hba1c-estimate", bloodSugarController.estimateHbA1c);
router.get("/insights", bloodSugarController.getReadingInsights);

export default router;
