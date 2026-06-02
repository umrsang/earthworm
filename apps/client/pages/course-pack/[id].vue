<template>
  <div class="flex w-full flex-col">
    <template v-if="isLoading">
      <Loading></Loading>
    </template>

    <template v-else>
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-white">
          {{ coursePackStore.currentCoursePack?.title }}
        </h2>
        <p class="mt-1 text-sm text-gray-500">
          共 {{ coursePackStore.currentCoursePack?.courses?.length }} 个课程
        </p>
      </div>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <template
          v-for="course in coursePackStore.currentCoursePack?.courses"
          :key="course.id"
        >
          <CoursesCourseCard
            :title="course.title"
            :description="course.description"
            :id="course.id"
            :count="course.completionCount"
            :coursePackId="course.coursePackId"
            @click="handleChangeCourse(course.id)"
          />
        </template>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { navigateTo } from "#app";
import { ref } from "vue";
import { useRoute } from "vue-router";

import { useActiveCourseMap } from "~/composables/courses/activeCourse";
import { useCoursePackStore } from "~/store/coursePack";

const isLoading = ref(false);
const route = useRoute();
const coursePackStore = useCoursePackStore();
const coursePackId = route.params.id as string;
const { updateActiveCourseMap } = useActiveCourseMap();

setup();

async function setup() {
  isLoading.value = true;
  await coursePackStore.setupCoursePack(coursePackId);
  isLoading.value = false;
}

function handleChangeCourse(courseId: string) {
  updateActiveCourseMap(coursePackId, courseId);
  navigateTo(`/game/${coursePackId}/${courseId}`);
}
</script>

<style scoped></style>
