import { computed, ref } from "vue";

import { useCourseStore } from "~/store/course";

// 评测状态
export type EvaluationStatus = "idle" | "recording" | "evaluating" | "done" | "error";

// SpeechRecognition 的类型声明（浏览器兼容）
interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
}

// 移除标点符号并转为小写
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,!?;:'"()[\]{}\-_]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// 计算最长公共子序列长度（基于单词）
function lcsLength(words1: string[], words2: string[]): number {
  const m = words1.length;
  const n = words2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (words1[i - 1] === words2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp[m][n];
}

// 计算发音准确率（0-100）
export function calculateAccuracy(target: string, recognized: string): number {
  const normalizedTarget = normalizeText(target);
  const normalizedRecognized = normalizeText(recognized);

  if (normalizedTarget.length === 0) return 0;
  if (normalizedRecognized.length === 0) return 0;

  const targetWords = normalizedTarget.split(" ");
  const recognizedWords = normalizedRecognized.split(" ");

  const lcs = lcsLength(targetWords, recognizedWords);
  const accuracy = Math.round((lcs / targetWords.length) * 100);

  return Math.min(accuracy, 100);
}

// 获取准确率对应的颜色
export function getAccuracyColor(accuracy: number): string {
  if (accuracy >= 80) return "text-green-500";
  if (accuracy >= 60) return "text-yellow-500";
  return "text-red-500";
}

// 获取准确率对应的评语
export function getAccuracyLabel(accuracy: number): string {
  if (accuracy >= 90) return "优秀！";
  if (accuracy >= 80) return "很好！";
  if (accuracy >= 60) return "继续努力！";
  return "需要多练习";
}

// 全局状态
const status = ref<EvaluationStatus>("idle");
const recognizedText = ref<string>("");
const accuracy = ref<number>(0);
const errorMessage = ref<string>("");

// SpeechRecognition 实例
let recognition: any = null;

// 检查浏览器是否支持语音识别
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
}

// 创建 SpeechRecognition 实例
function createRecognition(): any {
  const SpeechRecognitionClass =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognitionClass) return null;

  const instance = new SpeechRecognitionClass();
  instance.lang = "en-US";
  instance.interimResults = false;
  instance.maxAlternatives = 1;
  instance.continuous = false;

  return instance;
}

export function usePronunciationEvaluation() {
  const courseStore = useCourseStore();

  const targetText = computed(() => courseStore.currentStatement?.english ?? "");

  function startEvaluation() {
    if (!isSpeechRecognitionSupported()) {
      errorMessage.value = "当前浏览器不支持语音识别，请使用 Chrome 浏览器";
      status.value = "error";
      return;
    }

    // 清空之前的结果
    recognizedText.value = "";
    accuracy.value = 0;
    errorMessage.value = "";

    // 停止之前的识别
    if (recognition) {
      try {
        recognition.stop();
      } catch {
        // 忽略错误
      }
    }

    recognition = createRecognition();
    if (!recognition) {
      errorMessage.value = "无法启动语音识别";
      status.value = "error";
      return;
    }

    status.value = "recording";

    recognition.onresult = (event: any) => {
      const result: SpeechRecognitionResult = {
        transcript: event.results[0][0].transcript,
        confidence: event.results[0][0].confidence,
      };
      recognizedText.value = result.transcript;
      status.value = "evaluating";

      // 计算准确率
      setTimeout(() => {
        accuracy.value = calculateAccuracy(targetText.value, result.transcript);
        status.value = "done";
      }, 300);
    };

    recognition.onerror = (event: any) => {
      if (event.error === "no-speech") {
        errorMessage.value = "未检测到语音，请重试";
      } else if (event.error === "not-allowed") {
        errorMessage.value = "请允许麦克风权限后重试";
      } else {
        errorMessage.value = `语音识别错误: ${event.error}`;
      }
      status.value = "error";
    };

    recognition.onend = () => {
      if (status.value === "recording") {
        status.value = "idle";
      }
    };

    recognition.start();
  }

  function stopEvaluation() {
    if (recognition) {
      try {
        recognition.stop();
      } catch {
        // 忽略错误
      }
    }
    status.value = "idle";
  }

  function resetEvaluation() {
    status.value = "idle";
    recognizedText.value = "";
    accuracy.value = 0;
    errorMessage.value = "";
  }

  return {
    status,
    recognizedText,
    accuracy,
    errorMessage,
    targetText,
    isSupported: isSpeechRecognitionSupported(),
    startEvaluation,
    stopEvaluation,
    resetEvaluation,
  };
}
