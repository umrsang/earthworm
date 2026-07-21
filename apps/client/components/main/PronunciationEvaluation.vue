<template>
  <div class="flex flex-col items-center gap-3">
    <!-- 语音评测按钮 -->
    <button
      v-if="status === 'idle' || status === 'error'"
      class="rounded-full border border-purple-500/40 bg-purple-500/10 px-5 py-2 text-sm font-medium text-purple-400 transition-all duration-300 hover:border-purple-500 hover:bg-purple-500/20 hover:text-purple-300"
      @click="startEvaluation"
    >
      <span class="flex items-center gap-2">
        <UIcon
          name="i-ph-microphone"
          class="h-4 w-4"
        />
        语音评测
      </span>
    </button>

    <!-- 录音中 -->
    <button
      v-else-if="status === 'recording'"
      class="rounded-full border border-red-500/40 bg-red-500/10 px-5 py-2 text-sm font-medium text-red-500 transition-all duration-300 hover:border-red-500 hover:bg-red-500/20 animate-pulse"
      @click="stopEvaluation"
    >
      <span class="flex items-center gap-2">
        <UIcon
          name="i-ph-stop"
          class="h-4 w-4"
        />
        正在录音，点击停止
      </span>
    </button>

    <!-- 评测中 -->
    <div
      v-else-if="status === 'evaluating'"
      class="flex items-center gap-2 text-sm text-gray-400"
    >
      <UIcon
        name="i-ph-spinner"
        class="h-4 w-4 animate-spin"
      />
      正在评测...
    </div>

    <!-- 评测结果 -->
    <div
      v-else-if="status === 'done'"
      class="flex w-full max-w-lg flex-col items-center gap-3"
    >
      <!-- 准确率展示 -->
      <div class="flex items-baseline gap-2">
        <span class="text-sm text-gray-400">发音准确率</span>
        <span
          class="text-2xl font-bold"
          :class="getAccuracyColor(accuracy)"
        >
          {{ accuracy }}%
        </span>
        <span
          class="text-sm"
          :class="getAccuracyColor(accuracy)"
        >
          {{ getAccuracyLabel(accuracy) }}
        </span>
      </div>

      <!-- 识别结果 -->
      <div class="w-full rounded-lg bg-base-200/50 p-3 dark:bg-gray-800/50">
        <div class="mb-1 text-xs text-gray-400">你的发音</div>
        <div class="text-sm text-foreground">
          {{ recognizedText || "（未识别到内容）" }}
        </div>
      </div>

      <!-- 目标文本 -->
      <div class="w-full rounded-lg bg-base-200/50 p-3 dark:bg-gray-800/50">
        <div class="mb-1 text-xs text-gray-400">目标句子</div>
        <div class="text-sm text-foreground">
          {{ targetText }}
        </div>
      </div>

      <!-- 重新评测按钮 -->
      <button
        class="rounded-full border border-purple-500/40 bg-purple-500/10 px-4 py-1.5 text-xs font-medium text-purple-400 transition-all duration-300 hover:border-purple-500 hover:bg-purple-500/20 hover:text-purple-300"
        @click="resetEvaluation"
      >
        重新评测
      </button>
    </div>

    <!-- 错误提示 -->
    <div
      v-if="status === 'error' && errorMessage"
      class="text-sm text-red-500"
    >
      {{ errorMessage }}
    </div>

    <!-- 不支持提示 -->
    <div
      v-if="!isSupported"
      class="text-xs text-gray-400"
    >
      当前浏览器不支持语音识别，请使用 Chrome 浏览器
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  getAccuracyColor,
  getAccuracyLabel,
  usePronunciationEvaluation,
} from "~/composables/main/pronunciationEvaluation";

const {
  status,
  recognizedText,
  accuracy,
  errorMessage,
  targetText,
  isSupported,
  startEvaluation,
  stopEvaluation,
  resetEvaluation,
} = usePronunciationEvaluation();
</script>
