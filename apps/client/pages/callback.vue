<script setup lang="ts">
import { navigateTo } from "nuxt/app";
import { ref } from "vue";
import { toast } from "vue-sonner";

import { fetchCurrentUser } from "~/api/user";
import { getSignInCallback, register, signIn } from "~/services/auth";
import { useUserStore } from "~/store/user";

const userStore = useUserStore();
const isLogin = ref(true);
const username = ref("");
const password = ref("");
const isLoading = ref(false);

async function handleSubmit() {
  if (!username.value || !password.value) {
    toast.error("请填写用户名和密码");
    return;
  }

  isLoading.value = true;
  try {
    if (isLogin.value) {
      await signIn(username.value, password.value);
    } else {
      await register(username.value, password.value);
    }

    const res = await fetchCurrentUser();
    userStore.initUser(res);

    if (userStore.isNewUser()) {
      // 新用户需要设置用户名
      await navigateTo("/");
    } else {
      await navigateTo(getSignInCallback());
    }
  } catch (e: any) {
    toast.error(e?.message || "操作失败");
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center">
    <div class="card w-full max-w-md bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-center text-2xl font-bold">
          {{ isLogin ? "登录" : "注册" }}
        </h2>
        <div class="form-control">
          <label class="label">
            <span class="label-text">用户名</span>
          </label>
          <input
            v-model="username"
            type="text"
            placeholder="请输入用户名"
            class="input input-bordered w-full"
            @keydown.enter="handleSubmit"
          />
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">密码</span>
          </label>
          <input
            v-model="password"
            type="password"
            placeholder="请输入密码"
            class="input input-bordered w-full"
            @keydown.enter="handleSubmit"
          />
        </div>
        <div class="card-actions mt-4">
          <button
            class="btn btn-primary w-full"
            :disabled="isLoading"
            @click="handleSubmit"
          >
            <span
              v-if="isLoading"
              class="loading loading-spinner"
            ></span>
            {{ isLogin ? "登录" : "注册" }}
          </button>
        </div>
        <div class="mt-2 text-center">
          <button
            class="btn btn-link btn-sm"
            @click="isLogin = !isLogin"
          >
            {{ isLogin ? "没有账号？去注册" : "已有账号？去登录" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
