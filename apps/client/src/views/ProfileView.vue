<template>
  <div class="app-shell profile-page">
    <AppNavigation />

    <main class="profile-content">
      <!-- 页面标题与概览 -->
      <header class="profile-header">
        <p class="learning-eyebrow">{{ $t('profile.eyebrow') }}</p>
        <h1>{{ $t('profile.title') }}</h1>
      </header>

      <!-- 个人基础资料卡片 -->
      <section class="profile-user-card card">
        <div class="profile-avatar-wrap">
          <span class="profile-avatar">{{ userInitial }}</span>
        </div>
        <div class="profile-user-info">
          <div class="profile-name-row">
            <h2>{{ userDisplayName }}</h2>
            <span class="profile-role-badge" :class="{ 'is-admin': isAdmin }">
              {{ isAdmin ? $t('profile.roleAdmin') : $t('profile.roleUser') }}
            </span>
          </div>
          <p class="profile-username">@{{ userStore.profile?.username }}</p>
        </div>
        <div class="profile-streak-badge">
          <strong>12</strong>
          <span>{{ $t('profile.streakUnit') }}{{ $t('profile.streakLabel') }}</span>
        </div>
      </section>

      <!-- 学习中心：复习与数据洞察 -->
      <section class="profile-section">
        <h3 class="profile-section-title">{{ $t('profile.learningStatsTitle') }}</h3>
        <div class="profile-grid">
          <!-- 待复习卡片 -->
          <article class="profile-action-card card" @click="goToReview">
            <div class="profile-card-icon review-icon">↻</div>
            <div class="profile-card-content">
              <h4>{{ $t('profile.reviewTask') }}</h4>
              <p>{{ $t('profile.reviewTaskDesc') }}</p>
              <div class="profile-card-highlight">
                <span class="profile-badge">{{ $t('profile.reviewTaskCount', { count: 8 }) }}</span>
              </div>
            </div>
            <span class="profile-card-arrow">→</span>
          </article>

          <!-- 数据洞察卡片 -->
          <article class="profile-action-card card" @click="goToHome">
            <div class="profile-card-icon data-icon">⌁</div>
            <div class="profile-card-content">
              <h4>{{ $t('profile.insightsTitle') }}</h4>
              <p>{{ $t('profile.insightsDesc') }}</p>
              <div class="profile-stats-mini">
                <div>
                  <small>{{ $t('profile.todayStudyTime') }}</small>
                  <strong>9 分钟</strong>
                </div>
                <div>
                  <small>{{ $t('profile.completedCount') }}</small>
                  <strong>12 句</strong>
                </div>
              </div>
            </div>
            <span class="profile-card-arrow">→</span>
          </article>
        </div>
      </section>

      <!-- 管理与创作专区：仅管理员可见 -->
      <section v-if="isAdmin" class="profile-section">
        <div class="profile-section-header">
          <h3 class="profile-section-title">{{ $t('profile.adminSectionTitle') }}</h3>
          <span class="profile-admin-tag">{{ $t('profile.roleAdmin') }}</span>
        </div>
        <div class="profile-grid">
          <!-- 系统设置（大模型配置） -->
          <article class="profile-action-card card admin-feature-card" @click="goToAdmin">
            <div class="profile-card-icon admin-icon">⚙</div>
            <div class="profile-card-content">
              <h4>{{ $t('profile.adminSettings') }}</h4>
              <p>{{ $t('profile.adminSettingsDesc') }}</p>
            </div>
            <span class="profile-card-arrow">→</span>
          </article>

          <!-- 创作中心：上传课程包 -->
          <article class="profile-action-card card admin-feature-card" @click="goToUpload">
            <div class="profile-card-icon creator-icon">✎</div>
            <div class="profile-card-content">
              <h4>{{ $t('profile.creatorUpload') }}</h4>
              <p>{{ $t('profile.creatorUploadDesc') }}</p>
            </div>
            <span class="profile-card-arrow">→</span>
          </article>
        </div>
      </section>

      <!-- 通用偏好与账户操作 -->
      <section class="profile-section">
        <h3 class="profile-section-title">{{ $t('profile.generalSettingsTitle') }}</h3>
        <div class="profile-settings-list card">
          <div class="profile-setting-item">
            <span>{{ $t('profile.languageSetting') }}</span>
            <div class="profile-lang-switch">
              <button
                type="button"
                class="lang-btn"
                :class="{ 'is-active': currentLocale === 'zh-CN' }"
                @click="changeLocale('zh-CN')"
              >
                中文
              </button>
              <button
                type="button"
                class="lang-btn"
                :class="{ 'is-active': currentLocale === 'en-US' }"
                @click="changeLocale('en-US')"
              >
                English
              </button>
            </div>
          </div>
          <div class="profile-setting-item profile-logout-item" @click="handleLogout">
            <span class="profile-logout-text">{{ $t('profile.logout') }}</span>
            <span class="profile-card-arrow">⎋</span>
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
import AppNavigation from "../components/AppNavigation.vue";
import { ROUTE_PATHS, STORAGE_KEYS } from "../constants";
import { useUserStore } from "../stores/user";

const { locale, t } = useI18n();
const router = useRouter();
const userStore = useUserStore();

onMounted(async () => {
  if (userStore.token && !userStore.profile) {
    await userStore.fetchProfile().catch(() => null);
  }
});

const isAdmin = computed(() => userStore.profile?.role === "admin");
const currentLocale = computed(() => locale.value);

const userDisplayName = computed(() => {
  return userStore.profile?.nickname || userStore.profile?.username || t("today.guestUser");
});

const userInitial = computed(() => {
  return userDisplayName.value ? userDisplayName.value.charAt(0).toUpperCase() : "U";
});

function goToReview() {
  router.push(ROUTE_PATHS.HOME);
}

function goToHome() {
  router.push(ROUTE_PATHS.HOME);
}

function goToAdmin() {
  router.push(ROUTE_PATHS.ADMIN);
}

function goToUpload() {
  router.push(ROUTE_PATHS.COURSE_PACK_UPLOAD);
}

function changeLocale(target: string) {
  locale.value = target;
  localStorage.setItem(STORAGE_KEYS.LOCALE, target);
}

function handleLogout() {
  userStore.logout();
  router.push(ROUTE_PATHS.HOME);
}
</script>
