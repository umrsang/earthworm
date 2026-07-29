import { randomUUID } from "crypto";

import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { and, asc, desc, eq } from "drizzle-orm";

import { course, coursePack, statement } from "@earthworm/schema";
import { CourseHistoryService } from "../course-history/course-history.service";
import { CourseService } from "../course/course.service";
import { DB, DbType } from "../global/providers/db.provider";
import { CreatorGuard } from "../guards/creator.guard";
import { MembershipService } from "../membership/membership.service";
import { CoursePackQueryDto } from "./dto/course-pack-query.dto";
import { CreateCoursePackDto } from "./dto/create-course-pack.dto";
import { UpdateCoursePackDto } from "./dto/update-course-pack.dto";
import { UploadCoursePackDto } from "./dto/upload-course-pack.dto";

@Injectable()
export class CoursePackService {
  constructor(
    @Inject(DB) private db: DbType,
    private readonly courseService: CourseService,
    private readonly courseHistoryService: CourseHistoryService,
    private readonly membershipService: MembershipService,
    private readonly creatorGuard: CreatorGuard,
  ) {}

  async findAll(userId?: string, query: CoursePackQueryDto = {}) {
    let result = [];

    const publicCoursePacks = await this.findAllPublicCoursePacks();
    result.push(...publicCoursePacks);

    if (userId) {
      const userIdOwnedCoursePacks = await this.findAllForUser(userId);
      result.push(...userIdOwnedCoursePacks);

      // 看看是不是创始会员
      // 是的话 需要去查所有课程包的 shareLevel 为 founder_only 的
      if (await this.membershipService.isFounderMembership(userId)) {
        const founderOnlyCoursePacks = await this.findFounderOnly();
        result.push(...founderOnlyCoursePacks);
      }
    }

    const keyword = query.q?.trim().toLocaleLowerCase();
    result = result.filter((item) => {
      const matchesKeyword =
        !keyword ||
        item.title.toLocaleLowerCase().includes(keyword) ||
        item.description?.toLocaleLowerCase().includes(keyword);
      const matchesDifficulty = !query.difficulty || item.difficulty === query.difficulty;
      const tags = Array.isArray(item.tags) ? item.tags : [];
      const matchesTag = !query.tag || tags.includes(query.tag);
      return matchesKeyword && matchesDifficulty && matchesTag;
    });
    if (query.sort === "newest") {
      result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else if (query.sort === "oldest") {
      result.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    }
    return result;
  }

  async findFounderOnly() {
    const coursePacks = await this.db.query.coursePack.findMany({
      orderBy: asc(coursePack.order),
      where: and(eq(coursePack.shareLevel, "founder_only"), eq(coursePack.status, "published")),
    });

    return coursePacks;
  }

  async findAllForUser(userId: string) {
    const userIdOwnedCoursePacks = await this.db.query.coursePack.findMany({
      orderBy: asc(coursePack.order),
      where: and(eq(coursePack.creatorId, userId), eq(coursePack.shareLevel, "private")),
    });

    return userIdOwnedCoursePacks;
  }

  async findAllCreatedBy(userId: string) {
    return this.db.query.coursePack.findMany({
      orderBy: asc(coursePack.order),
      where: eq(coursePack.creatorId, userId),
      with: { courses: true },
    });
  }

  async getCreatorSummary(userId: string) {
    const packs = await this.findAllCreatedBy(userId);
    const packIds = new Set(packs.map((item) => String(item.id)));
    const attempts = await this.db.query.learningAttempt.findMany();
    const relatedAttempts = attempts.filter((item) => packIds.has(String(item.coursePackId)));
    return {
      coursePacks: packs.length,
      published: packs.filter((item) => item.status === "published").length,
      drafts: packs.filter((item) => item.status === "draft").length,
      courses: packs.reduce((total, item) => total + item.courses.length, 0),
      learners: new Set(relatedAttempts.map((item) => item.userId)).size,
      attempts: relatedAttempts.length,
      accuracy: relatedAttempts.length
        ? Math.round(
            (relatedAttempts.filter((item) => item.isCorrect).length / relatedAttempts.length) *
              100,
          )
        : 0,
    };
  }

  async findAllPublicCoursePacks() {
    return await this.db.query.coursePack.findMany({
      orderBy: asc(coursePack.order),
      where: and(eq(coursePack.shareLevel, "public"), eq(coursePack.status, "published")),
    });
  }

  async findOne(coursePackId: string) {
    const result = await this.db.query.coursePack.findFirst({
      where: eq(coursePack.id, coursePackId),
    });

    if (!result) {
      throw new NotFoundException(`CoursePack with ID ${coursePackId} not found`);
    }

    return result;
  }

  async findOneWithCourses(userId: string, coursePackId: string) {
    const coursePackWithCourses = await this.findCoursePackWithCourses(coursePackId, userId);

    if (userId) {
      coursePackWithCourses.courses = await this.addCompletionCountsToCourses(
        userId,
        coursePackWithCourses.courses,
        coursePackId,
      );
    }

    return coursePackWithCourses;
  }

  private async findCoursePackWithCourses(coursePackId: string, userId: string) {
    const coursePackWithCourses = await this.db.query.coursePack.findFirst({
      where: and(eq(coursePack.id, coursePackId)),
      with: {
        courses: {
          orderBy: asc(course.order),
        },
      },
    });

    if (!coursePackWithCourses) {
      throw new NotFoundException(`CoursePack with ID ${coursePackId} not found`);
    }

    if (coursePackWithCourses.status === "draft" && coursePackWithCourses.creatorId !== userId) {
      throw new NotFoundException(`CoursePack with ID ${coursePackId} not found`);
    }

    if (coursePackWithCourses.shareLevel === "private") {
      if (coursePackWithCourses.creatorId === userId) {
        return coursePackWithCourses;
      } else {
        throw new NotFoundException(`CoursePack with ID ${coursePackId} not found`);
      }
    } else if (coursePackWithCourses.shareLevel === "founder_only") {
      if (await this.membershipService.isFounderMembership(userId)) {
        return coursePackWithCourses;
      } else {
        throw new NotFoundException(`CoursePack with ID ${coursePackId} not found`);
      }
    } else {
      return coursePackWithCourses;
    }
  }

  private async addCompletionCountsToCourses(userId: string, courses: any[], coursePackId: string) {
    try {
      return await Promise.all(
        courses.map(async (course) => {
          if (!course.id) {
            console.warn("Course without ID found:", course);
            return {
              ...course,
              completionCount: 0,
            };
          }
          const completionCount = await this.courseHistoryService.findCompletionCount(
            userId,
            coursePackId,
            course.id,
          );
          return {
            ...course,
            completionCount,
          };
        }),
      );
    } catch (error) {
      console.error("Error adding completion counts:", error);
      throw error;
    }
  }

  async findCourse(userId: string, coursePackId: string, courseId: string) {
    if (userId) {
      return await this.courseService.findWithUserProgress(coursePackId, courseId, userId);
    } else {
      return await this.courseService.find(coursePackId, courseId);
    }
  }

  async findNextCourse(coursePackId: string, courseId: string) {
    return await this.courseService.findNext(coursePackId, courseId);
  }

  async completeCourse(userId: string, coursePackId: string, courseId: string) {
    return await this.courseService.completeCourse(userId, coursePackId, courseId);
  }

  async uploadCoursePack(userId: string, uploadDto: UploadCoursePackDto) {
    // 计算当前用户的课程包最大 order
    const existingPacks = await this.db.query.coursePack.findMany({
      where: eq(coursePack.creatorId, userId),
      orderBy: asc(coursePack.order),
    });
    const nextOrder =
      existingPacks.length > 0 ? Math.max(...existingPacks.map((p) => p.order)) + 1 : 1;

    // 插入课程包
    const coursePackId = randomUUID();
    return this.db.transaction(async (tx) => {
      await tx.insert(coursePack).values({
        id: coursePackId,
        order: nextOrder,
        title: uploadDto.title,
        description: uploadDto.description,
        creatorId: userId,
        shareLevel: uploadDto.shareLevel ?? "private",
        status: uploadDto.status ?? "draft",
        isFree: true,
        cover: "",
      });

      // 查询刚插入的课程包
      const courseIds: string[] = [];

      // 逐个插入 course 和 statement
      for (const [index, courseUnit] of uploadDto.courses.entries()) {
        await tx.insert(course).values({
          coursePackId,
          order: index + 1,
          title: courseUnit.title,
          description: courseUnit.description,
        });

        const [courseEntity] = await tx
          .select({ id: course.id })
          .from(course)
          .where(and(eq(course.coursePackId, coursePackId), eq(course.order, index + 1)))
          .limit(1);

        courseIds.push(courseEntity.id);

        // 插入 statements
        const statementInserts = courseUnit.data.map((item, sIndex) =>
          tx.insert(statement).values({
            chinese: item.chinese,
            english: item.english,
            soundmark: item.soundmark || "",
            posTags: item.posTags ? JSON.stringify(item.posTags) : null,
            syntaxTags: item.syntaxTags ? JSON.stringify(item.syntaxTags) : null,
            order: sIndex + 1,
            courseId: courseEntity.id,
          }),
        );

        await Promise.all(statementInserts);
      }

      return {
        success: true,
        coursePackId,
        courseIds,
        message: "课程包上传成功",
      };
    });
  }

  async createCoursePack(userId: string, dto: CreateCoursePackDto) {
    const latest = await this.db.query.coursePack.findFirst({
      where: eq(coursePack.creatorId, userId),
      orderBy: desc(coursePack.order),
    });
    const id = randomUUID();
    await this.db.insert(coursePack).values({
      id,
      title: dto.title,
      description: dto.description,
      order: dto.order ?? (latest?.order ?? 0) + 1,
      difficulty: dto.difficulty,
      tags: dto.tags ?? [],
      isFree: dto.isFree ?? true,
      cover: dto.cover ?? "",
      creatorId: userId,
      shareLevel: dto.shareLevel ?? "private",
      status: dto.status ?? "draft",
    });
    return this.findOne(id);
  }

  async updateCoursePack(userId: string, coursePackId: string, dto: UpdateCoursePackDto) {
    await this.creatorGuard.checkCoursePackOwner(userId, coursePackId);

    const data: Record<string, unknown> = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.isFree !== undefined) data.isFree = dto.isFree;
    if (dto.cover !== undefined) data.cover = dto.cover;
    if (dto.shareLevel !== undefined) data.shareLevel = dto.shareLevel;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.difficulty !== undefined) data.difficulty = dto.difficulty;
    if (dto.tags !== undefined) data.tags = dto.tags;

    if (Object.keys(data).length === 0) {
      throw new NotFoundException("没有需要更新的字段");
    }

    await this.db.update(coursePack).set(data).where(eq(coursePack.id, coursePackId));

    return this.findOne(coursePackId);
  }

  async deleteCoursePack(userId: string, coursePackId: string) {
    await this.creatorGuard.checkCoursePackOwner(userId, coursePackId);

    // 级联删除 courses 和 statements
    const courses = await this.db.query.course.findMany({
      where: eq(course.coursePackId, coursePackId),
    });

    for (const c of courses) {
      await this.db.delete(statement).where(eq(statement.courseId, c.id));
    }
    await this.db.delete(course).where(eq(course.coursePackId, coursePackId));
    await this.db.delete(coursePack).where(eq(coursePack.id, coursePackId));

    return { success: true, message: "课程包已删除" };
  }
}
