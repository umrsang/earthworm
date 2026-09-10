import { Controller, Get, Request, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { UserService } from "./user.service";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 获取当前登录用户的个人资料信息
   * @param req.user 经 JWT 认证守卫提取的用户上下文（包含 userId, username）
   * @returns 用户 ID、用户名、昵称、邮箱、创建时间等详细资料
   */
  @UseGuards(JwtAuthGuard)
  @Get("profile")
  async getProfile(@Request() req: any) {
    return this.userService.findProfileById(req.user.userId);
  }
}
