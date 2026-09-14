import { createId } from "@paralleldrive/cuid2";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const coursePack = sqliteTable("course_packs", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  name: text("name"),
  title: text("title").notNull(),
  description: text("description"),
  version: text("version"),
  level: text("level"),
  tags: text("tags"),
  totalUnits: integer("total_units"),
  totalVocab: integer("total_vocab"),
  creatorId: text("creator_id").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const course = sqliteTable("courses", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  coursePackId: text("course_pack_id").notNull().references(() => coursePack.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const statement = sqliteTable("statements", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  courseId: text("course_id").notNull().references(() => course.id, { onDelete: "cascade" }),
  chinese: text("chinese").notNull(),
  english: text("english").notNull(),
  soundmark: text("soundmark"),
  posTags: text("pos_tags"),
  syntaxTags: text("syntax_tags"),
  sortOrder: integer("sort_order").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const userCourseProgress = sqliteTable(
  "user_course_progress",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    userId: text("user_id").notNull(),
    coursePackId: text("course_pack_id").notNull().references(() => coursePack.id, { onDelete: "cascade" }),
    courseId: text("course_id").notNull().references(() => course.id, { onDelete: "cascade" }),
    statementIndex: integer("statement_index").notNull().default(0),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  },
  (table) => ({ userPackUnique: uniqueIndex("progress_user_pack_unique").on(table.userId, table.coursePackId) }),
);

export const courseHistory = sqliteTable(
  "course_history",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    userId: text("user_id").notNull(),
    coursePackId: text("course_pack_id").notNull().references(() => coursePack.id, { onDelete: "cascade" }),
    courseId: text("course_id").notNull().references(() => course.id, { onDelete: "cascade" }),
    completionCount: integer("completion_count").notNull().default(0),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  },
  (table) => ({ userCourseUnique: uniqueIndex("history_user_course_unique").on(table.userId, table.courseId) }),
);
