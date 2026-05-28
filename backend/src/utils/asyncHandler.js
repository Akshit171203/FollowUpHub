/**
 * Async Handler Wrapper
 * 
 * Wraps an async Express route handler so that any rejected promise
 * is automatically forwarded to Express's next() error handler.
 * 
 * Usage:
 *   router.get("/", asyncHandler(async (req, res) => { ... }));
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
