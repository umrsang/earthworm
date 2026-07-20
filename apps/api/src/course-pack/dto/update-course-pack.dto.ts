export class UpdateCoursePackDto {
  title?: string;
  description?: string;
  isFree?: boolean;
  cover?: string;
  shareLevel?: "public" | "private" | "founder_only";
}