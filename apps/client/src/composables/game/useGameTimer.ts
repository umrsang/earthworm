import { computed, onUnmounted, ref } from "vue";

const TIMER_INTERVAL_MS = 1000;

export function useGameTimer() {
  const elapsedSeconds = ref(0);
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
    }, TIMER_INTERVAL_MS);
  }

  function pause() {
    if (timerId === null) return;
    window.clearInterval(timerId);
    timerId = null;
  }

  function reset() {
    pause();
    elapsedSeconds.value = 0;
  }

  onUnmounted(pause);
  return { elapsedSeconds, formattedTime, start, pause, reset };
}
