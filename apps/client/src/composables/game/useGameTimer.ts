import { computed, onUnmounted, ref } from "vue";

const TIMER_INTERVAL_MS = 1000;

export function useGameTimer() {
  const elapsedSeconds = ref(0);
  const pendingSeconds = ref(0);
  let timerId: number | null = null;

  const formattedTime = computed(() => {
    const minutes = Math.floor(elapsedSeconds.value / 60).toString().padStart(2, "0");
    const seconds = (elapsedSeconds.value % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  });

  function start() {
    if (timerId !== null) return;
    timerId = window.setInterval(() => {
      elapsedSeconds.value += 1;
      pendingSeconds.value += 1;
    }, TIMER_INTERVAL_MS);
  }

  function pause() {
    if (timerId === null) return;
    window.clearInterval(timerId);
    timerId = null;
  }

  /** 返回当前可上报秒数快照，发送过程中新增的秒数不会被误扣。 */
  function getPendingSeconds(): number {
    return pendingSeconds.value;
  }

  /** 仅在服务端确认成功后扣减对应快照。 */
  function confirmSynced(seconds: number): void {
    pendingSeconds.value = Math.max(0, pendingSeconds.value - seconds);
  }

  function reset() {
    pause();
    elapsedSeconds.value = 0;
  }

  onUnmounted(pause);
  return {
    elapsedSeconds,
    pendingSeconds,
    formattedTime,
    start,
    pause,
    reset,
    getPendingSeconds,
    confirmSynced,
  };
}
