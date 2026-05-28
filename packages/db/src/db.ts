import path from "node:path";

import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

import { schemas } from "@earthworm/schema";

const envName = process.env.NODE_ENV === "prod" ? ".env.prod" : ".env";
dotenv.config({ path: path.resolve(__dirname, `../../../apps/api/${envName}`) });

console.log("connection string: ", process.env.DATABASE_URL);
const pool = mysql.createPool(process.env.DATABASE_URL ?? "");

export const db = drizzle(pool, {
  schema: schemas,
  mode: "default",
});
