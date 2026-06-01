import { createId } from "@paralleldrive/cuid2";
import { int, mysqlTable, timestamp, unique, varchar } from "drizzle-orm/mysql-core";

export const userRank = mysqlTable(
  "user_rank",
  {
    id: varchar("id", { length: 128 })
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: varchar("user_id", { length: 128 }).notNull(),
    period: varchar("period", { length: 32 }).notNull(),
    count: int("count").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdateFn(() => new Date()),
  },
  (t) => ({
    unq: unique().on(t.userId, t.period),
  }),
);
