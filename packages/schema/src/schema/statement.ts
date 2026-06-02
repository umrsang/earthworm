import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { int, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

import { course } from "./course";

export const statement = mysqlTable("statements", {
  id: varchar("id", { length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  order: int("order").notNull(),
  chinese: text("chinese").notNull(),
  english: text("english").notNull(),
  soundmark: text("soundmark").notNull(),
  posTags: text("pos_tags"), // JSON array: [[start, end, "label"], ...]
  syntaxTags: text("syntax_tags"), // JSON array: [[start, end, "label", "type"], ...]
  courseId: varchar("course_id", { length: 128 })
    .notNull()
    .references(() => course.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").onUpdateNow(),
});

export const statementRelations = relations(statement, ({ one }) => ({
  course: one(course, {
    fields: [statement.courseId],
    references: [course.id],
  }),
}));
