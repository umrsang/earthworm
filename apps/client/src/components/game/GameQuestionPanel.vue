<template><section class="game-question-panel">
  <div v-if="phase === 'ready'" class="game-ready-state"><span>🎧</span><h1>{{ $t('game.dictationReadyTitle') }}</h1><p>{{ $t('game.dictationReadyDescription') }}</p><button class="button primary" type="button" @click="$emit('start')">{{ $t('game.startDictation') }}</button></div>
  <template v-else><p class="game-prompt">{{ mode === 'dictation' ? $t('game.dictationPrompt') : $t('game.translatePrompt') }}</p><h1 v-if="mode === 'chineseToEnglish'">{{ statement.chinese }}</h1><p v-else class="game-dictation-symbol">•••</p><GameWordInput ref="wordInput" v-model="answerModel" :expected="statement.english" :incorrect-indexes="incorrectIndexes" @submit="$emit('submit')" /><p v-if="phase === 'incorrect'" class="game-error-feedback">{{ $t('game.incorrectTitle') }}</p></template>
</section></template>
<script setup lang="ts">
import { computed, ref } from "vue";
import type { CourseStatement } from "../../api/course-pack";
import type { GameMode, GamePhase } from "../../composables/game/useSentenceGame";
import GameWordInput from "./GameWordInput.vue";
const props = defineProps<{ statement: CourseStatement; answer: string; phase: GamePhase; mode: GameMode; incorrectIndexes: number[] }>();
const emit = defineEmits<{ "update:answer": [value: string]; submit: []; start: [] }>();
const answerModel = computed({ get: () => props.answer, set: (value) => emit("update:answer", value) });
const wordInput = ref<InstanceType<typeof GameWordInput> | null>(null);
defineExpose({ focus: () => wordInput.value?.focus() });
</script>
