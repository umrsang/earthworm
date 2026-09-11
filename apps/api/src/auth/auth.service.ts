import { ConflictException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import { eq } from "drizzle-orm";
import type { AppDatabase } from "@jufun/db";
import { user } from "@jufun/schema";

import { DB_TOKEN, ERROR_MESSAGES, LOG_EVENTS } from "../common/constants";
import { FileLoggerService } from "../common/logging/file-logger.service";
import { LoginDto, RegisterDto } from "./dto/auth.dto";

@Injectable()
export class AuthService {
  constructor(
    @Inject(DB_TOKEN) private readonly db: AppDatabase,
    private readonly jwtService: JwtService,
    private readonly logger: FileLoggerService,
  ) {}

  /**
   * 用户注册
   * @param dto 注册参数，包含 username, password, email, nickname
   * @returns 注册成功的用户信息和 JWT Token
   */
  async register(dto: RegisterDto) {
    // 1. 检查用户名是否已被注册
    const existingUser = await this.db.query.user.findFirst({
      where: eq(user.username, dto.username),
    });

    if (existingUser) {
      throw new ConflictException(ERROR_MESSAGES.USER_ALREADY_EXISTS);
    }

    // 2. 采用现代 Argon2 算法对密码进行安全哈希加盐
    const hashedPassword = await argon2.hash(dto.password);

    // 3. 写入用户表
    const [inserted] = await this.db
      .insert(user)
      .values({
        username: dto.username,
        password: hashedPassword,
        email: dto.email || null,
        nickname: dto.nickname || dto.username,
      })
      .returning();

    // 4. 为新注册用户即时签发 JWT Token，便于注册后直接进入系统
    const token = this.generateToken(inserted.id, inserted.username);

    return {
      userId: inserted.id,
      username: inserted.username,
      nickname: inserted.nickname,
      email: inserted.email,
      token,
    };
  }

  /**
   * 用户登录校验
   * @param dto 登录参数，包含 username 和 password
   * @returns 登录成功的用户信息和 JWT Token
   */
  async login(dto: LoginDto) {
    this.logger.log({ event: LOG_EVENTS.LOGIN_ATTEMPTED, username: dto.username }, AuthService.name);

    // 1. 查询目标用户
    const foundUser = await this.db.query.user.findFirst({
      where: eq(user.username, dto.username),
    });

    if (!foundUser) {
      this.logger.warn(
        { event: LOG_EVENTS.LOGIN_FAILED, username: dto.username, reason: "user_not_found" },
        AuthService.name,
      );
      throw new UnauthorizedException(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // 2. 校验密码哈希
    const isPasswordValid = await argon2.verify(foundUser.password, dto.password);
    if (!isPasswordValid) {
      this.logger.warn(
        { event: LOG_EVENTS.LOGIN_FAILED, username: dto.username, reason: "invalid_password" },
        AuthService.name,
      );
      throw new UnauthorizedException(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // 3. 签发登录凭据
    const token = this.generateToken(foundUser.id, foundUser.username);
    this.logger.log(
      { event: LOG_EVENTS.LOGIN_SUCCEEDED, userId: foundUser.id, username: foundUser.username },
      AuthService.name,
    );

    return {
      userId: foundUser.id,
      username: foundUser.username,
      nickname: foundUser.nickname,
      email: foundUser.email,
      token,
    };
  }

  /**
   * 生成 JWT 访问令牌
   * @param userId 用户 ID
   * @param username 用户名
   */
  private generateToken(userId: string, username: string): string {
    return this.jwtService.sign({
      sub: userId,
      username,
    });
  }
}
