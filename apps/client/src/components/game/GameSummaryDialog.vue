<template>
  <section class="game-summary-card">
    <span class="game-summary-icon">✓</span>
    <p class="learning-eyebrow">{{ $t('game.summaryEyebrow') }}</p>
    <h1>{{ $t('game.summaryTitle') }}</h1>
    <p>{{ $t('game.summaryDescription', { count }) }}</p>
    <dl class="game-summary-stats">
      <div><dt>{{ $t('game.completedStatements') }}</dt><dd>{{ count }}</dd></div>
      <div><dt>{{ $t('game.sessionTime') }}</dt><dd>{{ time }}</dd></div>
    </dl>
    <div class="game-summary-actions">
      <button class="button" type="button" @click="$emit('restart')">{{ $t('game.repeatCourse') }}</button>
      <button v-if="hasNext" class="button primary" type="button" @click="$emit('next-course')">{{ $t('game.nextCourse') }}</button>
      <button v-else class="button primary" type="button" @click="$emit('exit')">{{ $t('game.backToLessons') }}</button>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{ count: number; time: string; hasNext: boolean }>();
defineEmits<{ restart: []; "next-course": []; exit: [] }>();
</script>
