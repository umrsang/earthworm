import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { eq } from "drizzle-orm";

import { statement } from "@earthworm/schema";
import { DB, DbType } from "../global/providers/db.provider";
import { CreatorGuard } from "../guards/creator.guard";
import { UpdateStatementDto } from "./dto/update-statement.dto";

@Injectable()
export class StatementService {
  constructor(
    @Inject(DB) private db: DbType,
    private readonly creatorGuard: CreatorGuard,
  ) {}

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
