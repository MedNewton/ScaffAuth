import { Kysely, MysqlDialect, sql } from "kysely";
import { createPool } from "mysql2";
import type { Database } from "./types";

async function main() {
  const dialect = new MysqlDialect({
    pool: createPool({
      uri: process.env.DATABASE_URL,
    }),
  });

  const db = new Kysely<Database>({ dialect });

  console.log("Running migrations...");

  await db.schema
    .createTable("user")
    .ifNotExists()
    .addColumn("id", "varchar(36)", (col) => col.primaryKey())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("email", "varchar(255)", (col) => col.notNull().unique())
    .addColumn("email_verified", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("image", "text")
    .addColumn("created_at", "datetime", (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn("updated_at", "datetime", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createTable("session")
    .ifNotExists()
    .addColumn("id", "varchar(36)", (col) => col.primaryKey())
    .addColumn("expires_at", "datetime", (col) => col.notNull())
    .addColumn("token", "varchar(255)", (col) => col.notNull().unique())
    .addColumn("created_at", "datetime", (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn("updated_at", "datetime", (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn("ip_address", "text")
    .addColumn("user_agent", "text")
    .addColumn("user_id", "varchar(36)", (col) => col.notNull().references("user.id"))
    .execute();

  await db.schema
    .createTable("account")
    .ifNotExists()
    .addColumn("id", "varchar(36)", (col) => col.primaryKey())
    .addColumn("account_id", "text", (col) => col.notNull())
    .addColumn("provider_id", "text", (col) => col.notNull())
    .addColumn("user_id", "varchar(36)", (col) => col.notNull().references("user.id"))
    .addColumn("access_token", "text")
    .addColumn("refresh_token", "text")
    .addColumn("id_token", "text")
    .addColumn("access_token_expires_at", "datetime")
    .addColumn("refresh_token_expires_at", "datetime")
    .addColumn("scope", "text")
    .addColumn("password", "text")
    .addColumn("created_at", "datetime", (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn("updated_at", "datetime", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createTable("verification")
    .ifNotExists()
    .addColumn("id", "varchar(36)", (col) => col.primaryKey())
    .addColumn("identifier", "text", (col) => col.notNull())
    .addColumn("value", "text", (col) => col.notNull())
    .addColumn("expires_at", "datetime", (col) => col.notNull())
    .addColumn("created_at", "datetime", (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn("updated_at", "datetime", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  console.log("Migrations complete.");
  await db.destroy();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
