import { IsInt, IsOptional, IsString, Length, Min } from "class-validator";

export class CreateCourseDto {
  @IsString()
  @Length(1, 255)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  video?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  order?: number;
}
