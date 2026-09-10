import type {
  CourseLibraryItem,
  DailyPlan,
  LearningAttemptInput,
  LearningInsights,
  ReviewItem,
  UserNotification,
} from "~/types";
import { getHttp } from "./http";

export const recordLearningAttempt = (body: LearningAttemptInput) =>
  getHttp()("/learning-attempts", { method: "POST", body });

export const fetchReviewItems = (type: "due" | "wrong" | "all" = "due") =>
  getHttp()<ReviewItem[]>("/review", { query: { type } });

export const submitReviewResult = (id: string, isCorrect: boolean) =>
  getHttp()(`/review/${id}/result`, { method: "POST", body: { isCorrect } });

export const snoozeReview = (id: string, days = 1) =>
  getHttp()(`/review/${id}/snooze`, { method: "PATCH", body: { days } });

export const fetchDailyPlan = (date = new Date().toISOString().slice(0, 10)) =>
  getHttp()<DailyPlan>("/daily-plan", { query: { date } });

export const updateDailyPlan = (body: DailyPlan) =>
  getHttp()<DailyPlan>("/daily-plan", { method: "PUT", body });

export const fetchCourseLibrary = () => getHttp()<CourseLibraryItem[]>("/course-library");

export const enrollCoursePack = (coursePackId: string) =>
  getHttp()(`/course-library/${coursePackId}/enroll`, { method: "POST" });

export const setCoursePackFavorite = (coursePackId: string, isFavorite: boolean) =>
  getHttp()(`/course-library/${coursePackId}/favorite`, {
    method: "PUT",
    body: { isFavorite },
  });

export const fetchPreferences = () => getHttp()<Record<string, unknown>>("/preferences");
export const updatePreferences = (settings: Record<string, unknown>) =>
  getHttp()<Record<string, unknown>>("/preferences", { method: "PUT", body: { settings } });
export const resetPreferences = () =>
  getHttp()<Record<string, unknown>>("/preferences/reset", { method: "POST" });

export const fetchNotifications = () => getHttp()<UserNotification[]>("/notifications");
export const readNotification = (id: string) =>
  getHttp()(`/notifications/${id}/read`, { method: "PATCH" });
export const readAllNotifications = () => getHttp()("/notifications/read-all", { method: "PATCH" });

export const fetchInsights = (from?: string, to?: string) =>
  getHttp()<LearningInsights>("/insights/summary", { query: { from, to } });
export const fetchWeakPoints = () =>
  getHttp()<Array<{ statementId: string; attempts: number; wrong: number; errorRate: number }>>(
    "/insights/weak-points",
  );
