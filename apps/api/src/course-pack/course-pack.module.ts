import { Module } from "@nestjs/common";
import { CoursePackController } from "./course-pack.controller";
import { CoursePackService } from "./course-pack.service";

@Module({
  controllers: [CoursePackController],
  providers: [CoursePackService],
})
export class CoursePackModule {}
