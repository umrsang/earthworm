import { Body, Controller, Get, Patch, Post, UseGuards } from "@nestjs/common";

import { AuthService } from "../auth/auth.service";
import { AuthGuard } from "../guards/auth.guard";
import { User, UserEntity } from "../user/user.decorators";
import { LoginDto, RegisterDto, UpdateUserDto } from "./model/user.dto";
import { UserService } from "./user.service";

@Controller("user")
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post("register")
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.username, dto.password);
  }

  @Post("login")
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.username, dto.password);
  }

  @UseGuards(AuthGuard)
  @Patch()
  updateInfo(@User() user: UserEntity, @Body() dto: UpdateUserDto) {
    return this.userService.updateUser(user, dto);
  }

  @UseGuards(AuthGuard)
  @Get()
  async getCurrentUser(@User() user: UserEntity) {
    const userInfo = await this.userService.findCurrentUser(user.userId);
    return userInfo;
  }

  @UseGuards(AuthGuard)
  @Post("setup")
  async initializeUser(@User() user: UserEntity, @Body() dto: UpdateUserDto) {
    return this.userService.setupNewUser(user, dto);
  }
}
