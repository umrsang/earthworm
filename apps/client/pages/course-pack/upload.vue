<template>
  <div class="mx-auto w-full max-w-4xl p-6">
    <h2 class="mb-2 text-2xl font-bold text-white">上传课程包</h2>
    <div class="mb-8 flex items-center justify-between">
      <p class="text-sm text-gray-500">上传 .zip 格式的课程包文件，系统将自动解析课程单元数据</p>
      <button
        class="inline-flex items-center gap-2 rounded-full border border-purple-500/40 bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-400 transition-all duration-300 hover:border-purple-500 hover:bg-purple-500/20 hover:text-purple-300"
        @click="showFormatGuide = true"
      >
        <UIcon
          name="i-ph-question"
          class="h-4 w-4"
        ></UIcon>
        格式要求
      </button>
    </div>

    <!-- 格式要求弹窗 -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showFormatGuide"
          class="fixed inset-0 z-50 flex items-center justify-center"
          @click.self="showFormatGuide = false"
        >
          <div
            class="fixed inset-0 bg-black/60 backdrop-blur-sm"
            @click="showFormatGuide = false"
          ></div>
          <div
            class="relative z-10 mx-4 max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/[0.06] bg-[#12122a] p-6 shadow-2xl shadow-purple-900/20"
          >
            <!-- 关闭按钮 -->
            <button
              class="absolute right-4 top-4 text-gray-500 hover:text-white"
              @click="showFormatGuide = false"
            >
              <UIcon
                name="i-ph-x"
                class="h-5 w-5"
              ></UIcon>
            </button>

            <h3 class="mb-6 text-xl font-bold text-white">课程包格式要求</h3>

            <!-- 目录结构 -->
            <h4 class="mb-3 text-sm font-semibold uppercase tracking-wider text-purple-400">
              目录结构
            </h4>
            <div class="mb-6 rounded-xl bg-black/30 p-4 text-sm text-gray-400">
              <pre>
课程包名称.zip
├── package.json          ← 课程包元信息（可选）
└── data/
    ├── 1.json             ← 第1单元数据
    ├── 2.json             ← 第2单元数据
    └── ...</pre
              >
            </div>

            <!-- package.json -->
            <h4 class="mb-3 text-sm font-semibold uppercase tracking-wider text-purple-400">
              package.json（可选）
            </h4>
            <div class="mb-6 rounded-xl bg-black/30 p-4 text-sm text-gray-400">
              <pre>
{
  "name": "course-pack-name",
  "title": "星荣零基础学英语",
  "description": "课程包描述"
}</pre
              >
            </div>

            <!-- 单元数据格式 -->
            <h4 class="mb-3 text-sm font-semibold uppercase tracking-wider text-purple-400">
              data/*.json 单元数据
            </h4>
            <div class="mb-4 rounded-xl bg-black/30 p-4 text-sm text-gray-400">
              <pre>
[
  {
    "english": "I need to pay for this",
    "chinese": "我需要为这个付款",
    "soundmark": "aɪ niːd tuː peɪ fɔːr ðɪs"
  }
]</pre
              >
            </div>

            <!-- 字段说明 -->
            <h4 class="mb-3 text-sm font-semibold uppercase tracking-wider text-purple-400">
              字段说明
            </h4>
            <div class="mb-4 overflow-hidden rounded-xl border border-white/[0.06]">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-white/[0.06] bg-white/[0.02]">
                    <th class="px-4 py-3 text-left font-medium text-gray-400">字段</th>
                    <th class="px-4 py-3 text-left font-medium text-gray-400">类型</th>
                    <th class="px-4 py-3 text-left font-medium text-gray-400">必填</th>
                    <th class="px-4 py-3 text-left font-medium text-gray-400">说明</th>
                  </tr>
                </thead>
                <tbody class="text-gray-400">
                  <tr class="border-b border-white/[0.04]">
                    <td class="px-4 py-3"><code class="text-purple-400">english</code></td>
                    <td class="px-4 py-3">string</td>
                    <td class="px-4 py-3 text-green-400">是</td>
                    <td class="px-4 py-3">英文句子，单词用空格分隔</td>
                  </tr>
                  <tr class="border-b border-white/[0.04]">
                    <td class="px-4 py-3"><code class="text-purple-400">chinese</code></td>
                    <td class="px-4 py-3">string</td>
                    <td class="px-4 py-3 text-green-400">是</td>
                    <td class="px-4 py-3">中文翻译</td>
                  </tr>
                  <tr>
                    <td class="px-4 py-3"><code class="text-purple-400">soundmark</code></td>
                    <td class="px-4 py-3">string</td>
                    <td class="px-4 py-3 text-gray-600">否</td>
                    <td class="px-4 py-3">音标注音</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 注意事项 -->
            <h4 class="mb-3 text-sm font-semibold uppercase tracking-wider text-purple-400">
              注意事项
            </h4>
            <ul class="space-y-2 text-sm text-gray-400">
              <li class="flex items-start gap-2">
                <UIcon
                  name="i-ph-check-circle-fill"
                  class="mt-0.5 h-4 w-4 shrink-0 text-green-400"
                ></UIcon>
                每个 JSON 文件必须是数组格式
              </li>
              <li class="flex items-start gap-2">
                <UIcon
                  name="i-ph-check-circle-fill"
                  class="mt-0.5 h-4 w-4 shrink-0 text-green-400"
                ></UIcon>
                <code class="text-purple-400">english</code>
                字段中单词以空格分隔，系统自动拆分为输入框
              </li>
              <li class="flex items-start gap-2">
                <UIcon
                  name="i-ph-check-circle-fill"
                  class="mt-0.5 h-4 w-4 shrink-0 text-green-400"
                ></UIcon>
                JSON 文件名（去掉 .json）作为单元序号，按数字升序排列
              </li>
              <li class="flex items-start gap-2">
                <UIcon
                  name="i-ph-check-circle-fill"
                  class="mt-0.5 h-4 w-4 shrink-0 text-green-400"
                ></UIcon>
                无 package.json 时，以 zip 文件名或根目录名作为课程包名称
              </li>
            </ul>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 上传区域 -->
    <div
      class="group cursor-pointer rounded-2xl border border-dashed border-white/[0.12] bg-white/[0.02] p-12 text-center transition-all duration-300 hover:border-purple-500/30 hover:bg-white/[0.04]"
      @click="triggerFileInput"
    >
      <input
        ref="fileInput"
        type="file"
        accept=".zip"
        class="hidden"
        @change="handleFileSelect"
      />
      <UIcon
        name="i-ph-cloud-arrow-up"
        class="mx-auto mb-4 h-12 w-12 text-gray-600 transition-colors group-hover:text-purple-400"
      ></UIcon>
      <p class="text-base font-medium text-gray-400">点击或拖拽上传课程包文件</p>
      <p class="mt-2 text-sm text-gray-600">支持 .zip 格式</p>
    </div>

    <!-- 加载状态 -->
    <div
      v-if="isProcessing"
      class="mt-8 text-center"
    >
      <Loading />
      <p class="mt-4 text-sm text-gray-500">正在解析课程包...</p>
    </div>

    <!-- 课程包信息展示 -->
    <div
      v-if="coursePackInfo && !isProcessing"
      class="mt-8 space-y-6"
    >
      <!-- 基本信息 -->
      <div class="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
        <h3 class="mb-5 text-lg font-semibold text-white">课程包基本信息</h3>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-400">课程包名称</label>
            <input
              v-model="coursePackInfo.name"
              type="text"
              class="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-purple-500/30 focus:outline-none"
              placeholder="例如: elementary-grade-1-2"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-400">课程包标题</label>
            <input
              v-model="coursePackInfo.title"
              type="text"
              class="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-purple-500/30 focus:outline-none"
              placeholder="例如: 小学1-2年级英语"
            />
          </div>
          <div class="md:col-span-2">
            <label class="mb-2 block text-sm font-medium text-gray-400">课程包描述</label>
            <textarea
              v-model="coursePackInfo.description"
              rows="3"
              class="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-purple-500/30 focus:outline-none"
              placeholder="课程包描述"
            />
          </div>
        </div>
      </div>

      <!-- 课程单元列表 -->
      <div class="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
        <h3 class="mb-5 text-lg font-semibold text-white">
          课程单元列表
          <span class="ml-2 text-sm font-normal text-purple-400">
            共 {{ coursePackInfo.courses.length }} 个单元
          </span>
        </h3>
        <div class="space-y-4">
          <div
            v-for="(courseUnit, index) in coursePackInfo.courses"
            :key="index"
            class="rounded-xl border border-white/[0.06] bg-white/[0.01] p-5"
          >
            <div class="mb-3 flex items-center justify-between">
              <h4 class="text-base font-medium text-white">单元 {{ index + 1 }}</h4>
              <span
                class="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400"
              >
                <UIcon
                  name="i-ph-database"
                  class="h-3.5 w-3.5"
                ></UIcon>
                {{ courseUnit.dataCount }} 条数据
              </span>
            </div>
            <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm text-gray-500">单元名称</label>
                <input
                  v-model="courseUnit.title"
                  type="text"
                  class="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-purple-500/30 focus:outline-none"
                  placeholder="例如: 问候与自我介绍"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm text-gray-500">数据文件</label>
                <input
                  :value="courseUnit.dataFile"
                  type="text"
                  disabled
                  class="w-full rounded-lg border border-white/[0.04] bg-white/[0.01] px-3 py-2 text-sm text-gray-600"
                />
              </div>
              <div class="md:col-span-2">
                <label class="mb-1 block text-sm text-gray-500">单元描述</label>
                <textarea
                  v-model="courseUnit.description"
                  rows="2"
                  class="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-purple-500/30 focus:outline-none"
                  placeholder="单元描述"
                />
              </div>
            </div>

            <!-- 数据预览 -->
            <div class="mt-3">
              <button
                class="text-sm text-purple-400 hover:text-purple-300"
                @click="toggleDataPreview(index)"
              >
                {{ courseUnit.showPreview ? "隐藏" : "查看" }}数据预览
              </button>
              <div
                v-if="courseUnit.showPreview"
                class="mt-2 max-h-60 overflow-y-auto rounded-xl bg-black/30 p-4 text-xs text-gray-400"
              >
                <pre class="whitespace-pre-wrap">{{
                  JSON.stringify(courseUnit.data.slice(0, 5), null, 2)
                }}</pre>
                <p
                  v-if="courseUnit.data.length > 5"
                  class="mt-2 text-gray-600"
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
          class="rounded-full border border-white/[0.06] bg-white/[0.02] px-6 py-2.5 text-sm font-medium text-gray-400 transition-all duration-300 hover:bg-white/[0.06] hover:text-white"
          @click="resetForm"
        >
          重新选择
        </button>
        <button
          class="rounded-full bg-purple-600 px-8 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 transition-all duration-300 hover:scale-105 hover:bg-purple-500 active:scale-100"
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
      class="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400"
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
const showFormatGuide = ref(false);

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

  const rootFiles = Object.keys(zipContent.files).filter(
    (name) => !name.includes("/") || name.split("/").length === 2,
  );

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

  if (!coursePackName) {
    const firstFolder = Object.keys(zipContent.files).find((name) => name.endsWith("/"));
    coursePackName = firstFolder ? firstFolder.split("/")[0] : file.name.replace(".zip", "");
  }

  const dataFiles = Object.keys(zipContent.files)
    .filter((name) => name.includes("/data/") && name.endsWith(".json"))
    .sort();

  if (dataFiles.length === 0) {
    throw new Error("未找到课程数据文件（data/*.json）");
  }

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
