import cors from "cors";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { AppError, errorHandler } from "./middleware/errorHandler";
import { notesRouter } from "./routes/notes";
import { swaggerSpec } from "./swagger";

const allowedOrigin = "http://localhost:3000";

export const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (origin === undefined || origin === allowedOrigin) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
  }),
);

app.use(express.json());

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { explorer: true }),
);

app.get("/openapi.json", (_req, res) => {
  res.status(200).json(swaggerSpec);
});

app.use("/notes", notesRouter);

if (process.env.NODE_ENV === "test") {
  app.get("/__test/error", (_req, _res, next) => {
    next(new Error("Deliberate test error"));
  });
  app.get("/__test/app-error", (_req, _res, next) => {
    next(new AppError(418, "I'm a teapot"));
  });
}

app.use((_req, _res, next) => {
  next(new AppError(404, "Not found"));
});

app.use(errorHandler);
