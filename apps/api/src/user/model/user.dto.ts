import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, Length } from "class-validator";

export class RegisterDto {
  @ApiProperty({
    example: "admin",
    description: "用户名不能为空,长度为2-20位",
  })
  @IsNotEmpty({ message: "用户名不能为空" })
  @Length(2, 20, { message: "用户名长度为2-20位" })
  username: string;

  @ApiProperty({
    example: "123456",
    description: "密码不能为空,长度应在6-20位之间",
  })
  @IsNotEmpty({ message: "密码不能为空" })
  @Length(6, 20, { message: "密码长度为6-20位" })
  password: string;
}

export class LoginDto {
  @ApiProperty({
    example: "admin",
    description: "用户名不能为空",
  })
  @IsNotEmpty({ message: "用户名不能为空" })
  username: string;

  @ApiProperty({
    example: "123456",
    description: "密码不能为空",
  })
  @IsNotEmpty({ message: "密码不能为空" })
  password: string;
}

export class UpdateUserDto {
  @ApiProperty({
    example: "admin",
    description: "用户名不能为空,长度为2-20位",
  })
  @IsNotEmpty({ message: "用户名不能为空" })
  @Length(2, 20, { message: "用户名长度为2-20位" })
  username: string;

  avatar: string;
}
