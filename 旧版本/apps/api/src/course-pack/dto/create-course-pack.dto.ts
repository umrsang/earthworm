import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Min,
} from "class-validator";

export class CreateCoursePackDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 255)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  order?: number;

  @IsOptional()
  @IsString()
  difficulty?: string;

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
  @IsString({ each: true })
  tags?: string[];
}
