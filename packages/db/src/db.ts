import path from "node:path";
import { createClient, type Client } from "@libsql/client";
import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/libsql";

import { schemas } from "@jufun/schema";
import { autoMigrate, DEFAULT_DB_DIR, DEFAULT_DB_FILE, ensureDirectoryExists } from "./migrator";

// 加载环境变量
dotenv.config();

/**
 * 获取数据库连接 URL（file 协议格式）
 */
export function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    if (process.env.DATABASE_URL.startsWith("file:") || process.env.DATABASE_URL.startsWith("http")) {
      return process.env.DATABASE_URL;
    }
    return `file:${path.resolve(process.cwd(), process.env.DATABASE_URL)}`;
  }
  const dbFile = path.resolve(process.cwd(), DEFAULT_DB_DIR, DEFAULT_DB_FILE);
  return `file:${dbFile}`;
}

let clientInstance: Client | null = null;

/**
 * 获取或创建底层 LibSQL 客户端连接
 */
export function getDbClient(): Client {
  if (!clientInstance) {
    const url = getDatabaseUrl();
    ensureDirectoryExists(url);
    clientInstance = createClient({ url });
  }
  return clientInstance;
}

/**
 * 初始化数据库连接并自动执行结构迁移
 */
export async function initDatabase() {
  const client = getDbClient();
  await autoMigrate(client);
  return drizzle(client, { schema: schemas });
}

/** 默认导出的数据库客户端与 Drizzle 实例 */
const client = getDbClient();
// 启动即确保迁移执行
autoMigrate(client);

export const db = drizzle(client, { schema: schemas });
export type AppDatabase = typeof db;
