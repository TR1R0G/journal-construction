import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { errorHandler } from "./middleware/errorHandler.js";
import { prisma } from "./lib/prisma.js";
import { workLogEntriesRouter } from "./routes/workLogEntries.js";
import { workTypesRouter } from "./routes/workTypes.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 4000);

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

const server = app.listen(port, "0.0.0.0", () => {
  console.info(`API server listening on port ${port}`);
});

const shutdown = async () => {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
