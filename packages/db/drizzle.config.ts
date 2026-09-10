import type { Config } from "drizzle-kit";

export default {
  schema: "../schema/src/schema/*",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL || "./data/earthworm.db",
  },
} satisfies Config;
