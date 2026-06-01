import type { MySql2Database } from "drizzle-orm/mysql2";

import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

import type { SchemaType } from "@earthworm/schema";
import { schemas } from "@earthworm/schema";

export type DbType = MySql2Database<SchemaType>;

// eslint-disable-next-line import/no-mutable-exports
export let db: DbType;
let connection: mysql.Pool;

export const setupDB = async (databaseURL: string) => {
  connection = mysql.createPool(databaseURL || "");

  db = drizzle(connection, {
    schema: schemas,
    mode: "default",
  });

  return db;
};

export async function cleanDB(db: DbType) {
  await db.execute(sql`SET FOREIGN_KEY_CHECKS = 0`);
  await db.execute(sql`TRUNCATE TABLE courses`);
  await db.execute(sql`TRUNCATE TABLE statements`);
  await db.execute(sql`TRUNCATE TABLE course_packs`);
  await db.execute(sql`TRUNCATE TABLE user_course_progress`);
  await db.execute(sql`TRUNCATE TABLE course_history`);
  await db.execute(sql`TRUNCATE TABLE user_learn_record`);
  await db.execute(sql`TRUNCATE TABLE memberships`);
  await db.execute(sql`SET FOREIGN_KEY_CHECKS = 1`);
}

export async function teardownDb() {
  if (connection) {
    await connection.end();
  }
}
