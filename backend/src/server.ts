import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import type { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = Number(process.env.PORT ?? 4000);

app.use(cors());
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

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);
  res.status(500).json({ message: "Internal server error" });
});

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`API server listening on port ${port}`);
});

const shutdown = async () => {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
