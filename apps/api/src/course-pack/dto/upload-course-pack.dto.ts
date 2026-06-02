export class UploadCoursePackDto {
  name: string;
  title: string;
  description: string;
  courses: CourseUnitDto[];
}

export class CourseUnitDto {
  title: string;
  description: string;
  dataFile: string;
  data: CourseDataItem[];
}

export class CourseDataItem {
  chinese: string;
  english: string;
  soundmark: string;
  posTags?: number[][];
  syntaxTags?: (string | number)[][];
}
