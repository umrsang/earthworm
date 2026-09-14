<template>
  <div class="app-shell course-library-app-shell">
    <!-- 主导航：桌面端侧边栏 / 移动端底部 Tab 栏 -->
    <AppNavigation />

    <!-- 课程库主内容区 -->
    <main class="course-library-page app-main-shell-layout">
      <header class="learning-page-header">
        <router-link class="brand-link" :to="ROUTE_PATHS.HOME">Earthworm</router-link>
        <div class="learning-page-actions">
          <router-link class="button primary" :to="ROUTE_PATHS.COURSE_PACK_UPLOAD">{{ $t('coursePack.uploadAction') }}</router-link>
        </div>
      </header>

      <section class="learning-page-shell">
        <div class="learning-page-title-row">
          <div>
            <p class="learning-eyebrow">{{ $t('coursePack.eyebrow') }}</p>
            <h1>{{ $t('coursePack.libraryTitle') }}</h1>
            <p>{{ $t('coursePack.libraryDescription') }}</p>
          </div>
        </div>

        <p v-if="loading" class="learning-state-message">{{ $t('common.loading') }}</p>
        <div v-else-if="errorMessage" class="learning-error-message">{{ errorMessage }}</div>
        <section v-else-if="coursePacks.length" class="course-pack-grid">
          <button
            v-for="coursePack in coursePacks"
            :key="coursePack.id"
            class="course-pack-card"
            type="button"
            @click="openCoursePack(coursePack.id)"
          >
            <span class="course-pack-card-icon">Aa</span>
            <span class="course-pack-card-content">
              <strong>{{ coursePack.title }}</strong>
              <span>{{ coursePack.description || $t('coursePack.noDescription') }}</span>
              <small>{{ $t('coursePack.packMeta', { courses: Number(coursePack.courseCount), statements: Number(coursePack.statementCount) }) }}</small>
            </span>
            <span class="course-pack-card-arrow">→</span>
          </button>
        </section>
        <section v-else class="learning-empty-card">
          <span class="learning-empty-icon">＋</span>
          <h2>{{ $t('coursePack.emptyTitle') }}</h2>
          <p>{{ $t('coursePack.emptyDescription') }}</p>
          <router-link class="button primary" :to="ROUTE_PATHS.COURSE_PACK_UPLOAD">{{ $t('coursePack.uploadFirst') }}</router-link>
        </section>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { getCoursePacksApi, type CoursePackListItem } from "../api/course-pack";
import AppNavigation from "../components/AppNavigation.vue";
import { ROUTE_NAMES, ROUTE_PATHS } from "../constants";

const router = useRouter();
const coursePacks = ref<CoursePackListItem[]>([]);
const loading = ref(true);
const errorMessage = ref("");

onMounted(async () => {
  try {
    coursePacks.value = await getCoursePacksApi();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "";
  } finally {
    loading.value = false;
  }
});

function openCoursePack(coursePackId: string) {
  router.push({ name: ROUTE_NAMES.COURSE_PACK_DETAIL, params: { coursePackId } });
}
</script>
