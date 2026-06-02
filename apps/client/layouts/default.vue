<template>
  <div class="h-full w-full bg-[#0a0a16] text-white">
    <div class="m-auto flex h-fit min-h-screen flex-col items-center">
      <Navbar />
      <!-- 面包屑：和 Navbar 同容器对齐，仅非首页显示 -->
      <div
        v-if="!isLandingPage"
        class="mx-auto w-full max-w-screen-xl px-5"
      >
        <CommonBreadcrumb />
      </div>
      <!-- Landing 页面无内边距（组件内部自行控制），其他页面加内边距 -->
      <div :class="isLandingPage ? 'flex w-full flex-1' : 'flex w-full flex-1 px-5'">
        <div class="mx-auto flex w-full max-w-screen-xl flex-1">
          <NuxtPage />
        </div>
      </div>
      <Footer v-if="!isLandingPage"></Footer>
    </div>
  </div>
  <UserMenu />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const isLandingPage = computed(() => route.path === "/" || route.path === "");
</script>
