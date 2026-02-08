import { Kysely, SqliteDialect, sql } from "kysely";
import BetterSqlite3 from "better-sqlite3";
import type { Database } from "./types";

const dialect = new SqliteDialect({
  database: new BetterSqlite3(process.env.DATABASE_URL || "sqlite.db"),
});

const db = new Kysely<Database>({ dialect });

async function main() {
  console.log("Running migrations...");

  await db.schema
    .createTable("user")
    .ifNotExists()
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("email", "text", (col) => col.notNull().unique())
    .addColumn("email_verified", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("image", "text")
    .addColumn("created_at", "text", (col) => col.notNull().defaultTo(sql`(datetime('now'))`))
    .addColumn("updated_at", "text", (col) => col.notNull().defaultTo(sql`(datetime('now'))`))
    .execute();

  await db.schema
    .createTable("session")
    .ifNotExists()
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("expires_at", "text", (col) => col.notNull())
    .addColumn("token", "text", (col) => col.notNull().unique())
    .addColumn("created_at", "text", (col) => col.notNull().defaultTo(sql`(datetime('now'))`))
    .addColumn("updated_at", "text", (col) => col.notNull().defaultTo(sql`(datetime('now'))`))
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
    .addColumn("access_token_expires_at", "text")
    .addColumn("refresh_token_expires_at", "text")
    .addColumn("scope", "text")
    .addColumn("password", "text")
    .addColumn("created_at", "text", (col) => col.notNull().defaultTo(sql`(datetime('now'))`))
    .addColumn("updated_at", "text", (col) => col.notNull().defaultTo(sql`(datetime('now'))`))
    .execute();

  await db.schema
    .createTable("verification")
    .ifNotExists()
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("identifier", "text", (col) => col.notNull())
    .addColumn("value", "text", (col) => col.notNull())
    .addColumn("expires_at", "text", (col) => col.notNull())
    .addColumn("created_at", "text", (col) => col.notNull().defaultTo(sql`(datetime('now'))`))
    .addColumn("updated_at", "text", (col) => col.notNull().defaultTo(sql`(datetime('now'))`))
    .execute();

  console.log("Migrations complete.");
  await db.destroy();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
