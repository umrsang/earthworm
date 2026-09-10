import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { eq } from "drizzle-orm";
import type { AppDatabase } from "@jufun/db";
import { user } from "@jufun/schema";

import { DB_TOKEN, ERROR_MESSAGES } from "../common/constants";

@Injectable()
export class UserService {
  constructor(@Inject(DB_TOKEN) private readonly db: AppDatabase) {}

  /**
   * 根据用户主键 ID 获取用户基础详情（去除敏感密码哈希）
   * @param userId 用户 ID
   * @returns 用户个人基础资料
   */
  async findProfileById(userId: string) {
    const foundUser = await this.db.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (!foundUser) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    // 剔除密码哈希字段
    const { password: _pwd, ...profile } = foundUser;
    return profile;
  }
}
