<template>
  <section
    id="faq"
    class="py-24"
  >
    <div class="mx-auto max-w-screen-xl px-6">
      <!-- 标题 -->
      <div class="mb-16 text-center">
        <h2 class="text-3xl font-bold text-white sm:text-4xl">常见问题解答</h2>
        <p class="mx-auto mt-4 max-w-xl text-lg text-gray-400">
          如果您找不到所需的内容，请加入 Telegram 群组，我们会尽快回复您！
        </p>
      </div>

      <!-- FAQ 列表 -->
      <div class="mx-auto max-w-3xl space-y-3">
        <template
          v-for="(qsItem, qsIndex) in QUESTIONS"
          :key="qsIndex"
        >
          <details
            class="group rounded-xl border border-white/[0.06] bg-white/[0.02] transition-all duration-300"
            :open="qsIndex === 0"
          >
            <summary
              class="flex cursor-pointer items-center justify-between px-6 py-5 text-white transition-colors hover:bg-white/[0.02]"
            >
              <h3 class="pr-4 text-base font-medium lg:text-lg">
                {{ qsItem.title }}
              </h3>
              <UIcon
                name="i-ph-caret-down-bold"
                class="h-5 w-5 shrink-0 text-gray-500 transition-transform duration-300 group-open:rotate-180"
              ></UIcon>
            </summary>
            <div class="px-6 pb-5">
              <template
                v-for="(asItem, asIndex) in qsItem.content"
                :key="`content-${asIndex}`"
              >
                <p class="py-1.5 text-sm leading-relaxed text-gray-400">
                  <span
                    v-if="qsItem.content.length > 1"
                    class="mr-2 text-purple-400"
                    >{{ asIndex + 1 }}.</span
                  >
                  {{ asItem }}
                </p>
              </template>
            </div>
          </details>
        </template>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const QUESTIONS = [
  {
    title: "如何向开发团队提出更多的功能需求？",
    content: [
      "可以加入我们官方 Telegram 群组，详细的描述您想要的功能以及告知这个功能想要解决的问题是什么",
      "也可以去 github/issues 来提交您想要的功能需求",
    ],
  },
  {
    title: "如何向开发团队报告我在应用中遇到的错误或漏洞？",
    content: [
      "如果您在应用中发现了错误或漏洞，可以加入我们官方 Telegram 群组，提供详细的描述和重现问题的步骤",
    ],
  },
  {
    title: "如何为 Earthworm 贡献代码？",
    content: [
      "我们提供了完整的贡献代码指南，可以先读一读（页脚处有链接）",
      "去 github/issues 逛一逛，也可以基于你在使用中遇到的问题提一个 issue 并且自己尝试修复",
    ],
  },
  {
    title: "Earthworm 项目是完全免费的吗？",
    content: [
      "不完全免费，因为想要长久发展收费是必然的。未来会采用订阅模式，为会员提供更多的学习内容和功能",
    ],
  },
];
</script>

<style scoped></style>
