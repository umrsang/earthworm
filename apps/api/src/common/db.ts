import { Logger } from "@nestjs/common";
import { DefaultLogger, LogWriter } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

import { schemas } from "@earthworm/schema";

let pool: mysql.Pool;

export async function endDB() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export async function setupDB() {
  if (pool) return;

  const logger = new Logger("DB");

  class CustomDbLogWriter implements LogWriter {
    write(message: string) {
      logger.verbose(message);
    }
  }

  logger.debug(`Connecting to ${process.env.DATABASE_URL}`);
  logger.debug(`SECRET: ${process.env.SECRET}`);

  pool = mysql.createPool(process.env.DATABASE_URL ?? "");

  return drizzle(pool, {
    schema: schemas,
    logger: new DefaultLogger({ writer: new CustomDbLogWriter() }),
  });
}
