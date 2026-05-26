import type { NextFunction, Request, Response } from "express";
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

const isPrismaKnownRequestError = (error: unknown): error is { code: string } =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  typeof (error as { code?: unknown }).code === "string";

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    res.status(400).json({
      message: "Проверьте корректность заполнения полей",
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

  if (isPrismaKnownRequestError(error) && error.code === "P2025") {
    res.status(404).json({ message: "Запись не найдена" });
    return;
  }

  if (isPrismaKnownRequestError(error) && error.code === "P2003") {
    res.status(400).json({ message: "Выбранный вид работ не найден" });
    return;
  }

  if (isPrismaKnownRequestError(error) && error.code === "P2021") {
    res.status(500).json({
      message: "Схема базы данных не инициализирована. Примените миграции и seed."
    });
    return;
  }

  console.error(error);
  res.status(500).json({ message: "Внутренняя ошибка сервера" });
}
