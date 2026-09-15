/* Workspace 包由 Node 22 直接加载源码，ESM 相对路径必须包含扩展名。 */
import * as mysqlCoursePackSchema from "./schema/course-pack-mysql.ts";
import * as mysqlAiSchema from "./schema/ai-mysql.ts";
import * as mysqlUserSchema from "./schema/user-mysql.ts";
import * as sqliteAiSchema from "./schema/ai.ts";
import * as sqliteCoursePackSchema from "./schema/course-pack.ts";
import * as sqliteUserSchema from "./schema/user.ts";

/** SQLite Schema 集合 */
export const sqliteSchemas = {
  ...sqliteUserSchema,
  ...sqliteCoursePackSchema,
  ...sqliteAiSchema,
};

/** MySQL Schema 集合 */
export const mysqlSchemas = {
  ...mysqlUserSchema,
  ...mysqlCoursePackSchema,
  ...mysqlAiSchema,
};

/** 默认通用 Schema 导出（默认 SQLite） */
export const schemas = sqliteSchemas;

export * from "./schema/user.ts";
export * from "./schema/course-pack.ts";
export * from "./schema/ai.ts";
export * as mysqlAi from "./schema/ai-mysql.ts";
export * as mysqlUser from "./schema/user-mysql.ts";
export * as mysqlCoursePack from "./schema/course-pack-mysql.ts";
