import request from "supertest";
import { describe, it, expect } from "vitest";

import app from "../src/app.js";

describe("app", () => {
  it("responds with a not found message", () =>
    request(app)
      .get("/what-is-this-even")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(404));
});

describe("Security Headers", () => {
  it("should have security headers (Helmet)", async () => {
    const res = await request(app).get("/");
    
    expect(res.headers).toHaveProperty("x-dns-prefetch-control");
    expect(res.headers).toHaveProperty("x-frame-options");
    expect(res.headers).toHaveProperty("strict-transport-security");
    
    expect(res.headers).not.toHaveProperty("x-powered-by"); 
  });
});

describe("GET /", () => {
  it("responds with a json message", () =>
    request(app)
      .get("/")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200, {
        message: "🦄🌈✨👋🌎🌍🌏✨🌈🦄",
      }));
});
