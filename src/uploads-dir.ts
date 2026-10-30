import path from "node:path";

// Where uploaded files (service images, etc.) are written and served from.
// Configurable via UPLOADS_DIR so a deployment can point this at a mounted
// volume path; falls back to <cwd>/uploads for local dev. Shared by both
// the upload route and the static file server so they can never drift.
export const UPLOADS_DIR = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.join(process.cwd(), "uploads");
