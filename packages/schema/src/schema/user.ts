import { createId } from "@paralleldrive/cuid2";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * 用户表名常量，避免魔法字符串
 */
export const USER_TABLE_NAME = "users" as const;

/**
 * 用户数据表 Schema 定义
 */
export const user = sqliteTable(USER_TABLE_NAME, {
  /** 主键 ID，采用 cuid2 保证分布式唯一性 */
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  /** 唯一登录用户名 */
  username: text("username").notNull().unique(),

  /** 密码哈希串 */
  password: text("password").notNull(),

  /** 电子邮箱（可选） */
  email: text("email"),

  /** 昵称（可选） */
  nickname: text("nickname"),

  /** 头像地址（可选） */
  avatar: text("avatar"),

  /** 账号角色，admin 可访问系统管理能力 */
  role: text("role").notNull().default("user"),

  /** 账号创建时间戳（毫秒） */
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),

  /** 账号最后更新时间戳（毫秒） */
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/** 用户查询模型类型推导 */
export type User = typeof user.$inferSelect;
/** 用户插入模型类型推导 */
export type NewUser = typeof user.$inferInsert;
