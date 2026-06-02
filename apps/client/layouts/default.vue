<template>
  <div
    class="h-full w-full text-slate-600 transition-colors"
    :class="
      isLandingPage ? 'bg-[#0a0a16] text-white' : 'bg-white dark:bg-theme-dark dark:text-slate-300'
    "
  >
    <div class="m-auto flex h-fit min-h-screen flex-col items-center">
      <Navbar />
      <!-- 多一层内容的横向内边距是为了和 Navbar 对齐 -->
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
