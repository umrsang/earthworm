<template>
  <div class="overflow-hidden rounded-full bg-purple-500/10">
    <div
      class="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-400 transition-all duration-300"
      :style="{ width: `${percentage}%` }"
    ></div>
  </div>
</template>

<script setup lang="ts">
defineProps(["percentage"]);
</script>
