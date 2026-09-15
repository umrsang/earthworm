<template>
  <div class="app-shell admin-page">
    <AppNavigation />
    <main class="admin-content">
      <header class="admin-header">
        <div><p class="learning-eyebrow">{{ $t('admin.eyebrow') }}</p><h1>{{ $t('admin.title') }}</h1><p>{{ $t('admin.description') }}</p></div>
        <button class="button primary" type="button" @click="openCreate">{{ $t('admin.addModel') }}</button>
      </header>

      <nav class="admin-tabs" role="tablist">
        <button class="admin-tab is-active" type="button" role="tab" aria-selected="true">{{ $t('admin.modelTab') }}</button>
      </nav>

      <section class="admin-panel">
        <p v-if="loading" class="admin-state">{{ $t('common.loading') }}</p>
        <p v-else-if="errorMessage" class="admin-state learning-error-message">{{ errorMessage }}</p>
        <div v-else-if="models.length" class="admin-model-list">
          <article v-for="item in models" :key="item.id" class="admin-model-card" :class="{ 'is-active': item.isActive }">
            <div class="admin-model-main">
              <label class="admin-model-selector">
                <input type="radio" name="active-model" :checked="item.isActive" :aria-label="$t('admin.activateModel', { name: item.name })" @change="activate(item.id)" />
                <span aria-hidden="true"></span>
              </label>
              <div class="admin-model-info">
                <div class="admin-model-title">
                  <strong>{{ item.name }}</strong>
                  <span v-if="item.isActive">{{ $t('admin.active') }}</span>
                </div>
                <p :title="item.model">{{ item.model }}</p>
              </div>
            </div>
            <div class="admin-model-actions">
              <button class="button admin-model-edit-button" type="button" @click="openEdit(item)">{{ $t('common.edit') }}</button>
              <button class="button danger admin-model-delete-button" type="button" @click="remove(item)">{{ $t('common.delete') }}</button>
            </div>
          </article>
        </div>
        <div v-else class="admin-empty"><h2>{{ $t('admin.emptyTitle') }}</h2><p>{{ $t('admin.emptyDescription') }}</p></div>
      </section>
    </main>

    <div v-if="editorOpen" class="game-dialog-backdrop" @click.self="closeEditor">
      <form class="game-dialog admin-model-editor" @submit.prevent="save">
        <header><h2>{{ editingId ? $t('admin.editModel') : $t('admin.addModel') }}</h2><button type="button" class="game-icon-button" @click="closeEditor">×</button></header>
        <label><span>{{ $t('admin.name') }}</span><input v-model.trim="form.name" required maxlength="128" /></label>
        <label><span>{{ $t('admin.baseUrl') }}</span><input v-model.trim="form.baseUrl" required type="url" /></label>
        <label><span>{{ $t('admin.model') }}</span><input v-model.trim="form.model" required maxlength="128" /></label>
        <label><span>{{ $t('admin.apiKey') }}</span><input v-model.trim="form.apiKey" :required="!editingId" type="password" :placeholder="editingId ? $t('admin.keepKey') : ''" autocomplete="new-password" /></label>
        <label class="admin-switch"><input v-model="form.isActive" type="checkbox" /><span>{{ $t('admin.enableNow') }}</span></label>
        <p v-if="editorError" class="learning-error-message">{{ editorError }}</p>
        <footer><button class="button" type="button" @click="closeEditor">{{ $t('common.cancel') }}</button><button class="button primary" type="submit" :disabled="saving">{{ saving ? $t('common.saving') : $t('common.save') }}</button></footer>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { activateAiModelApi, createAiModelApi, deleteAiModelApi, getAiModelsApi, updateAiModelApi, type AiModelConfig } from "../api/ai";
import AppNavigation from "../components/AppNavigation.vue";
import { ROUTE_PATHS } from "../constants";
import { useUserStore } from "../stores/user";

const DEFAULT_BASE_URL = "https://api.openai.com/v1";
const router = useRouter();
const userStore = useUserStore();
const { t } = useI18n();
const models = ref<AiModelConfig[]>([]);
const loading = ref(true);
const saving = ref(false);
const errorMessage = ref("");
const editorError = ref("");
const editorOpen = ref(false);
const editingId = ref("");
const form = reactive({ name: "", baseUrl: DEFAULT_BASE_URL, model: "", apiKey: "", isActive: false });

onMounted(async () => {
  if (!userStore.profile) await userStore.fetchProfile().catch(() => null);
  if (userStore.profile?.role !== "admin") { await router.replace(ROUTE_PATHS.HOME); return; }
  await loadModels();
});

async function loadModels() {
  loading.value = true; errorMessage.value = "";
  try { models.value = await getAiModelsApi(); }
  catch (error) { errorMessage.value = error instanceof Error ? error.message : t("common.error"); }
  finally { loading.value = false; }
}
function openCreate() { editingId.value = ""; Object.assign(form, { name: "", baseUrl: DEFAULT_BASE_URL, model: "", apiKey: "", isActive: !models.value.length }); editorError.value = ""; editorOpen.value = true; }
function openEdit(item: AiModelConfig) { editingId.value = item.id; Object.assign(form, { name: item.name, baseUrl: item.baseUrl, model: item.model, apiKey: "", isActive: item.isActive }); editorError.value = ""; editorOpen.value = true; }
function closeEditor() { if (!saving.value) editorOpen.value = false; }
async function save() {
  saving.value = true; editorError.value = "";
  try {
    const payload = { ...form, apiKey: form.apiKey || undefined };
    if (editingId.value) await updateAiModelApi(editingId.value, payload); else await createAiModelApi(payload);
    editorOpen.value = false; await loadModels();
  } catch (error) { editorError.value = error instanceof Error ? error.message : t("common.error"); }
  finally { saving.value = false; }
}
async function activate(id: string) { try { await activateAiModelApi(id); await loadModels(); } catch (error) { errorMessage.value = error instanceof Error ? error.message : t("common.error"); } }
async function remove(item: AiModelConfig) {
  if (!window.confirm(t("admin.deleteConfirm", { name: item.name }))) return;
  try { await deleteAiModelApi(item.id); await loadModels(); } catch (error) { errorMessage.value = error instanceof Error ? error.message : t("common.error"); }
}
</script>
