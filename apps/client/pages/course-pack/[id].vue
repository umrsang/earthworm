<template>
  <div class="flex w-full flex-col">
    <template v-if="isLoading">
      <Loading></Loading>
    </template>

    <template v-else>
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-white">
          {{ coursePackStore.currentCoursePack?.title }}
        </h2>
        <p class="mt-1 text-sm text-gray-500">
          共 {{ coursePackStore.currentCoursePack?.courses?.length }} 个课程
        </p>
      </div>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <template
          v-for="course in coursePackStore.currentCoursePack?.courses"
          :key="course.id"
        >
          <div class="group/card relative">
            <CoursesCourseCard
              :title="course.title"
              :description="course.description"
              :id="course.id"
              :count="course.completionCount"
              :coursePackId="course.coursePackId"
              @click="handleChangeCourse(course.id)"
            />
            <!-- 课程编辑/删除按钮 -->
            <div
              v-if="isOwner"
              class="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover/card:opacity-100"
            >
              <button
                class="rounded-lg bg-white/10 p-1.5 text-gray-400 backdrop-blur-sm transition hover:bg-purple-500/30 hover:text-purple-300"
                title="编辑课程"
                @click.stop="startEditCourse(course)"
              >
                <UIcon
                  name="i-ph-pencil-simple"
                  class="h-4 w-4"
                ></UIcon>
              </button>
              <button
                class="rounded-lg bg-white/10 p-1.5 text-gray-400 backdrop-blur-sm transition hover:bg-red-500/30 hover:text-red-400"
                title="删除课程"
                @click.stop="confirmDeleteCourse(course)"
              >
                <UIcon
                  name="i-ph-trash"
                  class="h-4 w-4"
                ></UIcon>
              </button>
            </div>
          </div>
        </template>
      </div>
    </template>

    <!-- 编辑课程弹窗 -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showEditCourseModal"
          class="fixed inset-0 z-50 flex items-center justify-center"
          @click.self="showEditCourseModal = false"
        >
          <div
            class="fixed inset-0 bg-black/60 backdrop-blur-sm"
            @click="showEditCourseModal = false"
          ></div>
          <div
            class="relative z-10 mx-4 w-full max-w-md rounded-2xl border border-white/[0.06] bg-[#12122a] p-6 shadow-2xl shadow-purple-900/20"
          >
            <h3 class="mb-4 text-lg font-bold text-white">编辑课程</h3>
            <div class="space-y-4">
              <div>
                <label class="mb-1 block text-sm text-gray-400">标题</label>
                <input
                  v-model="editCourseForm.title"
                  type="text"
                  class="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-purple-500/30 focus:outline-none"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm text-gray-400">描述</label>
                <textarea
                  v-model="editCourseForm.description"
                  rows="3"
                  class="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-purple-500/30 focus:outline-none"
                ></textarea>
              </div>
            </div>
            <div class="mt-6 flex justify-end gap-3">
              <button
                class="rounded-full border border-white/[0.06] bg-white/[0.02] px-5 py-2 text-sm text-gray-400 hover:bg-white/[0.06] hover:text-white"
                @click="showEditCourseModal = false"
              >
                取消
              </button>
              <button
                class="rounded-full bg-purple-600 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-500"
                :disabled="isSaving"
                @click="saveEditCourse"
              >
                {{ isSaving ? "保存中..." : "保存" }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 删除课程确认弹窗 -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showDeleteCourseModal"
          class="fixed inset-0 z-50 flex items-center justify-center"
          @click.self="showDeleteCourseModal = false"
        >
          <div
            class="fixed inset-0 bg-black/60 backdrop-blur-sm"
            @click="showDeleteCourseModal = false"
          ></div>
          <div
            class="relative z-10 mx-4 w-full max-w-sm rounded-2xl border border-white/[0.06] bg-[#12122a] p-6 shadow-2xl shadow-red-900/20"
          >
            <h3 class="mb-2 text-lg font-bold text-white">确认删除</h3>
            <p class="text-sm text-gray-400">
              确定要删除课程 "<span class="text-white">{{ deleteCourseTarget?.title }}</span
              >" 吗？此操作将同时删除其中的所有语句，不可恢复。
            </p>
            <div class="mt-6 flex justify-end gap-3">
              <button
                class="rounded-full border border-white/[0.06] bg-white/[0.02] px-5 py-2 text-sm text-gray-400 hover:bg-white/[0.06] hover:text-white"
                @click="showDeleteCourseModal = false"
              >
                取消
              </button>
              <button
                class="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-500"
                :disabled="isDeleting"
                @click="doDeleteCourse"
              >
                {{ isDeleting ? "删除中..." : "确认删除" }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { navigateTo } from "#app";
import { definePageMeta } from "#imports";
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { toast } from "vue-sonner";

import { useActiveCourseMap } from "~/composables/courses/activeCourse";
import { useCoursePackStore } from "~/store/coursePack";
import { useUserStore } from "~/store/user";

definePageMeta({ middleware: "auth" });

const isLoading = ref(false);
const route = useRoute();
const coursePackStore = useCoursePackStore();
const userStore = useUserStore();
const coursePackId = route.params.id as string;
const { updateActiveCourseMap } = useActiveCourseMap();

const showEditCourseModal = ref(false);
const showDeleteCourseModal = ref(false);
const isSaving = ref(false);
const isDeleting = ref(false);
const editCourseForm = ref({ title: "", description: "" });
const editingCourseId = ref("");
const deleteCourseTarget = ref<{ id: string; title: string } | null>(null);

const isOwner = computed(() => {
  return userStore.user?.id === coursePackStore.currentCoursePack?.creatorId;
});

setup();

async function setup() {
  isLoading.value = true;
  await coursePackStore.setupCoursePack(coursePackId);
  isLoading.value = false;
}

function handleChangeCourse(courseId: string) {
  updateActiveCourseMap(coursePackId, courseId);
  navigateTo(`/game/${coursePackId}/${courseId}`);
}

function startEditCourse(course: any) {
  editingCourseId.value = course.id;
  editCourseForm.value = {
    title: course.title,
    description: course.description || "",
  };
  showEditCourseModal.value = true;
}

async function saveEditCourse() {
  isSaving.value = true;
  try {
    await coursePackStore.editCourse(editingCourseId.value, editCourseForm.value);
    toast.success("课程已更新");
    showEditCourseModal.value = false;
  } catch (e: any) {
    toast.error(e?.message || "更新失败");
  } finally {
    isSaving.value = false;
  }
}

function confirmDeleteCourse(course: any) {
  deleteCourseTarget.value = { id: course.id, title: course.title };
  showDeleteCourseModal.value = true;
}

async function doDeleteCourse() {
  if (!deleteCourseTarget.value) return;
  isDeleting.value = true;
  try {
    await coursePackStore.removeCourse(deleteCourseTarget.value.id);
    toast.success("课程已删除");
    showDeleteCourseModal.value = false;
  } catch (e: any) {
    toast.error(e?.message || "删除失败");
  } finally {
    isDeleting.value = false;
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
