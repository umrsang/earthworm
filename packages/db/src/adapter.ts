import fs from "node:fs";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";
import { createId } from "@paralleldrive/cuid2";
import * as argon2 from "argon2";
import dotenv from "dotenv";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import { drizzle as drizzleMysql } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

export { createId } from "@paralleldrive/cuid2";
export type { Client, InStatement } from "@libsql/client";
export type { Pool, PoolConnection, RowDataPacket } from "mysql2/promise";

import { mysqlSchemas, sqliteSchemas } from "@jufun/schema";
import { runMigrations } from "./migrations/index";

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

const MYSQL_COURSE_PACK_METADATA_COLUMNS = {
  name: "VARCHAR(256) NULL AFTER id",
  version: "VARCHAR(64) NULL AFTER description",
  level: "VARCHAR(128) NULL AFTER version",
  tags: "TEXT NULL AFTER level",
  total_units: "INT NULL AFTER tags",
  total_vocab: "INT NULL AFTER total_units",
} as const;

const MYSQL_STATEMENT_ANNOTATION_COLUMNS = {
  pos_tags: "TEXT NULL AFTER soundmark",
  syntax_tags: "TEXT NULL AFTER pos_tags",
} as const;

const SQLITE_COURSE_PACK_METADATA_COLUMNS = {
  name: "TEXT",
  version: "TEXT",
  level: "TEXT",
  tags: "TEXT",
  total_units: "INTEGER",
  total_vocab: "INTEGER",
} as const;

const SQLITE_STATEMENT_ANNOTATION_COLUMNS = {
  pos_tags: "TEXT",
  syntax_tags: "TEXT",
} as const;

/**
 * 为 MySQL 已有表补齐缺失字段。
 * @param pool MySQL 连接池
 * @param tableName 内部受控的表名
 * @param columnDefinitions 字段名到 SQL 类型定义的映射
 */
async function ensureMysqlColumns(
  pool: mysql.Pool,
  tableName: string,
  columnDefinitions: Record<string, string>,
): Promise<void> {
  const [columns] = (await pool.execute(`SHOW COLUMNS FROM ${tableName};`)) as [any[], any];
  const columnNames = new Set(columns.map((column: any) => column.Field));
  for (const [columnName, definition] of Object.entries(columnDefinitions)) {
    if (!columnNames.has(columnName)) {
      console.log(`➕ [DB Adapter MySQL] 检测到新字段 [${tableName}.${columnName}]，正在自动补齐...`);
      await pool.execute(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition};`);
    }
  }
}

/**
 * 为 SQLite 已有表补齐缺失字段。
 * @param client SQLite 客户端
 * @param tableName 内部受控的表名
 * @param columnDefinitions 字段名到 SQLite 类型定义的映射
 */
async function ensureSqliteColumns(
  client: Client,
  tableName: string,
  columnDefinitions: Record<string, string>,
): Promise<void> {
  const info = await client.execute(`PRAGMA table_info(${tableName});`);
  const columnNames = new Set(info.rows.map((row: any) => row.name));
  for (const [columnName, definition] of Object.entries(columnDefinitions)) {
    if (!columnNames.has(columnName)) {
      console.log(`➕ [DB Adapter SQLite] 检测到新字段 [${tableName}.${columnName}]，正在自动补齐...`);
      await client.execute(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition};`);
    }
  }
}

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
    await ensureMysqlColumns(pool, "users", {
      nickname: "VARCHAR(256) NULL AFTER email",
      avatar: "TEXT NULL AFTER nickname",
    });

    // 3. 课程包相关表按依赖顺序创建，外键级联保证删除课程包时同步清理学习数据。
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS course_packs (
        id VARCHAR(128) NOT NULL PRIMARY KEY,
        name VARCHAR(256) NULL,
        title VARCHAR(256) NOT NULL,
        description TEXT NULL,
        version VARCHAR(64) NULL,
        level VARCHAR(128) NULL,
        tags TEXT NULL,
        total_units INT NULL,
        total_vocab INT NULL,
        creator_id VARCHAR(128) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX course_packs_creator_idx (creator_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS courses (
        id VARCHAR(128) NOT NULL PRIMARY KEY,
        course_pack_id VARCHAR(128) NOT NULL,
        title VARCHAR(256) NOT NULL,
        description TEXT NULL,
        sort_order INT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX courses_pack_idx (course_pack_id),
        CONSTRAINT courses_pack_fk FOREIGN KEY (course_pack_id) REFERENCES course_packs(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS statements (
        id VARCHAR(128) NOT NULL PRIMARY KEY,
        course_id VARCHAR(128) NOT NULL,
        chinese TEXT NOT NULL,
        english TEXT NOT NULL,
        soundmark TEXT NULL,
        pos_tags TEXT NULL,
        syntax_tags TEXT NULL,
        sort_order INT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX statements_course_idx (course_id),
        CONSTRAINT statements_course_fk FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    await ensureMysqlColumns(pool, "course_packs", MYSQL_COURSE_PACK_METADATA_COLUMNS);
    await ensureMysqlColumns(pool, "statements", MYSQL_STATEMENT_ANNOTATION_COLUMNS);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS user_course_progress (
        id VARCHAR(128) NOT NULL PRIMARY KEY,
        user_id VARCHAR(128) NOT NULL,
        course_pack_id VARCHAR(128) NOT NULL,
        course_id VARCHAR(128) NOT NULL,
        statement_index INT NOT NULL DEFAULT 0,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY progress_user_pack_unique (user_id, course_pack_id),
        CONSTRAINT progress_pack_fk FOREIGN KEY (course_pack_id) REFERENCES course_packs(id) ON DELETE CASCADE,
        CONSTRAINT progress_course_fk FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS course_history (
        id VARCHAR(128) NOT NULL PRIMARY KEY,
        user_id VARCHAR(128) NOT NULL,
        course_pack_id VARCHAR(128) NOT NULL,
        course_id VARCHAR(128) NOT NULL,
        completion_count INT NOT NULL DEFAULT 0,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY history_user_course_unique (user_id, course_id),
        CONSTRAINT history_pack_fk FOREIGN KEY (course_pack_id) REFERENCES course_packs(id) ON DELETE CASCADE,
        CONSTRAINT history_course_fk FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
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
    await ensureSqliteColumns(sqlite, "users", {
      nickname: "TEXT",
      avatar: "TEXT",
    });

    // 3. SQLite 默认启用外键，并按依赖顺序创建课程包及学习记录表。
    await sqlite.execute("PRAGMA foreign_keys = ON;");
    await sqlite.execute(`
      CREATE TABLE IF NOT EXISTS course_packs (
        id TEXT PRIMARY KEY,
        name TEXT,
        title TEXT NOT NULL,
        description TEXT,
        version TEXT,
        level TEXT,
        tags TEXT,
        total_units INTEGER,
        total_vocab INTEGER,
        creator_id TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);
    await sqlite.execute("CREATE INDEX IF NOT EXISTS course_packs_creator_idx ON course_packs(creator_id);");
    await sqlite.execute(`
      CREATE TABLE IF NOT EXISTS courses (
        id TEXT PRIMARY KEY,
        course_pack_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        sort_order INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (course_pack_id) REFERENCES course_packs(id) ON DELETE CASCADE
      );
    `);
    await sqlite.execute("CREATE INDEX IF NOT EXISTS courses_pack_idx ON courses(course_pack_id);");
    await sqlite.execute(`
      CREATE TABLE IF NOT EXISTS statements (
        id TEXT PRIMARY KEY,
        course_id TEXT NOT NULL,
        chinese TEXT NOT NULL,
        english TEXT NOT NULL,
        soundmark TEXT,
        pos_tags TEXT,
        syntax_tags TEXT,
        sort_order INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      );
    `);
    await sqlite.execute("CREATE INDEX IF NOT EXISTS statements_course_idx ON statements(course_id);");
    await ensureSqliteColumns(sqlite, "course_packs", SQLITE_COURSE_PACK_METADATA_COLUMNS);
    await ensureSqliteColumns(sqlite, "statements", SQLITE_STATEMENT_ANNOTATION_COLUMNS);

    await sqlite.execute(`
      CREATE TABLE IF NOT EXISTS user_course_progress (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        course_pack_id TEXT NOT NULL,
        course_id TEXT NOT NULL,
        statement_index INTEGER NOT NULL DEFAULT 0,
        updated_at INTEGER NOT NULL,
        UNIQUE (user_id, course_pack_id),
        FOREIGN KEY (course_pack_id) REFERENCES course_packs(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      );
    `);
    await sqlite.execute(`
      CREATE TABLE IF NOT EXISTS course_history (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        course_pack_id TEXT NOT NULL,
        course_id TEXT NOT NULL,
        completion_count INTEGER NOT NULL DEFAULT 0,
        updated_at INTEGER NOT NULL,
        UNIQUE (user_id, course_id),
        FOREIGN KEY (course_pack_id) REFERENCES course_packs(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      );
    `);
  }

  // 4. 基础表就绪后执行独立版本迁移，确保已有数据库安全升级。
  await runMigrations(dialect, client);

  // 5. 自动种子初始化管理员账号
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
