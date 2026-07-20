import { ForbiddenException, Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";

import { course, coursePack, statement } from "@earthworm/schema";
import { DB, DbType } from "../global/providers/db.provider";

@Injectable()
export class CreatorGuard {
  constructor(@Inject(DB) private db: DbType) {}

  async checkCoursePackOwner(userId: string, coursePackId: string) {
    const entity = await this.db.query.coursePack.findFirst({
      where: eq(coursePack.id, coursePackId),
    });
    if (!entity) throw new ForbiddenException("课程包不存在");
    if (entity.creatorId !== userId) throw new ForbiddenException("无权操作此课程包");
    return entity;
  }

  async checkCourseOwner(userId: string, courseId: string) {
    const entity = await this.db.query.course.findFirst({
      where: eq(course.id, courseId),
      with: { coursePack: true },
    });
    if (!entity) throw new ForbiddenException("课程不存在");
    if (entity.coursePack.creatorId !== userId) throw new ForbiddenException("无权操作此课程");
    return entity;
  }

  async checkStatementOwner(userId: string, statementId: string) {
    const entity = await this.db.query.statement.findFirst({
      where: eq(statement.id, statementId),
      with: { course: { with: { coursePack: true } } },
    });
    if (!entity) throw new ForbiddenException("语句不存在");
    if (entity.course.coursePack.creatorId !== userId) throw new ForbiddenException("无权操作此语句");
    return entity;
  }
}