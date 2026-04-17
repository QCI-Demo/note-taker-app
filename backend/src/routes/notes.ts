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

/**
 * @openapi
 * /notes:
 *   get:
 *     summary: List all notes
 *     tags: [Notes]
 *     responses:
 *       200:
 *         description: Array of notes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Note'
 */
notesRouter.get("/", (_req, res) => {
  res.status(200).json(getAllNotes());
});

/**
 * @openapi
 * /notes:
 *   post:
 *     summary: Create a note
 *     tags: [Notes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NoteCreate'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Note'
 *       400:
 *         description: Validation error
 *       409:
 *         description: Note id already exists
 */
notesRouter.post("/", validateBody(noteCreateSchema), (req, res) => {
  const body = req.body as {
    content: string;
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
  };
  const id = body.id ?? generateNoteId();
  if (hasNoteId(id)) {
    res.status(409).json({
      status: 409,
      message: "A note with this id already exists",
    });
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

/**
 * @openapi
 * /notes/{id}:
 *   put:
 *     summary: Update a note
 *     tags: [Notes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NoteUpdate'
 *     responses:
 *       200:
 *         description: Updated note
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Note'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Note not found
 */
notesRouter.put("/:id", validateBody(noteUpdateSchema), (req, res) => {
  const id = String(req.params.id);
  const body = req.body as { content: string; updatedAt?: Date };
  if (!getNoteById(id)) {
    res.status(404).json({ status: 404, message: "Note not found" });
    return;
  }
  const updatedAt = body.updatedAt ?? new Date();
  const updated = updateNoteById(id, body.content, updatedAt);
  res.status(200).json(updated);
});

/**
 * @openapi
 * /notes/{id}:
 *   delete:
 *     summary: Delete a note
 *     tags: [Notes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Deleted
 *       404:
 *         description: Note not found
 */
notesRouter.delete("/:id", (req, res) => {
  const id = String(req.params.id);
  const removed = deleteNoteById(id);
  if (!removed) {
    res.status(404).json({ status: 404, message: "Note not found" });
    return;
  }
  res.status(204).send();
});
