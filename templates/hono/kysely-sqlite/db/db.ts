import { Kysely, SqliteDialect } from "kysely";
import Database from "better-sqlite3";
import type { Database as DatabaseType } from "./types";

const dialect = new SqliteDialect({
  database: new Database(process.env.DATABASE_URL || "sqlite.db"),
});

export const db = new Kysely<DatabaseType>({ dialect });
