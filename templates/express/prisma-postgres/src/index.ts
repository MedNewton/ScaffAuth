import express from "express";
import cors from "cors";
import { auth } from "./auth";
import { toNodeHandler } from "better-auth/node";

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3001",
    credentials: true,
  }),
);

// Mount Better Auth handler
app.all("/api/auth/*splat", toNodeHandler(auth));

// Health check
app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "Auth backend is running" });
});

// Start server
const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
