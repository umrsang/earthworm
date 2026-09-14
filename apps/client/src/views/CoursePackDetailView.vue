<template>
  <main class="course-detail-page">
    <header class="learning-page-header">
      <router-link class="brand-link" :to="ROUTE_PATHS.COURSE_PACKS">← {{ $t('coursePack.libraryTitle') }}</router-link>
    </header>

    <section class="learning-page-shell">
      <p v-if="loading" class="learning-state-message">{{ $t('common.loading') }}</p>
      <div v-else-if="errorMessage" class="learning-error-message">{{ errorMessage }}</div>
      <template v-else-if="coursePack">
        <header class="course-detail-hero">
          <p class="learning-eyebrow">{{ $t('coursePack.detailEyebrow') }}</p>
          <h1>{{ coursePack.title }}</h1>
          <p class="course-detail-description">{{ coursePack.description || $t('coursePack.noDescription') }}</p>
          <dl class="course-detail-metadata">
            <div v-if="coursePack.name"><dt>{{ $t('coursePack.metadataName') }}</dt><dd>{{ coursePack.name }}</dd></div>
            <div v-if="coursePack.version"><dt>{{ $t('coursePack.metadataVersion') }}</dt><dd>{{ coursePack.version }}</dd></div>
            <div v-if="coursePack.level"><dt>{{ $t('coursePack.metadataLevel') }}</dt><dd>{{ coursePack.level }}</dd></div>
            <div><dt>{{ $t('coursePack.metadataUnits') }}</dt><dd>{{ coursePack.courses.length }}</dd></div>
            <div v-if="coursePack.totalVocab !== undefined && coursePack.totalVocab !== null">
              <dt>{{ $t('coursePack.metadataVocab') }}</dt><dd>{{ coursePack.totalVocab }}</dd>
            </div>
          </dl>
          <div v-if="coursePack.tags?.length" class="course-detail-tags" :aria-label="$t('coursePack.metadataTags')">
            <span v-for="tag in coursePack.tags" :key="tag">{{ tag }}</span>
          </div>
        </header>
        <section class="lesson-list">
          <button
            v-for="(course, index) in coursePack.courses"
            :key="course.id"
            class="lesson-grid-card"
            type="button"
            @click="startCourse(course.id)"
          >
            <div class="lesson-card-head">
              <span class="lesson-order">{{ String(index + 1).padStart(2, '0') }}</span>
              <span v-if="Number(course.completionCount) > 0" class="lesson-status-tag mint">
                ✓ {{ $t('today.task1Status') }}
              </span>
            </div>
            <div class="lesson-content">
              <strong>{{ course.title }}</strong>
              <span>{{ course.description || $t('coursePack.lessonDescriptionFallback') }}</span>
            </div>
            <div class="lesson-card-foot">
              <small>{{ $t('coursePack.statementCount', { count: Number(course.statementCount) }) }}</small>
              <span class="lesson-action">{{ getCourseAction(course.id) }} →</span>
            </div>
          </button>
        </section>
      </template>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { getCoursePackApi, type CoursePackDetail } from "../api/course-pack";
import { ROUTE_NAMES, ROUTE_PATHS } from "../constants";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const coursePack = ref<CoursePackDetail | null>(null);
const loading = ref(true);
const errorMessage = ref("");

onMounted(async () => {
  try {
    coursePack.value = await getCoursePackApi(String(route.params.coursePackId));
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "";
  } finally {
    loading.value = false;
  }
});

function getCourseAction(courseId: string) {
  return coursePack.value?.progress?.courseId === courseId ? t("coursePack.continueLesson") : t("coursePack.startLesson");
}

function startCourse(courseId: string) {
  router.push({
    name: ROUTE_NAMES.COURSE_GAME,
    params: { coursePackId: route.params.coursePackId, courseId },
  });
}
</script>
