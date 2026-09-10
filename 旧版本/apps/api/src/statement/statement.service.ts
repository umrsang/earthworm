import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { and, desc, eq } from "drizzle-orm";

import { statement } from "@earthworm/schema";
import { DB, DbType } from "../global/providers/db.provider";
import { CreatorGuard } from "../guards/creator.guard";
import { CreateStatementDto } from "./dto/create-statement.dto";
import { UpdateStatementDto } from "./dto/update-statement.dto";

@Injectable()
export class StatementService {
  constructor(
    @Inject(DB) private db: DbType,
    private readonly creatorGuard: CreatorGuard,
  ) {}

  async create(userId: string, courseId: string, dto: CreateStatementDto) {
    await this.creatorGuard.checkCourseOwner(userId, courseId);
    const latest = await this.db.query.statement.findFirst({
      where: eq(statement.courseId, courseId),
      orderBy: desc(statement.order),
    });
    const order = dto.order ?? (latest?.order ?? 0) + 1;
    await this.db.insert(statement).values({
      courseId,
      order,
      chinese: dto.chinese,
      english: dto.english,
      soundmark: dto.soundmark ?? "",
      posTags: dto.posTags ? JSON.stringify(dto.posTags) : null,
      syntaxTags: dto.syntaxTags ? JSON.stringify(dto.syntaxTags) : null,
    });
    return this.db.query.statement.findFirst({
      where: and(eq(statement.courseId, courseId), eq(statement.order, order)),
    });
  }

  async update(userId: string, statementId: string, dto: UpdateStatementDto) {
    await this.creatorGuard.checkStatementOwner(userId, statementId);

    const data: Record<string, unknown> = {};
    if (dto.chinese !== undefined) data.chinese = dto.chinese;
    if (dto.english !== undefined) data.english = dto.english;
    if (dto.soundmark !== undefined) data.soundmark = dto.soundmark;
    if (dto.posTags !== undefined) data.posTags = dto.posTags ? JSON.stringify(dto.posTags) : null;
    if (dto.syntaxTags !== undefined)
      data.syntaxTags = dto.syntaxTags ? JSON.stringify(dto.syntaxTags) : null;
    if (dto.order !== undefined) data.order = dto.order;

    if (Object.keys(data).length === 0) {
      throw new NotFoundException("没有需要更新的字段");
    }

    await this.db.update(statement).set(data).where(eq(statement.id, statementId));

    const [updated] = await this.db.select().from(statement).where(eq(statement.id, statementId));
    return updated;
  }

  async delete(userId: string, statementId: string) {
    await this.creatorGuard.checkStatementOwner(userId, statementId);
    await this.db.delete(statement).where(eq(statement.id, statementId));
    return { success: true, message: "语句已删除" };
  }
}
