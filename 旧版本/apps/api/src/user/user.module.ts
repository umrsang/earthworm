import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { MembershipModule } from "../membership/membership.module";
import { UserCourseProgressModule } from "../user-course-progress/user-course-progress.module";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

@Module({
  imports: [AuthModule, UserCourseProgressModule, MembershipModule],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
