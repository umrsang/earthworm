import type { MySql2Database } from "drizzle-orm/mysql2";

import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

import type { SchemaType } from "@earthworm/schema";
import { schemas } from "@earthworm/schema";

export type DbType = MySql2Database<SchemaType>;

// eslint-disable-next-line import/no-mutable-exports
export let db: DbType;
let pool: mysql.Pool;

export const setupDB = async (databaseURL: string) => {
  pool = mysql.createPool(databaseURL || "");

  db = drizzle(pool, {
    schema: schemas,
  });

  return db;
};

export async function cleanDB(db: DbType) {
  await db.execute(sql.raw(`SET FOREIGN_KEY_CHECKS = 0`));
  const tables = [
    "courses",
    "statements",
    "course_packs",
    "user_course_progress",
    "course_history",
    "user_learn_record",
    "memberships",
    "user_learning_activities",
    "mastered_elements",
    "user_rank",
  ];
  for (const table of tables) {
    await db.execute(sql.raw(`TRUNCATE TABLE \`${table}\``));
  }
  await db.execute(sql.raw(`SET FOREIGN_KEY_CHECKS = 1`));
}

export async function teardownDb() {
  if (pool) {
    await pool.end();
  }
}
