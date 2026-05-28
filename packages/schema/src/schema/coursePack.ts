import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { boolean, int, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

import { course } from "./course";

export const coursePack = mysqlTable("course_packs", {
  id: varchar("id", { length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  order: int("order").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description").default(""),
  isFree: boolean("is_free"),
  cover: text("cover"),
  creatorId: varchar("creator_id", { length: 128 }).notNull(),
  shareLevel: varchar("share_level", { length: 32 }).default("private"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdateFn(() => new Date()),
});

export const coursePackRelations = relations(coursePack, ({ many }) => ({
  courses: many(course),
}));
