import path from "node:path";

import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

import { schemas } from "@earthworm/schema";

// 根据环境变量选择不同的 .env 文件
let envFile = ".env";
if (process.env.NODE_ENV === "prod") {
  envFile = ".env.prod";
} else if (process.env.ENV_TYPE === "office") {
  envFile = ".env.office";
}

dotenv.config({ path: path.resolve(__dirname, `../../../apps/api/${envFile}`) });

console.log("connection string: ", process.env.DATABASE_URL);
const connection = mysql.createPool(process.env.DATABASE_URL ?? "");

export const db = drizzle(connection, {
  schema: schemas,
  mode: "default",
});
