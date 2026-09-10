import { IsArray, IsBoolean, IsIn, IsOptional, IsString } from "class-validator";

export class UpdateCoursePackDto {
  @IsOptional()
  @IsString()
  title?: string;
  @IsOptional()
  @IsString()
  description?: string;
  @IsOptional()
  @IsBoolean()
  isFree?: boolean;
  @IsOptional()
  @IsString()
  cover?: string;
  @IsOptional()
  @IsIn(["public", "private", "founder_only"])
  shareLevel?: "public" | "private" | "founder_only";
  @IsOptional()
  @IsIn(["draft", "published"])
  status?: "draft" | "published";
  @IsOptional()
  @IsString()
  difficulty?: string;
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
