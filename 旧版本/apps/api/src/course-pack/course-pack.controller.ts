import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";

import { AuthGuard, UncheckAuth } from "../guards/auth.guard";
import { User, UserEntity } from "../user/user.decorators";
import { CoursePackService } from "./course-pack.service";
import { CoursePackQueryDto } from "./dto/course-pack-query.dto";
import { CreateCoursePackDto } from "./dto/create-course-pack.dto";
import { UpdateCoursePackDto } from "./dto/update-course-pack.dto";
import { UploadCoursePackDto } from "./dto/upload-course-pack.dto";

@Controller("course-pack")
export class CoursePackController {
  constructor(private readonly coursePackService: CoursePackService) {}

  @UncheckAuth()
  @UseGuards(AuthGuard)
  @Get()
  async findAll(@User() user: UserEntity, @Query() query: CoursePackQueryDto) {
    return await this.coursePackService.findAll(user.userId, query);
  }

  @UseGuards(AuthGuard)
  @Get("creator/mine")
  async findMine(@User() user: UserEntity) {
    return this.coursePackService.findAllCreatedBy(user.userId);
  }

  @UseGuards(AuthGuard)
  @Get("creator/summary")
  async creatorSummary(@User() user: UserEntity) {
    return this.coursePackService.getCreatorSummary(user.userId);
  }

  @UncheckAuth()
  @UseGuards(AuthGuard)
  @Get(":coursePackId")
  async findOne(@User() user: UserEntity, @Param("coursePackId") coursePackId: string) {
    return await this.coursePackService.findOneWithCourses(user.userId, coursePackId);
  }

  @UncheckAuth()
  @UseGuards(AuthGuard)
  @Get(":coursePackId/courses/:courseId")
  findCourse(
    @User() user: UserEntity,
    @Param("coursePackId") coursePackId: string,
    @Param("courseId") courseId: string,
  ) {
    return this.coursePackService.findCourse(user.userId, coursePackId, courseId);
  }

  @UncheckAuth()
  @UseGuards(AuthGuard)
  @Get(":coursePackId/courses/:courseId/next")
  findNextCourse(@Param("coursePackId") coursePackId: string, @Param("courseId") courseId: string) {
    return this.coursePackService.findNextCourse(coursePackId, courseId);
  }

  @UseGuards(AuthGuard)
  @Post(":coursePackId/courses/:courseId/complete")
  CompleteCourse(
    @User() user: UserEntity,
    @Param("coursePackId") coursePackId: string,
    @Param("courseId") courseId: string,
  ) {
    return this.coursePackService.completeCourse(user.userId, coursePackId, courseId);
  }

  @UseGuards(AuthGuard)
  @Post()
  async createCoursePack(@User() user: UserEntity, @Body() dto: CreateCoursePackDto) {
    return this.coursePackService.createCoursePack(user.userId, dto);
  }

  @UseGuards(AuthGuard)
  @Post("upload")
  async uploadCoursePack(@User() user: UserEntity, @Body() uploadDto: UploadCoursePackDto) {
    return await this.coursePackService.uploadCoursePack(user.userId, uploadDto);
  }

  @UseGuards(AuthGuard)
  @Put(":coursePackId")
  async updateCoursePack(
    @User() user: UserEntity,
    @Param("coursePackId") coursePackId: string,
    @Body() dto: UpdateCoursePackDto,
  ) {
    return this.coursePackService.updateCoursePack(user.userId, coursePackId, dto);
  }

  @UseGuards(AuthGuard)
  @Delete(":coursePackId")
  async deleteCoursePack(@User() user: UserEntity, @Param("coursePackId") coursePackId: string) {
    return this.coursePackService.deleteCoursePack(user.userId, coursePackId);
  }
}
