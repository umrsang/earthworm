import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from "class-validator";

export class UploadCoursePackDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsString()
  @Length(1, 255)
  title: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsIn(["draft", "published"])
  status?: "draft" | "published";

  @IsOptional()
  @IsIn(["public", "private", "founder_only"])
  shareLevel?: "public" | "private" | "founder_only";

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => CourseUnitDto)
  courses: CourseUnitDto[];
}

export class CourseUnitDto {
  @IsString()
  @Length(1, 255)
  title: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  dataFile: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(2000)
  @ValidateNested({ each: true })
  @Type(() => CourseDataItem)
  data: CourseDataItem[];
}

export class CourseDataItem {
  @IsString()
  @IsNotEmpty()
  chinese: string;

  @IsString()
  @IsNotEmpty()
  english: string;

  @IsOptional()
  @IsString()
  soundmark: string;

  @IsOptional()
  @IsArray()
  posTags?: number[][];

  @IsOptional()
  @IsArray()
  syntaxTags?: (string | number)[][];
}
