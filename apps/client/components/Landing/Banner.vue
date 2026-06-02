<template>
  <section
    id="home"
    class="relative overflow-hidden pb-16 pt-24"
  >
    <!-- 背景光斑 -->
    <div
      class="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-purple-600/10 blur-[120px]"
    ></div>
    <div
      class="pointer-events-none absolute left-1/4 top-32 h-[300px] w-[400px] rounded-full bg-blue-600/5 blur-[100px]"
    ></div>

    <!-- 左右布局：左侧文案，右侧预览图 -->
    <div class="relative mx-auto max-w-screen-xl px-6">
      <div class="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-16">
        <!-- 左侧：文案区域 -->
        <div class="flex-1 lg:max-w-xl">
          <!-- 标签 -->
          <div
            class="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-gray-400"
          >
            <UIcon
              name="i-ph-sparkle-fill"
              class="h-4 w-4 text-purple-400"
            ></UIcon>
            基于学习科学的英语习得工具
          </div>

          <!-- 主标题 -->
          <h1 class="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            <span
              class="bg-gradient-to-r from-purple-400 via-purple-300 to-white bg-clip-text text-transparent"
            >
              让你上瘾的
            </span>
            <br />
            <span class="text-white">英语学习工具</span>
          </h1>

          <!-- 副标题 -->
          <p class="mt-8 max-w-xl text-lg leading-relaxed text-gray-400 lg:text-xl">
            使用
            <span class="text-purple-400">连词成句</span>、
            <span class="text-purple-400">i+1</span>、
            <span class="text-purple-400">以终为始</span>
            等学习理论，通过不断
            <span class="text-purple-400">重复</span>形成肌肉记忆， 以
            <span class="text-purple-400">游戏化</span>
            的形式让学习英语不再痛苦
          </p>

          <!-- CTA 按钮 -->
          <div class="mt-10 flex flex-wrap items-center gap-4">
            <button
              @click="handleKeydown"
              class="inline-flex items-center gap-2 rounded-full bg-purple-600 px-12 py-3.5 text-base font-semibold text-white shadow-lg shadow-purple-600/25 transition-all duration-300 hover:scale-105 hover:bg-purple-500 hover:shadow-purple-500/30 active:scale-100"
            >
              <UIcon
                name="i-ph-play-fill"
                class="h-5 w-5"
              ></UIcon>
              免费开始
            </button>
          </div>
        </div>

        <!-- 右侧：产品预览图 -->
        <div class="flex-shrink-0">
          <div
            class="overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-1 shadow-2xl shadow-purple-900/20"
          >
            <img
              alt="Earthworm 产品预览"
              src="~/assets/home-page-preview.png"
              class="w-full max-w-[640px] rounded-xl"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 特性标签行 -->
    <div class="mx-auto mt-16 max-w-screen-xl px-6">
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div
          class="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3"
        >
          <UIcon
            name="i-ph-check-circle-fill"
            class="h-5 w-5 shrink-0 text-green-400"
          ></UIcon>
          <span class="text-sm text-gray-400">实时反馈</span>
        </div>
        <div
          class="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3"
        >
          <UIcon
            name="i-ph-check-circle-fill"
            class="h-5 w-5 shrink-0 text-green-400"
          ></UIcon>
          <span class="text-sm text-gray-400">情境学习</span>
        </div>
        <div
          class="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3"
        >
          <UIcon
            name="i-ph-check-circle-fill"
            class="h-5 w-5 shrink-0 text-green-400"
          ></UIcon>
          <span class="text-sm text-gray-400">进度跟踪</span>
        </div>
        <div
          class="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3"
        >
          <UIcon
            name="i-ph-check-circle-fill"
            class="h-5 w-5 shrink-0 text-green-400"
          ></UIcon>
          <span class="text-sm text-gray-400">完全免费</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const emit = defineEmits(["start-earthworm"]);

function handleKeydown() {
  emit("start-earthworm");
}
</script>

<style scoped></style>
