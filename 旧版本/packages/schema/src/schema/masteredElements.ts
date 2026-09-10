import { createId } from "@paralleldrive/cuid2";
import { json, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

export const masteredElements = mysqlTable("mastered_elements", {
  id: varchar("id", { length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: varchar("user_id", { length: 128 }).notNull(),
  content: json("content").notNull(),
  masteredAt: timestamp("mastered_at", { fsp: 3 }).defaultNow(),
});
