import express from "express";
import { ensureAuthenticated, restrictToRole } from "../../../middlewares/auth.middleware.js";
import { adminController } from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/", ensureAuthenticated, restrictToRole("ADMIN"), adminController.listUsers);

export default router;
