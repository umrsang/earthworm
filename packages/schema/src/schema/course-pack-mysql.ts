import { createId } from "@paralleldrive/cuid2";
import { index, int, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

export const coursePack = mysqlTable("course_packs", {
  id: varchar("id", { length: 128 }).primaryKey().$defaultFn(() => createId()),
  name: varchar("name", { length: 256 }),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  version: varchar("version", { length: 64 }),
  level: varchar("level", { length: 128 }),
  tags: text("tags"),
  totalUnits: int("total_units"),
  totalVocab: int("total_vocab"),
  creatorId: varchar("creator_id", { length: 128 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const course = mysqlTable("courses", {
  id: varchar("id", { length: 128 }).primaryKey().$defaultFn(() => createId()),
  coursePackId: varchar("course_pack_id", { length: 128 }).notNull().references(() => coursePack.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  sortOrder: int("sort_order").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const statement = mysqlTable("statements", {
  id: varchar("id", { length: 128 }).primaryKey().$defaultFn(() => createId()),
  courseId: varchar("course_id", { length: 128 }).notNull().references(() => course.id, { onDelete: "cascade" }),
  chinese: text("chinese").notNull(),
  english: text("english").notNull(),
  soundmark: text("soundmark"),
  posTags: text("pos_tags"),
  syntaxTags: text("syntax_tags"),
  sortOrder: int("sort_order").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const userCourseProgress = mysqlTable(
  "user_course_progress",
  {
    id: varchar("id", { length: 128 }).primaryKey().$defaultFn(() => createId()),
    userId: varchar("user_id", { length: 128 }).notNull(),
    coursePackId: varchar("course_pack_id", { length: 128 }).notNull().references(() => coursePack.id, { onDelete: "cascade" }),
    courseId: varchar("course_id", { length: 128 }).notNull().references(() => course.id, { onDelete: "cascade" }),
    statementIndex: int("statement_index").notNull().default(0),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => ({ userPackUnique: uniqueIndex("progress_user_pack_unique").on(table.userId, table.coursePackId) }),
);

export const learningActivityEvent = mysqlTable(
  "learning_activity_events",
  {
    id: varchar("id", { length: 128 }).primaryKey().$defaultFn(() => createId()),
    eventId: varchar("event_id", { length: 128 }).notNull(),
    userId: varchar("user_id", { length: 128 }).notNull(),
    coursePackId: varchar("course_pack_id", { length: 128 }).notNull().references(() => coursePack.id, { onDelete: "cascade" }),
    courseId: varchar("course_id", { length: 128 }).notNull().references(() => course.id, { onDelete: "cascade" }),
    statementId: varchar("statement_id", { length: 128 }).references(() => statement.id, { onDelete: "cascade" }),
    eventType: varchar("event_type", { length: 32 }).notNull(),
    durationSeconds: int("duration_seconds").notNull().default(0),
    attemptCount: int("attempt_count").notNull().default(0),
    correctCount: int("correct_count").notNull().default(0),
    learningDate: varchar("learning_date", { length: 10 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userEventIdUnique: uniqueIndex("learning_event_user_id_unique").on(table.userId, table.eventId),
    userDateIndex: index("learning_event_user_date_idx").on(table.userId, table.learningDate),
    userCreatedIndex: index("learning_event_user_created_idx").on(table.userId, table.createdAt),
    courseIndex: index("learning_event_course_idx").on(table.userId, table.courseId),
  }),
);

export const courseHistory = mysqlTable(
  "course_history",
  {
    id: varchar("id", { length: 128 }).primaryKey().$defaultFn(() => createId()),
    userId: varchar("user_id", { length: 128 }).notNull(),
    coursePackId: varchar("course_pack_id", { length: 128 }).notNull().references(() => coursePack.id, { onDelete: "cascade" }),
    courseId: varchar("course_id", { length: 128 }).notNull().references(() => course.id, { onDelete: "cascade" }),
    completionCount: int("completion_count").notNull().default(0),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => ({ userCourseUnique: uniqueIndex("history_user_course_unique").on(table.userId, table.courseId) }),
);
