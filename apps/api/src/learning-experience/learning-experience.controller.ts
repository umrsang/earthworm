import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from "@nestjs/common";
import { Response } from "express";

import { AuthGuard } from "../guards/auth.guard";
import { User, UserEntity } from "../user/user.decorators";
import {
  CreateNotificationDto,
  FavoriteDto,
  RecordAttemptDto,
  ReviewQueryDto,
  ReviewResultDto,
  SnoozeReviewDto,
  UpdateDailyPlanDto,
  UpdatePreferencesDto,
} from "./learning-experience.dto";
import { LearningExperienceService } from "./learning-experience.service";

@UseGuards(AuthGuard)
@Controller("learning-attempts")
export class LearningAttemptsController {
  constructor(private readonly service: LearningExperienceService) {}
  @Post()
  record(@User() user: UserEntity, @Body() dto: RecordAttemptDto) {
    return this.service.recordAttempt(user.userId, dto);
  }
  @Get()
  list(@User() user: UserEntity, @Query("onlyWrong") onlyWrong?: string) {
    return this.service.getAttempts(user.userId, onlyWrong === "true");
  }
}

@UseGuards(AuthGuard)
@Controller("review")
export class ReviewController {
  constructor(private readonly service: LearningExperienceService) {}
  @Get()
  list(@User() user: UserEntity, @Query() query: ReviewQueryDto) {
    return this.service.getReviewItems(user.userId, query.type);
  }
  @Post(":id/result")
  review(@User() user: UserEntity, @Param("id") id: string, @Body() dto: ReviewResultDto) {
    return this.service.review(user.userId, id, dto.isCorrect);
  }
  @Patch(":id/snooze")
  snooze(@User() user: UserEntity, @Param("id") id: string, @Body() dto: SnoozeReviewDto) {
    return this.service.snoozeReview(user.userId, id, dto.days);
  }
}

@UseGuards(AuthGuard)
@Controller("daily-plan")
export class DailyPlanController {
  constructor(private readonly service: LearningExperienceService) {}
  @Get()
  get(@User() user: UserEntity, @Query("date") date?: string) {
    return this.service.getDailyPlan(user.userId, date ?? new Date().toISOString().slice(0, 10));
  }
  @Put()
  update(@User() user: UserEntity, @Body() dto: UpdateDailyPlanDto) {
    return this.service.updateDailyPlan(user.userId, dto);
  }
}

@UseGuards(AuthGuard)
@Controller("course-library")
export class CourseLibraryController {
  constructor(private readonly service: LearningExperienceService) {}
  @Get()
  list(@User() user: UserEntity) {
    return this.service.getLibrary(user.userId);
  }
  @Post(":coursePackId/enroll")
  enroll(@User() user: UserEntity, @Param("coursePackId") id: string) {
    return this.service.enroll(user.userId, id);
  }
  @Put(":coursePackId/favorite")
  favorite(@User() user: UserEntity, @Param("coursePackId") id: string, @Body() dto: FavoriteDto) {
    return this.service.favorite(user.userId, id, dto.isFavorite);
  }
}

@UseGuards(AuthGuard)
@Controller("preferences")
export class PreferencesController {
  constructor(private readonly service: LearningExperienceService) {}
  @Get()
  get(@User() user: UserEntity) {
    return this.service.getPreferences(user.userId);
  }
  @Put()
  update(@User() user: UserEntity, @Body() dto: UpdatePreferencesDto) {
    return this.service.updatePreferences(user.userId, dto.settings);
  }
  @Post("reset")
  reset(@User() user: UserEntity) {
    return this.service.resetPreferences(user.userId);
  }
}

@UseGuards(AuthGuard)
@Controller("notifications")
export class NotificationsController {
  constructor(private readonly service: LearningExperienceService) {}
  @Get()
  list(@User() user: UserEntity) {
    return this.service.getNotifications(user.userId);
  }
  @Post()
  create(@User() user: UserEntity, @Body() dto: CreateNotificationDto) {
    return this.service.createNotification(user.userId, dto);
  }
  @Patch("read-all")
  readAll(@User() user: UserEntity) {
    return this.service.readAllNotifications(user.userId);
  }
  @Patch(":id/read")
  read(@User() user: UserEntity, @Param("id") id: string) {
    return this.service.readNotification(user.userId, id);
  }
}

@UseGuards(AuthGuard)
@Controller("insights")
export class InsightsController {
  constructor(private readonly service: LearningExperienceService) {}
  @Get("summary")
  summary(@User() user: UserEntity, @Query("from") from?: string, @Query("to") to?: string) {
    return this.service.getInsights(user.userId, from, to);
  }
  @Get("weak-points")
  weakPoints(@User() user: UserEntity) {
    return this.service.getWeakPoints(user.userId);
  }
  @Get("export.csv")
  async exportCsv(@User() user: UserEntity, @Res() response: Response) {
    const attempts = await this.service.getAttempts(user.userId);
    const escape = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const rows = [
      [
        "attemptedAt",
        "coursePackId",
        "courseId",
        "statementId",
        "answer",
        "isCorrect",
        "hintUsed",
        "durationMs",
      ],
      ...attempts.map((item) => [
        item.attemptedAt.toISOString(),
        item.coursePackId,
        item.courseId,
        item.statementId,
        item.answer,
        item.isCorrect,
        item.hintUsed,
        item.durationMs,
      ]),
    ];
    response
      .type("text/csv")
      .attachment(`earthworm-insights-${new Date().toISOString().slice(0, 10)}.csv`)
      .send(`\uFEFF${rows.map((row) => row.map(escape).join(",")).join("\n")}`);
  }
}
