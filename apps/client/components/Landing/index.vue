<template>
  <div class="min-h-screen bg-[#0a0a16] font-customFont text-white">
    <LandingBanner @start-earthworm="startEarthworm" />
    <LandingFeatures />
    <LandingComments />
    <LandingQuestions />
    <LandingContact />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";

import { isAuthenticated } from "~/services/auth";
import { cancelShortcut, registerShortcut } from "~/utils/keyboardShortcuts";

const { startEarthworm } = useShortcutToGame();

function useShortcutToGame() {
  const router = useRouter();

  async function startEarthworm() {
    if (!isAuthenticated()) {
      router.push(`/course-pack`);
    }
  }

  onMounted(() => {
    registerShortcut("enter", startEarthworm);
  });

  onUnmounted(() => {
    cancelShortcut("enter", startEarthworm);
  });

  return {
    startEarthworm,
  };
}
</script>
