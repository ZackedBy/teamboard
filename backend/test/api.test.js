import request from "supertest";
import { describe, it, afterEach, expect, vi, beforeEach } from "vitest";

import app from "../src/app.js";
import pool from "../src/db/index.js";

describe("GET /api/v1", () => {
  it("responds with a json message", () =>
    request(app)
      .get("/api/v1")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200, {
        message: "API - 👋🌎🌍🌏",
      }));
});

describe("GET /api/v1/emojis", () => {
  it("responds with a list of emojis", () =>
    request(app)
      .get("/api/v1/emojis")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200, ["😀", "😳", "🙄"]));
});

describe("GET /api/v1/emojis/random", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns a deterministic emoji when Math.random is mocked", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);

    const res = await request(app).get("/api/v1/emojis/random");

    expect(res.status).toBe(200);

    expect(res.body).toHaveProperty("emoji");

    expect(res.body.emoji).toBe("😳");
  });
});

describe("Schema Validation: GET /api/v1/emojis", () => {
  it("validates that response is an array of strings", async () => {
    const res = await request(app)
      .get("/api/v1/emojis")
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    
    res.body.forEach((emoji) => {
      expect(typeof emoji).toBe("string");
    });
  });
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
    // Mock pool.query to return successfully
    vi.spyOn(pool, "query").mockResolvedValueOnce({ rows: [{ "?column?": 1 }] });

    const res = await request(app)
      .get("/api/v1/ready")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toHaveProperty("status", "ready");
    expect(res.body).toHaveProperty("database", "connected");
    expect(res.body).toHaveProperty("timestamp");
    expect(typeof res.body.timestamp).toBe("string");
  });

  it("responds with 503 Service Unavailable when database is down", async () => {
    // Mock pool.query to throw an error
    vi.spyOn(pool, "query").mockRejectedValueOnce(
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
  });
});
