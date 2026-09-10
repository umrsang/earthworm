<template>
  <button
    class="rounded-full border border-purple-500/40 bg-purple-500/10 px-5 py-2 text-sm font-medium text-purple-400 transition-all duration-300 hover:border-purple-500 hover:bg-purple-500/20 hover:text-purple-300"
    @click="markStatementAsMastered"
  >
    掌握
  </button>
</template>

<script setup lang="ts">
import { useMastered } from "~/composables/main/useMastered";

const { markStatementAsMastered } = useMastered();
</script>

<style scoped></style>
