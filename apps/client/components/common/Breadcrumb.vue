<template>
  <nav
    v-if="items.length > 1"
    class="mb-6 flex items-center gap-1.5 text-sm"
  >
    <template
      v-for="(item, index) in items"
      :key="item.to || index"
    >
      <UIcon
        name="i-ph-caret-right"
        class="h-3 w-3 text-gray-700"
      ></UIcon>
      <NuxtLink
        v-if="item.to && index < items.length - 1"
        :to="item.to"
        class="text-gray-500 transition-colors hover:text-purple-400"
      >
        {{ item.label }}
      </NuxtLink>
      <span
        v-else
        class="text-gray-400"
      >
        {{ item.label }}
      </span>
    </template>
  </nav>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

import { useCourseStore } from "~/store/course";
import { useCoursePackStore } from "~/store/coursePack";

interface BreadcrumbItem {
  label: string;
  to?: string;
}

const route = useRoute();
const courseStore = useCourseStore();
const coursePackStore = useCoursePackStore();

// 路径前缀 → 父级面包屑映射
const parentMap: Record<string, BreadcrumbItem[]> = {
  "/course-pack/upload": [{ label: "课程包", to: "/course-pack" }, { label: "上传课程包" }],
  "/mastered-elements": [{ label: "已掌握元素" }],
  "/User/Setting": [{ label: "用户设置" }],
};

const items = computed<BreadcrumbItem[]>(() => {
  const path = route.path;
  if (path === "/" || path === "") return [];

  const result: BreadcrumbItem[] = [{ label: "首页", path: "/" }];

  // 静态路由匹配
  if (parentMap[path]) {
    result.push(...parentMap[path]);
    return result;
  }

  // 课程包列表页
  if (path === "/course-pack") {
    result.push({ label: "课程包" });
    return result;
  }

  // /course-pack/:id
  if (path.startsWith("/course-pack/") && path.split("/").length === 3) {
    result.push({ label: "课程包", to: "/course-pack" });
    result.push({ label: coursePackStore.currentCoursePack?.title || "课程详情" });
    return result;
  }

  // /game/:coursePackId/:courseId
  if (path.startsWith("/game/")) {
    const segments = path.split("/").filter(Boolean);
    result.push({ label: "课程包", to: "/course-pack" });
    result.push({
      label: coursePackStore.currentCoursePack?.title || "课程",
      to: `/course-pack/${segments[1]}`,
    });
    result.push({ label: courseStore.currentCourse?.title || "游戏" });
    return result;
  }

  return result;
});
</script>
