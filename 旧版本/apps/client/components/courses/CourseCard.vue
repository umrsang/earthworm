<template>
  <div
    :ref="isActiveCourse ? 'activeCourseRef' : undefined"
    :class="[
      'group relative w-full min-h-[180px] cursor-pointer overflow-hidden rounded-2xl border p-5 pb-6 transition-all duration-300',
      isActiveCourse
        ? 'border-purple-500/40 bg-purple-500/5 shadow-lg shadow-purple-500/10'
        : hasFinished
          ? 'border-emerald-500/30 bg-emerald-500/5'
          : 'border-white/[0.06] bg-white/[0.02] hover:border-purple-500/20 hover:bg-white/[0.04]',
    ]"
    @click="$emit('click')"
  >
    <h3 class="text-base font-semibold text-white">
      {{ title }}
    </h3>
    <p
      class="mt-3 line-clamp-2 text-sm leading-relaxed text-gray-500"
      :title="description"
    >
      {{ description }}
    </p>
    <div
      v-if="hasFinished"
      class="absolute bottom-1.5 right-1.5 flex h-6 w-auto min-w-[28px] items-center justify-center rounded-lg px-1.5 text-xs font-medium"
      :class="isActiveCourse ? 'bg-purple-600 text-white' : 'bg-emerald-600 text-white'"
    >
      <UTooltip :text="dataTip">
        {{ count }}
      </UTooltip>
    </div>
    <!-- 当前课程指示器 -->
    <div
      v-if="isActiveCourse"
      class="absolute right-0 top-0 h-8 w-1 rounded-l-full bg-purple-500"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

import { useActiveCourseMap } from "~/composables/courses/activeCourse";

const props = defineProps<{
  title: string;
  id: string;
  count: number | undefined;
  coursePackId: string;
  description: string;
}>();

defineEmits<{
  (e: "click"): void;
}>();

const { activeCourseMap } = useActiveCourseMap();

const activeCourseRef = ref<HTMLDivElement>();
const hasFinished = computed(() => !!props.count);
const isActiveCourse = computed(() => activeCourseMap.value[props.coursePackId] == props.id);
const dataTip = computed(() => `已完成 ${props.count} 次`);

onMounted(() => {
  activeCourseRef.value?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
});
</script>

<style scoped></style>
