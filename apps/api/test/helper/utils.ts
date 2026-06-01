import { JwtModule } from "@nestjs/jwt";
import { TestingModule } from "@nestjs/testing";
import { sql } from "drizzle-orm";
import { DbType } from "src/global/providers/db.provider";

import { GlobalModule } from "../../src/global/global.module";
import { LogtoService } from "../../src/logto/logto.service";
import { MockRedisModule } from "./mockRedis";

export async function cleanDB(db: DbType) {
  await db.execute(sql`SET FOREIGN_KEY_CHECKS = 0`);
  await db.execute(sql`TRUNCATE TABLE courses`);
  await db.execute(sql`TRUNCATE TABLE statements`);
  await db.execute(sql`TRUNCATE TABLE course_packs`);
  await db.execute(sql`TRUNCATE TABLE user_course_progress`);
  await db.execute(sql`TRUNCATE TABLE course_history`);
  await db.execute(sql`TRUNCATE TABLE user_learning_activities`);
  await db.execute(sql`TRUNCATE TABLE mastered_elements`);
  await db.execute(sql`TRUNCATE TABLE memberships`);
  await db.execute(sql`SET FOREIGN_KEY_CHECKS = 1`);
}

export async function signin(builder: TestingModule) {
  const logto = builder.get(LogtoService);
  return await logto.fetchToken();
}

export const testImportModules = [
  MockRedisModule,
  GlobalModule,
  JwtModule.register({
    secret: process.env.SECRET,
    signOptions: { expiresIn: "7d" },
  }),
];
