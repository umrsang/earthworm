import { onUnmounted, ref } from "vue";

const DEFAULT_LANGUAGE = "en-US";
const AMERICAN_PRONUNCIATION_TYPE = 2;
const YOUDAO_TTS_ENDPOINT = "https://dict.youdao.com/dictvoice";
const GOOGLE_TTS_ENDPOINT = "https://translate.google.com/translate_tts";
const GOOGLE_TTS_CLIENT = "tw-ob";
const MIN_PLAY_TIMES = 1;
const VOICE_LOAD_TIMEOUT_MS = 1200;
const HYPHEN_PATTERN = /-/g;
const REMAINING_APOSTROPHE_PATTERN = /'/g;

export interface SpeechOptions {
  rate: number;
  times: number;
  interval: number;
}

/** 清理有道 TTS 不兼容的连字符与常见英文缩写。 */
function sanitizeTtsText(text: string): string {
  return text
    .replace(HYPHEN_PATTERN, " ")
    .replace(/(\w)'m\b/gi, "$1 am")
    .replace(/(\w)'re\b/gi, "$1 are")
    .replace(/(\w)'s\b/gi, "$1 is")
    .replace(/(\w)'ll\b/gi, "$1 will")
    .replace(/(\w)'ve\b/gi, "$1 have")
    .replace(/(\w)'d\b/gi, "$1 would")
    .replace(/(\w)n't\b/gi, "$1 not")
    .replace(/let's\b/gi, "let us")
    .replace(REMAINING_APOSTROPHE_PATTERN, "");
}

function getYoudaoTtsUrl(text: string): string {
  const query = new URLSearchParams({
    type: String(AMERICAN_PRONUNCIATION_TYPE),
    audio: sanitizeTtsText(text),
  });
  return `${YOUDAO_TTS_ENDPOINT}?${query.toString()}`;
}

function getGoogleTtsUrl(text: string): string {
  const query = new URLSearchParams({
    ie: "UTF-8",
    client: GOOGLE_TTS_CLIENT,
    tl: DEFAULT_LANGUAGE,
    q: text,
  });
  return `${GOOGLE_TTS_ENDPOINT}?${query.toString()}`;
}

export function useSpeech() {
  const speaking = ref(false);
  const audioSupported = typeof window !== "undefined" && typeof Audio !== "undefined";
  const synthesisSupported = typeof window !== "undefined" && "speechSynthesis" in window;
  const supported = audioSupported || synthesisSupported;
  const audio = audioSupported ? new Audio() : null;
  let timerId: number | null = null;
  let voiceTimerId: number | null = null;
  let playSequence = 0;

  function clearTimers() {
    if (timerId !== null) window.clearTimeout(timerId);
    if (voiceTimerId !== null) window.clearTimeout(voiceTimerId);
    timerId = null;
    voiceTimerId = null;
  }

  function stop() {
    playSequence += 1;
    clearTimers();
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    if (synthesisSupported) window.speechSynthesis.cancel();
    speaking.value = false;
  }

  /** 等待浏览器异步加载 voice，优先选用美式英文并在超时后继续降级朗读。 */
  function speakWithSynthesis(text: string, rate: number, sequence: number, onEnd: () => void) {
    if (!synthesisSupported || sequence !== playSequence) {
      speaking.value = false;
      return;
    }

    let started = false;
    const speak = () => {
      if (started || sequence !== playSequence) return;
      started = true;
      clearTimers();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      utterance.voice = voices.find((voice) => voice.lang.toLowerCase() === DEFAULT_LANGUAGE.toLowerCase())
        || voices.find((voice) => voice.lang.toLowerCase().startsWith("en"))
        || null;
      utterance.lang = DEFAULT_LANGUAGE;
      utterance.rate = rate;
      utterance.onend = onEnd;
      utterance.onerror = () => { speaking.value = false; };
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length) {
      speak();
      return;
    }
    window.speechSynthesis.addEventListener("voiceschanged", speak, { once: true });
    voiceTimerId = window.setTimeout(speak, VOICE_LOAD_TIMEOUT_MS);
  }

  /** 优先播放真实 TTS 音频；网络、跨域或播放失败时自动降级到浏览器语音。 */
  function play(text: string, options: SpeechOptions): boolean {
    stop();
    if (!supported || !text.trim()) return false;
    const sequence = playSequence;
    let remaining = Math.max(MIN_PLAY_TIMES, options.times);
    speaking.value = true;

    const finishOnce = () => {
      if (sequence !== playSequence) return;
      remaining -= 1;
      if (remaining <= 0) {
        speaking.value = false;
        return;
      }
      timerId = window.setTimeout(playOnce, options.interval);
    };

    const playOnce = () => {
      if (sequence !== playSequence) return;
      const audioSources = [getYoudaoTtsUrl(text), getGoogleTtsUrl(text)];
      let sourceIndex = 0;
      let attemptSequence = 0;

      /** 当前音源失败后尝试下一个，全部失败才降级为系统语音。 */
      const tryNextSource = () => {
        if (sequence !== playSequence) return;
        const currentAttempt = ++attemptSequence;
        if (!audio || sourceIndex >= audioSources.length) {
          speakWithSynthesis(text, options.rate, sequence, finishOnce);
          return;
        }
        const source = audioSources[sourceIndex++];
        const handleFailure = () => {
          if (currentAttempt !== attemptSequence || sequence !== playSequence) return;
          attemptSequence += 1;
          audio.onerror = null;
          audio.pause();
          tryNextSource();
        };
        audio.onended = finishOnce;
        audio.onerror = handleFailure;
        audio.playbackRate = options.rate;
        audio.src = source;
        audio.load();
        void audio.play().catch(handleFailure);
      };

      tryNextSource();
    };

    playOnce();
    return true;
  }

  onUnmounted(stop);
  return { supported, speaking, play, stop };
}
