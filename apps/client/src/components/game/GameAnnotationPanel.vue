<template>
  <aside v-if="partOfSpeechItems.length || syntaxItems.length" class="game-annotation-panel">
    <section v-if="partOfSpeechItems.length" class="game-annotation-section">
      <h2>{{ $t('game.partOfSpeechTitle') }}</h2>
      <div class="game-annotation-list"><article v-for="item in partOfSpeechItems" :key="item.index" class="game-annotation-item"><strong>{{ item.word }}</strong><span v-for="label in item.labels" :key="label">{{ label }}</span></article></div>
    </section>
    <section v-if="syntaxItems.length" class="game-annotation-section">
      <h2>{{ $t('game.syntaxTitle') }}</h2>
      <div class="game-annotation-list"><article v-for="(item, index) in syntaxItems" :key="index" class="game-annotation-item game-syntax-item"><strong>{{ item.phrase }}</strong><span>{{ item.label }}</span><small>{{ $t('game.syntaxType', { type: item.type }) }}</small></article></div>
    </section>
  </aside>
</template>
<script setup lang="ts">
import { computed } from "vue";
import type { CourseStatement } from "../../api/course-pack";
import { getExpectedWords } from "../../composables/game/sentenceAnswer";
const props = defineProps<{ statement: CourseStatement }>();
const words = computed(() => getExpectedWords(props.statement.english));
const valid = (start: number, end: number) => Number.isInteger(start) && Number.isInteger(end) && start >= 0 && end >= start && end < words.value.length;
const partOfSpeechItems = computed(() => words.value.map((word, index) => ({ word, index, labels: [...new Set(props.statement.posTags.filter((tag) => valid(tag[0], tag[1]) && tag[0] <= index && index <= tag[1]).map((tag) => tag[2]))] })).filter((item) => item.labels.length));
const syntaxItems = computed(() => props.statement.syntaxTags.filter((tag) => valid(tag[0], tag[1])).map(([start, end, label, type]) => ({ phrase: words.value.slice(start, end + 1).join(" "), label, type })));
</script>
