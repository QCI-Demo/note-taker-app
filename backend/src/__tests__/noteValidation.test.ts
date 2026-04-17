/// <reference types="jest" />

import { noteCreateSchema, noteUpdateSchema } from "../validation/noteSchemas";

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
