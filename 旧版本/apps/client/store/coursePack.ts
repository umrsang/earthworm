import { defineStore } from "pinia";
import { ref } from "vue";

import type { CoursePack, CoursePacksItem } from "~/types";
import { deleteCourse, updateCourse } from "~/api/course";
import { fetchCourseHistory } from "~/api/course-history";
import {
  deleteCoursePack,
  fetchCoursePack,
  fetchCoursePacks,
  updateCoursePack,
} from "~/api/course-pack";
import { deleteStatement, updateStatement } from "~/api/statement";

export const useCoursePackStore = defineStore("course-pack", () => {
  const coursePacks = ref<CoursePacksItem[]>([]);
  const currentCoursePack = ref<CoursePack>();

  async function setupCoursePacks() {
    const res = await fetchCoursePacks();
    coursePacks.value = res;
  }

  async function setupCoursePack(coursePackId: string) {
    if (coursePackId === currentCoursePack.value?.id) return;

    const res = await fetchCoursePack(coursePackId);
    currentCoursePack.value = res;
  }

  async function updateCoursesCompleteCount(coursePackId: string) {
    const courseHistory = await fetchCourseHistory(coursePackId);

    const find = (courseId: string) =>
      courseHistory.find((history) => history.courseId === courseId);

    currentCoursePack.value?.courses.forEach((course) => {
      const matchCourseHistory = find(course.id);

      if (matchCourseHistory) {
        course.completionCount = matchCourseHistory.completionCount;
      }
    });
  }

  async function editCoursePack(
    coursePackId: string,
    data: {
      title?: string;
      description?: string;
      isFree?: boolean;
      cover?: string;
      shareLevel?: string;
    },
  ) {
    const updated = await updateCoursePack(coursePackId, data);
    coursePacks.value = coursePacks.value.map((cp) =>
      cp.id === coursePackId ? { ...cp, ...data } : cp,
    );
    if (currentCoursePack.value?.id === coursePackId) {
      currentCoursePack.value = { ...currentCoursePack.value, ...data };
    }
    return updated;
  }

  async function removeCoursePack(coursePackId: string) {
    await deleteCoursePack(coursePackId);
    coursePacks.value = coursePacks.value.filter((cp) => cp.id !== coursePackId);
    if (currentCoursePack.value?.id === coursePackId) {
      currentCoursePack.value = undefined;
    }
  }

  async function editCourse(
    courseId: string,
    data: {
      title?: string;
      description?: string;
      video?: string;
      order?: number;
    },
  ) {
    const updated = await updateCourse(courseId, data);
    if (currentCoursePack.value) {
      currentCoursePack.value.courses = currentCoursePack.value.courses.map((c) =>
        c.id === courseId ? { ...c, ...data } : c,
      );
    }
    return updated;
  }

  async function removeCourse(courseId: string) {
    await deleteCourse(courseId);
    if (currentCoursePack.value) {
      currentCoursePack.value.courses = currentCoursePack.value.courses.filter(
        (c) => c.id !== courseId,
      );
    }
  }

  async function editStatement(
    statementId: string,
    data: {
      chinese?: string;
      english?: string;
      soundmark?: string;
      posTags?: number[][] | null;
      syntaxTags?: (string | number)[][] | null;
      order?: number;
    },
  ) {
    return await updateStatement(statementId, data);
  }

  async function removeStatement(statementId: string) {
    return await deleteStatement(statementId);
  }

  return {
    setupCoursePack,
    setupCoursePacks,
    updateCoursesCompleteCount,
    editCoursePack,
    removeCoursePack,
    editCourse,
    removeCourse,
    editStatement,
    removeStatement,
    currentCoursePack,
    coursePacks,
  };
});
