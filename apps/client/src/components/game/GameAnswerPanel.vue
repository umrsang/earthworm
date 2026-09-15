<template>
  <section class="game-answer-panel">
    <p class="game-answer-status">{{ revealed ? $t('game.answerLabel') : `✓ ${$t('game.correctTitle')}` }}</p>
    <GameSyntaxDiagram :statement="statement" />
    <p class="game-answer-chinese">{{ statement.chinese }}</p>
    <p v-if="statement.soundmark" class="game-soundmark">{{ statement.soundmark }}</p>

    <!-- AI 学习分析触发区：不再全宽铺满，采用精致胶囊居中 -->
    <div v-if="!analysis" class="game-ai-trigger-wrap">
      <button
        class="button game-ai-button game-answer-ai-button"
        :class="{ 'is-loading': analysisLoading, 'is-error': Boolean(analysisError) }"
        type="button"
        :disabled="analysisLoading"
        @click="loadAnalysis"
      >
        <span class="game-ai-icon" :class="{ 'is-spinning': analysisLoading }">✦</span>
        <span class="game-ai-text">
          {{ analysisLoading ? $t('game.aiAnalyzingSentence') : (analysisError ? $t('game.aiRetryAnalysis') : $t('game.aiAnalysis')) }}
        </span>
      </button>
      <p v-if="analysisError" class="game-ai-error learning-error-message">{{ analysisError }}</p>
    </div>

    <!-- 流式生成实时展示卡片 -->
    <div v-if="analysisLoading && !analysis" class="game-ai-streaming-card">
      <div class="game-ai-streaming-header">
        <span class="game-ai-streaming-dot"></span>
        <span>{{ $t('game.aiStreaming') }}</span>
      </div>
      <div v-if="streamText" class="game-ai-streaming-preview">
        {{ streamText }}
      </div>
    </div>

    <!-- AI 结构化分析结果卡片 -->
    <section v-if="analysis" class="game-ai-analysis game-answer-ai-analysis">
      <header class="game-ai-header">
        <div>
          <p class="learning-eyebrow">{{ $t('game.aiAnalysisEyebrow') }}</p>
          <h2>{{ $t('game.aiAnalysisTitle') }}</h2>
        </div>
        <div class="game-ai-header-meta">
          <small>{{ analysis.modelName }} · {{ $t(`game.aiSource.${analysis.source}`) }}</small>
          <button
            class="game-ai-action-btn"
            type="button"
            @click="isCollapsed = !isCollapsed"
          >
            {{ isCollapsed ? $t('game.aiExpand') : $t('game.aiCollapse') }}
          </button>
        </div>
      </header>

      <div v-show="!isCollapsed" class="game-ai-body">
        <div class="game-ai-section">
          <h3>{{ $t('game.wordMnemonics') }}</h3>
          <div class="game-ai-words">
            <div v-for="entry in analysis.item.wordMnemonics" :key="entry.word">
              <strong>{{ entry.word }}</strong>
              <p>{{ entry.mnemonic }}</p>
            </div>
          </div>
        </div>
        <div class="game-ai-section">
          <h3>{{ $t('game.sentenceAnalysis') }}</h3>
          <p>{{ analysis.item.sentenceAnalysis }}</p>
        </div>
      </div>

      <footer class="game-ai-footer">
        <div>
          <p>{{ analysis.canRegenerate ? $t('game.aiRemainingGenerations', { count: analysis.remainingGenerations }) : $t('game.aiGenerationLimitReached') }}</p>
          <p v-if="analysisError" class="game-ai-footer-error learning-error-message">{{ analysisError }}</p>
        </div>
        <button
          class="game-ai-action-btn game-ai-regenerate-button"
          type="button"
          :disabled="analysisLoading || !analysis.canRegenerate"
          @click="regenerateAnalysis"
        >
          {{ analysisLoading ? $t('game.aiRegenerating') : $t('game.aiRetryAnalysis') }}
        </button>
      </footer>
    </section>
  </section>
</template>

<script setup lang="ts">
import { onUnmounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { analyzeStatementStreamApi, type StatementAiAnalysis } from "../../api/ai";
import type { CourseStatement } from "../../api/course-pack";
import GameSyntaxDiagram from "./GameSyntaxDiagram.vue";

const props = defineProps<{ statement: CourseStatement; revealed: boolean }>();
const { t } = useI18n();
const analysis = ref<StatementAiAnalysis | null>(null);
const analysisLoading = ref(false);
const analysisError = ref("");
const streamText = ref("");
const isCollapsed = ref(false);
const abortStream = ref<(() => void) | null>(null);

watch(() => props.statement.id, () => {
  if (abortStream.value) {
    abortStream.value();
    abortStream.value = null;
  }
  analysis.value = null;
  analysisLoading.value = false;
  analysisError.value = "";
  streamText.value = "";
  isCollapsed.value = false;
});

onUnmounted(() => {
  if (abortStream.value) {
    abortStream.value();
    abortStream.value = null;
  }
});

function loadAnalysis() {
  requestAnalysis(false);
}

function regenerateAnalysis() {
  if (!analysis.value?.canRegenerate) return;
  requestAnalysis(true);
}

function requestAnalysis(regenerate: boolean) {
  if (abortStream.value) {
    abortStream.value();
    abortStream.value = null;
  }
  analysisLoading.value = true;
  analysisError.value = "";
  streamText.value = "";
  isCollapsed.value = false;

  abortStream.value = analyzeStatementStreamApi(props.statement.id, regenerate, {
    onDelta(delta) {
      streamText.value += delta;
    },
    onDone(result) {
      analysis.value = result;
      analysisLoading.value = false;
      streamText.value = "";
      abortStream.value = null;
    },
    onError(error) {
      analysisError.value = error.message || t("game.aiAnalysisFailed");
      analysisLoading.value = false;
      abortStream.value = null;
    },
  });
}
</script>
