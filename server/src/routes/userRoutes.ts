// User routes
import { Router, Router as ExpressRouter } from "express";
import { UserController } from "@/controllers/UserController";
import { validateRequest, commonSchemas } from "@/middleware/validation";
import { generalRateLimit, authRateLimit } from "@/middleware/security";
import { requireAuth } from "@/middleware/auth";
import Joi from "joi";

const router: ExpressRouter = Router();
const userController = new UserController();

// Apply rate limiting to all user routes
router.use(generalRateLimit);

// Authentication routes with stricter rate limiting
router.post(
  "/login",
  authRateLimit,
  validateRequest({
    body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
    }),
  }),
  userController.login
);

router.post(
  "/signup",
  authRateLimit,
  validateRequest({
    body: Joi.object({
      firstName: Joi.string().min(2).max(50).required(),
      lastName: Joi.string().min(2).max(50).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
    }),
  }),
  userController.signup
);

// User routes
// Authenticated: get current user profile (place before parameterized routes)
router.get("/me", requireAuth, userController.me);

// Update current user profile
router.put(
  "/me",
  requireAuth,
  validateRequest({
    body: Joi.object({
      name: Joi.string().min(2).max(50).optional(),
      email: Joi.string().email().optional(),
    }),
  }),
  userController.updateProfile
);

// Save onboarding data
router.post(
  "/onboarding",
  requireAuth,
  validateRequest({ body: commonSchemas.onboarding.save }),
  userController.saveOnboarding
);

router.post(
  "/",
  validateRequest({ body: commonSchemas.user.create }),
  userController.create
);

router.get(
  "/",
  validateRequest({ query: commonSchemas.pagination }),
  userController.findAll
);

router.get(
  "/:id",
  validateRequest({ params: commonSchemas.id }),
  userController.findById
);

router.put(
  "/:id",
  validateRequest({
    params: commonSchemas.id,
    body: commonSchemas.user.update,
  }),
  userController.update
);

router.delete(
  "/:id",
  validateRequest({ params: commonSchemas.id }),
  userController.delete
);

export default router;
