import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "./app.js";
import { prisma } from "./lib/prisma.js";

vi.mock("./lib/prisma.js", () => ({
  prisma: {
    $queryRaw: vi.fn(),
    $disconnect: vi.fn(),
    $transaction: vi.fn((queries: Promise<unknown>[]) => Promise.all(queries)),
    workType: {
      findMany: vi.fn()
    },
    workLogEntry: {
      count: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    }
  }
}));

const mockedPrisma = vi.mocked(prisma);

describe("API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns healthcheck status", async () => {
    mockedPrisma.$queryRaw.mockResolvedValueOnce([{ "?column?": 1 }]);

    const response = await request(app).get("/health").expect(200);

    expect(response.body).toEqual({ status: "ok", database: "connected" });
  });

  it("returns work types sorted by name", async () => {
    mockedPrisma.workType.findMany.mockResolvedValueOnce([
      { id: 1, name: "Армирование", createdAt: new Date(), updatedAt: new Date() }
    ]);

    const response = await request(app).get("/api/work-types").expect(200);

    expect(response.body).toHaveLength(1);
    expect(mockedPrisma.workType.findMany).toHaveBeenCalledWith({
      orderBy: { name: "asc" }
    });
  });

  it("returns paginated work log entries", async () => {
    mockedPrisma.workLogEntry.count.mockResolvedValueOnce(11);
    mockedPrisma.workLogEntry.findMany.mockResolvedValueOnce([
      {
        id: 1,
        date: new Date("2026-05-25T00:00:00.000Z"),
        workTypeId: 1,
        volumeValue: "10",
        volumeUnit: "м²",
        performerName: "Иванов Иван Иванович",
        comment: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        workType: { id: 1, name: "Армирование", createdAt: new Date(), updatedAt: new Date() }
      }
    ]);

    const response = await request(app)
      .get("/api/work-log-entries")
      .query({
        dateFrom: "2026-05-01",
        dateTo: "2026-05-31",
        sortOrder: "asc",
        page: 2,
        pageSize: 5
      })
      .expect(200);

    expect(response.body).toMatchObject({
      page: 2,
      pageSize: 5,
      total: 11
    });
    expect(response.body.items).toHaveLength(1);
    expect(mockedPrisma.workLogEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { date: "asc" },
        skip: 5,
        take: 5
      })
    );
  });

  it("rejects invalid work log entry payload", async () => {
    const response = await request(app).post("/api/work-log-entries").send({}).expect(400);

    expect(response.body.message).toBe("Проверьте корректность заполнения полей");
    expect(mockedPrisma.workLogEntry.create).not.toHaveBeenCalled();
  });
});
