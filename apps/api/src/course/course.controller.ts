import { Body, Controller, Delete, Param, Post, Put, UseGuards } from "@nestjs/common";

import { AuthGuard } from "../guards/auth.guard";
import { User, UserEntity } from "../user/user.decorators";
import { CourseService } from "./course.service";
import { CreateCourseDto } from "./dto/create-course.dto";
import { UpdateCourseDto } from "./dto/update-course.dto";

@Controller("course")
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @UseGuards(AuthGuard)
  @Post("course-pack/:coursePackId")
  async create(
    @User() user: UserEntity,
    @Param("coursePackId") coursePackId: string,
    @Body() dto: CreateCourseDto,
  ) {
    return this.courseService.create(user.userId, coursePackId, dto);
  }

  @UseGuards(AuthGuard)
  @Put(":courseId")
  async update(
    @User() user: UserEntity,
    @Param("courseId") courseId: string,
    @Body() dto: UpdateCourseDto,
  ) {
    return this.courseService.update(user.userId, courseId, dto);
  }

  @UseGuards(AuthGuard)
  @Delete(":courseId")
  async delete(@User() user: UserEntity, @Param("courseId") courseId: string) {
    return this.courseService.delete(user.userId, courseId);
  }
}
