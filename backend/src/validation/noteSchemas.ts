import Joi from "joi";

const contentField = Joi.string()
  .required()
  .messages({
    "any.required": "content is required",
    "string.base": "content must be a string",
  });

const idField = Joi.string()
  .min(1)
  .messages({
    "string.base": "id must be a string",
    "string.empty": "id cannot be empty",
    "string.min": "id cannot be empty",
  });

const dateField = (label: string) =>
  Joi.date()
    .iso()
    .messages({
      "date.base": `${label} must be a valid date`,
      "date.format": `${label} must be an ISO 8601 date string`,
    });

/**
 * Validates **POST /notes** request bodies.
 * `content` is required. Optional `id`, `createdAt`, and `updatedAt` support
 * client-generated values for offline-first / sync flows; the server may still
 * override these when creating a new resource.
 */
export const noteCreateSchema = Joi.object({
  content: contentField,
  id: idField.optional(),
  createdAt: dateField("createdAt").optional(),
  updatedAt: dateField("updatedAt").optional(),
})
  .unknown(false)
  .required()
  .messages({
    "object.base": "request body must be a JSON object",
  });

/**
 * Validates **PUT /notes/:id** request bodies.
 * `content` is required. Optional `updatedAt` supports sync conflict metadata.
 */
export const noteUpdateSchema = Joi.object({
  content: contentField,
  updatedAt: dateField("updatedAt").optional(),
})
  .unknown(false)
  .required()
  .messages({
    "object.base": "request body must be a JSON object",
  });
