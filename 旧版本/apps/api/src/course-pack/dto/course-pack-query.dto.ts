import { IsIn, IsOptional, IsString } from "class-validator";

export class CoursePackQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  difficulty?: string;

  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsIn(["newest", "oldest", "order"])
  sort?: "newest" | "oldest" | "order";
}
