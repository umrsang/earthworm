import { JwtModule, JwtService } from "@nestjs/jwt";
import { TestingModule } from "@nestjs/testing";
import { sql } from "drizzle-orm";
import { DbType } from "src/global/providers/db.provider";

import { GlobalModule } from "../../src/global/global.module";

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
  await db.execute(sql`TRUNCATE TABLE users`);
  await db.execute(sql`SET FOREIGN_KEY_CHECKS = 1`);
}

export async function signin(builder: TestingModule) {
  const jwtService = builder.get(JwtService);
  return jwtService.sign({ sub: "test-user-id" });
}

export const testImportModules = [
  GlobalModule,
  JwtModule.register({
    secret: process.env.SECRET || "test-secret",
    signOptions: { expiresIn: "7d" },
  }),
];
