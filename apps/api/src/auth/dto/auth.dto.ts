import { IsEmail, IsNotEmpty, IsOptional, IsString, Length } from "class-validator";
import { AUTH_CONSTANTS } from "../../common/constants";

/**
 * 用户注册请求参数 DTO
 */
export class RegisterDto {
  /** 用户名：长度在 3-32 字符之间 */
  @IsString({ message: "用户名必须为字符串" })
  @IsNotEmpty({ message: "用户名不能为空" })
  @Length(AUTH_CONSTANTS.USERNAME_MIN_LENGTH, AUTH_CONSTANTS.USERNAME_MAX_LENGTH, {
    message: `用户名长度须在 ${AUTH_CONSTANTS.USERNAME_MIN_LENGTH} 到 ${AUTH_CONSTANTS.USERNAME_MAX_LENGTH} 位之间`,
  })
  username: string;

  /** 登录密码：长度在 6-64 字符之间 */
  @IsString({ message: "密码必须为字符串" })
  @IsNotEmpty({ message: "密码不能为空" })
  @Length(AUTH_CONSTANTS.PASSWORD_MIN_LENGTH, AUTH_CONSTANTS.PASSWORD_MAX_LENGTH, {
    message: `密码长度须在 ${AUTH_CONSTANTS.PASSWORD_MIN_LENGTH} 到 ${AUTH_CONSTANTS.PASSWORD_MAX_LENGTH} 位之间`,
  })
  password: string;

  /** 电子邮箱（选填） */
  @IsOptional()
  @IsEmail({}, { message: "邮箱格式不正确" })
  email?: string;

  /** 昵称（选填） */
  @IsOptional()
  @IsString({ message: "昵称必须为字符串" })
  nickname?: string;
}

/**
 * 用户登录请求参数 DTO
 */
export class LoginDto {
  /** 用户名 */
  @IsString({ message: "用户名必须为字符串" })
  @IsNotEmpty({ message: "用户名不能为空" })
  username: string;

  /** 登录密码 */
  @IsString({ message: "密码必须为字符串" })
  @IsNotEmpty({ message: "密码不能为空" })
  password: string;
}
