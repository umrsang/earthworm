<template>
  <div class="flex w-full flex-col">
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-white">课程包</h2>
        <p class="mt-1 text-sm text-gray-500">选择一个课程包开始学习</p>
      </div>
      <NuxtLink
        to="/course-pack/upload"
        class="inline-flex items-center gap-2 rounded-full bg-purple-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-purple-600/25 transition-all duration-300 hover:scale-105 hover:bg-purple-500 active:scale-100"
      >
        <UIcon
          name="i-ph-upload-simple"
          class="h-4 w-4"
        ></UIcon>
        上传课程包
      </NuxtLink>
    </div>

    <template v-if="isLoading">
      <Loading></Loading>
    </template>

    <template v-else>
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <template
          v-for="coursePack in coursePackStore.coursePacks"
          :key="coursePack.id"
        >
          <div class="group/card relative">
            <CoursePackCard
              :coursePack="{
                id: coursePack.id,
                title: coursePack.title,
                description: coursePack.description,
                cover: coursePack.cover,
                isFree: coursePack.isFree,
              }"
              @cardClick="handleGoToCoursePack"
            />
            <!-- 编辑/删除按钮：仅创建者可见 -->
            <div
              v-if="isOwner(coursePack)"
              class="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover/card:opacity-100"
            >
              <button
                class="rounded-lg bg-white/10 p-1.5 text-gray-400 backdrop-blur-sm transition hover:bg-purple-500/30 hover:text-purple-300"
                title="编辑"
                @click.stop="startEdit(coursePack)"
              >
                <UIcon
                  name="i-ph-pencil-simple"
                  class="h-4 w-4"
                ></UIcon>
              </button>
              <button
                class="rounded-lg bg-white/10 p-1.5 text-gray-400 backdrop-blur-sm transition hover:bg-red-500/30 hover:text-red-400"
                title="删除"
                @click.stop="confirmDelete(coursePack)"
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

    <!-- 编辑弹窗 -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showEditModal"
          class="fixed inset-0 z-50 flex items-center justify-center"
          @click.self="showEditModal = false"
        >
          <div
            class="fixed inset-0 bg-black/60 backdrop-blur-sm"
            @click="showEditModal = false"
          ></div>
          <div
            class="relative z-10 mx-4 w-full max-w-md rounded-2xl border border-white/[0.06] bg-[#12122a] p-6 shadow-2xl shadow-purple-900/20"
          >
            <h3 class="mb-4 text-lg font-bold text-white">编辑课程包</h3>
            <div class="space-y-4">
              <div>
                <label class="mb-1 block text-sm text-gray-400">标题</label>
                <input
                  v-model="editForm.title"
                  type="text"
                  class="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-purple-500/30 focus:outline-none"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm text-gray-400">描述</label>
                <textarea
                  v-model="editForm.description"
                  rows="3"
                  class="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-purple-500/30 focus:outline-none"
                ></textarea>
              </div>
              <div class="flex items-center gap-3">
                <label class="text-sm text-gray-400">免费</label>
                <input
                  v-model="editForm.isFree"
                  type="checkbox"
                  class="rounded"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm text-gray-400">分享级别</label>
                <select
                  v-model="editForm.shareLevel"
                  class="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-sm text-white focus:border-purple-500/30 focus:outline-none"
                >
                  <option value="public">公开</option>
                  <option value="private">私有</option>
                  <option value="founder_only">仅创始会员</option>
                </select>
              </div>
            </div>
            <div class="mt-6 flex justify-end gap-3">
              <button
                class="rounded-full border border-white/[0.06] bg-white/[0.02] px-5 py-2 text-sm text-gray-400 hover:bg-white/[0.06] hover:text-white"
                @click="showEditModal = false"
              >
                取消
              </button>
              <button
                class="rounded-full bg-purple-600 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-500"
                :disabled="isSaving"
                @click="saveEdit"
              >
                {{ isSaving ? "保存中..." : "保存" }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 删除确认弹窗 -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showDeleteModal"
          class="fixed inset-0 z-50 flex items-center justify-center"
          @click.self="showDeleteModal = false"
        >
          <div
            class="fixed inset-0 bg-black/60 backdrop-blur-sm"
            @click="showDeleteModal = false"
          ></div>
          <div
            class="relative z-10 mx-4 w-full max-w-sm rounded-2xl border border-white/[0.06] bg-[#12122a] p-6 shadow-2xl shadow-red-900/20"
          >
            <h3 class="mb-2 text-lg font-bold text-white">确认删除</h3>
            <p class="text-sm text-gray-400">
              确定要删除课程包 "<span class="text-white">{{ deleteTarget?.title }}</span
              >" 吗？此操作将同时删除其中的所有课程和语句，不可恢复。
            </p>
            <div class="mt-6 flex justify-end gap-3">
              <button
                class="rounded-full border border-white/[0.06] bg-white/[0.02] px-5 py-2 text-sm text-gray-400 hover:bg-white/[0.06] hover:text-white"
                @click="showDeleteModal = false"
              >
                取消
              </button>
              <button
                class="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-500"
                :disabled="isDeleting"
                @click="doDelete"
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
import { definePageMeta } from "#imports";
import { ref } from "vue";
import { toast } from "vue-sonner";

import type { CoursePack, CoursePacksItem } from "~/types";
import CoursePackCard from "~/components/courses/CoursePackCard.vue";
import { useNavigation } from "~/composables/useNavigation";
import { useCoursePackStore } from "~/store/coursePack";
import { useUserStore } from "~/store/user";

definePageMeta({ middleware: "auth" });

const coursePackStore = useCoursePackStore();
const userStore = useUserStore();
const { gotoCourseList } = useNavigation();
const isLoading = ref(false);

const showEditModal = ref(false);
const showDeleteModal = ref(false);
const isSaving = ref(false);
const isDeleting = ref(false);
const editForm = ref({ title: "", description: "", isFree: true, shareLevel: "public" });
const editingId = ref("");
const deleteTarget = ref<CoursePacksItem | null>(null);

setup();

async function setup() {
  if (coursePackStore.coursePacks.length === 0) {
    isLoading.value = true;
    await coursePackStore.setupCoursePacks();
    isLoading.value = false;
  }
}

function isOwner(coursePack: CoursePacksItem) {
  return userStore.user?.id === (coursePack as any).creatorId;
}

function handleGoToCoursePack(coursePack: CoursePack) {
  if (coursePack.isFree) {
    gotoCourseList(coursePack.id);
  } else {
    console.log("需要是会员");
  }
}

function startEdit(coursePack: CoursePacksItem) {
  editingId.value = coursePack.id;
  editForm.value = {
    title: coursePack.title,
    description: coursePack.description,
    isFree: coursePack.isFree,
    shareLevel: (coursePack as any).shareLevel || "public",
  };
  showEditModal.value = true;
}

async function saveEdit() {
  isSaving.value = true;
  try {
    await coursePackStore.editCoursePack(editingId.value, editForm.value);
    toast.success("课程包已更新");
    showEditModal.value = false;
  } catch (e: any) {
    toast.error(e?.message || "更新失败");
  } finally {
    isSaving.value = false;
  }
}

function confirmDelete(coursePack: CoursePacksItem) {
  deleteTarget.value = coursePack;
  showDeleteModal.value = true;
}

async function doDelete() {
  if (!deleteTarget.value) return;
  isDeleting.value = true;
  try {
    await coursePackStore.removeCoursePack(deleteTarget.value.id);
    toast.success("课程包已删除");
    showDeleteModal.value = false;
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
