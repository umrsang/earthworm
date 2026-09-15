import { createId } from "@paralleldrive/cuid2";
import { index, int, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";
import { course, statement } from "./course-pack-mysql.ts";
import { user } from "./user-mysql.ts";

export const aiModelConfig = mysqlTable(
  "ai_model_configs",
  {
    id: varchar("id", { length: 128 }).primaryKey().$defaultFn(() => createId()),
    name: varchar("name", { length: 128 }).notNull(),
    baseUrl: varchar("base_url", { length: 512 }).notNull(),
    model: varchar("model", { length: 128 }).notNull(),
    apiKey: text("api_key").notNull(),
    isActive: int("is_active").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => ({ activeIndex: index("ai_model_active_idx").on(table.isActive) }),
);

export const courseAiAnalysis = mysqlTable(
  "course_ai_analyses",
  {
    id: varchar("id", { length: 128 }).primaryKey().$defaultFn(() => createId()),
    userId: varchar("user_id", { length: 128 }).notNull(),
    courseId: varchar("course_id", { length: 128 }).notNull().references(() => course.id, { onDelete: "cascade" }),
    modelConfigId: varchar("model_config_id", { length: 128 }).notNull().references(() => aiModelConfig.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => ({
    cacheUnique: uniqueIndex("course_ai_analysis_cache_unique").on(table.userId, table.courseId, table.modelConfigId),
  }),
);

export const systemStatementAiAnalysis = mysqlTable(
  "system_statement_ai_analyses",
  {
    id: varchar("id", { length: 128 }).primaryKey().$defaultFn(() => createId()),
    statementId: varchar("statement_id", { length: 128 }).notNull().references(() => statement.id, { onDelete: "cascade" }),
    modelConfigId: varchar("model_config_id", { length: 128 }).notNull().references(() => aiModelConfig.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => ({ cacheUnique: uniqueIndex("system_statement_ai_analysis_unique").on(table.statementId, table.modelConfigId) }),
);

export const userStatementAiAnalysis = mysqlTable(
  "user_statement_ai_analyses",
  {
    id: varchar("id", { length: 128 }).primaryKey().$defaultFn(() => createId()),
    userId: varchar("user_id", { length: 128 }).notNull().references(() => user.id, { onDelete: "cascade" }),
    statementId: varchar("statement_id", { length: 128 }).notNull().references(() => statement.id, { onDelete: "cascade" }),
    modelConfigId: varchar("model_config_id", { length: 128 }).references(() => aiModelConfig.id, { onDelete: "set null" }),
    modelName: varchar("model_name", { length: 128 }).notNull(),
    content: text("content").notNull(),
    generationCount: int("generation_count").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => ({ cacheUnique: uniqueIndex("user_statement_ai_analysis_unique").on(table.userId, table.statementId) }),
);

export const statementAiAnalysis = mysqlTable(
  "statement_ai_analyses",
  {
    id: varchar("id", { length: 128 }).primaryKey().$defaultFn(() => createId()),
    userId: varchar("user_id", { length: 128 }).notNull(),
    statementId: varchar("statement_id", { length: 128 }).notNull().references(() => statement.id, { onDelete: "cascade" }),
    modelConfigId: varchar("model_config_id", { length: 128 }).notNull().references(() => aiModelConfig.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => ({ cacheUnique: uniqueIndex("statement_ai_analysis_cache_unique").on(table.userId, table.statementId, table.modelConfigId) }),
);
