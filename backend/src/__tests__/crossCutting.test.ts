/// <reference types="jest" />

import request from "supertest";
import { app } from "../app";
import { resetNoteStore } from "../store/noteStore";

const allowedOrigin = "http://localhost:3000";

describe("CORS", () => {
  it("sets Access-Control-Allow-Origin for allowed Origin header", async () => {
    const res = await request(app)
      .options("/notes")
      .set("Origin", allowedOrigin)
      .set("Access-Control-Request-Method", "GET");

    expect(res.headers["access-control-allow-origin"]).toBe(allowedOrigin);
  });

  it("does not reflect a disallowed origin", async () => {
    const res = await request(app)
      .options("/notes")
      .set("Origin", "http://evil.example")
      .set("Access-Control-Request-Method", "GET");

    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
  });
});

describe("Global error handler", () => {
  const prevEnv = process.env.NODE_ENV;

  beforeAll(() => {
    process.env.NODE_ENV = "test";
  });

  afterAll(() => {
    process.env.NODE_ENV = prevEnv;
  });

  it("returns JSON with status and message for thrown errors", async () => {
    const res = await request(app).get("/__test/error");
    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      status: 500,
      message: "Deliberate test error",
    });
  });

  it("uses AppError status and message", async () => {
    const res = await request(app).get("/__test/app-error");
    expect(res.status).toBe(418);
    expect(res.body).toEqual({
      status: 418,
      message: "I'm a teapot",
    });
  });

  it("returns 404 JSON for unknown routes", async () => {
    const res = await request(app).get("/no-such-route");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      status: 404,
      message: "Not found",
    });
  });
});

describe("OpenAPI", () => {
  beforeEach(() => {
    resetNoteStore();
  });

  it("serves OpenAPI JSON at /openapi.json", async () => {
    const res = await request(app).get("/openapi.json");
    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe("3.0.3");
    expect(res.body.info?.title).toBe("Notes API");
    expect(res.body.paths?.["/notes"]).toBeDefined();
  });

  it("serves Swagger UI at /api-docs", async () => {
    const res = await request(app).get("/api-docs/");
    expect(res.status).toBe(200);
    expect(res.text).toContain("swagger-ui");
  });
});
