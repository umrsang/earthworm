export type MigrationDialect = "sqlite" | "mysql";

export interface DbMigration {
  version: string;
  sqlite: string[];
  mysql: string[];
}
