import { Router } from "express";
import type { Note } from "../models/Note";
import { validateBody } from "../middleware/validateBody";
import { noteCreateSchema, noteUpdateSchema } from "../validation/noteSchemas";
import {
  deleteNoteById,
  generateNoteId,
  getAllNotes,
  getNoteById,
  hasNoteId,
  insertNote,
  updateNoteById,
} from "../store/noteStore";

export const notesRouter = Router();

notesRouter.get("/", (_req, res) => {
  res.status(200).json(getAllNotes());
});

notesRouter.post("/", validateBody(noteCreateSchema), (req, res) => {
  const body = req.body as {
    content: string;
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
  };
  const id = body.id ?? generateNoteId();
  if (hasNoteId(id)) {
    res.status(409).json({ message: "A note with this id already exists" });
    return;
  }

  const now = new Date();
  const createdAt = body.createdAt ?? now;
  const updatedAt = body.updatedAt ?? createdAt;

  const note: Note = {
    id,
    content: body.content,
    createdAt,
    updatedAt,
  };
  insertNote(note);
  res.status(201).json(note);
});

notesRouter.put("/:id", validateBody(noteUpdateSchema), (req, res) => {
  const id = String(req.params.id);
  const body = req.body as { content: string; updatedAt?: Date };
  if (!getNoteById(id)) {
    res.status(404).json({ message: "Note not found" });
    return;
  }
  const updatedAt = body.updatedAt ?? new Date();
  const updated = updateNoteById(id, body.content, updatedAt);
  res.status(200).json(updated);
});

notesRouter.delete("/:id", (req, res) => {
  const id = String(req.params.id);
  const removed = deleteNoteById(id);
  if (!removed) {
    res.status(404).json({ message: "Note not found" });
    return;
  }
  res.status(204).send();
});
