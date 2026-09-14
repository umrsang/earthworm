<template>
  <main class="sentence-game-page">
    <header class="game-header">
      <button class="game-exit-button" type="button" @click="exitGame">×</button>
      <div class="game-course-info">
        <strong>{{ course?.title || $t('common.loading') }}</strong>
        <span v-if="course">{{ $t('game.progress', { current: currentIndex + 1, total: course.statements.length }) }}</span>
      </div>
      <div class="game-progress-track"><span :style="{ width: progressPercent }"></span></div>
    </header>

    <section v-if="loading" class="game-center-state">{{ $t('common.loading') }}</section>
    <section v-else-if="errorMessage" class="game-center-state learning-error-message">{{ errorMessage }}</section>
    <section v-else-if="completed" class="game-summary-card">
      <span class="game-summary-icon">✓</span>
      <p class="learning-eyebrow">{{ $t('game.summaryEyebrow') }}</p>
      <h1>{{ $t('game.summaryTitle') }}</h1>
      <p>{{ $t('game.summaryDescription', { count: course?.statements.length || 0 }) }}</p>
      <div class="game-summary-actions">
        <button class="button" type="button" @click="restartCourse">{{ $t('game.repeatCourse') }}</button>
        <button v-if="nextCourse" class="button primary" type="button" @click="openNextCourse">{{ $t('game.nextCourse') }}</button>
        <button v-else class="button primary" type="button" @click="exitGame">{{ $t('game.backToLessons') }}</button>
      </div>
    </section>

    <section v-else-if="currentStatement" class="game-question-shell">
      <p class="game-prompt">{{ $t('game.translatePrompt') }}</p>
      <h1>{{ currentStatement.chinese }}</h1>
      <p v-if="currentStatement.soundmark && answerState !== 'answering'" class="game-soundmark">{{ currentStatement.soundmark }}</p>

      <form class="game-answer-form" @submit.prevent="submitAnswer">
        <textarea
          ref="answerInput"
          v-model="answer"
          :class="{ 'has-error': answerState === 'incorrect', 'is-correct': answerState === 'correct' }"
          :placeholder="$t('game.answerPlaceholder')"
          rows="3"
          spellcheck="false"
          autocomplete="off"
          @input="handleAnswerInput"
        ></textarea>
        <div v-if="answerState === 'incorrect'" class="game-feedback incorrect">
          <strong>{{ $t('game.incorrectTitle') }}</strong>
          <div class="game-word-comparison">
            <span v-for="(word, index) in expectedWords" :key="`${word}-${index}`" :class="{ wrong: isWordWrong(word, index) }">{{ word }}</span>
          </div>
          <button type="button" class="game-show-answer" @click="revealAnswer">{{ $t('game.showAnswer') }}</button>
        </div>
        <div v-else-if="answerState === 'correct'" class="game-feedback correct">
          <strong>{{ $t('game.correctTitle') }}</strong>
          <span>{{ currentStatement.english }}</span>
        </div>
        <div v-else-if="answerState === 'revealed'" class="game-feedback revealed">
          <strong>{{ $t('game.answerLabel') }}</strong>
          <span>{{ currentStatement.english }}</span>
        </div>

        <aside v-if="showAnnotations" class="game-annotation-panel">
          <section v-if="partOfSpeechItems.length" class="game-part-of-speech-section">
            <h2>{{ $t('game.partOfSpeechTitle') }}</h2>
            <div class="game-part-of-speech-list">
              <article v-for="item in partOfSpeechItems" :key="`${item.index}-${item.word}`" class="game-part-of-speech-item">
                <strong>{{ item.word }}</strong>
                <span v-for="label in item.labels" :key="label">{{ label }}</span>
              </article>
            </div>
          </section>
          <section v-if="syntaxItems.length" class="game-syntax-section">
            <h2>{{ $t('game.syntaxTitle') }}</h2>
            <div class="game-syntax-list">
              <article v-for="(item, index) in syntaxItems" :key="`${item.start}-${item.end}-${index}`" class="game-syntax-item">
                <strong>{{ item.phrase }}</strong>
                <span>{{ item.label }}</span>
                <small>{{ $t('game.syntaxType', { type: item.type }) }}</small>
              </article>
            </div>
          </section>
        </aside>

        <footer class="game-controls">
          <button v-if="answerState === 'answering'" class="button" type="button" @click="revealAnswer">{{ $t('game.dontKnow') }}</button>
          <button v-if="answerState === 'correct' || answerState === 'revealed'" class="button primary" type="button" @click="goNext">
            {{ isLastStatement ? $t('game.finishCourse') : $t('game.nextStatement') }}
          </button>
          <button v-else class="button primary" type="submit" :disabled="!answer.trim()">{{ $t('game.submitAnswer') }}</button>
        </footer>
      </form>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import {
  completeCourseApi,
  getCourseApi,
  saveCourseProgressApi,
  type CourseDetail,
  type CourseItemBase,
} from "../api/course-pack";
import { ROUTE_NAMES } from "../constants";

const TERMINAL_PUNCTUATION_PATTERN = /[.!?。！？]+$/;
const MULTIPLE_SPACE_PATTERN = /\s+/g;
const QUOTE_PATTERN = /[‘’“”]/g;
const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const course = ref<CourseDetail | null>(null);
const currentIndex = ref(0);
const answer = ref("");
const answerState = ref<"answering" | "incorrect" | "correct" | "revealed">("answering");
const loading = ref(true);
const completed = ref(false);
const errorMessage = ref("");
const nextCourse = ref<CourseItemBase | null>(null);
const answerInput = ref<HTMLTextAreaElement | null>(null);

const currentStatement = computed(() => course.value?.statements[currentIndex.value] || null);
const isLastStatement = computed(() => currentIndex.value >= (course.value?.statements.length || 1) - 1);
const progressPercent = computed(() => {
  const total = course.value?.statements.length || 1;
  return `${Math.round(((currentIndex.value + (completed.value ? 1 : 0)) / total) * 100)}%`;
});
const expectedWords = computed(() => currentStatement.value?.english.trim().split(MULTIPLE_SPACE_PATTERN).filter(Boolean) || []);
const inputWords = computed(() => answer.value.trim().split(MULTIPLE_SPACE_PATTERN));
const partOfSpeechItems = computed(() => expectedWords.value.map((word, index) => ({
  word,
  index,
  labels: [...new Set(
    (currentStatement.value?.posTags || [])
      .filter((tag) => isValidTagRange(tag[0], tag[1]) && tag[0] <= index && index <= tag[1])
      .map((tag) => tag[2]),
  )],
})).filter((item) => item.labels.length));
const syntaxItems = computed(() => (currentStatement.value?.syntaxTags || [])
  .filter((tag) => isValidTagRange(tag[0], tag[1]) && Boolean(tag[2]) && Boolean(tag[3]))
  .map(([start, end, label, type]) => ({
    start,
    end,
    label,
    type,
    phrase: expectedWords.value.slice(start, end + 1).join(" "),
  })));
const showAnnotations = computed(() =>
  (answerState.value === "correct" || answerState.value === "revealed")
  && (partOfSpeechItems.value.length > 0 || syntaxItems.value.length > 0),
);

/** 查询结果也可能包含历史脏数据，渲染前再次过滤越界标注。 */
function isValidTagRange(start: number, end: number): boolean {
  return Number.isInteger(start)
    && Number.isInteger(end)
    && start >= 0
    && end >= start
    && end < expectedWords.value.length;
}

onMounted(loadCourse);
watch(() => route.params.courseId, loadCourse);

async function loadCourse() {
  loading.value = true;
  completed.value = false;
  nextCourse.value = null;
  answer.value = "";
  answerState.value = "answering";
  errorMessage.value = "";
  try {
    course.value = await getCourseApi(String(route.params.coursePackId), String(route.params.courseId));
    if (!course.value.statements.length) throw new Error(t("game.emptyCourse"));
    currentIndex.value = Math.min(Math.max(Number(course.value.statementIndex) || 0, 0), course.value.statements.length - 1);
    await focusAnswer();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : t("common.error");
  } finally {
    loading.value = false;
  }
}

function normalizeAnswer(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(QUOTE_PATTERN, "'")
    .replace(TERMINAL_PUNCTUATION_PATTERN, "")
    .replace(MULTIPLE_SPACE_PATTERN, " ");
}

function submitAnswer() {
  if (!currentStatement.value || !answer.value.trim()) return;
  answerState.value = normalizeAnswer(answer.value) === normalizeAnswer(currentStatement.value.english) ? "correct" : "incorrect";
}

function isWordWrong(expectedWord: string, index: number) {
  return normalizeAnswer(expectedWord) !== normalizeAnswer(inputWords.value[index] || "");
}

function handleAnswerInput() {
  if (answerState.value === "incorrect") answerState.value = "answering";
}

function revealAnswer() {
  answerState.value = "revealed";
  answer.value = currentStatement.value?.english || "";
}

async function goNext() {
  if (!course.value) return;
  if (isLastStatement.value) {
    const result = await completeCourseApi(String(route.params.coursePackId), String(route.params.courseId));
    nextCourse.value = result.nextCourse;
    completed.value = true;
    return;
  }
  currentIndex.value += 1;
  answer.value = "";
  answerState.value = "answering";
  await saveCourseProgressApi(String(route.params.coursePackId), String(route.params.courseId), currentIndex.value);
  await focusAnswer();
}

async function focusAnswer() {
  await nextTick();
  answerInput.value?.focus();
}

function restartCourse() {
  currentIndex.value = 0;
  completed.value = false;
  nextCourse.value = null;
  answer.value = "";
  answerState.value = "answering";
  void saveCourseProgressApi(String(route.params.coursePackId), String(route.params.courseId), 0);
  void focusAnswer();
}

function openNextCourse() {
  if (!nextCourse.value) return;
  router.replace({
    name: ROUTE_NAMES.COURSE_GAME,
    params: { coursePackId: route.params.coursePackId, courseId: nextCourse.value.id },
  });
}

function exitGame() {
  router.push({ name: ROUTE_NAMES.COURSE_PACK_DETAIL, params: { coursePackId: route.params.coursePackId } });
}
</script>
