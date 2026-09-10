import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { int, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

import { coursePack } from "./coursePack";
import { statement } from "./statement";

export const course = mysqlTable("courses", {
  id: varchar("id", { length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  video: text("video"),
  order: int("order").notNull(),
  coursePackId: varchar("course_pack_id", { length: 128 })
    .notNull()
    .references(() => coursePack.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").onUpdateNow(),
});

export const courseRelations = relations(course, ({ one, many }) => ({
  statements: many(statement),
  coursePack: one(coursePack, {
    fields: [course.coursePackId],
    references: [coursePack.id],
  }),
}));
