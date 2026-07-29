import { IsArray, IsInt, IsOptional, IsString, Min } from "class-validator";

export class CreateStatementDto {
  @IsString()
  chinese: string;

  @IsString()
  english: string;

  @IsOptional()
  @IsString()
  soundmark?: string;

  @IsOptional()
  @IsArray()
  posTags?: number[][];

  @IsOptional()
  @IsArray()
  syntaxTags?: (string | number)[][];

  @IsOptional()
  @IsInt()
  @Min(1)
  order?: number;
}
