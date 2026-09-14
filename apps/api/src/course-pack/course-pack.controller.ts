import { Body, Controller, Get, Param, Post, Put, Request, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CoursePackService } from "./course-pack.service";
import { CreateCoursePackDto, SaveCourseProgressDto } from "./dto/course-pack.dto";

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
