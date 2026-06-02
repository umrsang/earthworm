<template>
  <div
    class="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] transition-all duration-300 hover:border-purple-500/20 hover:bg-white/[0.04]"
    @click="$emit('cardClick', coursePack)"
  >
    <figure class="relative aspect-video overflow-hidden">
      <NuxtImg
        :src="coursePack.cover"
        :placeholder="[288, 180]"
        width="288"
        height="180"
        class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
    </figure>
    <div class="flex flex-1 flex-col p-4">
      <h3 class="truncate text-base font-semibold text-white">
        {{ coursePack.title }}
      </h3>
      <p class="mt-2 flex-1 line-clamp-2 text-sm leading-relaxed text-gray-500">
        {{ coursePack.description }}
      </p>
      <div class="mt-3 flex items-center justify-between">
        <span
          class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs"
          :class="coursePack.isFree ? 'bg-green-500/10 text-green-400' : 'bg-purple-500/10 text-purple-400'"
        >
          <UIcon :name="coursePack.isFree ? 'i-ph-lock-open' : 'i-ph-crown-simple'" class="h-3.5 w-3.5"></UIcon>
          {{ coursePack.isFree ? '免费' : '会员' }}
        </span>
        <UIcon name="i-ph-arrow-right" class="h-4 w-4 text-gray-600 transition-all duration-300 group-hover:translate-x-1 group-hover:text-purple-400"></UIcon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  coursePack: {
    id: string;
    title: string;
    description: string;
    cover: string;
    isFree: boolean;
  };
}

defineProps<Props>();

defineEmits<{
  (e: "cardClick", coursePack: any): void;
}>();
</script>

<style scoped></style>
