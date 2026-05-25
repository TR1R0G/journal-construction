import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { errorHandler } from "./middleware/errorHandler.js";
import { prisma } from "./lib/prisma.js";
import { workLogEntriesRouter } from "./routes/workLogEntries.js";
import { workTypesRouter } from "./routes/workTypes.js";

dotenv.config();

export const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN ?? true
  })
);
app.use(express.json());

app.get("/health", async (_req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    next(error);
  }
});

app.get("/api", (_req, res) => {
  res.json({
    name: "journal-construction-api",
    version: "0.1.0"
  });
});

app.use("/api/work-types", workTypesRouter);
app.use("/api/work-log-entries", workLogEntriesRouter);

app.use(errorHandler);
