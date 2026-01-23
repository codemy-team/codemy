import { Request, Response, NextFunction } from "express";

export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({ error: { message: "Not Found" } });
};

interface CustomError extends Error {
  status?: number;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (res.headersSent) {
    next(err);
    return;
  }
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ error: { message } });
};
