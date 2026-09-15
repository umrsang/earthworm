<template>
  <main class="sentence-game-page">
    <GameToolbar
      v-if="course"
      :title="course.title"
      :current="game.currentIndex.value"
      :total="course.statements.length"
      :progress="game.progressPercent.value"
      :time="game.timer.formattedTime.value"
      @exit="exitGame"
      @contents="contentsOpen = true"
      @settings="settingsOpen = true"
      @pause="pauseGame"
    />

    <section v-if="loading" class="game-center-state">{{ $t('common.loading') }}</section>
    <section v-else-if="errorMessage" class="game-center-state learning-error-message">{{ errorMessage }}</section>
    <GameSummaryDialog
      v-else-if="course && game.phase.value === 'completed'"
      :count="course.statements.length"
      :time="game.timer.formattedTime.value"
      :has-next="Boolean(game.nextCourse.value)"
      @restart="restartCourse"
      @next-course="openNextCourse"
      @exit="exitGame"
    />
    <section v-else-if="course && game.currentStatement.value" class="game-play-area">
      <GameQuestionPanel
        v-if="game.isQuestionPhase.value || game.phase.value === 'ready'"
        ref="questionPanel"
        v-model:answer="game.answer.value"
        :statement="game.currentStatement.value"
        :phase="game.phase.value"
        :mode="game.settings.value.mode"
        :incorrect-indexes="game.incorrectIndexes.value"
        @submit="submitAnswer"
        @start="game.startQuestion"
      />
      <GameAnswerPanel v-else :statement="game.currentStatement.value" :revealed="game.answerRevealed.value" />
      <GameControls
        v-if="game.phase.value !== 'ready'"
        :question="game.isQuestionPhase.value"
        :first="game.currentIndex.value === 0"
        :last="game.isLastStatement.value"
        :has-answer="Boolean(game.answer.value.trim())"
        @previous="goPrevious"
        @next="goNext"
        @play="playCurrent"
        @reveal="game.revealAnswer"
        @submit="submitAnswer"
        @retry="game.retry"
      />
    </section>

    <GameConfetti :burst="game.correctBurst.value + game.completionBurst.value" :intensity="game.phase.value === 'completed' ? 'strong' : 'normal'" />
    <p v-if="speechMessage" class="game-toast" role="status">{{ speechMessage }}</p>
    <GameCourseContentsDialog :open="contentsOpen" :statements="course?.statements || []" :current="game.currentIndex.value" @close="contentsOpen = false" @select="selectStatement" />
    <GameSettingsDialog v-model="game.settings.value" :open="settingsOpen" @close="settingsOpen = false" />
    <GamePauseDialog v-if="game.phase.value === 'paused'" :time="game.timer.formattedTime.value" @resume="game.resume" />
  </main>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import {
  completeCourseApi,
  getCourseApi,
  saveCourseProgressApi,
  saveLearningActivitiesApi,
  type CourseDetail,
  type LearningActivityEventPayload,
} from "../api/course-pack";
import GameAnswerPanel from "../components/game/GameAnswerPanel.vue";
import GameControls from "../components/game/GameControls.vue";
import GameConfetti from "../components/game/GameConfetti.vue";
import GameCourseContentsDialog from "../components/game/GameCourseContentsDialog.vue";
import GamePauseDialog from "../components/game/GamePauseDialog.vue";
import GameQuestionPanel from "../components/game/GameQuestionPanel.vue";
import GameSettingsDialog from "../components/game/GameSettingsDialog.vue";
import GameSummaryDialog from "../components/game/GameSummaryDialog.vue";
import GameToolbar from "../components/game/GameToolbar.vue";
import { useGameShortcuts } from "../composables/game/useGameShortcuts";
import { useGameSoundEffects } from "../composables/game/useGameSoundEffects";
import { useSentenceGame } from "../composables/game/useSentenceGame";
import { ROUTE_NAMES } from "../constants";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const MAX_DURATION_SECONDS_PER_EVENT = 3600;

const course = ref<CourseDetail | null>(null);
const activeCoursePackId = ref("");
const activeCourseId = ref("");
const loading = ref(true);
const saving = ref(false);
const errorMessage = ref("");
const speechMessage = ref("");
const contentsOpen = ref(false);
const settingsOpen = ref(false);
const questionPanel = ref<InstanceType<typeof GameQuestionPanel> | null>(null);
const game = useSentenceGame(course);
const soundEffects = useGameSoundEffects();
const sessionId = `${Date.now()}-${crypto.randomUUID()}`;
let eventSequence = 0;
let pendingEvents: LearningActivityEventPayload[] = [];
let learningActivityRequest: Promise<void> = Promise.resolve();
const shortcutsBlocked = computed(() => loading.value || saving.value || contentsOpen.value || settingsOpen.value || game.phase.value === "completed");
game.inputRef.value = questionPanel.value;

onMounted(loadCourse);
watch(() => route.params.courseId, async () => {
  await flushLearningDuration();
  await loadCourse();
});
watch(questionPanel, (panel) => { game.inputRef.value = panel; });
watch(game.correctBurst, () => {
  const correctStatementId = game.currentStatement.value?.id;
  soundEffects.playCorrectSound(() => {
    if (game.settings.value.autoPlay && game.currentStatement.value?.id === correctStatementId) {
      game.playCurrent();
    }
  });
});
watch(game.incorrectBurst, () => { soundEffects.playErrorSound(); });

useGameShortcuts({ phase: game.phase, blocked: shortcutsBlocked, submit: submitAnswer, next: goNext, previous: goPrevious, retry: game.retry, reveal: game.revealAnswer, play: playCurrent, pause: pauseGame, resume: game.resume });

function createEventId(eventType: LearningActivityEventPayload["eventType"]): string {
  eventSequence += 1;
  return `${sessionId}-${eventType}-${eventSequence}`;
}

/** 串行发送学习事件；失败时保留原队列，等待下一次操作重试。 */
function flushLearningActivities(): Promise<void> {
  learningActivityRequest = learningActivityRequest.then(async () => {
    if (!pendingEvents.length) return;
    const events = [...pendingEvents];
    try {
      await saveLearningActivitiesApi(events, new Date().getTimezoneOffset());
      pendingEvents = pendingEvents.slice(events.length);
      const durationSeconds = events.reduce(
        (total, event) => total + (event.eventType === "duration" ? event.durationSeconds : 0),
        0,
      );
      game.timer.confirmSynced(durationSeconds);
    } catch {
      // 学习统计失败不阻断游戏，队列会在下一次刷新时继续重试。
    }
  });
  return learningActivityRequest;
}

function flushLearningDuration(): Promise<void> {
  const durationSeconds = Math.min(game.timer.getPendingSeconds(), MAX_DURATION_SECONDS_PER_EVENT);
  const hasQueuedDuration = pendingEvents.some((event) => event.eventType === "duration");
  if (durationSeconds > 0 && activeCoursePackId.value && activeCourseId.value && !hasQueuedDuration) {
    pendingEvents.push({
      eventId: createEventId("duration"),
      coursePackId: activeCoursePackId.value,
      courseId: activeCourseId.value,
      eventType: "duration",
      durationSeconds,
      attemptCount: 0,
      correctCount: 0,
    });
  }
  return flushLearningActivities();
}

function submitAnswer(): void {
  const result = game.submitAnswer();
  if (!result) return;
  pendingEvents.push({
    eventId: createEventId("answer"),
    coursePackId: activeCoursePackId.value,
    courseId: activeCourseId.value,
    statementId: result.statementId,
    eventType: "answer",
    durationSeconds: 0,
    attemptCount: result.attemptCount,
    correctCount: result.correctCount,
  });
  void flushLearningActivities();
}

function pauseGame(): void {
  game.pause();
  void flushLearningDuration();
}

async function loadCourse() {
  loading.value = true;
  errorMessage.value = "";
  try {
    const coursePackId = String(route.params.coursePackId);
    const courseId = String(route.params.courseId);
    course.value = await getCourseApi(coursePackId, courseId);
    activeCoursePackId.value = coursePackId;
    activeCourseId.value = courseId;
    if (!course.value.statements.length) throw new Error(t("game.emptyCourse"));
    const index = Math.min(Math.max(Number(course.value.statementIndex) || 0, 0), course.value.statements.length - 1);
    game.applyCourse(index);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : t("common.error");
  } finally { loading.value = false; }
}

function playCurrent() {
  if (game.playCurrent()) return;
  speechMessage.value = t("game.speechUnsupported");
  window.setTimeout(() => { speechMessage.value = ""; }, 2400);
}

async function saveIndex(index: number) {
  if (!course.value || saving.value) return;
  saving.value = true;
  try { await saveCourseProgressApi(String(route.params.coursePackId), String(route.params.courseId), index); }
  catch (error) { errorMessage.value = error instanceof Error ? error.message : t("common.error"); }
  finally { saving.value = false; }
}

async function moveTo(index: number) {
  if (!course.value || index < 0 || index >= course.value.statements.length || saving.value) return;
  await flushLearningDuration();
  game.setIndex(index);
  contentsOpen.value = false;
  await saveIndex(index);
}
function goPrevious() { void moveTo(game.currentIndex.value - 1); }
async function goNext() {
  if (!course.value || saving.value) return;
  if (!game.isLastStatement.value) { await moveTo(game.currentIndex.value + 1); return; }
  await flushLearningDuration();
  saving.value = true;
  try {
    const result = await completeCourseApi(String(route.params.coursePackId), String(route.params.courseId));
    game.complete(result.nextCourse);
  } catch (error) { errorMessage.value = error instanceof Error ? error.message : t("common.error"); }
  finally { saving.value = false; }
}
function selectStatement(index: number) { void moveTo(index); }
async function restartCourse() {
  await flushLearningDuration();
  game.restart();
  void saveIndex(0);
}
async function openNextCourse() {
  if (!game.nextCourse.value) return;
  await flushLearningDuration();
  await router.replace({ name: ROUTE_NAMES.COURSE_GAME, params: { coursePackId: route.params.coursePackId, courseId: game.nextCourse.value.id } });
}
async function exitGame() {
  game.speech.stop();
  game.timer.pause();
  soundEffects.stop();
  await flushLearningDuration();
  await router.push({ name: ROUTE_NAMES.COURSE_PACK_DETAIL, params: { coursePackId: route.params.coursePackId } });
}

onBeforeUnmount(() => {
  game.timer.pause();
  void flushLearningDuration();
});
</script>
