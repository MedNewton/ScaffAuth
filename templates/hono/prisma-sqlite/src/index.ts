import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { auth } from "./auth";

const app = new Hono();

// Middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3001",
    credentials: true,
  }),
);

// Mount Better Auth handler
app.on(["POST", "GET"], "/api/auth/**", (c) => {
  return auth.handler(c.req.raw);
});

// Health check
app.get("/", (c) => {
  return c.json({ status: "ok", message: "Auth backend is running" });
});

const port = Number(process.env.PORT) || 3000;
serve({
  fetch: app.fetch,
  port,
});

console.log(`Server running on http://localhost:${port}`);
