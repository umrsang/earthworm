import { Module } from "@nestjs/common";

import { CourseHistoryService } from "../course-history/course-history.service";
import { GlobalModule } from "../global/global.module";
import { CreatorGuard } from "../guards/creator.guard";
import { MembershipModule } from "../membership/membership.module";
import { RankService } from "../rank/rank.service";
import { UserCourseProgressService } from "../user-course-progress/user-course-progress.service";
import { UserModule } from "../user/user.module";
import { CourseController } from "./course.controller";
import { CourseService } from "./course.service";

@Module({
  imports: [GlobalModule, UserModule, MembershipModule],
  providers: [
    CourseService,
    UserCourseProgressService,
    RankService,
    CourseHistoryService,
    CreatorGuard,
  ],
  controllers: [CourseController],
  exports: [CourseService],
})
export class CourseModule {}
