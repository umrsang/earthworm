import { createId } from "@paralleldrive/cuid2";
import { boolean, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const user = mysqlTable("users", {
  id: varchar("id", { length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  username: varchar("username", { length: 256 }).notNull().unique(),
  email: varchar("email", { length: 256 }).unique(),
  password: varchar("password", { length: 256 }).notNull(),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").onUpdateNow(),
  isActive: boolean("is_active").notNull().default(true),
});
