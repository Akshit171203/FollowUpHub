import { z } from "zod";
import { AppError } from "./error.middleware.js";

/**
 * Express middleware factory for validating request data with Zod schemas.
 * 
 * @param {Object} schemas - Object with optional `body`, `query`, `params` Zod schemas
 * @returns {Function} Express middleware
 * 
 * Usage:
 *   import { z } from "zod";
 *   import { validate } from "../middlewares/validate.js";
 * 
 *   const createUserSchema = { body: z.object({ email: z.string().email(), ... }) };
 *   router.post("/", validate(createUserSchema), handler);
 */
export function validate(schemas) {
  return (req, res, next) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
      next();
    } catch (err) {
      // Zod v4 uses .issues, v3 uses .errors
      const issues = err?.issues || err?.errors;
      if (issues && Array.isArray(issues)) {
        const details = issues.map((e) => ({
          field: (e.path || []).join("."),
          message: e.message,
        }));

        return next(new AppError("Validation failed", 400, details));
      }
      next(err);
    }
  };
}
