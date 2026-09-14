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

/** @param coursePackId 课程包 ID @param courseId 已完成课程 ID */
export function completeCourseApi(coursePackId: string, courseId: string): Promise<{ nextCourse: CourseItemBase | null }> {
  return apiClient.post(`/course-packs/${coursePackId}/courses/${courseId}/complete`) as unknown as Promise<{
    nextCourse: CourseItemBase | null;
  }>;
}
