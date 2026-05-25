import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
  }
}

export const notFound = (message = "Resource not found") => new AppError(404, message);

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    res.status(400).json({
      message: "Validation error",
      errors: error.flatten()
    });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      message: error.message,
      details: error.details
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
    res.status(404).json({ message: "Resource not found" });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
    res.status(400).json({ message: "Invalid relation id" });
    return;
  }

  console.error(error);
  res.status(500).json({ message: "Internal server error" });
}
