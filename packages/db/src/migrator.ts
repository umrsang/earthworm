import fs from "node:fs";
import path from "node:path";
import type { Client } from "@libsql/client";

/** 默认数据库目录名称常量 */
export const DEFAULT_DB_DIR = "data";
/** 默认数据库文件名称常量 */
export const DEFAULT_DB_FILE = "earthworm.db";

/**
 * 确保数据库文件所在目录存在
 * @param dbPath 数据库文件的绝对或相对路径
 */
export function ensureDirectoryExists(dbPath: string): void {
  // 去除 file: 协议前缀获取真实文件路径
  const cleanPath = dbPath.replace(/^file:/, "");
  const dir = path.dirname(cleanPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * 自动执行数据库迁移
 * 在服务初始化时调用，自动检查核心表结构是否存在，自动执行建表与结构对齐
 * @param client LibSQL 客户端实例
 */
export async function autoMigrate(client: Client): Promise<void> {
  console.log("----------------------------------------");
  console.log("📦 [DB Migration] 正在检查并自动执行数据库迁移...");

  // 1. 自动检查并创建 users 用户表
  await client.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      email TEXT,
      nickname TEXT,
      avatar TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

  // 2. 检查是否有新增字段需要补全（增量自动迁移机制）
  const info = await client.execute("PRAGMA table_info(users);");
  const existingColumnNames = new Set(info.rows.map((row: any) => row.name));

  if (!existingColumnNames.has("nickname")) {
    console.log("➕ [DB Migration] 检测到新字段 [nickname]，自动补齐字段...");
    await client.execute("ALTER TABLE users ADD COLUMN nickname TEXT;");
  }

  if (!existingColumnNames.has("avatar")) {
    console.log("➕ [DB Migration] 检测到新字段 [avatar]，自动补齐字段...");
    await client.execute("ALTER TABLE users ADD COLUMN avatar TEXT;");
  }

  console.log("✅ [DB Migration] 数据库结构自动迁移完成，所有表就绪！");
  console.log("----------------------------------------");
}
