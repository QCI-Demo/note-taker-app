import path from "node:path";
import swaggerJsdoc from "swagger-jsdoc";

const serverUrl =
  process.env.API_PUBLIC_URL ?? "http://localhost:3001";

export const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Notes API",
      version: "1.0.0",
      description: "REST API for plain-text notes (CRUD).",
    },
    servers: [{ url: serverUrl }],
    components: {
      schemas: {
        Note: {
          type: "object",
          required: ["id", "content", "createdAt", "updatedAt"],
          properties: {
            id: { type: "string" },
            content: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        NoteCreate: {
          type: "object",
          required: ["content"],
          properties: {
            content: { type: "string" },
            id: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        NoteUpdate: {
          type: "object",
          required: ["content"],
          properties: {
            content: { type: "string" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
      },
    },
  },
  apis: [path.join(__dirname, "routes", "*.{ts,js}")],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
