import path from "node:path";
import dotenv from "dotenv";
import type { Config } from "drizzle-kit";

const API_DIRECTORY = path.resolve(__dirname, "../../apps/api");
dotenv.config({ path: path.join(API_DIRECTORY, ".env") });

const databaseUrl = process.env.DATABASE_URL || "data/earthworm.db";
const isRemoteDatabase = /^(?:mysql|https?):\/\//.test(databaseUrl);
const sqlitePath = databaseUrl.replace(/^file:/, "");
const resolvedDatabaseUrl = isRemoteDatabase
  ? databaseUrl
  : `file:${path.isAbsolute(sqlitePath) ? sqlitePath : path.resolve(API_DIRECTORY, sqlitePath)}`;

export default {
  schema: "../schema/src/schema/*",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: resolvedDatabaseUrl,
  },
} satisfies Config;
