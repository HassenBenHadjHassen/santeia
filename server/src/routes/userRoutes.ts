// User routes
import { Router } from "express";
import { UserController } from "@/controllers/UserController";
import { validateRequest, commonSchemas } from "@/middleware/validation";
import { generalRateLimit } from "@/middleware/security";

const router = Router();
const userController = new UserController();

// Apply rate limiting to all user routes
router.use(generalRateLimit);

// User routes
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
