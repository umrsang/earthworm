<template>
  <main class="mx-auto w-full max-w-5xl py-10">
    <header class="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-sm font-semibold tracking-[0.2em] text-purple-400">TODAY</p>
        <h1 class="mt-2 text-3xl font-bold text-[var(--ew-color-text-primary)]">今日学习</h1>
        <p class="mt-2 text-[var(--ew-color-text-secondary)]">
          完成今天的目标，学习进度会自动同步。
        </p>
      </div>
      <NuxtLink
        to="/course-pack"
        class="rounded-xl bg-purple-500 px-5 py-3 font-semibold text-white"
      >
        选择课程
      </NuxtLink>
    </header>

    <section
      v-if="plan"
      class="rounded-3xl border border-[var(--ew-color-border-default)] bg-[var(--ew-color-bg-elevated)] p-7"
    >
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-semibold text-[var(--ew-color-text-primary)]">每日目标</h2>
          <p class="mt-1 text-[var(--ew-color-text-secondary)]">
            {{ plan.completedStatements }} / {{ plan.goalStatements }} 句
          </p>
        </div>
        <strong class="text-3xl text-purple-300">{{ progress }}%</strong>
      </div>
      <div class="mt-5 h-2 overflow-hidden rounded-full bg-[var(--ew-color-border-default)]">
        <div
          class="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400"
          :style="{ width: `${progress}%` }"
        />
      </div>
      <div class="mt-7 flex items-center gap-3">
        <label class="text-sm text-[var(--ew-color-text-secondary)]">目标句数</label>
        <input
          v-model.number="plan.goalStatements"
          type="number"
          min="1"
          max="500"
          class="w-24 rounded-lg border border-[var(--ew-color-border-default)] bg-[var(--ew-color-bg-surface)] px-3 py-2 text-[var(--ew-color-text-primary)]"
        />
        <button
          class="rounded-lg border border-[var(--ew-color-border-default)] px-4 py-2 text-sm text-[var(--ew-color-text-primary)]"
          @click="save"
        >
          保存计划
        </button>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { definePageMeta } from "#imports";
import { computed, onMounted, ref } from "vue";
import { toast } from "vue-sonner";

import type { DailyPlan } from "~/types";
import { fetchDailyPlan, updateDailyPlan } from "~/api/learning-experience";

definePageMeta({ middleware: "auth" });
const plan = ref<DailyPlan>();
const progress = computed(() =>
  plan.value
    ? Math.min(100, Math.round((plan.value.completedStatements / plan.value.goalStatements) * 100))
    : 0,
);
onMounted(async () => (plan.value = await fetchDailyPlan()));
async function save() {
  if (!plan.value) return;
  plan.value = await updateDailyPlan(plan.value);
  toast.success("今日计划已保存");
}
</script>
