import { createId } from "@paralleldrive/cuid2";
import { date, int, json, mysqlTable, timestamp, unique, varchar } from "drizzle-orm/mysql-core";

export const userLearningActivities = mysqlTable(
  "user_learning_activities",
  {
    id: varchar("id", { length: 128 })
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: varchar("user_id", { length: 128 }).notNull(),
    date: date("date").notNull(),
    activityType: varchar("activity_type", { length: 64 }).notNull(),
    courseId: varchar("course_id", { length: 128 }),
    duration: int("duration").notNull(),
    metadata: json("metadata"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdateFn(() => new Date()),
  },
  (t) => ({
    unq: unique().on(t.userId, t.date, t.activityType),
  }),
);
