import { HttpException, Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";

import { course, coursePack, user as userTable } from "@earthworm/schema";
import { DB, DbType } from "../global/providers/db.provider";
import { MembershipService } from "../membership/membership.service";
import { type MembershipDetails } from "../membership/types/membership.types";
import { UserCourseProgressService } from "../user-course-progress/user-course-progress.service";
import { UserEntity } from "../user/user.decorators";
import { UpdateUserDto } from "./model/user.dto";

@Injectable()
export class UserService {
  constructor(
    @Inject(DB) private db: DbType,
    private readonly userCourseProgressService: UserCourseProgressService,
    private readonly membershipService: MembershipService,
  ) {}

  async findUser(uId: string) {
    try {
      const userInfo = await this.db.query.user.findFirst({
        where: eq(userTable.id, uId),
      });

      if (!userInfo) return undefined;

      const membershipInfo = await this.getMembershipInfo(uId);

      return {
        id: userInfo.id,
        username: userInfo.username,
        avatar: userInfo.avatar,
        email: userInfo.email,
        membership: membershipInfo,
      };
    } catch (error) {
      console.error("Error fetching user info:", error);
      return undefined;
    }
  }

  async findCurrentUser(uId: string) {
    try {
      const userInfo = await this.db.query.user.findFirst({
        where: eq(userTable.id, uId),
        columns: { password: false },
      });
      if (!userInfo) return undefined;
      return {
        ...userInfo,
        membership: await this.getMembershipInfo(uId),
      };
    } catch (error) {
      console.error("Error fetching current user info:", error);
      return undefined;
    }
  }

  private async getMembershipInfo(uId: string) {
    const isMember = await this.membershipService.isMember(uId);
    let details: MembershipDetails = null;
    if (isMember) {
      details = await this.membershipService.getMembershipDetails(uId);
    }
    return { isMember, details };
  }

  async updateUser(user: UserEntity, dto: UpdateUserDto) {
    try {
      await this.db
        .update(userTable)
        .set({
          username: dto.username,
          avatar: dto.avatar,
        })
        .where(eq(userTable.id, user.userId));

      return { username: dto.username, avatar: dto.avatar };
    } catch (e) {
      throw new HttpException(e.message, 500);
    }
  }

  async setupNewUser(userEntity: UserEntity, dto: { username: string; avatar: string }) {
    if (!dto.avatar) {
      dto.avatar = this.getAvatarUrl();
    }

    await this.updateUser(userEntity, { username: dto.username, avatar: dto.avatar });

    const { id, courses } = await this.db.query.coursePack.findFirst({
      where: eq(coursePack.order, 1),
      with: {
        courses: {
          where: eq(course.order, 1),
        },
      },
    });

    await this.userCourseProgressService.upsert(userEntity.userId, id, courses.at(0).id, 0);
    return {
      avatar: dto.avatar,
      username: dto.username,
    };
  }

  private getAvatarUrl() {
    const order = this.getRandomNumber();
    return `https://earthworm-prod-1312884695.cos.ap-beijing.myqcloud.com/avatars/avatar${order}.png`;
  }

  private getRandomNumber() {
    return Math.floor(Math.random() * 9) + 1;
  }
}
