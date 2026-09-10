import { TestingModule } from "@nestjs/testing";

import { UserEntity } from "../../src/user/user.decorators";

export function createUser(): UserEntity {
  return {
    userId: "123456",
  };
}

export async function createTestUser(builder: TestingModule, username: string) {
  // 直接通过数据库创建用户，不再依赖 Logto
  const { DB } = await import("../../src/global/providers/db.provider");
  const db = builder.get(DB);
  const { user } = await import("@earthworm/schema");
  const argon2 = await import("argon2");
  const { createId } = await import("@paralleldrive/cuid2");

  const userId = createId();
  await db.insert(user).values({
    id: userId,
    username,
    password: await argon2.hash("password123"),
  });

  return { userId, username };
}
