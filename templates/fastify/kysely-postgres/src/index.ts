import Fastify from "fastify";
import cors from "@fastify/cors";
import { auth } from "./auth";
import { toNodeHandler } from "better-auth/node";

const app = Fastify({ logger: true });

// CORS
await app.register(cors, {
  origin: process.env.CORS_ORIGIN || "http://localhost:3001",
  credentials: true,
});

// Mount Better Auth handler
app.all("/api/auth/*", async (req, reply) => {
  const handler = toNodeHandler(auth);
  // @ts-ignore - bridge Fastify to Node handler
  handler(req.raw, reply.raw);
});

// Health check
app.get("/", async () => {
  return { status: "ok", message: "Auth backend is running" };
});

// Start server
const port = Number(process.env.PORT) || 3000;
try {
  await app.listen({ port, host: "0.0.0.0" });
  console.log(`Server running on http://localhost:${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
