/* Workspace 包由 Node 22 直接加载源码，ESM 相对路径必须包含扩展名。 */
import * as mysqlUserSchema from "./schema/user-mysql.ts";
import * as sqliteUserSchema from "./schema/user.ts";

/** SQLite Schema 集合 */
export const sqliteSchemas = {
  ...sqliteUserSchema,
};

/** MySQL Schema 集合 */
export const mysqlSchemas = {
  ...mysqlUserSchema,
};

/** 默认通用 Schema 导出（默认 SQLite） */
export const schemas = sqliteSchemas;

export * from "./schema/user.ts";
export * as mysqlUser from "./schema/user-mysql.ts";
