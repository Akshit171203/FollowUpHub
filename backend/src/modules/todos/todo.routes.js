import express from "express";
import { authenticateUser } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.js";
import {
  createTodoSchema,
  updateTodoSchema,
  followupIdParam,
} from "../../middlewares/schemas.js";
import { todoController } from "./todo.controller.js";

const router = express.Router();

router.get("/", authenticateUser, todoController.list);
router.post("/", authenticateUser, validate(createTodoSchema), todoController.create);
router.patch("/:id", authenticateUser, validate(updateTodoSchema), todoController.update);
router.delete("/:id", authenticateUser, validate(followupIdParam), todoController.remove);
router.post("/:id/promote", authenticateUser, validate(followupIdParam), todoController.promote);

export default router;
