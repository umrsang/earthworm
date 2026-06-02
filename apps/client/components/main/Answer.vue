<template>
  <div class="text-center">
    <MainSyntaxAnnotation
      :tokens="words.map((w) => ({ word: w }))"
      :pos-tags="[]"
      :syntax-tags="[]"
      :chinese="courseStore.currentStatement?.chinese ?? ''"
      :soundmark="courseStore.currentStatement?.soundmark ?? ''"
    />
    <div class="mt-6 space-y-3">
      <div>
        <button
          class="rounded-full border border-purple-500/40 bg-purple-500/10 px-5 py-2 text-sm font-medium text-purple-400 transition-all duration-300 hover:border-purple-500 hover:bg-purple-500/20 hover:text-purple-300"
          @click="showQuestion"
        >
          再来一次
        </button>
        <button
          class="ml-4 rounded-full border border-purple-500/40 bg-purple-500/10 px-5 py-2 text-sm font-medium text-purple-400 transition-all duration-300 hover:border-purple-500 hover:bg-purple-500/20 hover:text-purple-300"
          @click="goToNextQuestion"
        >
          下一题
        </button>
      </div>
      <div class="md:hidden">
        <MainMasteredBtn></MainMasteredBtn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from "vue";

import { useCurrentStatementEnglishSound } from "~/composables/main/englishSound";
import { usePlayWordSound } from "~/composables/main/englishSound/audio";
import { useGameMode } from "~/composables/main/game";
import { useAutoPronunciation } from "~/composables/user/sound";
import { useCourseStore } from "~/store/course";
import { cancelShortcut, registerShortcut } from "~/utils/keyboardShortcuts";
import { useAnswer } from "./QuestionInput/useAnswer";

const courseStore = useCourseStore();
const { handlePlayWordSound } = usePlayWordSound();
const { handlePlayEnglishSound } = usePlayEnglishSound();
const { showQuestion } = useGameMode();
const { isAutoPlaySound } = useAutoPronunciation();
const { goToNextQuestion } = useAnswer();

const words = computed(() => courseStore.currentStatement?.english.split(" "));

registerShortcutKeyForNextQuestion();

function usePlayEnglishSound() {
  const { playSound } = useCurrentStatementEnglishSound();

  onMounted(() => {
    if (isAutoPlaySound()) {
      playSound();
    }
  });

  function handlePlayEnglishSound() {
    playSound();
  }

  return {
    handlePlayEnglishSound,
  };
}

function registerShortcutKeyForNextQuestion() {
  function handleKeydown(e: KeyboardEvent) {
    e.preventDefault(); // 阻止到下一个页面的默认按键动作
    goToNextQuestion();
  }
  onMounted(() => {
    registerShortcut(" ", handleKeydown);
    registerShortcut("enter", handleKeydown);
  });

  onUnmounted(() => {
    cancelShortcut(" ", handleKeydown);
    cancelShortcut("enter", handleKeydown);
  });
}
</script>
