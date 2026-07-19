import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { and, asc, eq, or } from "drizzle-orm";

import { course, coursePack, statement } from "@earthworm/schema";
import { CourseHistoryService } from "../course-history/course-history.service";
import { CourseService } from "../course/course.service";
import { DB, DbType } from "../global/providers/db.provider";
import { MembershipService } from "../membership/membership.service";
import { UploadCoursePackDto } from "./dto/upload-course-pack.dto";

@Injectable()
export class CoursePackService {
  constructor(
    @Inject(DB) private db: DbType,
    private readonly courseService: CourseService,
    private readonly courseHistoryService: CourseHistoryService,
    private readonly membershipService: MembershipService,
  ) {}

  async findAll(userId?: string) {
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

    return result;
  }

  async findFounderOnly() {
    const coursePacks = await this.db.query.coursePack.findMany({
      orderBy: asc(coursePack.order),
      where: and(eq(coursePack.shareLevel, "founder_only")), // TODO 缺一个 shareLevel 的枚举类型
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

  async findAllPublicCoursePacks() {
    return await this.db.query.coursePack.findMany({
      orderBy: asc(coursePack.order),
      where: eq(coursePack.shareLevel, "public"),
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
    await this.db.insert(coursePack).values({
      order: nextOrder,
      title: uploadDto.title,
      description: uploadDto.description,
      creatorId: userId,
      shareLevel: "public",
      isFree: true,
      cover: "",
    });

    // 查询刚插入的课程包
    const [coursePackEntity] = await this.db
      .select()
      .from(coursePack)
      .where(and(eq(coursePack.creatorId, userId), eq(coursePack.title, uploadDto.title)))
      .orderBy(asc(coursePack.order))
      .limit(1);

    const courseIds: string[] = [];

    // 逐个插入 course 和 statement
    for (const [index, courseUnit] of uploadDto.courses.entries()) {
      await this.db.insert(course).values({
        coursePackId: coursePackEntity.id,
        order: index + 1,
        title: courseUnit.title,
        description: courseUnit.description,
      });

      const [courseEntity] = await this.db
        .select({ id: course.id })
        .from(course)
        .where(and(eq(course.coursePackId, coursePackEntity.id), eq(course.order, index + 1)))
        .limit(1);

      courseIds.push(courseEntity.id);

      // 插入 statements
      const statementInserts = courseUnit.data.map((item, sIndex) =>
        this.db.insert(statement).values({
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
      coursePackId: coursePackEntity.id,
      courseIds,
      message: "课程包上传成功",
    };
  }
}
