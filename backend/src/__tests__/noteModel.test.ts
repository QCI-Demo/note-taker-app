/// <reference types="jest" />

import type { Note } from "../models/Note";

describe("Note interface (compile-time contract)", () => {
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
