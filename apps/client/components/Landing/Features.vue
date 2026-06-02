<template>
  <section
    id="features"
    class="py-24"
  >
    <div class="mx-auto max-w-screen-xl px-6">
      <!-- 标题区 -->
      <div class="mb-16 text-center">
        <h2 class="text-3xl font-bold text-white sm:text-4xl">了解有关 Earthworm 更多信息</h2>
        <p class="mx-auto mt-4 max-w-xl text-lg text-gray-400">
          通过这些强大的功能将 Earthworm 提升到一个新的水平！
        </p>
      </div>

      <!-- 功能卡片网格 -->
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="(feItem, feIndex) in FEATURES"
          :key="feIndex"
          class="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:border-purple-500/20 hover:bg-white/[0.04]"
        >
          <div
            class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 transition-colors group-hover:bg-purple-500/20"
          >
            <UIcon
              :name="feItem.icon"
              class="h-6 w-6"
            ></UIcon>
          </div>
          <h3 class="mb-2 text-lg font-semibold text-white">
            {{ feItem.title }}
          </h3>
          <p class="text-sm leading-relaxed text-gray-400">
            {{ feItem.desc }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const FEATURES = [
  {
    icon: "i-ph-eye",
    title: "实时反馈和进度跟踪",
    desc: "Earthworm 提供精准即时的反馈机制，辅助学习者即刻纠正学习中的偏差，并通过高效的进度跟踪功能，让每位学习者都能实时掌握自身的学习进展",
  },
  {
    icon: "i-ph-chat-circle-text",
    title: "情境语言学习",
    desc: "Earthworm 精心设计了丰富的语境化学习内容，旨在帮助用户深入理解单词在不同场合下的具体用法，从而有效提高用词的准确性和适应性",
  },
  {
    icon: "i-ph-megaphone-simple",
    title: "提高语言表达能力",
    desc: "通过系统的造句练习，加强学习者对词汇使用和语法结构的理解，有效提升口语和书面语的表达流畅性及准确度",
  },
  {
    icon: "i-brain",
    title: "增强词汇保留率",
    desc: "采用独特的单词句式构建方法，加深学习者对词汇的记忆和应用能力，通过实践加强理解，显著提高长期词汇保留效果",
  },
  {
    icon: "i-ph-book-open-text",
    title: "掌握常用搭配和惯用表达",
    desc: "集成了丰富的词汇搭配和惯用表达学习资源，帮助学习者精准掌握语言的自然表达方式，让语言运用更加地道、流畅",
  },
  {
    icon: "i-ph-speaker-high",
    title: "键盘音效",
    desc: "提供多样化的键盘音效设置及发音方法选择，通过优化听觉反馈增强学习的沉浸感和效率，助力英语学习过程更加高效愉悦",
  },
];
</script>

<style scoped></style>
