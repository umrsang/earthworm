import type { Client } from "@libsql/client";
import type { Pool } from "mysql2/promise";
import { learningActivityEventsMigration } from "./001-learning-activity-events";
import type { DbMigration, MigrationDialect } from "./types";

const MIGRATIONS: DbMigration[] = [learningActivityEventsMigration];

/** 创建迁移记录表，后续结构变更必须以独立版本文件登记。 */
async function ensureMigrationTable(dialect: MigrationDialect, client: Client | Pool): Promise<void> {
  if (dialect === "mysql") {
    await (client as Pool).execute(`CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(128) NOT NULL PRIMARY KEY,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
    return;
  }
  await (client as Client).execute(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at INTEGER NOT NULL
  );`);
}

async function isApplied(dialect: MigrationDialect, client: Client | Pool, version: string): Promise<boolean> {
  if (dialect === "mysql") {
    const [rows] = await (client as Pool).execute<any[]>("SELECT version FROM schema_migrations WHERE version = ? LIMIT 1", [version]);
    return rows.length > 0;
  }
  const result = await (client as Client).execute({
    sql: "SELECT version FROM schema_migrations WHERE version = ? LIMIT 1",
    args: [version],
  });
  return result.rows.length > 0;
}

/** 逐版本执行迁移；仅在全部 SQL 成功后登记版本。 */
export async function runMigrations(dialect: MigrationDialect, client: Client | Pool): Promise<void> {
  await ensureMigrationTable(dialect, client);
  for (const migration of MIGRATIONS) {
    if (await isApplied(dialect, client, migration.version)) continue;
    const statements = migration[dialect];
    if (dialect === "mysql") {
      const connection = await (client as Pool).getConnection();
      try {
        await connection.beginTransaction();
        for (const sql of statements) await connection.execute(sql);
        await connection.execute("INSERT INTO schema_migrations (version) VALUES (?)", [migration.version]);
        await connection.commit();
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } else {
      const sqlite = client as Client;
      const now = Date.now();
      await sqlite.batch([
        ...statements.map((sql) => ({ sql, args: [] })),
        { sql: "INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)", args: [migration.version, now] },
      ], "write");
    }
  }
}
