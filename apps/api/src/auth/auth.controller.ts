import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto, RegisterDto } from "./dto/auth.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 用户注册接口
   * @param dto.username 用户登录名 (必填，3-32位)
   * @param dto.password 用户密码 (必填，6-64位)
   * @param dto.email 电子邮箱 (选填)
   * @param dto.nickname 用户昵称 (选填)
   * @returns 注册成功的用户信息以及自动签发的 JWT Token
   */
  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /**
   * 用户登录接口
   * @param dto.username 用户名 (必填)
   * @param dto.password 密码 (必填)
   * @returns 包含 userId, username, nickname, token 的登录结果
   */
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
