import { createId } from "@paralleldrive/cuid2";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { course, statement } from "./course-pack.ts";
import { user } from "./user.ts";

export const aiModelConfig = sqliteTable(
  "ai_model_configs",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    name: text("name").notNull(),
    baseUrl: text("base_url").notNull(),
    model: text("model").notNull(),
    apiKey: text("api_key").notNull(),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(false),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  },
  (table) => ({ activeIndex: index("ai_model_active_idx").on(table.isActive) }),
);

export const courseAiAnalysis = sqliteTable(
  "course_ai_analyses",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    userId: text("user_id").notNull(),
    courseId: text("course_id").notNull().references(() => course.id, { onDelete: "cascade" }),
    modelConfigId: text("model_config_id").notNull().references(() => aiModelConfig.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  },
  (table) => ({
    cacheUnique: uniqueIndex("course_ai_analysis_cache_unique").on(table.userId, table.courseId, table.modelConfigId),
  }),
);

export const systemStatementAiAnalysis = sqliteTable(
  "system_statement_ai_analyses",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    statementId: text("statement_id").notNull().references(() => statement.id, { onDelete: "cascade" }),
    modelConfigId: text("model_config_id").notNull().references(() => aiModelConfig.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  },
  (table) => ({ cacheUnique: uniqueIndex("system_statement_ai_analysis_unique").on(table.statementId, table.modelConfigId) }),
);

export const userStatementAiAnalysis = sqliteTable(
  "user_statement_ai_analyses",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    statementId: text("statement_id").notNull().references(() => statement.id, { onDelete: "cascade" }),
    modelConfigId: text("model_config_id").references(() => aiModelConfig.id, { onDelete: "set null" }),
    modelName: text("model_name").notNull(),
    content: text("content").notNull(),
    generationCount: integer("generation_count").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  },
  (table) => ({ cacheUnique: uniqueIndex("user_statement_ai_analysis_unique").on(table.userId, table.statementId) }),
);

export const statementAiAnalysis = sqliteTable(
  "statement_ai_analyses",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    userId: text("user_id").notNull(),
    statementId: text("statement_id").notNull().references(() => statement.id, { onDelete: "cascade" }),
    modelConfigId: text("model_config_id").notNull().references(() => aiModelConfig.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  },
  (table) => ({ cacheUnique: uniqueIndex("statement_ai_analysis_cache_unique").on(table.userId, table.statementId, table.modelConfigId) }),
);
