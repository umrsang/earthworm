import * as mysqlUserSchema from "./schema/user-mysql";
import * as sqliteUserSchema from "./schema/user";

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

export * from "./schema/user";
export * as mysqlUser from "./schema/user-mysql";
