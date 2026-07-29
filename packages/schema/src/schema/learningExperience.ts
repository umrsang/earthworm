import { createId } from "@paralleldrive/cuid2";
import {
  boolean,
  int,
  json,
  mysqlTable,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/mysql-core";

export const userCourseLibrary = mysqlTable(
  "user_course_library",
  {
    id: varchar("id", { length: 128 })
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: varchar("user_id", { length: 128 }).notNull(),
    coursePackId: varchar("course_pack_id", { length: 128 }).notNull(),
    isFavorite: boolean("is_favorite").notNull().default(false),
    enrolledAt: timestamp("enrolled_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").onUpdateNow(),
  },
  (t) => ({ unq: unique().on(t.userId, t.coursePackId) }),
);

export const dailyPlan = mysqlTable(
  "daily_plans",
  {
    id: varchar("id", { length: 128 })
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: varchar("user_id", { length: 128 }).notNull(),
    date: varchar("date", { length: 10 }).notNull(),
    goalStatements: int("goal_statements").notNull().default(20),
    completedStatements: int("completed_statements").notNull().default(0),
    items: json("items").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").onUpdateNow(),
  },
  (t) => ({ unq: unique().on(t.userId, t.date) }),
);

export const learningAttempt = mysqlTable("learning_attempts", {
  id: varchar("id", { length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: varchar("user_id", { length: 128 }).notNull(),
  coursePackId: varchar("course_pack_id", { length: 128 }).notNull(),
  courseId: varchar("course_id", { length: 128 }).notNull(),
  statementId: varchar("statement_id", { length: 128 }).notNull(),
  answer: text("answer").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  hintUsed: boolean("hint_used").notNull().default(false),
  durationMs: int("duration_ms").notNull().default(0),
  attemptedAt: timestamp("attempted_at").notNull().defaultNow(),
});

export const reviewItem = mysqlTable(
  "review_items",
  {
    id: varchar("id", { length: 128 })
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: varchar("user_id", { length: 128 }).notNull(),
    coursePackId: varchar("course_pack_id", { length: 128 }).notNull(),
    courseId: varchar("course_id", { length: 128 }).notNull(),
    statementId: varchar("statement_id", { length: 128 }).notNull(),
    mastery: int("mastery").notNull().default(0),
    intervalDays: int("interval_days").notNull().default(1),
    wrongCount: int("wrong_count").notNull().default(0),
    dueAt: timestamp("due_at").notNull().defaultNow(),
    lastReviewedAt: timestamp("last_reviewed_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").onUpdateNow(),
  },
  (t) => ({ unq: unique().on(t.userId, t.statementId) }),
);

export const userPreference = mysqlTable(
  "user_preferences",
  {
    id: varchar("id", { length: 128 })
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: varchar("user_id", { length: 128 }).notNull(),
    settings: json("settings").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").onUpdateNow(),
  },
  (t) => ({ unq: unique().on(t.userId) }),
);

export const notification = mysqlTable("notifications", {
  id: varchar("id", { length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: varchar("user_id", { length: 128 }).notNull(),
  type: varchar("type", { length: 64 }).notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  content: text("content"),
  actionUrl: varchar("action_url", { length: 512 }),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  readAt: timestamp("read_at"),
});
