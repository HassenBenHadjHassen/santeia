// Meal routes
import { Router, Router as ExpressRouter } from "express";
import { MealController } from "@/controllers/MealController";
import { authenticateToken } from "@/middleware/auth";
import { generalRateLimit } from "@/middleware/security";
import { validateRequest, commonSchemas } from "@/middleware/validation";

const router: ExpressRouter = Router();
const mealController = new MealController();

// Apply authentication and rate limiting to all routes
router.use(authenticateToken);
router.use(generalRateLimit);

// Meal routes
router.post(
  "/",
  validateRequest({ body: commonSchemas.meal.create }),
  mealController.create
);

router.get("/", mealController.getMealsByUser);
router.get("/:id", mealController.getMealById);
router.get("/date-range", mealController.getMealsByDateRange);
router.get("/day", mealController.getMealsByDay);
router.get("/week", mealController.getMealsByWeek);
router.get("/month", mealController.getMealsByMonth);
router.get("/type/:mealType", mealController.getMealsByType);
router.get("/high-carb", mealController.getHighCarbMeals);
router.get("/low-carb", mealController.getLowCarbMeals);
router.get("/search", mealController.searchMeals);
router.put("/:id", mealController.updateMeal);
router.delete("/:id", mealController.deleteMeal);

// Macro tracking
router.get("/macros/day", mealController.getTotalMacrosByDay);
router.get("/macros/week", mealController.getTotalMacrosByWeek);
router.get("/macros/average", mealController.getAverageMacrosByDay);
router.get("/frequency", mealController.getMealFrequency);
router.get("/recent", mealController.getRecentMeals);

// Insights and suggestions
router.get("/insights", mealController.getMealInsights);
router.get("/suggestions", mealController.getMealSuggestions);

export default router;
