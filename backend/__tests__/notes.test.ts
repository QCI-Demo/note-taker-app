/// <reference types="jest" />

import request from "supertest";
import { app } from "../src/app";
import type { Note } from "../src/models/Note";
import { noteCreateSchema, noteUpdateSchema } from "../src/validation/noteSchemas";
import { resetNoteStore, updateNoteById } from "../src/store/noteStore";

const allowedOrigin = "http://localhost:3000";

describe("Notes API (Supertest)", () => {
  beforeEach(() => {
    resetNoteStore();
  });

  describe("GET /notes", () => {
    it("returns 200 and an empty array when there are no notes", async () => {
      const res = await request(app).get("/notes");
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it("returns all notes as JSON with stable ids and content", async () => {
      await request(app).post("/notes").send({ content: "First" });
      await request(app).post("/notes").send({ content: "Second" });

      const res = await request(app).get("/notes");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(2);
      expect(res.body[0]).toMatchObject({
        id: expect.any(String),
        content: "First",
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
      });
      expect(res.body[1]).toMatchObject({
        id: expect.any(String),
        content: "Second",
      });
    });
  });

  describe("POST /notes", () => {
    it("creates a note with 201 and sets timestamps", async () => {
      const res = await request(app).post("/notes").send({ content: "New note" });
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        id: expect.any(String),
        content: "New note",
      });
      expect(res.body.createdAt).toBeDefined();
      expect(res.body.updatedAt).toBeDefined();

      const list = await request(app).get("/notes");
      expect(list.body).toHaveLength(1);
      expect(list.body[0].id).toBe(res.body.id);
    });

    it("returns 400 when content is missing with validation details", async () => {
      const res = await request(app).post("/notes").send({});
      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        status: 400,
        message: "Validation failed",
      });
      expect(Array.isArray(res.body.details)).toBe(true);
      expect(res.body.details.length).toBeGreaterThan(0);
    });

    it("returns 400 when content is not a string", async () => {
      const res = await request(app).post("/notes").send({ content: 123 });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Validation failed");
      expect(res.body.details.some((d: string) => d.includes("content"))).toBe(true);
    });

    it("returns 400 when body contains unknown keys", async () => {
      const res = await request(app)
        .post("/notes")
        .send({ content: "ok", extra: "not-allowed" });
      expect(res.status).toBe(400);
      expect(res.body.details.some((d: string) => d.toLowerCase().includes("not allowed"))).toBe(
        true,
      );
    });

    it("returns 409 when id already exists", async () => {
      const first = await request(app).post("/notes").send({
        id: "same-id",
        content: "A",
      });
      expect(first.status).toBe(201);

      const second = await request(app).post("/notes").send({
        id: "same-id",
        content: "B",
      });
      expect(second.status).toBe(409);
      expect(second.body).toEqual({
        status: 409,
        message: "A note with this id already exists",
      });
    });
  });

  describe("PUT /notes/:id", () => {
    it("updates a note and returns 200", async () => {
      const created = await request(app).post("/notes").send({ content: "Old" });
      const id = created.body.id as string;

      const res = await request(app).put(`/notes/${id}`).send({ content: "New body" });
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        id,
        content: "New body",
      });
      expect(new Date(res.body.updatedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(created.body.updatedAt).getTime(),
      );

      const getOne = await request(app).get("/notes");
      expect(getOne.body.find((n: { id: string }) => n.id === id).content).toBe("New body");
    });

    it("returns 404 when note does not exist", async () => {
      const res = await request(app)
        .put("/notes/missing-id")
        .send({ content: "x" });
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ status: 404, message: "Note not found" });
    });

    it("returns 400 for invalid body (empty object)", async () => {
      const created = await request(app).post("/notes").send({ content: "x" });
      const id = created.body.id as string;

      const res = await request(app).put(`/notes/${id}`).send({});
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Validation failed");
      expect(res.body.details).toBeDefined();
    });

    it("returns 400 when content is not a string", async () => {
      const created = await request(app).post("/notes").send({ content: "x" });
      const id = created.body.id as string;

      const res = await request(app).put(`/notes/${id}`).send({ content: false });
      expect(res.status).toBe(400);
      expect(res.body.details.some((d: string) => d.includes("content"))).toBe(true);
    });
  });

  describe("DELETE /notes/:id", () => {
    it("returns 204 and removes the note from the in-memory store", async () => {
      const created = await request(app).post("/notes").send({ content: "To delete" });
      const id = created.body.id as string;

      const res = await request(app).delete(`/notes/${id}`);
      expect(res.status).toBe(204);
      expect(res.body).toEqual({});

      const list = await request(app).get("/notes");
      expect(list.body).toHaveLength(0);
    });

    it("returns 404 when note does not exist", async () => {
      const res = await request(app).delete("/notes/unknown");
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ status: 404, message: "Note not found" });
    });
  });
});

describe("CORS", () => {
  it("sets Access-Control-Allow-Origin for OPTIONS preflight from localhost:3000", async () => {
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

  beforeEach(() => {
    resetNoteStore();
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

describe("noteCreateSchema", () => {
  it("accepts valid payload with content only", () => {
    const { error, value } = noteCreateSchema.validate({ content: "Hello" });
    expect(error).toBeUndefined();
    expect(value).toEqual({ content: "Hello" });
  });

  it("accepts optional id and ISO date strings", () => {
    const payload = {
      id: "note-1",
      content: "Body",
      createdAt: "2024-01-15T10:00:00.000Z",
      updatedAt: "2024-01-16T12:30:00.000Z",
    };
    const { error, value } = noteCreateSchema.validate(payload);
    expect(error).toBeUndefined();
    expect(value.id).toBe("note-1");
    expect(value.content).toBe("Body");
    expect(value.createdAt).toBeInstanceOf(Date);
    expect(value.updatedAt).toBeInstanceOf(Date);
  });

  it("rejects missing content with a clear message", () => {
    const { error } = noteCreateSchema.validate({});
    expect(error).toBeDefined();
    expect(error!.details[0]!.message).toContain("content");
  });

  it("rejects non-string content", () => {
    const { error } = noteCreateSchema.validate({ content: 123 });
    expect(error).toBeDefined();
    expect(error!.details.some((d) => d.message.includes("content"))).toBe(true);
  });

  it("rejects empty id when provided", () => {
    const { error } = noteCreateSchema.validate({ content: "x", id: "" });
    expect(error).toBeDefined();
    expect(error!.details.some((d) => d.path.includes("id"))).toBe(true);
  });

  it("rejects invalid date format", () => {
    const { error } = noteCreateSchema.validate({
      content: "x",
      createdAt: "not-a-date",
    });
    expect(error).toBeDefined();
    expect(error!.details.some((d) => d.path.includes("createdAt"))).toBe(true);
  });

  it("rejects unknown keys", () => {
    const { error } = noteCreateSchema.validate({
      content: "ok",
      extra: "not-allowed",
    });
    expect(error).toBeDefined();
    expect(error!.details.some((d) => d.message.includes("not allowed"))).toBe(true);
  });
});

describe("noteUpdateSchema", () => {
  it("accepts valid payload with content only", () => {
    const { error, value } = noteUpdateSchema.validate({ content: "Updated" });
    expect(error).toBeUndefined();
    expect(value).toEqual({ content: "Updated" });
  });

  it("accepts optional updatedAt as ISO string", () => {
    const { error, value } = noteUpdateSchema.validate({
      content: "U",
      updatedAt: "2024-06-01T00:00:00.000Z",
    });
    expect(error).toBeUndefined();
    expect(value.updatedAt).toBeInstanceOf(Date);
  });

  it("rejects missing content", () => {
    const { error } = noteUpdateSchema.validate({});
    expect(error).toBeDefined();
    expect(error!.details[0]!.message).toContain("content");
  });

  it("rejects extra unknown keys for strict API contract", () => {
    const { error } = noteUpdateSchema.validate({
      content: "ok",
      id: "should-not-be-here",
    });
    expect(error).toBeDefined();
    expect(error!.details.some((d) => d.message.includes("not allowed"))).toBe(true);
  });
});

describe("Note model (compile-time contract)", () => {
  it("accepts a well-formed note object", () => {
    const note: Note = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      content: "IndexedDB-friendly plain text",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-02T00:00:00.000Z"),
    };
    expect(note.id).toBeDefined();
    expect(note.content.length).toBeGreaterThanOrEqual(0);
  });
});

describe("noteStore.updateNoteById edge case", () => {
  beforeEach(() => {
    resetNoteStore();
  });

  it("returns undefined when id does not exist", () => {
    expect(updateNoteById("missing", "x", new Date())).toBeUndefined();
  });
});
