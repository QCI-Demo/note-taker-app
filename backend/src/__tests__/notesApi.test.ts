/// <reference types="jest" />

import request from "supertest";
import { app } from "../app";
import { resetNoteStore } from "../store/noteStore";

describe("Notes API", () => {
  beforeEach(() => {
    resetNoteStore();
  });

  describe("GET /notes", () => {
    it("returns 200 and an empty array when there are no notes", async () => {
      const res = await request(app).get("/notes");
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it("returns all notes as JSON", async () => {
      await request(app).post("/notes").send({ content: "First" });
      await request(app).post("/notes").send({ content: "Second" });

      const res = await request(app).get("/notes");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(2);
      expect(res.body[0]).toMatchObject({
        id: expect.any(String),
        content: "First",
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
    });

    it("returns 400 when content is missing", async () => {
      const res = await request(app).post("/notes").send({});
      expect(res.status).toBe(400);
      expect(res.body.details).toBeDefined();
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
    });

    it("returns 404 when note does not exist", async () => {
      const res = await request(app)
        .put("/notes/missing-id")
        .send({ content: "x" });
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ status: 404, message: "Note not found" });
    });

    it("returns 400 for invalid body", async () => {
      const created = await request(app).post("/notes").send({ content: "x" });
      const id = created.body.id as string;

      const res = await request(app).put(`/notes/${id}`).send({});
      expect(res.status).toBe(400);
    });
  });

  describe("DELETE /notes/:id", () => {
    it("returns 204 and removes the note", async () => {
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
