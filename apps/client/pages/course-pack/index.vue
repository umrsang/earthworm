<template>
  <div class="flex w-full flex-col">
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-white">课程包</h2>
        <p class="mt-1 text-sm text-gray-500">选择一个课程包开始学习</p>
      </div>
      <NuxtLink
        to="/course-pack/upload"
        class="inline-flex items-center gap-2 rounded-full bg-purple-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-purple-600/25 transition-all duration-300 hover:bg-purple-500 hover:scale-105 active:scale-100"
      >
        <UIcon name="i-ph-upload-simple" class="h-4 w-4"></UIcon>
        上传课程包
      </NuxtLink>
    </div>

    <template v-if="isLoading">
      <Loading></Loading>
    </template>

    <template v-else>
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <template v-for="coursePack in coursePackStore.coursePacks" :key="coursePack.id">
          <CoursePackCard
            :coursePack="{
              id: coursePack.id,
              title: coursePack.title,
              description: coursePack.description,
              cover: coursePack.cover,
              isFree: coursePack.isFree,
            }"
            @cardClick="handleGoToCoursePack"
          />
        </template>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

import type { CoursePack } from "~/types";
import CoursePackCard from "~/components/courses/CoursePackCard.vue";
import { useNavigation } from "~/composables/useNavigation";
import { useCoursePackStore } from "~/store/coursePack";

const coursePackStore = useCoursePackStore();
const { gotoCourseList } = useNavigation();
const isLoading = ref(false);

setup();

async function setup() {
  if (coursePackStore.coursePacks.length === 0) {
    isLoading.value = true;
    await coursePackStore.setupCoursePacks();
    isLoading.value = false;
  }
}

function handleGoToCoursePack(coursePack: CoursePack) {
  if (coursePack.isFree) {
    gotoCourseList(coursePack.id);
  } else {
    console.log("需要是会员");
  }
}
</script>

<style scoped></style>
