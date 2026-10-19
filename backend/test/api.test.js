import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import app from "../src/app.js";
import pool from "../src/db/index.js";

describe("GET /health (Liveness Check)", () => {
  it("responds with 200 OK and status 'ok'", () =>
    request(app)
      .get("/health")
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty("status", "ok");
        expect(res.body).toHaveProperty("message", "Liveness probe successful");
        expect(res.body).toHaveProperty("timestamp");
      }));
});

describe("GET /ready (Readiness Check with DB)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("responds with 200 OK when the database is connected", async () => {
    const clientMock = {
      release: vi.fn(),
      query: vi.fn().mockResolvedValue({ rows: [{ "?column?": 1 }] }),
    };
    vi.spyOn(pool, "connect").mockResolvedValueOnce(clientMock);

    const res = await request(app)
      .get("/ready")
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toEqual({
      status: "ready",
      database: "connected",
      timestamp: res.body.timestamp,
    });
    expect(pool.connect).toHaveBeenCalledOnce();
  });

  it("responds with 503 Service Unavailable when the database is disconnected", async () => {
    vi.spyOn(pool, "connect").mockRejectedValueOnce(
      new Error("Connection refused by Postgres"),
    );

    const res = await request(app)
      .get("/ready")
      .expect("Content-Type", /json/)
      .expect(503);

    expect(res.body).toEqual({
      status: "not ready",
      database: "disconnected",
      error: "Database connection failed. Service is not ready.",
      timestamp: res.body.timestamp,
    });
    expect(pool.connect).toHaveBeenCalledOnce();
  });
});

describe("GET /api/v1", () => {
  it("responds with a json message", () =>
    request(app)
      .get("/api/v1")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200, {
        message: "TeamBoard API",
      }));
});

describe("Invalid route", () => {
  it("responds with 404", () =>
    request(app)
      .get("/non-existent-route")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(404)
      .then((res) => {
        expect(res.body).toHaveProperty("message");
        expect(res.body.message).toMatch(/Not Found/);
      }));
});

describe("Health Check: GET /api/v1/health", () => {
  it("responds with 200 OK and status", async () => {
    const res = await request(app)
      .get("/api/v1/health")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toHaveProperty("status", "ok");
    expect(res.body).toHaveProperty("timestamp");
    expect(typeof res.body.timestamp).toBe("string");
  });
});

describe("Readiness Check: GET /api/v1/ready", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("responds with 200 OK when database is connected", async () => {
    const clientMock = {
      release: vi.fn(),
      query: vi.fn().mockResolvedValue({ rows: [{ "?column?": 1 }] }),
    };
    vi.spyOn(pool, "connect").mockResolvedValueOnce(clientMock);

    const res = await request(app)
      .get("/api/v1/ready")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toHaveProperty("status", "ready");
    expect(res.body).toHaveProperty("database", "connected");
    expect(res.body).toHaveProperty("timestamp");
    expect(typeof res.body.timestamp).toBe("string");
    expect(pool.connect).toHaveBeenCalledOnce();
  });

  it("responds with 503 Service Unavailable when database is down", async () => {
    vi.spyOn(pool, "connect").mockRejectedValueOnce(
      new Error("Connection refused"),
    );

    const res = await request(app)
      .get("/api/v1/ready")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(503);

    expect(res.body).toHaveProperty("status", "not ready");
    expect(res.body).toHaveProperty("database", "disconnected");
    expect(res.body).toHaveProperty("error");
    expect(res.body).toHaveProperty("timestamp");
    expect(typeof res.body.timestamp).toBe("string");
    expect(pool.connect).toHaveBeenCalledOnce();
  });
});
