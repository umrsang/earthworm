<template>
  <main class="mx-auto w-full max-w-4xl py-10">
    <header class="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-sm font-semibold tracking-[0.2em] text-cyan-400">NOTIFICATIONS</p>
        <h1 class="mt-2 text-3xl font-bold text-[var(--ew-color-text-primary)]">通知中心</h1>
        <p class="mt-2 text-[var(--ew-color-text-secondary)]">
          课程更新、复习提醒和学习反馈会集中显示在这里。
        </p>
      </div>
      <button
        v-if="unreadCount"
        class="rounded-xl border border-[var(--ew-color-border-default)] px-4 py-2 text-sm text-[var(--ew-color-text-primary)] transition hover:bg-[var(--ew-color-bg-surface)]"
        @click="markAllRead"
      >
        全部标为已读
      </button>
    </header>

    <div
      v-if="loading"
      class="py-20 text-center text-[var(--ew-color-text-secondary)]"
    >
      正在加载通知…
    </div>
    <div
      v-else-if="!notifications.length"
      class="rounded-3xl border border-[var(--ew-color-border-default)] bg-[var(--ew-color-bg-elevated)] py-20 text-center"
    >
      <UIcon
        name="i-ph-bell-slash"
        class="h-10 w-10 text-gray-500"
      />
      <p class="mt-4 text-[var(--ew-color-text-secondary)]">暂时没有新通知</p>
    </div>
    <div
      v-else
      class="space-y-3"
    >
      <article
        v-for="item in notifications"
        :key="item.id"
        class="grid gap-4 rounded-2xl border p-5 transition md:grid-cols-[auto_1fr_auto] md:items-start"
        :class="
          item.isRead
            ? 'border-[var(--ew-color-border-default)] bg-[var(--ew-color-bg-elevated)]'
            : 'border-purple-400/30 bg-purple-500/[0.08]'
        "
      >
        <span
          class="mt-1 flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-purple-300"
        >
          <UIcon
            :name="iconFor(item.type)"
            class="h-5 w-5"
          />
        </span>
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <strong class="text-[var(--ew-color-text-primary)]">{{ item.title }}</strong>
            <span
              v-if="!item.isRead"
              class="h-2 w-2 rounded-full bg-purple-400"
            />
          </div>
          <p
            v-if="item.content"
            class="mt-1 text-sm leading-6 text-[var(--ew-color-text-secondary)]"
          >
            {{ item.content }}
          </p>
          <time class="mt-2 block text-xs text-[var(--ew-color-text-secondary)]">{{
            formatTime(item.createdAt)
          }}</time>
        </div>
        <div class="flex gap-2">
          <NuxtLink
            v-if="item.actionUrl"
            :to="item.actionUrl"
            class="rounded-lg bg-purple-500 px-3 py-2 text-sm font-semibold text-white"
            @click="markRead(item)"
          >
            查看
          </NuxtLink>
          <button
            v-if="!item.isRead"
            class="rounded-lg border border-[var(--ew-color-border-default)] px-3 py-2 text-sm text-[var(--ew-color-text-secondary)]"
            @click="markRead(item)"
          >
            已读
          </button>
        </div>
      </article>
    </div>
  </main>
</template>

<script setup lang="ts">
import { definePageMeta } from "#imports";
import { computed, onMounted, ref } from "vue";

import type { UserNotification } from "~/types";
import {
  fetchNotifications,
  readAllNotifications,
  readNotification,
} from "~/api/learning-experience";

definePageMeta({ middleware: "auth" });

const notifications = ref<UserNotification[]>([]);
const loading = ref(true);
const unreadCount = computed(() => notifications.value.filter((item) => !item.isRead).length);

onMounted(async () => {
  try {
    notifications.value = await fetchNotifications();
  } finally {
    loading.value = false;
  }
});

async function markRead(item: UserNotification) {
  if (item.isRead) return;
  await readNotification(item.id);
  item.isRead = true;
}

async function markAllRead() {
  await readAllNotifications();
  notifications.value.forEach((item) => {
    item.isRead = true;
  });
}

function iconFor(type: string) {
  if (type.includes("review")) return "i-ph-arrows-clockwise";
  if (type.includes("course")) return "i-ph-books";
  if (type.includes("achievement")) return "i-ph-trophy";
  return "i-ph-bell";
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
</script>
