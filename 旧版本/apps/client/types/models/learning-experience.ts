export interface LearningAttemptInput {
  coursePackId: string;
  courseId: string;
  statementId: string;
  answer: string;
  isCorrect: boolean;
  hintUsed?: boolean;
  durationMs?: number;
}

export interface ReviewItem {
  id: string;
  coursePackId: string;
  courseId: string;
  statementId: string;
  mastery: number;
  intervalDays: number;
  wrongCount: number;
  dueAt: string;
  chinese: string;
  english: string;
  soundmark: string;
}

export interface DailyPlan {
  id?: string;
  date: string;
  goalStatements: number;
  completedStatements: number;
  items: Array<Record<string, unknown>>;
}

export interface LearningInsights {
  attempts: number;
  correct: number;
  accuracy: number;
  completedStatements: number;
  firstAttemptAccuracy: number;
  learningDuration: number;
}

export interface CourseLibraryItem {
  id: string;
  coursePackId: string;
  isFavorite: boolean;
  enrolledAt: string;
}

export interface UserNotification {
  id: string;
  type: string;
  title: string;
  content?: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: string;
}
