<template>
  <main class="mx-auto w-full max-w-5xl py-10">
    <header class="mb-8 flex items-end justify-between">
      <div>
        <p class="text-sm font-semibold tracking-[0.2em] text-cyan-400">INSIGHTS</p>
        <h1 class="mt-2 text-3xl font-bold text-[var(--ew-color-text-primary)]">学习洞察</h1>
      </div>
      <button
        class="rounded-xl border border-[var(--ew-color-border-default)] px-4 py-2 text-sm text-[var(--ew-color-text-primary)]"
        @click="downloadCsv"
      >
        导出 CSV
      </button>
    </header>
    <div
      v-if="summary"
      class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <article
        v-for="metric in metrics"
        :key="metric.label"
        class="rounded-2xl border border-[var(--ew-color-border-default)] bg-[var(--ew-color-bg-elevated)] p-5"
      >
        <p class="text-sm text-[var(--ew-color-text-secondary)]">{{ metric.label }}</p>
        <strong class="mt-3 block text-3xl text-[var(--ew-color-text-primary)]">{{
          metric.value
        }}</strong>
      </article>
    </div>
    <section
      class="mt-8 rounded-3xl border border-[var(--ew-color-border-default)] bg-[var(--ew-color-bg-elevated)] p-6"
    >
      <h2 class="text-lg font-semibold text-[var(--ew-color-text-primary)]">薄弱点</h2>
      <div
        v-if="!weakPoints.length"
        class="py-10 text-center text-[var(--ew-color-text-secondary)]"
      >
        完成学习后，这里会展示高频错误。
      </div>
      <div
        v-for="item in weakPoints"
        :key="item.statementId"
        class="mt-4 flex items-center justify-between border-t border-[var(--ew-color-border-default)] pt-4 text-sm"
      >
        <span class="text-[var(--ew-color-text-secondary)]">{{ item.statementId }}</span
        ><strong class="text-rose-400">错误率 {{ item.errorRate }}%</strong>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { useRuntimeConfig } from "#app";
import { definePageMeta } from "#imports";
import { computed, onMounted, ref } from "vue";

import type { LearningInsights } from "~/types";
import { fetchInsights, fetchWeakPoints } from "~/api/learning-experience";
import { getToken } from "~/services/auth";

definePageMeta({ middleware: "auth" });
const apiBase = useRuntimeConfig().public.apiBase;
const summary = ref<LearningInsights>();
const weakPoints = ref<Awaited<ReturnType<typeof fetchWeakPoints>>>([]);
const metrics = computed(() =>
  summary.value
    ? [
        { label: "完成语句", value: summary.value.completedStatements },
        { label: "总体正确率", value: `${summary.value.accuracy}%` },
        { label: "首次正确率", value: `${summary.value.firstAttemptAccuracy}%` },
        { label: "学习时长", value: `${Math.round(summary.value.learningDuration / 60)} 分钟` },
      ]
    : [],
);
onMounted(async () => {
  [summary.value, weakPoints.value] = await Promise.all([fetchInsights(), fetchWeakPoints()]);
});
async function downloadCsv() {
  const response = await fetch(`${apiBase}/insights/export.csv`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const url = URL.createObjectURL(await response.blob());
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "earthworm-insights.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}
</script>
