export interface Statement {
  english: string;
  phonetic: string;
  chinese: string;
  posTags?: number[][];
  syntaxTags?: (string | number)[][];
}

interface Course {
  title: string;
  description: string;
  statements: Statement[];
  learningContent: string;
}

export interface CreateCoursePack {
  title: string;
  description: string;
  cover: string;
  uId: string;
  shareLevel: string;
  courses: Course[];
}

type UpdateCourse = Course & { publishCourseId: string };

export interface UpdateCoursePack {
  title: string;
  description: string;
  cover: string;
  uId: string;
  shareLevel: string;
  courses: UpdateCourse[];
}
