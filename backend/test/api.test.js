import request from "supertest";
import { describe, it, afterEach, expect, vi } from "vitest";

import app from "../src/app.js";

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
