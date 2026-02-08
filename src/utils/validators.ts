import type { Database, Framework, ORM } from "../types/index.js";

export function validateProjectName(name: string): string | undefined {
  if (!name || name.trim().length === 0) {
    return "Project name is required";
  }

  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/.test(name)) {
    return "Project name must be lowercase alphanumeric with hyphens (e.g. my-auth-api)";
  }

  if (name.length > 100) {
    return "Project name must be 100 characters or less";
  }

  if (name.includes("--")) {
    return "Project name cannot contain consecutive hyphens";
  }

  return undefined;
}

const VALID_FRAMEWORKS: Framework[] = ["hono", "fastify", "express"];
const VALID_ORMS: ORM[] = ["drizzle", "prisma", "kysely"];
const VALID_DATABASES: Database[] = ["postgres", "mysql", "sqlite"];

export interface ParsedTemplate {
  framework: Framework;
  orm: ORM;
  database: Database;
}

/**
 * Parse a --template value in the format: framework/orm-database
 * Example: hono/drizzle-postgres
 */
export function parseTemplateOption(template: string): ParsedTemplate {
  const value = template.trim().toLowerCase();
  const [frameworkPart, ormDatabasePart] = value.split("/");

  if (!frameworkPart || !ormDatabasePart || value.split("/").length !== 2) {
    throw new Error(
      `Invalid template "${template}". Expected format: framework/orm-database (e.g. hono/drizzle-postgres).`,
    );
  }

  const [ormPart, databasePart] = ormDatabasePart.split("-");
  if (!ormPart || !databasePart || ormDatabasePart.split("-").length !== 2) {
    throw new Error(
      `Invalid template "${template}". Expected format: framework/orm-database (e.g. hono/drizzle-postgres).`,
    );
  }

  if (!VALID_FRAMEWORKS.includes(frameworkPart as Framework)) {
    throw new Error(
      `Unknown framework "${frameworkPart}". Supported: ${VALID_FRAMEWORKS.join(", ")}.`,
    );
  }

  if (!VALID_ORMS.includes(ormPart as ORM)) {
    throw new Error(`Unknown ORM "${ormPart}". Supported: ${VALID_ORMS.join(", ")}.`);
  }

  if (!VALID_DATABASES.includes(databasePart as Database)) {
    throw new Error(
      `Unknown database "${databasePart}". Supported: ${VALID_DATABASES.join(", ")}.`,
    );
  }

  return {
    framework: frameworkPart as Framework,
    orm: ormPart as ORM,
    database: databasePart as Database,
  };
}
