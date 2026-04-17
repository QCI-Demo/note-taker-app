/**
 * Canonical note record for API and persistence layers.
 *
 * Designed to align with an IndexedDB-style document: stable `id`, plain-text
 * `content`, and monotonic wall-clock timestamps for create/update. Timestamps
 * are represented as {@link Date} in application code; JSON transports should
 * use ISO 8601 strings, which Joi validation accepts and normalizes.
 */
export interface Note {
  /** Opaque stable identifier (e.g. UUID) for sync and CRUD addressing. */
  id: string;
  /** Plain-text body of the note. */
  content: string;
  /** When the note was first created. */
  createdAt: Date;
  /** When the note was last modified. */
  updatedAt: Date;
}
