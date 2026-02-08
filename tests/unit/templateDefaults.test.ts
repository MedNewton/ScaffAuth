import fs from "fs-extra";
import path from "path";
import { describe, expect, it } from "vitest";

describe("template defaults", () => {
  it("uses Prisma-compatible SQLite DATABASE_URL in prisma-sqlite templates", async () => {
    const frameworks = ["express", "fastify", "hono"] as const;

    for (const framework of frameworks) {
      const templatePath = path.join(
        process.cwd(),
        "templates",
        framework,
        "prisma-sqlite",
        ".env.example.hbs",
      );

      const template = await fs.readFile(templatePath, "utf-8");
      expect(template).toContain("DATABASE_URL=file:./dev.db");
    }
  });

  it("does not use deprecated Better Auth kysely adapter import path", async () => {
    const frameworks = ["express", "fastify", "hono"] as const;
    const databases = ["sqlite", "mysql", "postgres"] as const;

    for (const framework of frameworks) {
      for (const database of databases) {
        const templatePath = path.join(
          process.cwd(),
          "templates",
          framework,
          `kysely-${database}`,
          "src",
          "auth.ts.hbs",
        );

        const template = await fs.readFile(templatePath, "utf-8");
        expect(template).not.toContain('from "better-auth/adapters/kysely"');
        expect(template).toContain("database: {");
        expect(template).toContain("db,");
      }
    }
  });

  it("uses Express 5 compatible auth wildcard route", async () => {
    const variants = [
      "drizzle-mysql",
      "drizzle-postgres",
      "drizzle-sqlite",
      "kysely-mysql",
      "kysely-postgres",
      "kysely-sqlite",
      "prisma-mysql",
      "prisma-postgres",
      "prisma-sqlite",
    ] as const;

    for (const variant of variants) {
      const templatePath = path.join(
        process.cwd(),
        "templates",
        "express",
        variant,
        "src",
        "index.ts",
      );

      const template = await fs.readFile(templatePath, "utf-8");
      expect(template).toContain('app.all("/api/auth/*splat", toNodeHandler(auth));');
      expect(template).not.toContain('app.all("/api/auth/*", toNodeHandler(auth));');
    }
  });
});
