import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { AppError, notFound } from "../middleware/errorHandler.js";
import { asyncHandler } from "./asyncHandler.js";
import {
  workLogEntryParamsSchema,
  workLogEntryQuerySchema,
  workLogEntrySchema
} from "../validation/workLogEntrySchemas.js";

export const workLogEntriesRouter = Router();

const includeWorkType = {
  workType: true
};

const isPrismaKnownRequestError = (error: unknown): error is { code: string } =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  typeof (error as { code?: unknown }).code === "string";

workLogEntriesRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const query = workLogEntryQuerySchema.parse(req.query);
    const where =
      query.dateFrom || query.dateTo
        ? {
            date: {
        ...(query.dateFrom ? { gte: query.dateFrom } : {}),
        ...(query.dateTo ? { lte: query.dateTo } : {})
            }
          }
        : undefined;

    const [total, items] = await prisma.$transaction([
      prisma.workLogEntry.count({ where }),
      prisma.workLogEntry.findMany({
        where,
        include: includeWorkType,
        orderBy: { date: query.sortOrder },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize
      })
    ]);

    res.json({
      items,
      page: query.page,
      pageSize: query.pageSize,
      total
    });
  })
);

workLogEntriesRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = workLogEntrySchema.parse(req.body);

    const entry = await prisma.workLogEntry.create({
      data,
      include: includeWorkType
    });

    res.status(201).json(entry);
  })
);

workLogEntriesRouter.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = workLogEntryParamsSchema.parse(req.params);
    const data = workLogEntrySchema.parse(req.body);

    try {
      const entry = await prisma.workLogEntry.update({
        where: { id },
        data,
        include: includeWorkType
      });

      res.json(entry);
    } catch (error) {
      if (isPrismaKnownRequestError(error) && error.code === "P2025") {
        throw notFound("Запись журнала не найдена");
      }

      throw error;
    }
  })
);

workLogEntriesRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = workLogEntryParamsSchema.parse(req.params);

    try {
      await prisma.workLogEntry.delete({
        where: { id }
      });

      res.status(204).send();
    } catch (error) {
      if (isPrismaKnownRequestError(error) && error.code === "P2025") {
        throw notFound("Запись журнала не найдена");
      }

      throw error;
    }
  })
);

workLogEntriesRouter.use((_req, _res, next) => {
  next(new AppError(404, "Endpoint журнала работ не найден"));
});
