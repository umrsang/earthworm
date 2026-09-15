import { apiClient } from "./client";

const COURSE_PACK_UPLOAD_TIMEOUT_MS = 120000;

export type PosTagTuple = [startIndex: number, endIndex: number, label: string];
export type SyntaxTagTuple = [startIndex: number, endIndex: number, label: string, type: string];

export interface CoursePackMetadata {
  name?: string;
  version?: string;
  level?: string;
  tags?: string[];
  totalUnits?: number;
  totalVocab?: number;
}

interface CoursePackResponseBase {
  id: string;
  name: string | null;
  title: string;
  description: string | null;
  version: string | null;
  level: string | null;
  tags: string[];
  totalUnits: number;
  totalVocab: number | null;
  creatorId: string;
  createdAt: string | number;
}

export interface CoursePackListItem extends CoursePackResponseBase {
  courseCount: number;
  statementCount: number;
}

export interface CourseItemBase {
  id: string;
  coursePackId: string;
  title: string;
  description: string | null;
  sortOrder: number;
}

export interface CourseListItem extends CourseItemBase {
  statementCount: number;
  completionCount: number;
}

export interface CourseStatement {
  id: string;
  chinese: string;
  english: string;
  soundmark: string | null;
  posTags: PosTagTuple[];
  syntaxTags: SyntaxTagTuple[];
  sortOrder: number;
}

export interface CoursePackDetail extends CoursePackResponseBase {
  courses: CourseListItem[];
  progress: { courseId: string; statementIndex: number } | null;
}

export interface CourseDetail extends CourseItemBase {
  statements: CourseStatement[];
  statementIndex: number;
}

export type LearningActivityEventType = "answer" | "duration";

export interface LearningActivityEventPayload {
  eventId: string;
  coursePackId: string;
  courseId: string;
  statementId?: string;
  eventType: LearningActivityEventType;
  durationSeconds: number;
  attemptCount: number;
  correctCount: number;
}

export interface DashboardCourseProgress {
  coursePackId: string;
  coursePackTitle: string;
  courseId: string;
  courseTitle: string;
  statementIndex: number;
  statementCount: number;
  completionCount: number;
}

export interface LearningDashboard {
  today: {
    durationSeconds: number;
    completedAnswers: number;
    attempts: number;
    correctRate: number;
  };
  streakDays: number;
  progress: {
    totalCourses: number;
    completedCourses: number;
    percent: number;
  };
  recent: DashboardCourseProgress | null;
  tasks: DashboardCourseProgress[];
  coursePacks: Array<{
    id: string;
    title: string;
    courses: DashboardCourseProgress[];
  }>;
}

export interface CoursePackUploadPayload extends CoursePackMetadata {
  title: string;
  description?: string;
  courses: Array<{
    title: string;
    description?: string;
    statements: Array<{
      chinese: string;
      english: string;
      soundmark?: string;
      posTags?: PosTagTuple[];
      syntaxTags?: SyntaxTagTuple[];
    }>;
  }>;
}

export function getCoursePacksApi(): Promise<CoursePackListItem[]> {
  return apiClient.get("/course-packs") as unknown as Promise<CoursePackListItem[]>;
}

/** @param payload 浏览器解析并校验后的课程包数据 */
export function createCoursePackApi(payload: CoursePackUploadPayload): Promise<{ coursePackId: string; courseIds: string[] }> {
  return apiClient.post("/course-packs", payload, { timeout: COURSE_PACK_UPLOAD_TIMEOUT_MS }) as unknown as Promise<{
    coursePackId: string;
    courseIds: string[];
  }>;
}

/** @param coursePackId 课程包 ID */
export function getCoursePackApi(coursePackId: string): Promise<CoursePackDetail> {
  return apiClient.get(`/course-packs/${coursePackId}`) as unknown as Promise<CoursePackDetail>;
}

/** @param coursePackId 课程包 ID @param courseId 课程 ID */
export function getCourseApi(coursePackId: string, courseId: string): Promise<CourseDetail> {
  return apiClient.get(`/course-packs/${coursePackId}/courses/${courseId}`) as unknown as Promise<CourseDetail>;
}

/** @param coursePackId 课程包 ID @param courseId 当前课程 ID @param statementIndex 当前句子索引 */
export function saveCourseProgressApi(coursePackId: string, courseId: string, statementIndex: number) {
  return apiClient.put(`/course-packs/${coursePackId}/progress`, { courseId, statementIndex });
}

/** @param coursePackId 课程包 ID @param courseId 已完成课程 ID @returns 下一课信息，没有下一课时返回 null */
export function completeCourseApi(coursePackId: string, courseId: string): Promise<{ nextCourse: CourseItemBase | null }> {
  return apiClient.post(`/course-packs/${coursePackId}/courses/${courseId}/complete`) as unknown as Promise<{
    nextCourse: CourseItemBase | null;
  }>;
}

/**
 * 批量保存幂等学习事件。
 * @param events 答题或有效学习时长事件
 * @param timezoneOffset 浏览器 Date#getTimezoneOffset 返回的分钟差
 * @returns 本次首次写入的事件数量
 */
export function saveLearningActivitiesApi(
  events: LearningActivityEventPayload[],
  timezoneOffset: number,
): Promise<{ insertedCount: number }> {
  return apiClient.post("/course-packs/learning-activities", {
    events,
    timezoneOffset,
  }) as unknown as Promise<{ insertedCount: number }>;
}

/**
 * 获取首页学习统计和进度数据。
 * @param timezoneOffset 浏览器 Date#getTimezoneOffset 返回的分钟差
 * @returns 当前用户的今日统计、最近课程、任务和课程包进度
 */
export function getLearningDashboardApi(timezoneOffset: number): Promise<LearningDashboard> {
  return apiClient.get("/course-packs/dashboard", {
    params: { timezoneOffset },
  }) as unknown as Promise<LearningDashboard>;
}

/**
 * 重置指定课程当前位置和完成记录，保留历史学习统计。
 * @param coursePackId 课程包 ID
 * @param courseId 课程 ID
 * @returns 已重置的课程 ID
 */
export function resetCourseProgressApi(coursePackId: string, courseId: string): Promise<{ courseId: string }> {
  return apiClient.delete(`/course-packs/${coursePackId}/courses/${courseId}/progress`) as unknown as Promise<{
    courseId: string;
  }>;
}

/**
 * 重置整个课程包当前位置和完成记录，保留历史学习统计。
 * @param coursePackId 课程包 ID
 * @returns 已重置的课程包 ID
 */
export function resetCoursePackProgressApi(coursePackId: string): Promise<{ coursePackId: string }> {
  return apiClient.delete(`/course-packs/${coursePackId}/progress`) as unknown as Promise<{ coursePackId: string }>;
}
