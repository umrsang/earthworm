<template>
  <div
    class="absolute left-1/2 top-36 flex w-3/4 translate-x-[-50%] items-center justify-center text-xl"
  >
    <div class="rounded-2xl border border-white/[0.06] bg-[#12122a] p-6 shadow-2xl shadow-purple-900/20">
      <div class="relative pr-8">
        <div class="absolute -right-1 top-0">
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark-20-solid"
            @click="hiddenAnswerTip"
            tabindex="-1"
            :ui="{ color: { gray: { ghost: 'hover:bg-white/10 text-gray-400 hover:text-white' } } }"
          />
        </div>

        <div class="text-3xl text-white">{{ courseStore.currentStatement?.english }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAnswerTip } from "~/composables/main/answerTip";
import { useCourseStore } from "~/store/course";

const courseStore = useCourseStore();
const { hiddenAnswerTip } = useAnswerTip();
</script>
