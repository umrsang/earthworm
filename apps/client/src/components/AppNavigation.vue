<template>
  <!-- 主侧边栏 / 移动端底部导航栏通用组件 -->
  <aside class="sidebar app-main-sidebar" aria-label="主导航">
    <!-- 桌面端顶部品牌 Logo -->
    <router-link to="/" class="brand" :aria-label="$t('app.title')">
      <span class="brand-mark">E</span>
      <span>
        <strong>{{ $t('app.title') }}</strong>
        <small>{{ $t('app.subBrand') }}</small>
      </span>
    </router-link>

    <!-- 核心菜单项导航 -->
    <nav class="main-nav">
      <!-- 今日工作台 -->
      <button
        type="button"
        class="nav-item"
        :class="{ 'is-active': activeKey === 'today' }"
        @click="navigateTo(ROUTE_PATHS.HOME)"
      >
        <span class="nav-icon">⌂</span>
        <span>{{ $t('today.navToday') }}</span>
      </button>

      <!-- 课程库 (直属菜单) -->
      <button
        type="button"
        class="nav-item"
        :class="{ 'is-active': activeKey === 'courses' }"
        @click="navigateTo(ROUTE_PATHS.COURSE_PACKS)"
      >
        <span class="nav-icon">▤</span>
        <span>{{ $t('today.navCourses') }}</span>
      </button>

      <!-- 待复习 -->
      <button
        type="button"
        class="nav-item"
        :class="{ 'is-active': activeKey === 'review' }"
        @click="navigateTo(ROUTE_PATHS.HOME)"
      >
        <span class="nav-icon">↻</span>
        <span>{{ $t('today.navReview') }}</span>
        <span class="nav-badge">8</span>
      </button>

      <!-- 洞察 -->
      <button
        type="button"
        class="nav-item"
        :class="{ 'is-active': activeKey === 'insights' }"
        @click="navigateTo(ROUTE_PATHS.HOME)"
      >
        <span class="nav-icon">⌁</span>
        <span>{{ $t('today.navInsights') }}</span>
      </button>

      <!-- 创作中心 (直属菜单) -->
      <button
        type="button"
        class="nav-item"
        :class="{ 'is-active': activeKey === 'creator' }"
        @click="navigateTo(ROUTE_PATHS.COURSE_PACK_UPLOAD)"
      >
        <span class="nav-icon">✎</span>
        <span>{{ $t('today.navCreator') }}</span>
      </button>
    </nav>

    <!-- 桌面端底部区域：目标进度与个人菜单 -->
    <div class="sidebar-bottom">
      <div class="goal-mini">
        <div class="goal-mini-head">
          <span>{{ $t('today.goalProgress') }}</span>
          <strong>60%</strong>
        </div>
        <div class="progress-track">
          <i style="width: 60%;"></i>
        </div>
        <small>{{ $t('today.goalProgressDetail') }}</small>
      </div>

      <button type="button" class="nav-item" @click="navigateTo(ROUTE_PATHS.HOME)">
        <span class="nav-icon">⚙</span>
        <span>{{ $t('today.navSettings') }}</span>
      </button>

      <button type="button" class="profile-chip" @click="toggleUserMenu">
        <span class="avatar">{{ userInitial }}</span>
        <span>
          <strong>{{ userDisplayName }}</strong>
          <small>{{ $t('today.streakPrefix') }} 12 {{ $t('today.streakSuffix') }}</small>
        </span>
        <span class="chevron">⌄</span>
      </button>
    </div>

    <!-- 用户登出弹出菜单 (移动端与桌面端共用) -->
    <div v-if="showUserMenu" class="user-dropdown-menu">
      <div class="user-dropdown-header">
        <strong>{{ userDisplayName }}</strong>
        <small>{{ userStore.user?.username }}</small>
      </div>
      <button type="button" class="user-dropdown-item danger" @click="handleLogout">
        {{ $t('auth.logout') }}
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { ROUTE_PATHS } from "../constants";
import { useUserStore } from "../stores/user";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const showUserMenu = ref(false);

/** 当前激活的菜单项标识，自动根据路由匹配 */
const activeKey = computed(() => {
  const currentPath = route.path;
  if (currentPath === ROUTE_PATHS.COURSE_PACK_UPLOAD) {
    return "creator";
  }
  if (currentPath.startsWith(ROUTE_PATHS.COURSE_PACKS)) {
    return "courses";
  }
  if (currentPath === ROUTE_PATHS.HOME) {
    return "today";
  }
  return "";
});

/** 当前用户展示昵称或用户名 */
const userDisplayName = computed(() => {
  return userStore.user?.nickname || userStore.user?.username || t("today.guestUser");
});

/** 当前用户头像首字母 */
const userInitial = computed(() => {
  return userDisplayName.value ? userDisplayName.value.charAt(0).toUpperCase() : "U";
});

/**
 * 路由跳转
 * @param path 目标路径
 */
function navigateTo(path: string) {
  showUserMenu.value = false;
  if (route.path !== path) {
    router.push(path);
  }
}

/** 切换用户操作气泡菜单 */
function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value;
}

/** 处理注销退出登录 */
function handleLogout() {
  showUserMenu.value = false;
  userStore.logout();
  router.push(ROUTE_PATHS.HOME);
}
</script>
