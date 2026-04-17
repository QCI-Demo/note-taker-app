import type { ErrorRequestHandler } from "express";

export class AppError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const status =
    err instanceof AppError
      ? err.status
      : typeof (err as { status?: number }).status === "number"
        ? (err as { status: number }).status
        : 500;

  const message =
    err instanceof Error && err.message
      ? err.message
      : "An unexpected error occurred";

  if (!res.headersSent) {
    res.status(status).json({ status, message });
  }
};
