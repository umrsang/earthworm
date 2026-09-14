<template>
  <main class="course-upload-page">
    <header class="learning-page-header">
      <router-link class="brand-link" :to="ROUTE_PATHS.COURSE_PACKS">← {{ $t('coursePack.libraryTitle') }}</router-link>
    </header>

    <section class="learning-page-shell upload-page-shell">
      <header class="learning-page-title-row">
        <div>
          <p class="learning-eyebrow">{{ $t('coursePack.creatorEyebrow') }}</p>
          <h1>{{ $t('coursePack.uploadTitle') }}</h1>
          <p>{{ $t('coursePack.uploadDescription') }}</p>
        </div>
      </header>

      <label v-if="!payload" class="course-upload-dropzone">
        <input type="file" accept=".zip,application/zip" @change="handleFileChange" />
        <span class="course-upload-icon">ZIP</span>
        <strong>{{ parsing ? $t('coursePack.parsing') : $t('coursePack.chooseZip') }}</strong>
        <span>{{ $t('coursePack.zipHint') }}</span>
      </label>

      <div v-if="errorMessage" class="learning-error-message">{{ errorMessage }}</div>

      <template v-if="payload">
        <section class="upload-form-card">
          <label>
            <span>{{ $t('coursePack.packTitleLabel') }}</span>
            <input v-model.trim="payload.title" maxlength="256" />
          </label>
          <label>
            <span>{{ $t('coursePack.descriptionLabel') }}</span>
            <textarea v-model.trim="payload.description" maxlength="4000" rows="3"></textarea>
          </label>
          <dl class="course-metadata-preview">
            <div v-if="payload.name"><dt>{{ $t('coursePack.metadataName') }}</dt><dd>{{ payload.name }}</dd></div>
            <div v-if="payload.version"><dt>{{ $t('coursePack.metadataVersion') }}</dt><dd>{{ payload.version }}</dd></div>
            <div v-if="payload.level"><dt>{{ $t('coursePack.metadataLevel') }}</dt><dd>{{ payload.level }}</dd></div>
            <div><dt>{{ $t('coursePack.metadataUnits') }}</dt><dd>{{ payload.totalUnits }}</dd></div>
            <div v-if="payload.totalVocab !== undefined"><dt>{{ $t('coursePack.metadataVocab') }}</dt><dd>{{ payload.totalVocab }}</dd></div>
          </dl>
          <div v-if="payload.tags?.length" class="course-metadata-tags" :aria-label="$t('coursePack.metadataTags')">
            <span v-for="tag in payload.tags" :key="tag">{{ tag }}</span>
          </div>
        </section>

        <section class="upload-preview-list">
          <article v-for="(course, index) in payload.courses" :key="index" class="upload-preview-card">
            <div class="upload-preview-heading">
              <span>{{ String(index + 1).padStart(2, '0') }}</span>
              <div>
                <input v-model.trim="course.title" maxlength="256" />
                <small>{{ $t('coursePack.statementCount', { count: course.statements.length }) }}</small>
              </div>
            </div>
            <ul>
              <li v-for="statement in course.statements.slice(0, PREVIEW_COUNT)" :key="`${statement.chinese}-${statement.english}`">
                <span>{{ statement.chinese }}</span><strong>{{ statement.english }}</strong>
              </li>
            </ul>
          </article>
        </section>

        <footer class="upload-actions">
          <button class="button" type="button" :disabled="uploading" @click="resetUpload">{{ $t('coursePack.chooseAgain') }}</button>
          <button class="button primary" type="button" :disabled="uploading" @click="submitCoursePack">
            {{ uploading ? $t('coursePack.uploading') : $t('coursePack.confirmUpload') }}
          </button>
        </footer>
      </template>
    </section>
  </main>
</template>

<script setup lang="ts">
import JSZip from "jszip";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import {
  createCoursePackApi,
  type CoursePackMetadata,
  type CoursePackUploadPayload,
  type PosTagTuple,
  type SyntaxTagTuple,
} from "../api/course-pack";
import { ROUTE_NAMES, ROUTE_PATHS } from "../constants";

const PREVIEW_COUNT = 3;
const MAX_ARCHIVE_SIZE_BYTES = 20 * 1024 * 1024;
const MAX_COURSE_COUNT = 100;
const MAX_STATEMENT_COUNT_PER_COURSE = 1000;
const MAX_STATEMENT_COUNT_PER_PACK = 10000;
const MAX_METADATA_TAG_COUNT = 50;
const MAX_METADATA_TAG_LENGTH = 128;
const MAX_TOTAL_VOCAB = 1_000_000;
const MAX_ANNOTATION_COUNT_PER_STATEMENT = 200;
const POS_TAG_TUPLE_LENGTH = 3;
const SYNTAX_TAG_TUPLE_LENGTH = 4;
const WORD_SEPARATOR_PATTERN = /\s+/;
const METADATA_FILE_NAME = "metadata.json";
const LEGACY_METADATA_FILE_NAME = "package.json";
const DATA_PATH_PATTERN = /(^|\/)data\/[^/]+\.json$/i;
const router = useRouter();
const { t } = useI18n();
const payload = ref<CoursePackUploadPayload | null>(null);
const parsing = ref(false);
const uploading = ref(false);
const errorMessage = ref("");

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** 按数字文件名优先排序课程，非数字文件名使用稳定字典序。 */
function compareDataPaths(left: string, right: string): number {
  const leftName = left.split("/").pop() || left;
  const rightName = right.split("/").pop() || right;
  const leftNumber = Number.parseInt(leftName, 10);
  const rightNumber = Number.parseInt(rightName, 10);
  if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber)) return leftNumber - rightNumber;
  return left.localeCompare(right);
}

function normalizeOptionalMetadataText(value: unknown): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") throw new Error(t("coursePack.errorInvalidMetadata"));
  return value.trim() || undefined;
}

/** 校验并清理独立 metadata.json；课程数由实际 data 文件覆盖。 */
function normalizeMetadata(value: unknown, actualCourseCount: number): CoursePackMetadata & {
  title?: string;
  description?: string;
} {
  if (!isRecord(value)) throw new Error(t("coursePack.errorInvalidMetadata"));
  let tags: string[] | undefined;
  if (value.tags !== undefined) {
    if (!Array.isArray(value.tags) || value.tags.length > MAX_METADATA_TAG_COUNT) {
      throw new Error(t("coursePack.errorInvalidMetadata"));
    }
    const normalizedTags = value.tags.map((tag) => {
      if (typeof tag !== "string" || !tag.trim() || tag.trim().length > MAX_METADATA_TAG_LENGTH) {
        throw new Error(t("coursePack.errorInvalidMetadata"));
      }
      return tag.trim();
    });
    tags = [...new Set(normalizedTags)];
  }
  const normalizeCount = (count: unknown, maximum: number): number | undefined => {
    if (count === undefined || count === null) return undefined;
    if (!Number.isInteger(count) || Number(count) < 0 || Number(count) > maximum) {
      throw new Error(t("coursePack.errorInvalidMetadata"));
    }
    return Number(count);
  };
  normalizeCount(value.totalUnits, MAX_COURSE_COUNT);
  return {
    name: normalizeOptionalMetadataText(value.name),
    title: normalizeOptionalMetadataText(value.title),
    description: normalizeOptionalMetadataText(value.description),
    version: normalizeOptionalMetadataText(value.version),
    level: normalizeOptionalMetadataText(value.level),
    tags,
    totalUnits: actualCourseCount,
    totalVocab: normalizeCount(value.totalVocab, MAX_TOTAL_VOCAB),
  };
}

function normalizeTags<T extends PosTagTuple | SyntaxTagTuple>(
  value: unknown,
  tupleLength: number,
  wordCount: number,
  dataPath: string,
): T[] | undefined {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value) || value.length > MAX_ANNOTATION_COUNT_PER_STATEMENT) {
    throw new Error(t("coursePack.errorInvalidAnnotation", { file: dataPath }));
  }
  const isValid = value.every((tag) =>
    Array.isArray(tag)
    && tag.length === tupleLength
    && Number.isInteger(tag[0])
    && Number.isInteger(tag[1])
    && tag[0] >= 0
    && tag[1] >= tag[0]
    && tag[1] < wordCount
    && tag.slice(2).every((label) => typeof label === "string" && Boolean(label.trim())),
  );
  if (!isValid) throw new Error(t("coursePack.errorInvalidAnnotation", { file: dataPath }));
  return value.map((tag) => tag.map((part) => typeof part === "string" ? part.trim() : part) as T);
}

/** 兼容 ZIP 根目录及唯一外层文件夹中的新旧课程包结构。 */
async function parseCoursePack(file: File): Promise<CoursePackUploadPayload> {
  const archive = await JSZip.loadAsync(file);
  const fileNames = Object.keys(archive.files).filter((name) => !archive.files[name].dir);
  const dataPaths = fileNames.filter((name) => DATA_PATH_PATTERN.test(name)).sort(compareDataPaths);
  if (!dataPaths.length) throw new Error(t("coursePack.errorNoData"));
  if (dataPaths.length > MAX_COURSE_COUNT) throw new Error(t("coursePack.errorTooManyCourses"));

  const roots = new Set(dataPaths.map((name) => name.replace(/data\/[^/]+\.json$/i, "")));
  if (roots.size !== 1) throw new Error(t("coursePack.errorMultipleRoots"));
  const rootPath = [...roots][0];
  const findRootFile = (fileName: string) => fileNames.find(
    (name) => name.toLowerCase() === `${rootPath}${fileName}`.toLowerCase(),
  );
  const metadataPath = findRootFile(METADATA_FILE_NAME) || findRootFile(LEGACY_METADATA_FILE_NAME);
  const rawMetadata = metadataPath
    ? JSON.parse(await archive.files[metadataPath].async("string"))
    : {};
  const metadata = normalizeMetadata(rawMetadata, dataPaths.length);

  const courses: CoursePackUploadPayload["courses"] = [];
  for (const [index, dataPath] of dataPaths.entries()) {
    const parsed: unknown = JSON.parse(await archive.files[dataPath].async("string"));
    const isUnitObject = isRecord(parsed);
    const unitData = isUnitObject ? parsed.data : parsed;
    if (!Array.isArray(unitData) || !unitData.length) {
      throw new Error(t("coursePack.errorInvalidFile", { file: dataPath }));
    }
    if (unitData.length > MAX_STATEMENT_COUNT_PER_COURSE) {
      throw new Error(t("coursePack.errorTooManyStatements", { file: dataPath }));
    }
    const statements = unitData.map((item: unknown) => {
      if (!isRecord(item) || typeof item.chinese !== "string" || !item.chinese.trim()
        || typeof item.english !== "string" || !item.english.trim()) {
        throw new Error(t("coursePack.errorInvalidFile", { file: dataPath }));
      }
      const english = item.english.trim();
      const wordCount = english.split(WORD_SEPARATOR_PATTERN).filter(Boolean).length;
      return {
        chinese: item.chinese.trim(),
        english,
        soundmark: typeof item.soundmark === "string" ? item.soundmark.trim() : "",
        posTags: normalizeTags<PosTagTuple>(item.posTags, POS_TAG_TUPLE_LENGTH, wordCount, dataPath),
        syntaxTags: normalizeTags<SyntaxTagTuple>(item.syntaxTags, SYNTAX_TAG_TUPLE_LENGTH, wordCount, dataPath),
      };
    });
    const fileName = dataPath.split("/").pop()?.replace(/\.json$/i, "") || String(index + 1);
    const unitTitle = isUnitObject ? normalizeOptionalMetadataText(parsed.title) : undefined;
    const unitDescription = isUnitObject ? normalizeOptionalMetadataText(parsed.description) : undefined;
    courses.push({
      title: unitTitle || t("coursePack.defaultLessonTitle", { name: fileName }),
      description: unitDescription || "",
      statements,
    });
  }
  const totalStatementCount = courses.reduce((total, course) => total + course.statements.length, 0);
  if (totalStatementCount > MAX_STATEMENT_COUNT_PER_PACK) throw new Error(t("coursePack.errorPackTooManyStatements"));

  const archiveName = file.name.replace(/\.zip$/i, "");
  return {
    ...metadata,
    title: metadata.title || metadata.name || archiveName,
    description: metadata.description || "",
    totalUnits: courses.length,
    courses,
  };
}

async function handleFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  errorMessage.value = "";
  if (file.size > MAX_ARCHIVE_SIZE_BYTES) {
    errorMessage.value = t("coursePack.errorArchiveTooLarge");
    return;
  }
  parsing.value = true;
  try {
    payload.value = await parseCoursePack(file);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : t("coursePack.errorParse");
  } finally {
    parsing.value = false;
  }
}

async function submitCoursePack() {
  if (!payload.value || !payload.value.title.trim()) return;
  uploading.value = true;
  errorMessage.value = "";
  try {
    const result = await createCoursePackApi(payload.value);
    await router.push({ name: ROUTE_NAMES.COURSE_PACK_DETAIL, params: { coursePackId: result.coursePackId } });
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : t("coursePack.errorUpload");
  } finally {
    uploading.value = false;
  }
}

function resetUpload() {
  payload.value = null;
  errorMessage.value = "";
}
</script>
