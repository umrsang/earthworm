<template>
  <main class="grid min-h-screen w-full bg-[#090914] lg:grid-cols-2">
    <section
      class="hidden items-center justify-center overflow-hidden bg-gradient-to-br from-purple-700/30 via-[#111126] to-cyan-500/10 p-16 lg:flex"
    >
      <div class="max-w-lg">
        <NuxtLink
          to="/"
          class="text-2xl font-black text-white"
          >Earthworm</NuxtLink
        >
        <p class="mt-16 text-sm font-semibold tracking-[0.24em] text-purple-300">
          LEARN BY BUILDING
        </p>
        <h1 class="mt-5 text-5xl font-bold leading-tight text-white">
          把每一句英语，练成自然反应。
        </h1>
        <p class="mt-6 text-lg leading-8 text-gray-400">
          课程进度、错题复习和学习洞察都会自动同步。
        </p>
        <div class="mt-12 rounded-3xl border border-white/10 bg-white/[0.05] p-6">
          <div class="flex justify-between text-sm text-gray-300">
            <span>今日学习</span><strong>12 / 20 句</strong>
          </div>
          <div class="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div class="h-full w-3/5 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400" />
          </div>
        </div>
      </div>
    </section>

    <section class="flex items-center justify-center p-6 sm:p-12">
      <form
        class="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.035] p-7 shadow-2xl sm:p-10"
        @submit.prevent="handleSubmit"
      >
        <p class="text-sm font-semibold tracking-[0.2em] text-purple-400">
          {{ isLogin ? "WELCOME BACK" : "CREATE ACCOUNT" }}
        </p>
        <h2 class="mt-3 text-3xl font-bold text-white">
          {{ isLogin ? "登录 Earthworm" : "创建学习账号" }}
        </h2>
        <p class="mt-2 text-gray-400">
          {{ isLogin ? "继续上次的学习进度。" : "注册后自动同步学习记录。" }}
        </p>

        <label class="mt-8 block text-sm text-gray-300">用户名</label>
        <input
          v-model.trim="username"
          autocomplete="username"
          class="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-purple-400"
          placeholder="2–20 位用户名"
        />

        <label class="mt-5 block text-sm text-gray-300">密码</label>
        <div class="relative mt-2">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            :autocomplete="isLogin ? 'current-password' : 'new-password'"
            class="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 pr-16 text-white outline-none focus:border-purple-400"
            placeholder="至少 8 位，包含字母和数字"
          />
          <button
            type="button"
            class="absolute right-3 top-3 text-sm text-gray-400"
            @click="showPassword = !showPassword"
          >
            {{ showPassword ? "隐藏" : "显示" }}
          </button>
        </div>

        <label
          v-if="!isLogin"
          class="mt-5 flex items-start gap-3 text-sm text-gray-400"
        >
          <input
            v-model="agreed"
            type="checkbox"
            class="mt-1"
          />
          <span
            >我已阅读并同意
            <NuxtLink
              to="/terms"
              class="text-purple-300"
              >用户协议</NuxtLink
            >
            和
            <NuxtLink
              to="/privacy-policy"
              class="text-purple-300"
              >隐私政策</NuxtLink
            ></span
          >
        </label>

        <button
          class="mt-7 w-full rounded-xl bg-purple-500 px-4 py-3 font-semibold text-white transition hover:bg-purple-400 disabled:opacity-60"
          :disabled="isLoading"
        >
          {{ isLoading ? "处理中…" : isLogin ? "登录" : "免费注册" }}
        </button>
        <button
          type="button"
          class="mt-5 w-full text-sm text-gray-400 hover:text-white"
          @click="switchMode"
        >
          {{ isLogin ? "没有账号？免费创建账号" : "已有账号？返回登录" }}
        </button>
      </form>
    </section>
  </main>
</template>

<script setup lang="ts">
import { definePageMeta } from "#imports";
import { navigateTo } from "nuxt/app";
import { ref } from "vue";
import { toast } from "vue-sonner";

import { fetchCurrentUser } from "~/api/user";
import { getSignInCallback, register, signIn } from "~/services/auth";
import { useUserStore } from "~/store/user";

const userStore = useUserStore();
definePageMeta({ layout: false });
const isLogin = ref(true);
const username = ref("");
const password = ref("");
const agreed = ref(false);
const showPassword = ref(false);
const isLoading = ref(false);

function switchMode() {
  isLogin.value = !isLogin.value;
  password.value = "";
}

async function handleSubmit() {
  if (username.value.length < 2) return toast.error("用户名至少需要 2 位");
  if (password.value.length < 8 || !/[a-z]/i.test(password.value) || !/\d/.test(password.value)) {
    return toast.error("密码至少 8 位，并且包含字母和数字");
  }
  if (!isLogin.value && !agreed.value) return toast.error("请先同意用户协议和隐私政策");
  isLoading.value = true;
  try {
    isLogin.value
      ? await signIn(username.value, password.value)
      : await register(username.value, password.value);
    userStore.initUser(await fetchCurrentUser());
    await navigateTo(getSignInCallback());
  } catch (error: any) {
    toast.error(error?.message || "操作失败，请稍后重试");
  } finally {
    isLoading.value = false;
  }
}
</script>
