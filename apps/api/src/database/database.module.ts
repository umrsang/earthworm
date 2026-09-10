import { Global, Logger, Module, OnApplicationBootstrap } from "@nestjs/common";
import { autoMigrateDatabase, db, getCurrentDialect } from "@jufun/db";

import { DB_TOKEN } from "../common/constants";

@Global()
@Module({
  providers: [
    {
      provide: DB_TOKEN,
      useValue: db,
    },
  ],
  exports: [DB_TOKEN],
})
export class DatabaseModule implements OnApplicationBootstrap {
  private readonly logger = new Logger("DatabaseModule");

  /**
   * 应用启动阶段生命周期钩子
   * 通过中间层触发自动数据库迁移，根据 DATABASE_URL 自动适配 SQLite 或 MySQL
   */
  async onApplicationBootstrap() {
    const dialect = getCurrentDialect();
    this.logger.log(`检测到当前数据库驱动方言: [${dialect.toUpperCase()}]`);
    await autoMigrateDatabase();
    this.logger.log(`数据库迁移完成，${dialect.toUpperCase()} 数据表与列已就绪。`);
  }
}
