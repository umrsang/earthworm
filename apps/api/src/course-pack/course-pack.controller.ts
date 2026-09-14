import { Body, Controller, Delete, Get, Param, Post, Put, Query, Request, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CoursePackService } from "./course-pack.service";
import {
  CreateCoursePackDto,
  DashboardQueryDto,
  SaveCourseProgressDto,
  SaveLearningActivitiesDto,
} from "./dto/course-pack.dto";

@UseGuards(JwtAuthGuard)
@Controller("course-packs")
export class CoursePackController {
  constructor(private readonly coursePackService: CoursePackService) {}

  /**
   * 上传解析后的课程包。
   * @param req.user 当前 JWT 用户上下文
   * @param dto 课程包、课程和句子数据
   */
  @Post()
  create(@Request() req: any, @Body() dto: CreateCoursePackDto) {
    return this.coursePackService.create(req.user.userId, dto);
  }

  /**
   * 批量记录答题与有效学习时长。
   * @param req.user 当前 JWT 用户上下文
   * @param dto 客户端幂等事件列表与浏览器时区偏移
   * @returns 本批请求中首次写入的事件数量
   */
  @Post("learning-activities")
  saveLearningActivities(@Request() req: any, @Body() dto: SaveLearningActivitiesDto) {
    return this.coursePackService.saveLearningActivities(req.user.userId, dto);
  }

  /**
   * 获取首页真实统计、最近学习和进度管理数据。
   * @param req.user 当前 JWT 用户上下文
   * @param query 浏览器时区偏移
   */
  @Get("dashboard")
  getDashboard(@Request() req: any, @Query() query: DashboardQueryDto) {
    return this.coursePackService.getDashboard(req.user.userId, query.timezoneOffset);
  }

  /** 获取当前用户的课程包列表。 */
  @Get()
  findAll(@Request() req: any) {
    return this.coursePackService.findAll(req.user.userId);
  }

  /** 获取课程包及课程目录。 */
  @Get(":coursePackId")
  findOne(@Request() req: any, @Param("coursePackId") coursePackId: string) {
    return this.coursePackService.findOne(req.user.userId, coursePackId);
  }

  /** 获取课程及其句子。 */
  @Get(":coursePackId/courses/:courseId")
  findCourse(
    @Request() req: any,
    @Param("coursePackId") coursePackId: string,
    @Param("courseId") courseId: string,
  ) {
    return this.coursePackService.findCourse(req.user.userId, coursePackId, courseId);
  }

  /** 保存当前课程的句子位置。 */
  @Put(":coursePackId/progress")
  saveProgress(
    @Request() req: any,
    @Param("coursePackId") coursePackId: string,
    @Body() dto: SaveCourseProgressDto,
  ) {
    return this.coursePackService.saveProgress(req.user.userId, coursePackId, dto);
  }

  /**
   * 重置指定课程的当前位置和完成记录，保留历史学习统计。
   * @param req.user 当前 JWT 用户上下文
   * @param coursePackId 课程包 ID
   * @param courseId 课程 ID
   */
  @Delete(":coursePackId/courses/:courseId/progress")
  resetCourseProgress(
    @Request() req: any,
    @Param("coursePackId") coursePackId: string,
    @Param("courseId") courseId: string,
  ) {
    return this.coursePackService.resetCourseProgress(req.user.userId, coursePackId, courseId);
  }

  /**
   * 重置课程包的当前位置和全部课程完成记录，保留历史学习统计。
   * @param req.user 当前 JWT 用户上下文
   * @param coursePackId 课程包 ID
   */
  @Delete(":coursePackId/progress")
  resetCoursePackProgress(@Request() req: any, @Param("coursePackId") coursePackId: string) {
    return this.coursePackService.resetCoursePackProgress(req.user.userId, coursePackId);
  }

  /** 记录课程完成次数并获取下一课。 */
  @Post(":coursePackId/courses/:courseId/complete")
  completeCourse(
    @Request() req: any,
    @Param("coursePackId") coursePackId: string,
    @Param("courseId") courseId: string,
  ) {
    return this.coursePackService.completeCourse(req.user.userId, coursePackId, courseId);
  }
}
