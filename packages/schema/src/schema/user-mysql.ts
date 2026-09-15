import { createId } from "@paralleldrive/cuid2";
import { text, timestamp, varchar } from "drizzle-orm/mysql-core";
import { mysqlTable } from "drizzle-orm/mysql-core";

/**
 * MySQL 用户数据表 Schema 定义
 */
export const user = mysqlTable("users", {
  id: varchar("id", { length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  username: varchar("username", { length: 256 }).notNull().unique(),
  password: varchar("password", { length: 256 }).notNull(),
  email: varchar("email", { length: 256 }),
  nickname: varchar("nickname", { length: 256 }),
  avatar: text("avatar"),
  role: varchar("role", { length: 32 }).notNull().default("user"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export type MysqlUser = typeof user.$inferSelect;
export type NewMysqlUser = typeof user.$inferInsert;
