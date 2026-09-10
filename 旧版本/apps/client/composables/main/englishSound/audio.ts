import { usePronunciation } from "~/composables/user/pronunciation";

// 浏览器 SpeechSynthesis 降级播放
function speakWithSynthesis(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 1;
  window.speechSynthesis.speak(utterance);
}

// 便于测试
// 后面不使用 audio 后也可以不破坏业务逻辑
const audio = new Audio();
let currentText = "";
export function updateSource(src: string, text?: string) {
  audio.src = src;
  currentText = text || "";
  audio.load();
}

// 有道 TTS 失败时降级到浏览器语音合成
audio.onerror = () => {
  if (currentText) {
    speakWithSynthesis(currentText);
  }
};

const { getPronunciationUrl } = usePronunciation();
export function usePlayWordSound() {
  const wordAudio = new Audio();
  let lastWord = "";
  let isPlaying = false;

  wordAudio.onplay = () => {
    isPlaying = true;
  };

  wordAudio.onended = () => {
    isPlaying = false;
  };

  wordAudio.onerror = () => {
    isPlaying = false;
    if (lastWord) {
      speakWithSynthesis(lastWord);
    }
  };

  function handlePlayWordSound(word: string) {
    if (isPlaying && lastWord === word) {
      // skip
      return;
    }
    lastWord = word;
    wordAudio.src = getPronunciationUrl(word);
    wordAudio.play().catch(() => {});
  }

  return {
    handlePlayWordSound,
  };
}

export interface PlayOptions {
  times?: number;
  rate?: number;
  interval?: number;
}

const DefaultPlayOptions = {
  times: 1,
  rate: 1,
  interval: 500,
};

export function play(playOptions?: PlayOptions) {
  const { times, rate, interval } = Object.assign({}, DefaultPlayOptions, playOptions);

  audio.playbackRate = rate;
  audio.play().catch(() => {
    // Chrome 自动播放策略：用户未交互时静默忽略
  });
  if (times > 1) {
    audio.addEventListener("ended", handleEnded, false);
  }

  let index = 1;
  let timeoutId: NodeJS.Timeout;
  function handleEnded() {
    timeoutId = setTimeout(() => {
      if (index < times) {
        audio.play();
        index++;
      } else {
        index = 1;
        audio.removeEventListener("ended", handleEnded);
      }
    }, interval);
  }

  return () => {
    audio.pause();
    audio.currentTime = 0;
    audio.removeEventListener("ended", handleEnded);
    timeoutId && clearTimeout(timeoutId);
  };
}
