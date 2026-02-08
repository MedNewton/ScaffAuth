import { Kysely, PostgresDialect, sql } from "kysely";
import pg from "pg";
import type { Database } from "./types";

async function main() {
  const dialect = new PostgresDialect({
    pool: new pg.Pool({
      connectionString: process.env.DATABASE_URL,
    }),
  });

  const db = new Kysely<Database>({ dialect });

  console.log("Running migrations...");

  await db.schema
    .createTable("user")
    .ifNotExists()
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("email", "text", (col) => col.notNull().unique())
    .addColumn("email_verified", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("image", "text")
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn("updated_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createTable("session")
    .ifNotExists()
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("expires_at", "timestamptz", (col) => col.notNull())
    .addColumn("token", "text", (col) => col.notNull().unique())
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn("updated_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn("ip_address", "text")
    .addColumn("user_agent", "text")
    .addColumn("user_id", "text", (col) => col.notNull().references("user.id"))
    .execute();

  await db.schema
    .createTable("account")
    .ifNotExists()
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("account_id", "text", (col) => col.notNull())
    .addColumn("provider_id", "text", (col) => col.notNull())
    .addColumn("user_id", "text", (col) => col.notNull().references("user.id"))
    .addColumn("access_token", "text")
    .addColumn("refresh_token", "text")
    .addColumn("id_token", "text")
    .addColumn("access_token_expires_at", "timestamptz")
    .addColumn("refresh_token_expires_at", "timestamptz")
    .addColumn("scope", "text")
    .addColumn("password", "text")
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn("updated_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createTable("verification")
    .ifNotExists()
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("identifier", "text", (col) => col.notNull())
    .addColumn("value", "text", (col) => col.notNull())
    .addColumn("expires_at", "timestamptz", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn("updated_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  console.log("Migrations complete.");
  await db.destroy();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
