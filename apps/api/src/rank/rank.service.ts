import { Inject, Injectable, Logger } from "@nestjs/common";
import { desc, eq, sql } from "drizzle-orm";

import { userRank } from "@earthworm/schema";
import { DB, DbType } from "../global/providers/db.provider";
import { UserEntity } from "../user/user.decorators";
import { UserService } from "../user/user.service";

export enum RankPeriod {
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  YEARLY = "yearly",
}

export type RankPeriodAlias = "weekly" | "monthly" | "yearly";

@Injectable()
export class RankService {
  private readonly logger = new Logger(RankService.name);

  constructor(
    @Inject(DB) private readonly db: DbType,
    private readonly userService: UserService,
  ) {}

  async userFinishCourse(userId: string) {
    const counts = {};
    for (const period of Object.values(RankPeriod)) {
      const existing = await this.db.query.userRank.findFirst({
        where: (ur) => eq(ur.userId, userId) && eq(ur.period, period),
      });

      if (existing) {
        await this.db
          .update(userRank)
          .set({ count: sql`${userRank.count} + 1` })
          .where(eq(userRank.id, existing.id));
        counts[period] = existing.count + 1;
      } else {
        await this.db.insert(userRank).values({
          userId,
          period,
          count: 1,
        });
        counts[period] = 1;
      }
    }

    return counts;
  }

  private convertRankListToObjectArray(rankList: any[]) {
    return rankList.map((item) => ({
      count: item.count,
      userId: item.userId,
    }));
  }

  async getRankList(user: UserEntity, period: RankPeriodAlias = RankPeriod.WEEKLY) {
    let self = null;
    
    const rankList = await this.db.query.userRank.findMany({
      where: (ur) => eq(ur.period, period),
      orderBy: (ur) => desc(ur.count),
      limit: 25,
    });

    const convertedList = this.convertRankListToObjectArray(rankList);

    if (user) {
      const userRankRecord = rankList.find((r) => r.userId === user.userId);
      const userRank = rankList.findIndex((r) => r.userId === user.userId);
      
      self = {
        userId: user.userId,
        count: userRankRecord?.count ?? -1,
        rank: userRank === -1 ? -1 : userRank + 1,
      };
    }

    await this.appendUserNameProperty(self, convertedList);

    return {
      self,
      list: convertedList,
    };
  }

  private async appendUserNameProperty(self, rankList) {
    const usersMap = await this.fetchUsersMap(
      Array.from(new Set([self.userId, ...rankList.map(({ userId }) => userId)])),
    );

    const rankListUsernameGenByUserId = (id: string) => {
      const user = usersMap[id];

      if (!user) {
        return "";
      }

      return user.username;
    };

    self.username = rankListUsernameGenByUserId(self.userId);
    rankList.forEach((info) => {
      info.username = rankListUsernameGenByUserId(info.userId);
    });
  }

  private async fetchUsersMap(uIds: string[]) {
    const promises = uIds.map((uId) => {
      return this.userService.findUser(uId);
    });

    const users = await Promise.all(promises);

    return users.reduce((obj, cur) => {
      if (cur) {
        obj[cur.id] = cur;
      }
      return obj;
    }, {});
  }

  async resetRankList(period: RankPeriodAlias = RankPeriod.WEEKLY) {
    try {
      await this.db.delete(userRank).where(eq(userRank.period, period));
      this.logger.verbose(`${period}重置排行榜成功: ${new Date()}`);
    } catch (error) {
      this.logger.error(`${period}重置排行榜时发生错误: ${error}`);
    }
  }
}
