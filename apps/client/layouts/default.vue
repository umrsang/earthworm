<template>
  <div class="h-full w-full bg-[var(--ew-color-bg-page)] text-[var(--ew-color-text-primary)]">
    <div class="m-auto flex h-fit min-h-screen flex-col items-center">
      <Navbar v-if="!isGamePage" />
      <!-- 面包屑：和 Navbar 同容器对齐，仅非首页显示 -->
      <div
        v-if="!isLandingPage && !isGamePage"
        class="mx-auto w-full max-w-screen-xl px-5"
      >
        <CommonBreadcrumb />
      </div>
      <!-- Landing 页面无内边距（组件内部自行控制），其他页面加内边距 -->
      <div :class="isLandingPage || isGamePage ? 'flex w-full flex-1' : 'flex w-full flex-1 px-5'">
        <div
          :class="isGamePage ? 'flex w-full flex-1' : 'mx-auto flex w-full max-w-screen-xl flex-1'"
        >
          <slot />
        </div>
      </div>
      <Footer v-if="!isLandingPage && !isGamePage"></Footer>
    </div>
  </div>
  <UserMenu />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const isLandingPage = computed(() => route.path === "/" || route.path === "");
const isGamePage = computed(() => route.path.startsWith("/game/"));
</script>
