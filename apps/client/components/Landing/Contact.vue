<template>
  <footer
    id="contact"
    class="border-t border-white/[0.06]"
  >
    <div class="mx-auto max-w-screen-xl px-6 py-16">
      <div class="grid grid-cols-1 gap-12 lg:grid-cols-4">
        <!-- Logo & 简介 -->
        <div class="lg:col-span-2">
          <div class="flex items-center gap-4">
            <img
              width="40"
              height="40"
              class="rounded-lg"
              src="/logo.png"
              alt="earthworm-logo"
            />
            <span class="text-2xl font-bold text-white">Earthworm</span>
          </div>
          <p class="mt-4 max-w-sm text-sm leading-relaxed text-gray-500">
            一起来加入我们
            <span class="text-purple-400">Earthworm</span>
            ！ 基于学习科学的英语习得工具，让学习英语不再痛苦。
          </p>
        </div>

        <!-- 导航链接 -->
        <div>
          <p class="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">项目</p>
          <ul class="space-y-3">
            <li>
              <a
                href="https://github.com/cuixueshe/earthworm"
                class="text-sm text-gray-500 transition-colors hover:text-white"
                target="_blank"
                rel="noreferrer"
              >
                开源
              </a>
            </li>
            <li>
              <a
                href="https://github.com/cuixueshe/earthworm/issues"
                class="text-sm text-gray-500 transition-colors hover:text-white"
                target="_blank"
                rel="noreferrer"
              >
                问题
              </a>
            </li>
            <li>
              <a
                href="https://github.com/cuixueshe/earthworm/issues/91"
                class="text-sm text-gray-500 transition-colors hover:text-white"
                target="_blank"
                rel="noreferrer"
              >
                贡献代码
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p class="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">团队</p>
          <ul class="space-y-3">
            <li>
              <a
                href="https://t.me/+dohhXSz-5n1kZDQ1"
                class="text-sm text-gray-500 transition-colors hover:text-white"
                target="_blank"
                rel="noreferrer"
              >
                联系我们
              </a>
            </li>
          </ul>
        </div>
      </div>

      <!-- 底部分隔线 -->
      <div class="mt-12 border-t border-white/[0.06] pt-8 text-center">
        <p class="text-xs text-gray-600">
          &copy; {{ new Date().getFullYear() }} Earthworm. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts"></script>

<style scoped></style>
