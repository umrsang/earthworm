import { Module } from "@nestjs/common";

import {
  CourseLibraryController,
  DailyPlanController,
  InsightsController,
  LearningAttemptsController,
  NotificationsController,
  PreferencesController,
  ReviewController,
} from "./learning-experience.controller";
import { LearningExperienceService } from "./learning-experience.service";

@Module({
  controllers: [
    LearningAttemptsController,
    ReviewController,
    DailyPlanController,
    CourseLibraryController,
    PreferencesController,
    NotificationsController,
    InsightsController,
  ],
  providers: [LearningExperienceService],
})
export class LearningExperienceModule {}
