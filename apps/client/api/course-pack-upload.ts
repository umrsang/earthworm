import { getHttp } from "./http";

export interface CourseUnitUpload {
  title: string;
  description: string;
  dataFile: string;
  data: any[];
  dataCount?: number;
  showPreview?: boolean;
}

export interface CoursePackUploadDto {
  name: string;
  title: string;
  description: string;
  courses: CourseUnitUpload[];
}

export interface UploadResponse {
  success: boolean;
  coursePackId: string;
  courseIds: string[];
  message: string;
}

export async function uploadCoursePack(data: CoursePackUploadDto) {
  const http = getHttp();
  return await http<UploadResponse>("/course-pack/upload", {
    method: "POST",
    body: data,
  });
}
