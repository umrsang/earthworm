<template>
  <div class="landing-home-page-container">
    <!-- 顶部极光导航栏 (1:1 复刻 Navbar.vue) -->
    <header class="dark-navbar-header">
      <div class="dark-navbar-inner">
        <router-link to="/" class="dark-navbar-logo-area">
          <div class="dark-navbar-logo-badge">J</div>
          <span class="dark-navbar-logo-text">{{ $t('app.title') }}</span>
        </router-link>

        <div class="dark-navbar-actions-area">
          <!-- 语言切换 -->
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

          <!-- 已登录：展示用户信息与退出按钮 -->
          <template v-if="userStore.token">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <span style="font-size: 0.95rem; color: #d8b4fe; font-weight: 600;">
                {{ userStore.profile?.nickname || userStore.profile?.username }}
              </span>
              <button
                type="button"
                class="language-selector-button"
                style="border: 1px solid var(--theme-border-translucent); border-radius: 8px;"
                @click="handleLogout"
              >
                {{ $t('auth.logout') }}
              </button>
            </div>
          </template>

          <!-- 未登录：展示登录按钮 -->
          <template v-else>
            <button
              type="button"
              class="dark-nav-action-button"
              @click="goToLogin"
            >
              {{ $t('auth.loginButton') }}
            </button>
          </template>
        </div>
      </div>
    </header>

    <!-- 主视口区域 -->
    <main>
      <!-- 场景 A：未登录时展示旧版炫酷 Landing 落地页 (1:1 复刻 Landing/Banner.vue) -->
      <section v-if="!userStore.token" class="landing-hero-section">
        <div class="landing-ambient-glow"></div>

        <div class="landing-hero-badge">
          <span>✨</span>
          <span>{{ $t('landing.badge') }}</span>
        </div>

        <h1 class="landing-hero-headline">
          <span class="text-gradient-purple">{{ $t('landing.titlePrefix') }}</span>
          <br />
          <span>{{ $t('landing.titleSuffix') }}</span>
        </h1>

        <p class="landing-hero-subparagraph">
          {{ $t('landing.description') }}
        </p>

        <div class="landing-cta-row">
          <button type="button" class="landing-primary-cta-button" @click="goToLogin">
            {{ $t('landing.ctaButton') }}
          </button>
        </div>

        <!-- 4 个特性标签行 (复刻 Landing/Banner.vue 底部) -->
        <div class="landing-features-grid">
          <div class="landing-feature-chip">
            <span style="color: #4ade80;">✔</span>
            <span>{{ $t('landing.featureFeedback') }}</span>
          </div>
          <div class="landing-feature-chip">
            <span style="color: #4ade80;">✔</span>
            <span>{{ $t('landing.featureRepetition') }}</span>
          </div>
          <div class="landing-feature-chip">
            <span style="color: #4ade80;">✔</span>
            <span>{{ $t('landing.featureScientific') }}</span>
          </div>
          <div class="landing-feature-chip">
            <span style="color: #4ade80;">✔</span>
            <span>{{ $t('landing.featureGamified') }}</span>
          </div>
        </div>
      </section>

      <!-- 场景 B：已登录时展示旧版工作台 (1:1 复刻 Home/index.vue) -->
      <section v-else class="user-profile-dashboard-section">
        <!-- 左侧头像与用户名 -->
        <div class="user-sidebar-profile-card">
          <div class="user-avatar-circle">
            {{ (userStore.profile?.username || 'U')[0].toUpperCase() }}
          </div>
          <h2 class="user-username-heading">{{ userStore.profile?.username }}</h2>
          <p style="color: var(--theme-text-muted); margin-top: 0.35rem;">
            {{ userStore.profile?.nickname || userStore.profile?.username }}
          </p>
        </div>

        <!-- 右侧内容与数据状态区 -->
        <div class="user-main-content-panel">
          <!-- 数据库自动迁移状态卡片 -->
          <div class="dark-content-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
              <h3 class="dark-content-card-title" style="margin-bottom: 0;">
                {{ $t('home.dbMigrationTitle') }}
              </h3>
              <span class="status-badge is-success">
                <span class="status-dot"></span>
                {{ $t('home.dbStatusReady') }}
              </span>
            </div>
            <p style="color: var(--theme-text-muted); font-size: 0.95rem; line-height: 1.6;">
              {{ $t('home.dbMigrationDesc') }}
            </p>
          </div>

          <!-- 用户基础资料卡片 -->
          <div class="dark-content-card">
            <h3 class="dark-content-card-title">{{ $t('home.dashboard') }}</h3>
            <div class="info-list-group">
              <div class="info-item-row" style="border-bottom: 1px solid var(--theme-border-translucent);">
                <span class="info-item-label" style="color: var(--theme-text-muted);">{{ $t('home.userId') }}</span>
                <span class="info-item-value" style="color: #fff; font-family: monospace;">{{ userStore.profile?.id || '-' }}</span>
              </div>
              <div class="info-item-row" style="border-bottom: 1px solid var(--theme-border-translucent);">
                <span class="info-item-label" style="color: var(--theme-text-muted);">{{ $t('auth.username') }}</span>
                <span class="info-item-value" style="color: #fff;">{{ userStore.profile?.username || '-' }}</span>
              </div>
              <div class="info-item-row" style="border-bottom: 1px solid var(--theme-border-translucent);">
                <span class="info-item-label" style="color: var(--theme-text-muted);">{{ $t('home.nickname') }}</span>
                <span class="info-item-value" style="color: #fff;">{{ userStore.profile?.nickname || '-' }}</span>
              </div>
              <div class="info-item-row" style="border-bottom: 1px solid var(--theme-border-translucent);">
                <span class="info-item-label" style="color: var(--theme-text-muted);">{{ $t('home.registeredAt') }}</span>
                <span class="info-item-value" style="color: #fff;">{{ formattedDate }}</span>
              </div>
            </div>

            <div style="margin-top: 1.5rem;">
              <button
                type="button"
                class="auth-submit-action-button"
                style="max-width: 180px;"
                :disabled="userStore.loading"
                @click="refreshUserProfile"
              >
                {{ userStore.loading ? $t('common.loading') : $t('home.refreshProfile') }}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { ROUTE_PATHS } from "../constants";
import { setLanguage } from "../locales";
import { useUserStore } from "../stores/user";

const { locale } = useI18n();
const router = useRouter();
const userStore = useUserStore();

const currentLocale = computed(() => locale.value);

const formattedDate = computed(() => {
  const time = userStore.profile?.createdAt;
  if (!time) return "-";
  const d = new Date(time);
  return isNaN(d.getTime()) ? String(time) : d.toLocaleString();
});

function switchLang(lang: string) {
  setLanguage(lang);
}

function goToLogin() {
  router.push(ROUTE_PATHS.LOGIN);
}

async function refreshUserProfile() {
  await userStore.fetchProfile();
}

function handleLogout() {
  userStore.logout();
}

onMounted(async () => {
  if (userStore.token && !userStore.profile) {
    await userStore.fetchProfile();
  }
});
</script>
