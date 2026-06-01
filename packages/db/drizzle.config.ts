import path from "path";
import type { Config } from "drizzle-kit";

import * as dotenv from "dotenv";

// 根据环境变量选择不同的 .env 文件
const envFile =
  process.env.ENV_TYPE === "office" ? "../../apps/api/.env.office" : "../../apps/api/.env";

dotenv.config({ path: path.resolve(__dirname, envFile) });

console.log("process.env.DATABASE_URL: ", process.env.DATABASE_URL);

export default {
  schema: "../schema/src/schema/*",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "",
  },
} satisfies Config;
