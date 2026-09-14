<template>
  <!-- 登录/注册主页面根节点，使用语义化 class 容器 -->
  <div class="auth-page">
    <!-- 左侧：科技与沉浸式故事介绍区域 (1:1 复刻原型 auth-story) -->
    <section class="auth-story-section">
      <!-- 品牌 Logo 导航回首页 -->
      <router-link to="/" class="brand-logo-button auth-story-brand-link" :aria-label="$t('app.title')">
        <span class="brand-mark">E</span>
        <span>
          <strong class="brand-logo-text-title">{{ $t('app.title') }}</strong>
          <small class="brand-logo-text-sub">{{ $t('app.subBrand') }}</small>
        </span>
      </router-link>

      <!-- 品牌故事与价值主张文案 -->
      <div class="auth-story-copy-block">
        <span class="status-pill status-pill-purple">{{ $t('auth.storyPill') }}</span>
        <h1 class="auth-story-main-title">
          {{ $t('auth.storyTitlePrefix') }}<br />
          <em class="auth-story-title-emphasis">{{ $t('auth.storyTitleEmphasis') }}</em>
        </h1>
        <p class="auth-story-description">{{ $t('auth.storyDescription') }}</p>

        <!-- 3 项量化数据指标展示 -->
        <div class="auth-story-proof-row">
          <div>
            <strong class="auth-proof-item-val">{{ $t('auth.proofStreakVal') }}</strong>
            <span class="auth-proof-item-label">{{ $t('auth.proofStreakLabel') }}</span>
          </div>
          <div>
            <strong class="auth-proof-item-val">{{ $t('auth.proofAccuracyVal') }}</strong>
            <span class="auth-proof-item-label">{{ $t('auth.proofAccuracyLabel') }}</span>
          </div>
          <div>
            <strong class="auth-proof-item-val">{{ $t('auth.proofTimeVal') }}</strong>
            <span class="auth-proof-item-label">{{ $t('auth.proofTimeLabel') }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 右侧：表单操作面板 (1:1 复刻原型 auth-panel) -->
    <section class="auth-panel-section">
      <div class="auth-form-card-wrapper">
        <!-- 移动端顶部品牌标识 -->
        <div class="auth-mobile-brand-bar">
          <span class="brand-mark">E</span>
          <strong class="brand-logo-text-title">{{ $t('app.title') }}</strong>
        </div>

        <p class="auth-panel-eyebrow">
          {{ isLogin ? $t('auth.welcomeBack') : $t('auth.createAccount') }}
        </p>
        <h2 class="auth-panel-title">
          {{ isLogin ? $t('auth.loginTitle') : $t('auth.registerTitle') }}
        </h2>
        <p class="auth-panel-subdesc">
          {{ isLogin ? $t('auth.loginDesc') : $t('auth.registerDesc') }}
        </p>

        <!-- 错误提示组件 -->
        <div v-if="errorMessage" class="auth-feedback-error" style="margin-top: 16px;">
          {{ errorMessage }}
        </div>

        <!-- 提交表单 -->
        <form class="auth-form-group" @submit.prevent="handleSubmit">
          <!-- 用户名输入框 -->
          <div class="auth-form-field">
            <label for="auth-username-input" class="auth-field-label">{{ $t('auth.username') }}</label>
            <input
              id="auth-username-input"
              v-model.trim="username"
              type="text"
              autocomplete="username"
              required
              class="auth-input-element"
              :placeholder="$t('auth.usernamePlaceholder')"
            />
          </div>

          <!-- 昵称输入框 (注册模式展示) -->
          <div v-if="!isLogin" class="auth-form-field">
            <label for="auth-nickname-input" class="auth-field-label">{{ $t('auth.nickname') }}</label>
            <input
              id="auth-nickname-input"
              v-model.trim="nickname"
              type="text"
              class="auth-input-element"
              :placeholder="$t('auth.nicknamePlaceholder')"
            />
          </div>

          <!-- 密码输入框与显隐切换 -->
          <div class="auth-form-field">
            <div class="auth-field-label-row">
              <label for="auth-password-input" class="auth-field-label">{{ $t('auth.password') }}</label>
              <!-- 忘记密码轻量操作 -->
              <button
                v-if="isLogin"
                type="button"
                class="auth-switch-action-btn"
                @click="handleForgotPassword"
              >
                {{ $t('auth.forgotPassword') }}
              </button>
            </div>
            <div class="auth-password-container">
              <input
                id="auth-password-input"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                :autocomplete="isLogin ? 'current-password' : 'new-password'"
                required
                class="auth-input-element"
                :placeholder="$t('auth.passwordPlaceholder')"
              />
              <button
                type="button"
                class="auth-password-toggle-btn"
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? $t('auth.hidePassword') : $t('auth.showPassword') }}
              </button>
            </div>
          </div>

          <!-- 确认密码输入框 (注册模式展示) -->
          <div v-if="!isLogin" class="auth-form-field">
            <label for="auth-confirm-password-input" class="auth-field-label">
              {{ $t('auth.confirmPassword') }}
            </label>
            <input
              id="auth-confirm-password-input"
              v-model="confirmPassword"
              type="password"
              autocomplete="new-password"
              required
              class="auth-input-element"
              :placeholder="$t('auth.confirmPasswordPlaceholder')"
            />
          </div>

          <!-- 登录模式：保持登录复选框 -->
          <label v-if="isLogin" class="auth-checkbox-row">
            <input v-model="rememberMe" type="checkbox" />
            <span>{{ $t('auth.rememberMe') }}</span>
          </label>

          <!-- 注册模式：服务条款与隐私政策勾选 -->
          <label v-else class="auth-checkbox-row">
            <input v-model="agreedTerms" type="checkbox" />
            <span>
              {{ $t('auth.agreeTermsPrefix') }}
              <a href="javascript:void(0);">{{ $t('auth.terms') }}</a>
              {{ $t('auth.and') }}
              <a href="javascript:void(0);">{{ $t('auth.privacy') }}</a>
            </span>
          </label>

          <!-- 提交主操作按钮 -->
          <button
            type="submit"
            :disabled="isLoading"
            class="btn-primary auth-submit-btn"
          >
            {{ isLoading ? $t('auth.processing') : isLogin ? $t('auth.loginButton') : $t('auth.registerButton') }}
          </button>
        </form>

        <!-- 模式切换：登录 / 注册 -->
        <div class="auth-switch-prompt-row">
          <span>{{ isLogin ? $t('auth.noAccountPrompt') : $t('auth.hasAccountPrompt') }}</span>
          <button
            type="button"
            class="auth-switch-action-btn"
            @click="switchAuthMode"
          >
            {{ isLogin ? $t('auth.createAccountLink') : $t('auth.loginLink') }}
          </button>
        </div>

        <!-- 返回产品落地页 -->
        <router-link to="/" class="btn-ghost auth-back-home-btn">
          {{ $t('auth.backToHome') }}
        </router-link>

        <!-- 底部语言切换器 -->
        <div style="margin-top: 24px; display: flex; justify-content: center;">
          <div class="language-selector-group">
            <button
              type="button"
              class="language-selector-btn"
              :class="{ 'is-active': currentLocale === 'zh-CN' }"
              @click="switchLanguage('zh-CN')"
            >
              中文
            </button>
            <button
              type="button"
              class="language-selector-btn"
              :class="{ 'is-active': currentLocale === 'en-US' }"
              @click="switchLanguage('en-US')"
            >
              English
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { loginApi, registerApi } from "../api/auth";
import { ROUTE_PATHS } from "../constants";
import { setLanguage } from "../locales";
import { useUserStore } from "../stores/user";

const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

// 状态声明
const isLogin = ref(true);
const username = ref("");
const password = ref("");
const confirmPassword = ref("");
const nickname = ref("");
const rememberMe = ref(true);
const agreedTerms = ref(false);
const showPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref("");

const currentLocale = computed(() => locale.value);

/**
 * 切换中英多语言
 * @param lang 语言代码 ('zh-CN' | 'en-US')
 */
function switchLanguage(lang: string) {
  setLanguage(lang);
}

/**
 * 切换登录与注册模式，重置密码和错误提示
 */
function switchAuthMode() {
  isLogin.value = !isLogin.value;
  password.value = "";
  confirmPassword.value = "";
  errorMessage.value = "";
}

/**
 * 点击“忘记密码”提示交互
 */
function handleForgotPassword() {
  errorMessage.value = t("auth.forgotPasswordTip");
}

/**
 * 提交登录或注册请求
 */
async function handleSubmit() {
  errorMessage.value = "";

  // 基础输入合法性校验
  if (username.value.length < 2) {
    errorMessage.value = t("auth.usernamePlaceholder");
    return;
  }
  if (password.value.length < 6) {
    errorMessage.value = t("auth.passwordPlaceholder");
    return;
  }
  if (!isLogin.value) {
    if (password.value !== confirmPassword.value) {
      errorMessage.value = t("auth.passwordNotMatch");
      return;
    }
    if (!agreedTerms.value) {
      errorMessage.value = t("auth.mustAgreeTerms");
      return;
    }
  }

  isLoading.value = true;
  try {
    const res = isLogin.value
      ? await loginApi({ username: username.value, password: password.value })
      : await registerApi({
          username: username.value,
          password: password.value,
          nickname: nickname.value || username.value,
        });

    // 存储 Token 并获取个人信息；仅接受站内回跳地址，避免开放重定向。
    userStore.setToken(res.token);
    await userStore.fetchProfile();
    const redirect = typeof route.query.redirect === "string"
      && route.query.redirect.startsWith("/")
      && !route.query.redirect.startsWith("//")
      ? route.query.redirect
      : ROUTE_PATHS.HOME;
    router.push(redirect);
  } catch (err: any) {
    errorMessage.value = err.message || t("common.error");
  } finally {
    isLoading.value = false;
  }
}
</script>
