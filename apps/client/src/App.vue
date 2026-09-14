<template>
  <div class="app-root-container">
    <!-- 全局霓虹流体追光背景 -->
    <NeonGlowBackground />
    <div class="app-view-layer">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import NeonGlowBackground from "./components/NeonGlowBackground.vue";
</script>
