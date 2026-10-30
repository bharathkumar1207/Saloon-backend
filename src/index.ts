import express, { type ErrorRequestHandler, type Request, type Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import pinoHttp from "pino-http";
import { logger } from "./logger/logger";
import { apiRouter } from "./apis";
import { UPLOADS_DIR } from "./uploads-dir";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// Uploaded service images, etc. — written by the /api/uploads route,
// served back out from the same configurable path (see UPLOADS_DIR).
app.use("/uploads", express.static(UPLOADS_DIR));

app.use("/api", apiRouter);

const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  req.log.error({ err }, "Unhandled error");
  const message = err instanceof Error ? err.message : "Internal server error";
  res.status(400).json({ error: message });
};

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
