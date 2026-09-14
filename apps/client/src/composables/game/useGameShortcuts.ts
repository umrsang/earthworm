import { onMounted, onUnmounted, type Ref } from "vue";
import type { GamePhase } from "./useSentenceGame";

interface ShortcutActions {
  phase: Ref<GamePhase>;
  blocked: Ref<boolean>;
  submit: () => void;
  next: () => void;
  previous: () => void;
  retry: () => void;
  reveal: () => void;
  play: () => void;
  pause: () => void;
  resume: () => void;
}

export function useGameShortcuts(actions: ShortcutActions) {
  function handleKeydown(event: KeyboardEvent) {
    if (event.isComposing || actions.blocked.value) return;
    const key = event.key.toLowerCase();
    if (actions.phase.value === "paused") {
      if (key === "p" || key === "escape") {
        event.preventDefault();
        actions.resume();
      }
      return;
    }
    const target = event.target as HTMLElement | null;
    const typing = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA";

    if (event.key === "Enter") {
      event.preventDefault();
      if (actions.phase.value === "answer") actions.next();
      else if (actions.phase.value === "question" || actions.phase.value === "incorrect") actions.submit();
      return;
    }
    if (typing && event.key !== "Escape") return;
    const commands: Record<string, () => void> = {
      " ": actions.play,
      h: actions.reveal,
      r: actions.retry,
      arrowleft: actions.previous,
      arrowright: actions.next,
      p: actions.phase.value === "paused" ? actions.resume : actions.pause,
      escape: actions.phase.value === "paused" ? actions.resume : actions.pause,
    };
    if (!commands[key]) return;
    event.preventDefault();
    commands[key]();
  }

  onMounted(() => window.addEventListener("keydown", handleKeydown));
  onUnmounted(() => window.removeEventListener("keydown", handleKeydown));
}
