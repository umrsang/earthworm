import { createId } from "@paralleldrive/cuid2";
import { date, int, mysqlTable, timestamp, unique, varchar } from "drizzle-orm/mysql-core";

export const userLearnRecord = mysqlTable(
  "user_learn_record",
  {
    id: varchar("id", { length: 128 })
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: varchar("user_id", { length: 128 }).notNull(),
    count: int("count").notNull().default(0),
    day: date("day").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdateFn(() => new Date()),
  },
  (t) => ({
    unq: unique().on(t.userId, t.day),
  }),
);
