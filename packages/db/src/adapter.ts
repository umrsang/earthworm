import fs from "node:fs";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";
import { createId } from "@paralleldrive/cuid2";
import * as argon2 from "argon2";
import dotenv from "dotenv";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import { drizzle as drizzleMysql } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

import { mysqlSchemas, sqliteSchemas } from "@jufun/schema";

dotenv.config();

/** 数据库支持的方言枚举常量 */
export const DB_DIALECTS = {
  SQLITE: "sqlite",
  MYSQL: "mysql",
} as const;

export type DbDialect = (typeof DB_DIALECTS)[keyof typeof DB_DIALECTS];

/** 默认初始化管理员常量配置 */
export const DEFAULT_ADMIN = {
  USERNAME: "admin",
  PASSWORD: "qqwweerr",
  NICKNAME: "系统管理员",
  EMAIL: "admin@jufun.com",
} as const;

/**
 * 判断当前配置的数据库类型
 */
export function getCurrentDialect(): DbDialect {
  const url = process.env.DATABASE_URL || "";
  if (url.startsWith("mysql://")) {
    return DB_DIALECTS.MYSQL;
  }
  return DB_DIALECTS.SQLITE;
}

/** 确保本地 SQLite 文件所在目录存在 */
function ensureSqliteDirExists(dbPath: string): void {
  const cleanPath = dbPath.replace(/^file:/, "");
  const dir = path.dirname(cleanPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

let mysqlPool: mysql.Pool | null = null;
let libsqlClient: Client | null = null;
let unifiedDbInstance: any = null;

/**
 * 获取或创建底层数据库原始连接实例
 */
export function getUnderlyingClient() {
  const dialect = getCurrentDialect();
  const rawUrl = process.env.DATABASE_URL;

  if (dialect === DB_DIALECTS.MYSQL) {
    if (!mysqlPool) {
      mysqlPool = mysql.createPool(rawUrl!);
    }
    return { dialect, client: mysqlPool };
  }

  // SQLite 驱动
  if (!libsqlClient) {
    let sqliteUrl = rawUrl;
    if (!sqliteUrl || (!sqliteUrl.startsWith("file:") && !sqliteUrl.startsWith("http"))) {
      const dbFile = path.resolve(process.cwd(), "data", "earthworm.db");
      sqliteUrl = `file:${dbFile}`;
    }
    ensureSqliteDirExists(sqliteUrl);
    libsqlClient = createClient({ url: sqliteUrl });
  }
  return { dialect, client: libsqlClient };
}

/**
 * 初始化默认管理员账号（若不存在则自动创建）
 * @param dialect 数据库方言
 * @param client 底层数据库连接客户端
 */
async function seedDefaultAdmin(dialect: DbDialect, client: any): Promise<void> {
  const hashedPassword = await argon2.hash(DEFAULT_ADMIN.PASSWORD);
  const now = Date.now();
  const adminId = createId();

  if (dialect === DB_DIALECTS.MYSQL) {
    const pool = client as mysql.Pool;
    const [rows] = (await pool.execute("SELECT id FROM users WHERE username = ? LIMIT 1;", [
      DEFAULT_ADMIN.USERNAME,
    ])) as [any[], any];

    if (rows.length === 0) {
      console.log(`🌱 [DB Adapter] 未检测到管理员账号，正在自动初始化管理员 [${DEFAULT_ADMIN.USERNAME}]...`);
      await pool.execute(
        `INSERT INTO users (id, username, password, email, nickname, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, NOW(), NOW());`,
        [adminId, DEFAULT_ADMIN.USERNAME, hashedPassword, DEFAULT_ADMIN.EMAIL, DEFAULT_ADMIN.NICKNAME],
      );
      console.log(`✅ [DB Adapter] 初始管理员已就绪: 用户名 [${DEFAULT_ADMIN.USERNAME}]`);
    }
  } else {
    const sqlite = client as Client;
    const res = await sqlite.execute({
      sql: "SELECT id FROM users WHERE username = ? LIMIT 1;",
      args: [DEFAULT_ADMIN.USERNAME],
    });

    if (res.rows.length === 0) {
      console.log(`🌱 [DB Adapter] 未检测到管理员账号，正在自动初始化管理员 [${DEFAULT_ADMIN.USERNAME}]...`);
      await sqlite.execute({
        sql: `INSERT INTO users (id, username, password, email, nickname, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?);`,
        args: [
          adminId,
          DEFAULT_ADMIN.USERNAME,
          hashedPassword,
          DEFAULT_ADMIN.EMAIL,
          DEFAULT_ADMIN.NICKNAME,
          now,
          now,
        ],
      });
      console.log(`✅ [DB Adapter] 初始管理员已就绪: 用户名 [${DEFAULT_ADMIN.USERNAME}]`);
    }
  }
}

/**
 * 自动执行对应方言的数据库建表、字段迁移与初始数据 Seed
 */
export async function autoMigrateDatabase(): Promise<void> {
  const { dialect, client } = getUnderlyingClient();
  console.log("----------------------------------------");
  console.log(`📦 [DB Adapter] 当前激活引擎: [${dialect.toUpperCase()}]，正在执行自适应数据库迁移...`);

  if (dialect === DB_DIALECTS.MYSQL) {
    const pool = client as mysql.Pool;
    // 1. 自动创建 MySQL 用户表
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(128) NOT NULL PRIMARY KEY,
        username VARCHAR(256) NOT NULL UNIQUE,
        password VARCHAR(256) NOT NULL,
        email VARCHAR(256) NULL,
        nickname VARCHAR(256) NULL,
        avatar TEXT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. 增量字段探测与对齐
    const [columns] = (await pool.execute("SHOW COLUMNS FROM users;")) as [any[], any];
    const columnNames = new Set(columns.map((col: any) => col.Field));

    if (!columnNames.has("nickname")) {
      console.log("➕ [DB Adapter MySQL] 检测到新字段 [nickname]，正在自动补齐...");
      await pool.execute("ALTER TABLE users ADD COLUMN nickname VARCHAR(256) NULL AFTER email;");
    }
    if (!columnNames.has("avatar")) {
      console.log("➕ [DB Adapter MySQL] 检测到新字段 [avatar]，正在自动补齐...");
      await pool.execute("ALTER TABLE users ADD COLUMN avatar TEXT NULL AFTER nickname;");
    }
  } else {
    const sqlite = client as Client;
    // 1. 自动创建 SQLite 用户表
    await sqlite.execute(`
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

    // 2. 增量字段探测与对齐
    const info = await sqlite.execute("PRAGMA table_info(users);");
    const columnNames = new Set(info.rows.map((row: any) => row.name));

    if (!columnNames.has("nickname")) {
      console.log("➕ [DB Adapter SQLite] 检测到新字段 [nickname]，正在自动补齐...");
      await sqlite.execute("ALTER TABLE users ADD COLUMN nickname TEXT;");
    }
    if (!columnNames.has("avatar")) {
      console.log("➕ [DB Adapter SQLite] 检测到新字段 [avatar]，正在自动补齐...");
      await sqlite.execute("ALTER TABLE users ADD COLUMN avatar TEXT;");
    }
  }

  // 3. 自动种子初始化管理员账号
  await seedDefaultAdmin(dialect, client);

  console.log(`✅ [DB Adapter] ${dialect.toUpperCase()} 数据库结构自动迁移与初始化完毕！`);
  console.log("----------------------------------------");
}

/**
 * 获取统一包装的 Drizzle ORM 数据库实例
 */
export function getDatabaseInstance(): any {
  if (!unifiedDbInstance) {
    const { dialect, client } = getUnderlyingClient();
    if (dialect === DB_DIALECTS.MYSQL) {
      unifiedDbInstance = drizzleMysql(client as mysql.Pool, {
        schema: mysqlSchemas,
        mode: "default",
      });
    } else {
      unifiedDbInstance = drizzleLibsql(client as Client, {
        schema: sqliteSchemas,
      });
    }
  }
  return unifiedDbInstance;
}

/** 默认导出的自适应单例实例 */
export const db = getDatabaseInstance();
export type AppDatabase = typeof db;
