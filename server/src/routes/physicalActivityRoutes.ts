// Physical activity routes
import { Router, Router as ExpressRouter } from "express";
import { PhysicalActivityController } from "@/controllers/PhysicalActivityController";
import { authenticateToken } from "@/middleware/auth";
import { generalRateLimit } from "@/middleware/security";
import { validateRequest, commonSchemas } from "@/middleware/validation";

const router: ExpressRouter = Router();
const activityController = new PhysicalActivityController();

// Apply authentication and rate limiting to all routes
router.use(authenticateToken);
router.use(generalRateLimit);

// Physical activity routes
router.post(
  "/",
  validateRequest({ body: commonSchemas.physicalActivity.create }),
  activityController.create
);

router.get("/", activityController.getActivitiesByUser);
router.get("/:id", activityController.getActivityById);
router.get("/date-range", activityController.getActivitiesByDateRange);
router.get("/day", activityController.getActivitiesByDay);
router.get("/week", activityController.getActivitiesByWeek);
router.get("/month", activityController.getActivitiesByMonth);
router.get("/type/:activityType", activityController.getActivitiesByType);
router.get(
  "/intensity/:intensity",
  activityController.getActivitiesByIntensity
);
router.get("/search", activityController.searchActivities);
router.put("/:id", activityController.updateActivity);
router.delete("/:id", activityController.deleteActivity);

// Duration tracking
router.get("/duration/day", activityController.getTotalDurationByDay);
router.get("/duration/week", activityController.getTotalDurationByWeek);
router.get("/duration/month", activityController.getTotalDurationByMonth);
router.get("/duration/average", activityController.getAverageDurationByDay);

// Calories tracking
router.get("/calories/day", activityController.getTotalCaloriesBurnedByDay);
router.get("/calories/week", activityController.getTotalCaloriesBurnedByWeek);
router.get("/calories/month", activityController.getTotalCaloriesBurnedByMonth);

// Analytics
router.get("/frequency", activityController.getActivityFrequency);
router.get(
  "/intensity-distribution",
  activityController.getIntensityDistribution
);
router.get("/most-frequent", activityController.getMostFrequentActivities);
router.get("/recent", activityController.getRecentActivities);
router.get("/weekly-goal", activityController.getWeeklyActivityGoal);

// Insights and suggestions
router.get("/insights", activityController.getActivityInsights);
router.get("/suggestions", activityController.getActivitySuggestions);

export default router;
