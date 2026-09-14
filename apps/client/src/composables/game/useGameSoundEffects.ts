import { onUnmounted } from "vue";
import errorSoundUrl from "../../assets/sounds/error.mp3";
import correctSoundUrl from "../../assets/sounds/right.mp3";

/** 音频起始播放时间位置（秒） */
const AUDIO_START_POSITION = 0;

export function useGameSoundEffects() {
  const correctAudio = new Audio(correctSoundUrl);
  const errorAudio = new Audio(errorSoundUrl);
  correctAudio.preload = "auto";
  errorAudio.preload = "auto";

  /**
   * 播放成功提示音，并在结束或播放受限时继续后续反馈。
   * @param onFinished 成功音效完成后的回调
   */
  function playCorrectSound(onFinished?: () => void) {
    errorAudio.pause();
    errorAudio.currentTime = AUDIO_START_POSITION;
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      correctAudio.onended = null;
      correctAudio.onerror = null;
      onFinished?.();
    };

    correctAudio.pause();
    correctAudio.currentTime = AUDIO_START_POSITION;
    correctAudio.onended = finish;
    correctAudio.onerror = finish;
    void correctAudio.play().catch(finish);
  }

  /** 每次判题失败都将警示音归零重播，允许连续提交重复反馈。 */
  function playErrorSound() {
    correctAudio.pause();
    correctAudio.currentTime = AUDIO_START_POSITION;
    errorAudio.pause();
    errorAudio.currentTime = AUDIO_START_POSITION;
    void errorAudio.play().catch(() => {
      // 浏览器禁止音频时不阻断用户继续修正答案。
    });
  }

  function stop() {
    correctAudio.pause();
    correctAudio.currentTime = AUDIO_START_POSITION;
    errorAudio.pause();
    errorAudio.currentTime = AUDIO_START_POSITION;
  }

  onUnmounted(stop);
  return { playCorrectSound, playErrorSound, stop };
}
