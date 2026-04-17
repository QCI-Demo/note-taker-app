import { randomUUID } from "crypto";
import type { Note } from "../models/Note";

/**
 * In-memory note storage backed by an array (stable list order) and a Map for
 * id lookups. This mirrors a simple IndexedDB object store layout: each record
 * is a document `{ id, content, createdAt, updatedAt }` keyed by `id`, with
 * optional index on `updatedAt` for sorting—here we keep array order as
 * insertion order until a migration adds explicit indexes.
 */
const notes: Note[] = [];
const byId = new Map<string, Note>();

export function getAllNotes(): readonly Note[] {
  return notes;
}

export function getNoteById(id: string): Note | undefined {
  return byId.get(id);
}

export function hasNoteId(id: string): boolean {
  return byId.has(id);
}

export function insertNote(note: Note): void {
  notes.push(note);
  byId.set(note.id, note);
}

export function updateNoteById(
  id: string,
  content: string,
  updatedAt: Date,
): Note | undefined {
  const existing = byId.get(id);
  if (!existing) {
    return undefined;
  }
  existing.content = content;
  existing.updatedAt = updatedAt;
  return existing;
}

export function deleteNoteById(id: string): boolean {
  const existing = byId.get(id);
  if (!existing) {
    return false;
  }
  const index = notes.findIndex((n) => n.id === id);
  if (index !== -1) {
    notes.splice(index, 1);
  }
  byId.delete(id);
  return true;
}

/** Generates a new unique id when the client does not supply one. */
export function generateNoteId(): string {
  return randomUUID();
}

/** Clears all notes; for tests only. */
export function resetNoteStore(): void {
  notes.length = 0;
  byId.clear();
}
