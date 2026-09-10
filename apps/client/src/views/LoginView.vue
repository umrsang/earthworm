<template>
  <div class="auth-dual-grid-page">
    <!-- 左侧：科技感 Hero 区域 (1:1 复刻 callback.vue 左侧) -->
    <section class="auth-hero-banner-section">
      <div class="auth-hero-content-wrapper">
        <router-link to="/" class="auth-hero-brand-title">{{ $t('app.title') }}</router-link>
        <p class="auth-hero-tagline">{{ $t('landing.leftHeroTag') }}</p>
        <h1 class="auth-hero-main-title">{{ $t('landing.leftHeroTitle') }}</h1>
        <p class="auth-hero-description">{{ $t('landing.leftHeroDesc') }}</p>

        <!-- 今日学习进度条卡片 -->
        <div class="auth-hero-progress-card">
          <div class="auth-progress-header">
            <span>{{ $t('landing.todayProgress') }}</span>
            <strong>{{ $t('landing.todayProgressCount') }}</strong>
          </div>
          <div class="auth-progress-track">
            <div class="auth-progress-fill"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- 右侧：登录与注册磨砂表单卡片 (1:1 复刻 callback.vue 右侧) -->
    <section class="auth-form-container-section">
      <form class="auth-form-card" @submit.prevent="handleSubmit">
        <p class="auth-form-top-tag">
          {{ isLogin ? $t('auth.welcomeBack') : $t('auth.createAccount') }}
        </p>
        <h2 class="auth-form-heading">
          {{ isLogin ? $t('auth.loginTitle') : $t('auth.registerTitle') }}
        </h2>
        <p class="auth-form-subheading">
          {{ isLogin ? $t('auth.loginDesc') : $t('auth.registerDesc') }}
        </p>

        <div v-if="errorMessage" class="auth-feedback-alert" style="margin-top: 1rem;">
          {{ errorMessage }}
        </div>

        <div class="auth-form-group">
          <!-- 用户名 -->
          <div class="auth-field-item">
            <label class="auth-field-label">{{ $t('auth.username') }}</label>
            <input
              v-model.trim="username"
              type="text"
              required
              class="auth-field-input"
              :placeholder="$t('auth.usernamePlaceholder')"
            />
          </div>

          <!-- 昵称 (注册模式可见) -->
          <div v-if="!isLogin" class="auth-field-item">
            <label class="auth-field-label">{{ $t('auth.nickname') }}</label>
            <input
              v-model.trim="nickname"
              type="text"
              class="auth-field-input"
              :placeholder="$t('auth.nicknamePlaceholder')"
            />
          </div>

          <!-- 密码与显隐切换 -->
          <div class="auth-field-item">
            <label class="auth-field-label">{{ $t('auth.password') }}</label>
            <div class="auth-password-wrapper">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="auth-field-input"
                :placeholder="$t('auth.passwordPlaceholder')"
              />
              <button
                type="button"
                class="auth-password-toggle-button"
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? $t('auth.hidePassword') : $t('auth.showPassword') }}
              </button>
            </div>
          </div>

          <!-- 协议勾选 (注册模式可见) -->
          <label v-if="!isLogin" class="auth-terms-checkbox-row">
            <input v-model="agreed" type="checkbox" style="margin-top: 3px;" />
            <span>
              {{ $t('auth.agreeTermsPrefix') }}
              <a href="#" class="auth-terms-link">{{ $t('auth.terms') }}</a>
              {{ $t('auth.and') }}
              <a href="#" class="auth-terms-link">{{ $t('auth.privacy') }}</a>
            </span>
          </label>

          <!-- 提交按钮 -->
          <button
            type="submit"
            :disabled="isLoading"
            class="auth-submit-action-button"
          >
            {{ isLoading ? $t('auth.processing') : isLogin ? $t('auth.loginButton') : $t('auth.registerButton') }}
          </button>
        </div>

        <!-- 登录/注册模式无刷新切换 -->
        <button
          type="button"
          class="auth-mode-switch-button"
          @click="switchMode"
        >
          {{ isLogin ? $t('auth.noAccountPrompt') : $t('auth.hasAccountPrompt') }}
        </button>

        <!-- 语言切换器 -->
        <div style="margin-top: 1.5rem; display: flex; justify-content: center;">
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
      </form>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { loginApi, registerApi } from "../api/auth";
import { ROUTE_PATHS } from "../constants";
import { setLanguage } from "../locales";
import { useUserStore } from "../stores/user";

const { t, locale } = useI18n();
const router = useRouter();
const userStore = useUserStore();

const isLogin = ref(true);
const username = ref("");
const password = ref("");
const nickname = ref("");
const agreed = ref(false);
const showPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref("");

const currentLocale = computed(() => locale.value);

function switchLang(lang: string) {
  setLanguage(lang);
}

function switchMode() {
  isLogin.value = !isLogin.value;
  password.value = "";
  errorMessage.value = "";
}

async function handleSubmit() {
  errorMessage.value = "";
  if (username.value.length < 2) {
    errorMessage.value = t("auth.usernamePlaceholder");
    return;
  }
  if (password.value.length < 6) {
    errorMessage.value = t("auth.passwordPlaceholder");
    return;
  }
  if (!isLogin.value && !agreed.value) {
    errorMessage.value = t("auth.mustAgreeTerms");
    return;
  }

  isLoading.value = true;
  try {
    const res = isLogin.value
      ? await loginApi({ username: username.value, password: password.value })
      : await registerApi({ username: username.value, password: password.value, nickname: nickname.value });

    userStore.setToken(res.token);
    await userStore.fetchProfile();
    router.push(ROUTE_PATHS.HOME);
  } catch (err: any) {
    errorMessage.value = err.message;
  } finally {
    isLoading.value = false;
  }
}
</script>
