<template>
  <div class="mx-auto w-full max-w-6xl p-6">
    <h2 class="mb-6 text-center text-3xl font-bold">课程包上传管理</h2>

    <!-- 上传区域 -->
    <div
      class="mb-8 rounded-lg border-2 border-dashed border-gray-300 bg-white p-8 dark:bg-gray-800"
    >
      <div class="text-center">
        <input
          ref="fileInput"
          type="file"
          accept=".zip"
          class="hidden"
          @change="handleFileSelect"
        />
        <button
          class="rounded-lg bg-blue-500 px-6 py-3 text-white hover:bg-blue-600"
          @click="triggerFileInput"
        >
          选择课程包压缩文件 (.zip)
        </button>
        <p class="mt-4 text-sm text-gray-500">支持 .zip 格式的课程包压缩文件</p>
      </div>
    </div>

    <!-- 加载状态 -->
    <div
      v-if="isProcessing"
      class="text-center"
    >
      <Loading />
      <p class="mt-4 text-gray-600">正在解析课程包...</p>
    </div>

    <!-- 课程包信息展示 -->
    <div
      v-if="coursePackInfo && !isProcessing"
      class="space-y-6"
    >
      <!-- 基本信息 -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h3 class="mb-4 text-xl font-semibold">课程包基本信息</h3>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label class="mb-2 block text-sm font-medium">课程包名称</label>
            <input
              v-model="coursePackInfo.name"
              type="text"
              class="w-full rounded-lg border border-gray-300 p-2 dark:bg-gray-700"
              placeholder="例如: elementary-grade-1-2"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium">课程包标题</label>
            <input
              v-model="coursePackInfo.title"
              type="text"
              class="w-full rounded-lg border border-gray-300 p-2 dark:bg-gray-700"
              placeholder="例如: 小学1-2年级英语"
            />
          </div>
          <div class="md:col-span-2">
            <label class="mb-2 block text-sm font-medium">课程包描述</label>
            <textarea
              v-model="coursePackInfo.description"
              rows="3"
              class="w-full rounded-lg border border-gray-300 p-2 dark:bg-gray-700"
              placeholder="课程包描述"
            />
          </div>
        </div>
      </div>

      <!-- 课程单元列表 -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h3 class="mb-4 text-xl font-semibold">
          课程单元列表 (共 {{ coursePackInfo.courses.length }} 个单元)
        </h3>
        <div class="space-y-4">
          <div
            v-for="(courseUnit, index) in coursePackInfo.courses"
            :key="index"
            class="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
          >
            <div class="mb-3 flex items-center justify-between">
              <h4 class="text-lg font-medium">单元 {{ index + 1 }}</h4>
              <span
                class="rounded bg-blue-100 px-3 py-1 text-sm text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              >
                {{ courseUnit.dataCount }} 条数据
              </span>
            </div>
            <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium">单元名称</label>
                <input
                  v-model="courseUnit.title"
                  type="text"
                  class="w-full rounded border border-gray-300 p-2 text-sm dark:bg-gray-700"
                  placeholder="例如: 问候与自我介绍"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium">数据文件</label>
                <input
                  :value="courseUnit.dataFile"
                  type="text"
                  disabled
                  class="w-full rounded border border-gray-300 bg-gray-100 p-2 text-sm dark:bg-gray-600"
                />
              </div>
              <div class="md:col-span-2">
                <label class="mb-1 block text-sm font-medium">单元描述</label>
                <textarea
                  v-model="courseUnit.description"
                  rows="2"
                  class="w-full rounded border border-gray-300 p-2 text-sm dark:bg-gray-700"
                  placeholder="单元描述"
                />
              </div>
            </div>

            <!-- 数据预览 -->
            <div class="mt-3">
              <button
                class="text-sm text-blue-500 hover:text-blue-600"
                @click="toggleDataPreview(index)"
              >
                {{ courseUnit.showPreview ? "隐藏" : "查看" }}数据预览
              </button>
              <div
                v-if="courseUnit.showPreview"
                class="mt-2 max-h-60 overflow-y-auto rounded bg-gray-50 p-3 text-xs dark:bg-gray-900"
              >
                <pre class="whitespace-pre-wrap">{{
                  JSON.stringify(courseUnit.data.slice(0, 5), null, 2)
                }}</pre>
                <p
                  v-if="courseUnit.data.length > 5"
                  class="mt-2 text-gray-500"
                >
                  ... 还有 {{ courseUnit.data.length - 5 }} 条数据
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex justify-center gap-4">
        <button
          class="rounded-lg bg-gray-500 px-6 py-3 text-white hover:bg-gray-600"
          @click="resetForm"
        >
          重新选择
        </button>
        <button
          class="rounded-lg bg-green-500 px-6 py-3 text-white hover:bg-green-600"
          :disabled="isUploading"
          @click="handleUpload"
        >
          {{ isUploading ? "上传中..." : "确认上传" }}
        </button>
      </div>
    </div>

    <!-- 错误提示 -->
    <div
      v-if="errorMessage"
      class="mt-4 rounded-lg bg-red-100 p-4 text-red-700 dark:bg-red-900 dark:text-red-200"
    >
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import JSZip from "jszip";
import { ref } from "vue";
import { toast } from "vue-sonner";

interface CourseUnit {
  title: string;
  description: string;
  dataFile: string;
  dataCount: number;
  data: any[];
  showPreview: boolean;
}

interface CoursePackInfo {
  name: string;
  title: string;
  description: string;
  courses: CourseUnit[];
}

const fileInput = ref<HTMLInputElement | null>(null);
const isProcessing = ref(false);
const isUploading = ref(false);
const coursePackInfo = ref<CoursePackInfo | null>(null);
const errorMessage = ref("");

function triggerFileInput() {
  fileInput.value?.click();
}

async function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  errorMessage.value = "";
  isProcessing.value = true;

  try {
    await parseZipFile(file);
  } catch (error: any) {
    errorMessage.value = error.message || "解析课程包失败";
    console.error("解析错误:", error);
  } finally {
    isProcessing.value = false;
  }
}

async function parseZipFile(file: File) {
  const zip = new JSZip();
  const zipContent = await zip.loadAsync(file);

  // 获取第一层目录
  const rootFiles = Object.keys(zipContent.files).filter(
    (name) => !name.includes("/") || name.split("/").length === 2,
  );

  // 尝试读取 package.json
  let packageJson: any = null;
  let coursePackName = "";

  const packageJsonFile =
    zipContent.files["package.json"] ||
    Object.values(zipContent.files).find(
      (f) => f.name.endsWith("package.json") && f.name.split("/").length === 2,
    );

  if (packageJsonFile && !packageJsonFile.dir) {
    const content = await packageJsonFile.async("string");
    packageJson = JSON.parse(content);
    coursePackName = packageJson.name || "";
  }

  // 如果没有 package.json，从文件夹名获取
  if (!coursePackName) {
    const firstFolder = Object.keys(zipContent.files).find((name) => name.endsWith("/"));
    coursePackName = firstFolder ? firstFolder.split("/")[0] : file.name.replace(".zip", "");
  }

  // 查找 data 目录下的 JSON 文件
  const dataFiles = Object.keys(zipContent.files)
    .filter((name) => name.includes("/data/") && name.endsWith(".json"))
    .sort();

  if (dataFiles.length === 0) {
    throw new Error("未找到课程数据文件（data/*.json）");
  }

  // 读取所有课程数据
  const courses: CourseUnit[] = [];

  for (const dataFile of dataFiles) {
    const file = zipContent.files[dataFile];
    const content = await file.async("string");
    const data = JSON.parse(content);
    const fileName = dataFile.split("/").pop() || "";

    courses.push({
      title: `第${fileName.replace(".json", "")}单元`,
      description: "",
      dataFile: fileName,
      dataCount: Array.isArray(data) ? data.length : 0,
      data: Array.isArray(data) ? data : [],
      showPreview: false,
    });
  }

  coursePackInfo.value = {
    name: coursePackName,
    title: packageJson?.title || coursePackName,
    description: packageJson?.description || "",
    courses,
  };

  toast.success("课程包解析成功！");
}

function toggleDataPreview(index: number) {
  if (coursePackInfo.value) {
    coursePackInfo.value.courses[index].showPreview =
      !coursePackInfo.value.courses[index].showPreview;
  }
}

function resetForm() {
  coursePackInfo.value = null;
  errorMessage.value = "";
  if (fileInput.value) {
    fileInput.value.value = "";
  }
}

async function handleUpload() {
  if (!coursePackInfo.value) return;

  isUploading.value = true;

  try {
    const response = await $fetch("/api/course-pack/upload", {
      method: "POST",
      body: coursePackInfo.value,
    });

    toast.success("课程包上传成功！");

    // 跳转到课程包列表页面
    setTimeout(() => {
      navigateTo("/course-pack");
    }, 1000);
  } catch (error: any) {
    errorMessage.value = error.data?.message || error.message || "上传失败";
    toast.error("上传失败");
  } finally {
    isUploading.value = false;
  }
}
</script>
