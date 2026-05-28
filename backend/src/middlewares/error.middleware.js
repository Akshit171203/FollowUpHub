/**
 * Global Error Handler Middleware
 * 
 * Catches all errors thrown in route handlers and returns a 
 * consistent JSON response. In development, includes the stack trace.
 * In production, hides internal details to avoid leaking info.
 */

// Custom application error class for throwing structured errors
export class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true; // Distinguishes from programming bugs
  }
}

/**
 * Express error-handling middleware (4 args required)
 */
export function errorHandler(err, req, res, _next) {
  // Default values
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === "production";

  // Log the error (always log full error server-side)
  console.error(
    `[ERROR] ${req.method} ${req.originalUrl} — ${statusCode}`,
    err.message
  );

  if (!isProduction) {
    console.error(err.stack);
  }

  // Build response payload
  const response = {
    status: "error",
    message: isProduction && statusCode === 500
      ? "Internal server error"     // Hide internal details in production
      : err.message || "Internal server error",
  };

  // Include validation details if present (e.g., from Zod)
  if (err.details) {
    response.errors = err.details;
  }

  // Include stack trace in development only
  if (!isProduction) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

/**
 * 404 Not Found handler — mount after all routes
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    status: "error",
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}
