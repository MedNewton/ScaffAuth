import { describe, expect, it } from "vitest";
import {
  parseTemplateOption,
  validateProjectName,
} from "../../src/utils/validators.js";

describe("validateProjectName", () => {
  it("accepts a valid project name", () => {
    expect(validateProjectName("my-auth-api")).toBeUndefined();
  });

  it("rejects empty names", () => {
    expect(validateProjectName("")).toBe("Project name is required");
  });

  it("rejects uppercase characters", () => {
    expect(validateProjectName("MyProject")).toContain("lowercase");
  });

  it("rejects consecutive hyphens", () => {
    expect(validateProjectName("my--auth")).toContain("consecutive hyphens");
  });
});

describe("parseTemplateOption", () => {
  it("parses a valid template string", () => {
    expect(parseTemplateOption("hono/drizzle-postgres")).toEqual({
      framework: "hono",
      orm: "drizzle",
      database: "postgres",
    });
  });

  it("normalizes casing and whitespace", () => {
    expect(parseTemplateOption("  FASTIFY/PRISMA-MYSQL ")).toEqual({
      framework: "fastify",
      orm: "prisma",
      database: "mysql",
    });
  });

  it("throws on invalid format", () => {
    expect(() => parseTemplateOption("hono-drizzle-postgres")).toThrow(
      "Expected format: framework/orm-database",
    );
  });

  it("throws on unknown framework", () => {
    expect(() => parseTemplateOption("koa/drizzle-postgres")).toThrow(
      'Unknown framework "koa"',
    );
  });

  it("throws on unknown orm", () => {
    expect(() => parseTemplateOption("hono/typeorm-postgres")).toThrow(
      'Unknown ORM "typeorm"',
    );
  });

  it("throws on unknown database", () => {
    expect(() => parseTemplateOption("hono/drizzle-mongodb")).toThrow(
      'Unknown database "mongodb"',
    );
  });
});
