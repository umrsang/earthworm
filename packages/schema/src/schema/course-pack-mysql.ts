import { createId } from "@paralleldrive/cuid2";
import { int, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

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
