import { Request, Response, NextFunction } from 'express';

/**
 * A wrapper for asynchronous Express request handlers.
 * It catches any errors and passes them to the next middleware (error handler).
 */
const catchAsync = (fn: (req: Request, res: Response, next: NextFunction) => void | Promise<void>) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

export default catchAsync;
