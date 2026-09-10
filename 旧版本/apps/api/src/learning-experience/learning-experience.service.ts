import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { and, asc, desc, eq, gte, lte } from "drizzle-orm";

import {
  course,
  dailyPlan,
  learningAttempt,
  notification,
  reviewItem,
  statement,
  userCourseLibrary,
  userLearningActivities,
  userPreference,
} from "@earthworm/schema";
import { DB, DbType } from "../global/providers/db.provider";
import {
  CreateNotificationDto,
  RecordAttemptDto,
  UpdateDailyPlanDto,
} from "./learning-experience.dto";

const DEFAULT_SETTINGS = {
  dailyGoal: 20,
  autoNext: true,
  errorTips: true,
  sound: true,
  pronunciation: "us",
  submitKey: "enter",
  theme: "system",
  notifications: { review: true, dailyPlan: true },
};

@Injectable()
export class LearningExperienceService {
  constructor(@Inject(DB) private db: DbType) {}

  async recordAttempt(userId: string, dto: RecordAttemptDto) {
    const source = await this.db
      .select({ statementId: statement.id })
      .from(statement)
      .innerJoin(course, eq(statement.courseId, course.id))
      .where(
        and(
          eq(statement.id, dto.statementId),
          eq(statement.courseId, dto.courseId),
          eq(course.coursePackId, dto.coursePackId),
        ),
      )
      .limit(1);
    if (!source.length) throw new BadRequestException("语句与课程来源不匹配");

    const attemptedAt = new Date();
    await this.db.insert(learningAttempt).values({
      userId,
      ...dto,
      hintUsed: dto.hintUsed ?? false,
      durationMs: dto.durationMs ?? 0,
      attemptedAt,
    });

    const current = await this.db.query.reviewItem.findFirst({
      where: and(eq(reviewItem.userId, userId), eq(reviewItem.statementId, dto.statementId)),
    });
    const mastery = Math.max(
      0,
      Math.min(100, (current?.mastery ?? 0) + (dto.isCorrect ? 20 : -15)),
    );
    const intervalDays = dto.isCorrect
      ? Math.min(60, Math.max(1, (current?.intervalDays ?? 1) * 2))
      : 1;
    const dueAt = new Date(attemptedAt);
    dueAt.setDate(dueAt.getDate() + intervalDays);
    await this.db
      .insert(reviewItem)
      .values({
        userId,
        coursePackId: dto.coursePackId,
        courseId: dto.courseId,
        statementId: dto.statementId,
        mastery,
        intervalDays,
        wrongCount: dto.isCorrect ? current?.wrongCount ?? 0 : (current?.wrongCount ?? 0) + 1,
        dueAt,
        lastReviewedAt: attemptedAt,
      })
      .onDuplicateKeyUpdate({
        set: {
          mastery,
          intervalDays,
          wrongCount: dto.isCorrect ? current?.wrongCount ?? 0 : (current?.wrongCount ?? 0) + 1,
          dueAt,
          lastReviewedAt: attemptedAt,
        },
      });
    return { recorded: true, review: { mastery, intervalDays, dueAt } };
  }

  getAttempts(userId: string, onlyWrong = false) {
    return this.db.query.learningAttempt.findMany({
      where: onlyWrong
        ? and(eq(learningAttempt.userId, userId), eq(learningAttempt.isCorrect, false))
        : eq(learningAttempt.userId, userId),
      orderBy: desc(learningAttempt.attemptedAt),
      limit: 200,
    });
  }

  async getReviewItems(userId: string, type: "due" | "wrong" | "all" = "due") {
    const conditions = [eq(reviewItem.userId, userId)];
    if (type === "due") conditions.push(lte(reviewItem.dueAt, new Date()));
    if (type === "wrong") conditions.push(gte(reviewItem.wrongCount, 1));
    return this.db
      .select({
        id: reviewItem.id,
        coursePackId: reviewItem.coursePackId,
        courseId: reviewItem.courseId,
        statementId: reviewItem.statementId,
        mastery: reviewItem.mastery,
        intervalDays: reviewItem.intervalDays,
        wrongCount: reviewItem.wrongCount,
        dueAt: reviewItem.dueAt,
        chinese: statement.chinese,
        english: statement.english,
        soundmark: statement.soundmark,
      })
      .from(reviewItem)
      .leftJoin(statement, eq(reviewItem.statementId, statement.id))
      .where(and(...conditions))
      .orderBy(asc(reviewItem.dueAt));
  }

  async review(userId: string, itemId: string, isCorrect: boolean) {
    const item = await this.db.query.reviewItem.findFirst({
      where: and(eq(reviewItem.id, itemId), eq(reviewItem.userId, userId)),
    });
    if (!item) throw new NotFoundException("复习项不存在");
    const mastery = Math.max(0, Math.min(100, item.mastery + (isCorrect ? 15 : -20)));
    const intervalDays = isCorrect ? Math.min(60, Math.max(1, item.intervalDays * 2)) : 1;
    const dueAt = new Date();
    dueAt.setDate(dueAt.getDate() + intervalDays);
    await this.db
      .update(reviewItem)
      .set({
        mastery,
        intervalDays,
        wrongCount: isCorrect ? item.wrongCount : item.wrongCount + 1,
        dueAt,
        lastReviewedAt: new Date(),
      })
      .where(eq(reviewItem.id, itemId));
    return { id: itemId, mastery, intervalDays, dueAt };
  }

  async snoozeReview(userId: string, itemId: string, days: number) {
    const item = await this.db.query.reviewItem.findFirst({
      where: and(eq(reviewItem.id, itemId), eq(reviewItem.userId, userId)),
    });
    if (!item) throw new NotFoundException("复习项不存在");
    const dueAt = new Date(item.dueAt);
    dueAt.setDate(dueAt.getDate() + days);
    await this.db.update(reviewItem).set({ dueAt }).where(eq(reviewItem.id, itemId));
    return { id: itemId, dueAt };
  }

  async getDailyPlan(userId: string, date: string) {
    const plan = await this.db.query.dailyPlan.findFirst({
      where: and(eq(dailyPlan.userId, userId), eq(dailyPlan.date, date)),
    });
    return plan ?? { date, goalStatements: 20, completedStatements: 0, items: [] };
  }

  async updateDailyPlan(userId: string, dto: UpdateDailyPlanDto) {
    await this.db
      .insert(dailyPlan)
      .values({ userId, ...dto, completedStatements: dto.completedStatements ?? 0 })
      .onDuplicateKeyUpdate({
        set: {
          goalStatements: dto.goalStatements,
          completedStatements: dto.completedStatements ?? 0,
          items: dto.items,
        },
      });
    return this.getDailyPlan(userId, dto.date);
  }

  async enroll(userId: string, coursePackId: string) {
    await this.db
      .insert(userCourseLibrary)
      .values({ userId, coursePackId })
      .onDuplicateKeyUpdate({ set: { coursePackId } });
    return { enrolled: true, coursePackId };
  }

  async favorite(userId: string, coursePackId: string, isFavorite: boolean) {
    await this.db
      .insert(userCourseLibrary)
      .values({ userId, coursePackId, isFavorite })
      .onDuplicateKeyUpdate({ set: { isFavorite } });
    return { coursePackId, isFavorite };
  }

  getLibrary(userId: string) {
    return this.db.query.userCourseLibrary.findMany({
      where: eq(userCourseLibrary.userId, userId),
      orderBy: desc(userCourseLibrary.updatedAt),
    });
  }

  async getPreferences(userId: string) {
    const result = await this.db.query.userPreference.findFirst({
      where: eq(userPreference.userId, userId),
    });
    return result?.settings ?? DEFAULT_SETTINGS;
  }

  async updatePreferences(userId: string, settings: Record<string, unknown>) {
    const current = (await this.getPreferences(userId)) as Record<string, unknown>;
    const merged = { ...current, ...settings };
    await this.db
      .insert(userPreference)
      .values({ userId, settings: merged })
      .onDuplicateKeyUpdate({ set: { settings: merged } });
    return merged;
  }

  async resetPreferences(userId: string) {
    await this.db.delete(userPreference).where(eq(userPreference.userId, userId));
    return DEFAULT_SETTINGS;
  }

  getNotifications(userId: string) {
    return this.db.query.notification.findMany({
      where: eq(notification.userId, userId),
      orderBy: desc(notification.createdAt),
      limit: 100,
    });
  }

  async createNotification(userId: string, dto: CreateNotificationDto) {
    await this.db.insert(notification).values({ userId, ...dto });
    return { created: true };
  }

  async readNotification(userId: string, id: string) {
    await this.db
      .update(notification)
      .set({ isRead: true, readAt: new Date() })
      .where(and(eq(notification.id, id), eq(notification.userId, userId)));
    return { id, isRead: true };
  }

  async readAllNotifications(userId: string) {
    await this.db
      .update(notification)
      .set({ isRead: true, readAt: new Date() })
      .where(eq(notification.userId, userId));
    return { updated: true };
  }

  async getInsights(userId: string, from?: string, to?: string) {
    const attemptConditions = [eq(learningAttempt.userId, userId)];
    if (from) attemptConditions.push(gte(learningAttempt.attemptedAt, new Date(from)));
    if (to) attemptConditions.push(lte(learningAttempt.attemptedAt, new Date(to)));
    const attempts = await this.db.query.learningAttempt.findMany({
      where: and(...attemptConditions),
    });
    const activities = await this.db.query.userLearningActivities.findMany({
      where: eq(userLearningActivities.userId, userId),
    });
    const correct = attempts.filter((item) => item.isCorrect).length;
    const firstAttempt = new Map<string, (typeof attempts)[number]>();
    attempts
      .sort((a, b) => a.attemptedAt.getTime() - b.attemptedAt.getTime())
      .forEach(
        (item) => firstAttempt.has(item.statementId) || firstAttempt.set(item.statementId, item),
      );
    const firstCorrect = [...firstAttempt.values()].filter((item) => item.isCorrect).length;
    return {
      attempts: attempts.length,
      correct,
      accuracy: attempts.length ? Math.round((correct / attempts.length) * 100) : 0,
      completedStatements: firstAttempt.size,
      firstAttemptAccuracy: firstAttempt.size
        ? Math.round((firstCorrect / firstAttempt.size) * 100)
        : 0,
      learningDuration: activities.reduce((total, item) => total + item.duration, 0),
    };
  }

  async getWeakPoints(userId: string) {
    const attempts = await this.getAttempts(userId);
    const groups = new Map<string, { attempts: number; wrong: number }>();
    attempts.forEach((item) => {
      const value = groups.get(item.statementId) ?? { attempts: 0, wrong: 0 };
      value.attempts += 1;
      if (!item.isCorrect) value.wrong += 1;
      groups.set(item.statementId, value);
    });
    return [...groups.entries()]
      .map(([statementId, value]) => ({
        statementId,
        ...value,
        errorRate: Math.round((value.wrong / value.attempts) * 100),
      }))
      .filter((item) => item.wrong > 0)
      .sort((a, b) => b.errorRate - a.errorRate)
      .slice(0, 20);
  }
}
