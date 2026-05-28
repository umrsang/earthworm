import { createId } from "@paralleldrive/cuid2";
import { int, mysqlTable, timestamp, unique, varchar } from "drizzle-orm/mysql-core";

export const courseHistory = mysqlTable(
  "course_history",
  {
    id: varchar("id", { length: 128 })
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: varchar("user_id", { length: 128 }).notNull(),
    courseId: varchar("course_id", { length: 128 }).notNull(),
    coursePackId: varchar("course_pack_id", { length: 128 }).notNull(),
    completionCount: int("completion_count").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdateFn(() => new Date()),
  },
  (t) => ({
    unq: unique().on(t.userId, t.courseId, t.coursePackId),
  }),
);
