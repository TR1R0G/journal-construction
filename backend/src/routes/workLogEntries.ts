import { Router } from "express";
import { Prisma } from "@prisma/client";
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
} satisfies Prisma.WorkLogEntryInclude;

workLogEntriesRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const query = workLogEntryQuerySchema.parse(req.query);
    const where: Prisma.WorkLogEntryWhereInput = {};

    if (query.dateFrom || query.dateTo) {
      where.date = {
        ...(query.dateFrom ? { gte: query.dateFrom } : {}),
        ...(query.dateTo ? { lte: query.dateTo } : {})
      };
    }

    const entries = await prisma.workLogEntry.findMany({
      where,
      include: includeWorkType,
      orderBy: { date: query.sortOrder }
    });

    res.json(entries);
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
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        throw notFound("Work log entry not found");
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
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        throw notFound("Work log entry not found");
      }

      throw error;
    }
  })
);

workLogEntriesRouter.use((_req, _res, next) => {
  next(new AppError(404, "Work log endpoint not found"));
});
