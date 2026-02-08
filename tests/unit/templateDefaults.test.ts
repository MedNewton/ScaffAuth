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
});
