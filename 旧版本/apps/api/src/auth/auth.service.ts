import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import { eq } from "drizzle-orm";

import { user } from "@earthworm/schema";
import { DB, DbType } from "../global/providers/db.provider";

@Injectable()
export class AuthService {
  constructor(
    @Inject(DB) private db: DbType,
    private readonly jwtService: JwtService,
  ) {}

  async register(username: string, password: string) {
    const existing = await this.db.query.user.findFirst({
      where: eq(user.username, username),
    });

    if (existing) {
      throw new UnauthorizedException("用户名已存在");
    }

    const hashedPassword = await argon2.hash(password);

    const [newUser] = await this.db
      .insert(user)
      .values({
        username,
        password: hashedPassword,
      })
      .$returningId();

    const token = this.generateToken(newUser.id);

    return {
      userId: newUser.id,
      username,
      token,
    };
  }

  async login(username: string, password: string) {
    const foundUser = await this.db.query.user.findFirst({
      where: eq(user.username, username),
    });

    if (!foundUser) {
      throw new UnauthorizedException("用户名或密码错误");
    }

    const isPasswordValid = await argon2.verify(foundUser.password, password);

    if (!isPasswordValid) {
      throw new UnauthorizedException("用户名或密码错误");
    }

    const token = this.generateToken(foundUser.id);

    return {
      userId: foundUser.id,
      username: foundUser.username,
      token,
    };
  }

  async validateUser(userId: string) {
    const foundUser = await this.db.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (!foundUser) {
      throw new UnauthorizedException("用户不存在");
    }

    return foundUser;
  }

  private generateToken(userId: string) {
    return this.jwtService.sign({ sub: userId });
  }
}
