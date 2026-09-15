import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength } from "class-validator";

export class SaveAiModelDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  name!: string;

  @IsUrl({ require_tld: false })
  @MaxLength(512)
  baseUrl!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  model!: string;

  @IsOptional()
  @IsString()
  apiKey?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
