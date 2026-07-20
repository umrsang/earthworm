import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from "@nestjs/common";

import { AuthGuard, UncheckAuth } from "../guards/auth.guard";
import { User, UserEntity } from "../user/user.decorators";
import { CoursePackService } from "./course-pack.service";
import { UpdateCoursePackDto } from "./dto/update-course-pack.dto";
import { UploadCoursePackDto } from "./dto/upload-course-pack.dto";

@Controller("course-pack")
export class CoursePackController {
  constructor(private readonly coursePackService: CoursePackService) {}

  @UncheckAuth()
  @UseGuards(AuthGuard)
  @Get()
  async findAll(@User() user: UserEntity) {
    return await this.coursePackService.findAll(user.userId);
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
