import { computed, nextTick, ref, watch, type Ref } from "vue";
import type { CourseDetail, CourseItemBase } from "../../api/course-pack";
import { STORAGE_KEYS } from "../../constants";
import { getIncorrectWordIndexes, normalizeAnswer } from "./sentenceAnswer";
import { useGameTimer } from "./useGameTimer";
import { useSpeech } from "./useSpeech";

export type GameMode = "chineseToEnglish" | "dictation";
export type GamePhase = "ready" | "question" | "incorrect" | "answer" | "paused" | "completed";
export interface GameSettings { mode: GameMode; autoPlay: boolean; rate: number; times: number; interval: number }
const DEFAULT_SETTINGS: GameSettings = { mode: "chineseToEnglish", autoPlay: true, rate: 1, times: 1, interval: 3000 };

function loadSettings(): GameSettings {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.GAME_SETTINGS) || "null");
    return saved ? { ...DEFAULT_SETTINGS, ...saved } : { ...DEFAULT_SETTINGS };
  } catch { return { ...DEFAULT_SETTINGS }; }
}

export function useSentenceGame(course: Ref<CourseDetail | null>) {
  const currentIndex = ref(0);
  const answer = ref("");
  const phase = ref<GamePhase>("question");
  const previousPhase = ref<GamePhase>("question");
  const incorrectIndexes = ref<number[]>([]);
  const answerRevealed = ref(false);
  const correctBurst = ref(0);
  const incorrectBurst = ref(0);
  const completionBurst = ref(0);
  const nextCourse = ref<CourseItemBase | null>(null);
  const settings = ref<GameSettings>(loadSettings());
  const inputRef = ref<{ focus: () => void } | null>(null);
  const timer = useGameTimer();
  const speech = useSpeech();

  const currentStatement = computed(() => course.value?.statements[currentIndex.value] || null);
  const isLastStatement = computed(() => currentIndex.value >= (course.value?.statements.length || 1) - 1);
  const progressPercent = computed(() => `${Math.round(((currentIndex.value + (phase.value === "completed" ? 1 : 0)) / (course.value?.statements.length || 1)) * 100)}%`);
  const isQuestionPhase = computed(() => phase.value === "question" || phase.value === "incorrect");

  function persistSettings() {
    localStorage.setItem(STORAGE_KEYS.GAME_SETTINGS, JSON.stringify(settings.value));
  }

  function resetQuestion(autoPlay = true) {
    speech.stop();
    answer.value = "";
    incorrectIndexes.value = [];
    answerRevealed.value = false;
    phase.value = settings.value.mode === "dictation" ? "ready" : "question";
    if (phase.value === "ready") timer.pause();
    else timer.start();
    if (settings.value.mode === "chineseToEnglish" && autoPlay && settings.value.autoPlay) playCurrent();
    void focusInput();
  }

  function startQuestion() {
    phase.value = "question";
    timer.start();
    if (settings.value.mode === "dictation" || settings.value.autoPlay) playCurrent();
    void focusInput();
  }

  function submitAnswer() {
    if (!currentStatement.value || !answer.value.trim() || !isQuestionPhase.value) return;
    if (normalizeAnswer(answer.value) === normalizeAnswer(currentStatement.value.english)) {
      phase.value = "answer";
      incorrectIndexes.value = [];
      answerRevealed.value = false;
      correctBurst.value += 1;
      speech.stop();
      return;
    }
    incorrectIndexes.value = getIncorrectWordIndexes(answer.value, currentStatement.value.english);
    incorrectBurst.value += 1;
    phase.value = "incorrect";
  }

  function revealAnswer() {
    if (!currentStatement.value) return;
    answer.value = currentStatement.value.english;
    incorrectIndexes.value = [];
    answerRevealed.value = true;
    phase.value = "answer";
    playCurrent();
  }

  function retry() { resetQuestion(false); phase.value = "question"; }
  function playCurrent() {
    if (!currentStatement.value) return false;
    return speech.play(currentStatement.value.english, settings.value);
  }
  function pause() { if (phase.value === "paused" || phase.value === "completed") return; previousPhase.value = phase.value; phase.value = "paused"; timer.pause(); speech.stop(); }
  function resume() { phase.value = previousPhase.value; timer.start(); void focusInput(); }
  async function focusInput() { await nextTick(); inputRef.value?.focus(); }
  function applyCourse(startIndex: number) { currentIndex.value = startIndex; nextCourse.value = null; timer.reset(); resetQuestion(); }
  function setIndex(index: number) { currentIndex.value = index; resetQuestion(); }
  function complete(next: CourseItemBase | null) { nextCourse.value = next; phase.value = "completed"; completionBurst.value += 1; timer.pause(); speech.stop(); }
  function restart() { currentIndex.value = 0; nextCourse.value = null; timer.reset(); resetQuestion(); }

  watch(settings, () => { persistSettings(); resetQuestion(false); }, { deep: true });
  return { currentIndex, answer, phase, incorrectIndexes, answerRevealed, correctBurst, incorrectBurst, completionBurst, nextCourse, settings, inputRef, timer, speech, currentStatement, isLastStatement, progressPercent, isQuestionPhase, applyCourse, startQuestion, submitAnswer, revealAnswer, retry, playCurrent, pause, resume, setIndex, complete, restart, focusInput };
}
