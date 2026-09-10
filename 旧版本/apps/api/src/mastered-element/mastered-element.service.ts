import { randomUUID } from "crypto";

import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { and, desc, eq } from "drizzle-orm";

import { masteredElements as masteredElementsSchema } from "@earthworm/schema";
import { DB, DbType } from "../global/providers/db.provider";

interface ElementContent {
  english: string;
}

@Injectable()
export class MasteredElementService {
  constructor(@Inject(DB) private db: DbType) {}

  async addMasteredElement(userId: string, content: ElementContent) {
    if (!content.english) {
      throw new BadRequestException("Element english content is required");
    }

    if (await this.isMastered(userId, content)) {
      throw new BadRequestException("这个内容已经掌握了");
    }

    const id = randomUUID();
    await this.db.insert(masteredElementsSchema).values({
      id,
      userId,
      content,
      masteredAt: new Date(),
    });

    // MySQL doesn't support RETURNING, query the latest inserted record
    const [entity] = await this.db
      .select()
      .from(masteredElementsSchema)
      .where(eq(masteredElementsSchema.id, id))
      .orderBy(desc(masteredElementsSchema.masteredAt))
      .limit(1);

    return { ...entity, content: this.normalizeContent(entity.content) };
  }

  async getMasteredElements(userId: string) {
    const result = await this.db
      .select()
      .from(masteredElementsSchema)
      .where(eq(masteredElementsSchema.userId, userId))
      .orderBy(desc(masteredElementsSchema.masteredAt));

    return result.map((item) => ({
      ...item,
      content: this.normalizeContent(item.content),
    }));
  }

  async removeMasteredElement(userId: string, elementId: string) {
    // First find the element to return it
    const [existing] = await this.db
      .select()
      .from(masteredElementsSchema)
      .where(
        and(eq(masteredElementsSchema.userId, userId), eq(masteredElementsSchema.id, elementId)),
      )
      .limit(1);

    if (!existing) {
      throw new NotFoundException(
        `Mastered element with id ${elementId} not found for user ${userId}`,
      );
    }

    await this.db
      .delete(masteredElementsSchema)
      .where(
        and(eq(masteredElementsSchema.userId, userId), eq(masteredElementsSchema.id, elementId)),
      );

    return existing;
  }

  async isMastered(userId: string, content: ElementContent) {
    const result = await this.db
      .select()
      .from(masteredElementsSchema)
      .where(eq(masteredElementsSchema.userId, userId));

    return result.some(
      (item) => JSON.stringify(this.normalizeContent(item.content)) === JSON.stringify(content),
    );
  }

  private normalizeContent(content: unknown) {
    return typeof content === "string" ? JSON.parse(content) : content;
  }
}
