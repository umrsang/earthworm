<template>
  <main class="mx-auto w-full max-w-5xl py-10">
    <header class="mb-8">
      <p class="text-sm font-semibold tracking-[0.2em] text-emerald-400">REVIEW</p>
      <h1 class="mt-2 text-3xl font-bold text-[var(--ew-color-text-primary)]">复习中心</h1>
      <div class="mt-5 flex gap-2">
        <button
          v-for="item in tabs"
          :key="item.value"
          class="rounded-xl px-4 py-2 text-sm"
          :class="
            type === item.value
              ? 'bg-purple-500 text-white'
              : 'bg-[var(--ew-color-bg-surface)] text-[var(--ew-color-text-secondary)]'
          "
          @click="changeType(item.value)"
        >
          {{ item.label }}
        </button>
      </div>
    </header>
    <div
      v-if="loading"
      class="py-20 text-center text-[var(--ew-color-text-secondary)]"
    >
      正在加载复习内容…
    </div>
    <div
      v-else-if="!items.length"
      class="rounded-3xl border border-[var(--ew-color-border-default)] bg-[var(--ew-color-bg-elevated)] py-20 text-center text-[var(--ew-color-text-secondary)]"
    >
      当前没有需要复习的内容
    </div>
    <div
      v-else
      class="space-y-3"
    >
      <article
        v-for="item in items"
        :key="item.id"
        class="grid gap-4 rounded-2xl border border-[var(--ew-color-border-default)] bg-[var(--ew-color-bg-elevated)] p-5 md:grid-cols-[1fr_auto] md:items-center"
      >
        <div>
          <strong class="text-lg text-[var(--ew-color-text-primary)]">{{ item.english }}</strong>
          <p class="mt-1 text-[var(--ew-color-text-secondary)]">{{ item.chinese }}</p>
          <p class="mt-2 text-xs text-[var(--ew-color-text-secondary)]">
            掌握度 {{ item.mastery }}% · 错误 {{ item.wrongCount }} 次
          </p>
        </div>
        <div class="flex gap-2">
          <button
            class="rounded-lg border border-[var(--ew-color-border-default)] px-3 py-2 text-sm text-[var(--ew-color-text-secondary)]"
            @click="delay(item)"
          >
            稍后
          </button>
          <NuxtLink
            :to="{
              path: `/game/${item.coursePackId}/${item.courseId}`,
              query: { reviewItemId: item.id, statementId: item.statementId },
            }"
            class="rounded-lg bg-purple-500 px-4 py-2 text-sm font-semibold text-white"
            >开始复习</NuxtLink
          >
        </div>
      </article>
    </div>
  </main>
</template>

<script setup lang="ts">
import { definePageMeta } from "#imports";
import { onMounted, ref } from "vue";

import type { ReviewItem } from "~/types";
import { fetchReviewItems, snoozeReview } from "~/api/learning-experience";

definePageMeta({ middleware: "auth" });
const tabs = [
  { label: "到期", value: "due" },
  { label: "错题", value: "wrong" },
  { label: "全部", value: "all" },
] as const;
const type = ref<"due" | "wrong" | "all">("due");
const items = ref<ReviewItem[]>([]);
const loading = ref(true);
async function load() {
  loading.value = true;
  items.value = await fetchReviewItems(type.value);
  loading.value = false;
}
async function changeType(value: typeof type.value) {
  type.value = value;
  await load();
}
async function delay(item: ReviewItem) {
  await snoozeReview(item.id);
  await load();
}
onMounted(load);
</script>
