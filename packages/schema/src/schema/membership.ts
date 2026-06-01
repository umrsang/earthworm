import { createId } from "@paralleldrive/cuid2";
import { boolean, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

export const membership = mysqlTable("memberships", {
  id: varchar("id", { length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: varchar("user_id", { length: 128 }).notNull(),
  start_date: timestamp("start_date").notNull(),
  end_date: timestamp("end_date").notNull(),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").onUpdateNow(),
  type: varchar("type", { length: 64 }).notNull().default("regular"), // 先用 string 的形式， 后面需要改成枚举
});
