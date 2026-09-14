<template>
  <nav class="game-controls" :aria-label="$t('game.controlsLabel')">
    <!-- 上排辅助操作按钮组 (上一句 / 播放发音 / 提示或重试) -->
    <div class="game-controls-aux">
      <button class="game-control-button" type="button" :disabled="first" @click="$emit('previous')">
        ← {{ $t('game.previousStatement') }} <kbd>←</kbd>
      </button>
      <button class="game-control-button" type="button" @click="$emit('play')">
        ◉ {{ $t('game.playSound') }} <kbd>Space</kbd>
      </button>
      <button v-if="question" class="game-control-button" type="button" @click="$emit('reveal')">
        {{ $t('game.showAnswer') }} <kbd>H</kbd>
      </button>
      <button v-else class="game-control-button" type="button" @click="$emit('retry')">
        {{ $t('game.retry') }} <kbd>R</kbd>
      </button>
    </div>

    <!-- 下排核心提交/下一步操作按钮 -->
    <div class="game-controls-main">
      <button
        v-if="question"
        class="button primary game-submit-btn"
        type="button"
        :disabled="!hasAnswer"
        @click="$emit('submit')"
      >
        {{ $t('game.submitAnswer') }}
      </button>
      <button
        v-else
        class="button primary game-submit-btn"
        type="button"
        @click="$emit('next')"
      >
        {{ last ? $t('game.finishCourse') : $t('game.nextStatement') }}
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
defineProps<{ question: boolean; first: boolean; last: boolean; hasAnswer: boolean }>();
defineEmits<{ previous: []; next: []; play: []; reveal: []; submit: []; retry: [] }>();
</script>
