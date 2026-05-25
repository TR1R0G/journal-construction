import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "./asyncHandler.js";

export const workTypesRouter = Router();

workTypesRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const workTypes = await prisma.workType.findMany({
      orderBy: { name: "asc" }
    });

    res.json(workTypes);
  })
);
