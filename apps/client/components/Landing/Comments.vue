<template>
  <section class="py-24">
    <div class="mx-auto max-w-screen-xl px-6">
      <!-- 标题 -->
      <div class="mb-16 text-center">
        <h2 class="text-3xl font-bold text-white sm:text-4xl">用户反馈</h2>
        <p class="mx-auto mt-4 max-w-xl text-lg text-gray-400">
          如果您正在使用 Earthworm，请随时在 Twitter 上向我们提供反馈！
        </p>
      </div>

      <!-- 评价卡片 -->
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="(item, index) in CommentsList"
          :key="index"
          class="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:border-purple-500/20 hover:bg-white/[0.04]"
        >
          <!-- 用户信息 -->
          <div class="mb-4 flex items-center gap-3">
            <img
              :src="item.avatar"
              alt=""
              class="h-10 w-10 rounded-full border border-purple-500/30 object-cover"
            />
            <div class="flex-grow">
              <p class="text-sm font-semibold text-white">
                {{ item.nickname }}
              </p>
              <p class="text-xs text-gray-500">
                {{ "@" + item.account }}
              </p>
            </div>
            <UIcon
              name="i-simple-icons-x"
              class="h-4 w-4 text-gray-600"
            ></UIcon>
          </div>

          <!-- 评价内容 -->
          <p class="text-sm leading-relaxed text-gray-400">
            {{ item.chinese }}
          </p>

          <!-- 底部 -->
          <div class="mt-4 flex items-center justify-between text-xs text-gray-600">
            <div class="flex items-center gap-1.5">
              <UIcon
                name="i-ph-heart-fill"
                class="h-3.5 w-3.5 text-pink-400/60"
              ></UIcon>
              <span>{{ item.likeCount }}</span>
            </div>
            <span>{{ formatTimestamp({ timestamp: item.time }) }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import CommentsList from "~/assets/comments.json";
import { formatTimestamp } from "~/utils/date";
</script>

<style scoped></style>
