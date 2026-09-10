<template>
  <div class="register-page-container">
    <div class="auth-card">
      <div class="auth-card-header">
        <h1 class="auth-card-title">{{ $t('auth.register') }}</h1>
        <p class="auth-card-subtitle">{{ $t('app.subtitle') }}</p>
      </div>

      <div v-if="errorMessage" class="form-error-alert">
        {{ errorMessage }}
      </div>

      <form @submit.prevent="handleRegister" class="form-item-group">
        <div class="form-item">
          <label class="form-label">{{ $t('auth.username') }}</label>
          <input
            v-model="form.username"
            type="text"
            required
            class="form-input"
            :placeholder="$t('auth.usernamePlaceholder')"
          />
        </div>

        <div class="form-item">
          <label class="form-label">{{ $t('auth.nickname') }}</label>
          <input
            v-model="form.nickname"
            type="text"
            class="form-input"
            :placeholder="$t('auth.nicknamePlaceholder')"
          />
        </div>

        <div class="form-item">
          <label class="form-label">{{ $t('auth.email') }}</label>
          <input
            v-model="form.email"
            type="email"
            class="form-input"
            :placeholder="$t('auth.emailPlaceholder')"
          />
        </div>

        <div class="form-item">
          <label class="form-label">{{ $t('auth.password') }}</label>
          <input
            v-model="form.password"
            type="password"
            required
            class="form-input"
            :placeholder="$t('auth.passwordPlaceholder')"
          />
        </div>

        <div class="form-item">
          <label class="form-label">{{ $t('auth.confirmPassword') }}</label>
          <input
            v-model="form.confirmPassword"
            type="password"
            required
            class="form-input"
            :placeholder="$t('auth.confirmPasswordPlaceholder')"
          />
        </div>

        <button type="submit" :disabled="loading" class="form-button">
          {{ loading ? $t('common.loading') : $t('auth.registerButton') }}
        </button>
      </form>

      <div class="form-link-wrapper">
        <router-link to="/login" class="form-link">
          {{ $t('auth.hasAccount') }}
        </router-link>
      </div>

      <!-- 语言切换器 -->
      <div class="auth-language-bar" style="margin-top: 1.5rem; display: flex; justify-content: center;">
        <div class="language-selector">
          <button
            type="button"
            class="language-selector-button"
            :class="{ 'is-active': currentLocale === 'zh-CN' }"
            @click="switchLang('zh-CN')"
          >
            中文
          </button>
          <button
            type="button"
            class="language-selector-button"
            :class="{ 'is-active': currentLocale === 'en-US' }"
            @click="switchLang('en-US')"
          >
            English
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { registerApi } from "../api/auth";
import { ROUTE_PATHS } from "../constants";
import { setLanguage } from "../locales";
import { useUserStore } from "../stores/user";

const { t, locale } = useI18n();
const router = useRouter();
const userStore = useUserStore();

const loading = ref(false);
const errorMessage = ref("");

const currentLocale = computed(() => locale.value);

const form = reactive({
  username: "",
  nickname: "",
  email: "",
  password: "",
  confirmPassword: "",
});

/** 切换语言 */
function switchLang(lang: string) {
  setLanguage(lang);
}

/** 提交注册表单 */
async function handleRegister() {
  errorMessage.value = "";

  // 1. 验证两次输入的密码是否一致
  if (form.password !== form.confirmPassword) {
    errorMessage.value = t("auth.passwordMismatch");
    return;
  }

  loading.value = true;
  try {
    const res = await registerApi({
      username: form.username.trim(),
      password: form.password,
      nickname: form.nickname.trim() || undefined,
      email: form.email.trim() || undefined,
    });

    // 2. 注册成功后自动持久化 Token 并跳转首页
    userStore.setToken(res.token);
    await userStore.fetchProfile();
    router.push(ROUTE_PATHS.HOME);
  } catch (err: any) {
    errorMessage.value = err.message;
  } finally {
    loading.value = false;
  }
}
</script>
