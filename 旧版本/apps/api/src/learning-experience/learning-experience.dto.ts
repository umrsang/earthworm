import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

export class RecordAttemptDto {
  @IsString()
  coursePackId: string;
  @IsString()
  courseId: string;
  @IsString()
  statementId: string;
  @IsString()
  answer: string;
  @IsBoolean()
  isCorrect: boolean;
  @IsOptional()
  @IsBoolean()
  hintUsed?: boolean;
  @IsOptional()
  @IsInt()
  @Min(0)
  durationMs?: number;
}

export class ReviewResultDto {
  @IsBoolean()
  isCorrect: boolean;
}

export class SnoozeReviewDto {
  @IsInt()
  @Min(1)
  @Max(30)
  days: number;
}

export class UpdateDailyPlanDto {
  @IsString()
  date: string;
  @IsInt()
  @Min(1)
  @Max(500)
  goalStatements: number;
  @IsOptional()
  @IsInt()
  @Min(0)
  completedStatements?: number;
  @IsArray()
  items: Record<string, unknown>[];
}

export class FavoriteDto {
  @IsBoolean()
  isFavorite: boolean;
}

export class UpdatePreferencesDto {
  @IsObject()
  settings: Record<string, unknown>;
}

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  type: string;
  @IsString()
  @IsNotEmpty()
  title: string;
  @IsOptional()
  @IsString()
  content?: string;
  @IsOptional()
  @IsString()
  actionUrl?: string;
}

export class ReviewQueryDto {
  @IsOptional()
  @IsIn(["due", "wrong", "all"])
  type?: "due" | "wrong" | "all";
}
