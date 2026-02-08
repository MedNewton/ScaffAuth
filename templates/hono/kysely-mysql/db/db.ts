import { Kysely, MysqlDialect } from "kysely";
import { createPool } from "mysql2";
import type { Database } from "./types";

const dialect = new MysqlDialect({
  pool: createPool({
    uri: process.env.DATABASE_URL,
  }),
});

export const db = new Kysely<Database>({ dialect });
