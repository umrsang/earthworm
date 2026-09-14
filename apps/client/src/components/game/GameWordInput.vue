<template>
  <div class="game-word-input" :class="{ 'game-word-input-error': incorrectIndexes.length }" @click="focus">
    <div class="game-word-list">
      <template v-for="(token, tokenIndex) in tokens" :key="`${token.value}-${tokenIndex}`">
        <span v-if="token.type === 'punctuation'" class="game-punctuation">{{ token.value }}</span>
        <span
          v-else
          class="game-word-slot"
          :class="wordClass(token.wordIndex!)"
          :style="{ minWidth: `${Math.max(token.value.length, MIN_SLOT_CH_WIDTH)}ch` }"
          @click.stop="selectSlot(token.wordIndex!)"
        >
          {{ words[token.wordIndex!] || ' ' }}
        </span>
      </template>
    </div>
    <input
      ref="input"
      v-model="currentInput"
      class="game-hidden-input"
      type="text"
      lang="en"
      autocomplete="off"
      spellcheck="false"
      :aria-label="$t('game.answerInputLabel')"
      @compositionstart="composing = true"
      @compositionend="handleCompositionEnd"
      @input="handleInput"
      @keydown="handleKeydown"
    />
  </div>
</template>
<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { splitInputWords, tokenizeSentence } from "../../composables/game/sentenceAnswer";

/** 槽位最小字符宽度基准 */
const MIN_SLOT_CH_WIDTH = 3;

const props = defineProps<{ expected: string; incorrectIndexes: number[] }>();
const model = defineModel<string>({ required: true });
const emit = defineEmits<{ submit: [] }>();

const input = ref<HTMLInputElement | null>(null);
const composing = ref(false);

/** 句子分词结果 */
const tokens = computed(() => tokenizeSentence(props.expected));

/** 句子包含的纯单词槽位数量 */
const wordSlotCount = computed(() => tokens.value.filter((token) => token.type === "word").length);

/** 各个槽位的单词内容列表 */
const words = ref<string[]>([]);

/** 当前处于激活高亮状态的单词槽位索引 */
const activeSlotIndex = ref(0);

/** 当前激活槽位正在输入的文本 */
const currentInput = ref("");

/** 是否为内部输入引发的 model 更新，避免循环反向触发 */
let isInternalSync = false;

// 监听外部 expected 变动时重置状态
watch(
  () => props.expected,
  () => {
    words.value = [];
    activeSlotIndex.value = 0;
    currentInput.value = "";
  },
);

// 监听外部 model 同步（如题目切换、重置或查看答案）
watch(
  model,
  (newVal) => {
    if (isInternalSync) {
      isInternalSync = false;
      return;
    }
    const parsedWords = splitInputWords(newVal || "");
    words.value = [...parsedWords];

    if (!newVal) {
      activeSlotIndex.value = 0;
      currentInput.value = "";
    } else {
      // 保证 activeSlotIndex 在合法范围内
      if (activeSlotIndex.value >= wordSlotCount.value) {
        activeSlotIndex.value = Math.max(0, wordSlotCount.value - 1);
      }
      currentInput.value = words.value[activeSlotIndex.value] || "";
    }
  },
  { immediate: true },
);

/** 同步内部各槽位内容至外部 model */
function syncModel() {
  isInternalSync = true;
  model.value = words.value.join(" ").trim();
}

/** 切换并聚焦指定单词槽位 */
function selectSlot(index: number) {
  if (index < 0 || (wordSlotCount.value > 0 && index >= wordSlotCount.value)) return;
  activeSlotIndex.value = index;
  currentInput.value = words.value[index] || "";
  nextTick(() => {
    focus();
    if (input.value) {
      const cursorPosition = currentInput.value.length;
      input.value.setSelectionRange(cursorPosition, cursorPosition);
    }
  });
}

/** 输入事件处理，支持空格分词和多词粘贴 */
function handleInput() {
  if (composing.value) return;

  const rawValue = currentInput.value;
  // 若输入中包含空格（如输入空格切词或粘贴了多词短语）
  if (rawValue.includes(" ")) {
    const parts = rawValue.split(/\s+/);
    let targetIndex = activeSlotIndex.value;

    for (const part of parts) {
      if (targetIndex >= wordSlotCount.value) break;
      if (part) {
        words.value[targetIndex] = part;
      }
      targetIndex++;
    }

    syncModel();

    // 焦点切换至后续槽位
    const nextIndex = Math.min(targetIndex, Math.max(0, wordSlotCount.value - 1));
    selectSlot(nextIndex);
    return;
  }

  // 常规单词字符输入
  words.value[activeSlotIndex.value] = rawValue;
  syncModel();
}

/** 中文等输入法合成结束时处理 */
function handleCompositionEnd() {
  composing.value = false;
  handleInput();
}

/** 槽位样式判断 */
function wordClass(index: number) {
  return {
    "game-word-slot-active": index === activeSlotIndex.value,
    "game-word-slot-filled": Boolean(words.value[index]),
    "game-word-slot-incorrect": props.incorrectIndexes.includes(index),
  };
}

/** 聚焦隐藏输入框 */
function focus() {
  input.value?.focus();
}

/** 键盘事件监听：支持左右方向键切换、Enter 提交、空格切词与 Backspace 跨槽退格 */
function handleKeydown(event: KeyboardEvent) {
  if (composing.value) return;

  // 回车提交
  if (event.key === "Enter") {
    event.preventDefault();
    event.stopPropagation();
    emit("submit");
    return;
  }

  // 左方向键：切换至上一个单词槽位
  if (event.key === "ArrowLeft") {
    if (activeSlotIndex.value > 0) {
      event.preventDefault();
      selectSlot(activeSlotIndex.value - 1);
    }
    return;
  }

  // 右方向键：切换至下一个单词槽位
  if (event.key === "ArrowRight") {
    if (activeSlotIndex.value < wordSlotCount.value - 1) {
      event.preventDefault();
      selectSlot(activeSlotIndex.value + 1);
    }
    return;
  }

  // 空格键：当前单词输入完成，跳往下一个槽位
  if (event.key === " ") {
    event.preventDefault();
    if (activeSlotIndex.value < wordSlotCount.value - 1) {
      selectSlot(activeSlotIndex.value + 1);
    }
    return;
  }

  // 退格键：当前槽位为空时，按退格自动跳到上一个槽位
  if (event.key === "Backspace" && !currentInput.value && activeSlotIndex.value > 0) {
    event.preventDefault();
    selectSlot(activeSlotIndex.value - 1);
    return;
  }

  // Windows 快捷键 Ctrl+Backspace 清空当前词
  if (event.key === "Backspace" && event.ctrlKey) {
    event.preventDefault();
    currentInput.value = "";
    words.value[activeSlotIndex.value] = "";
    syncModel();
  }
}

defineExpose({ focus, selectSlot });
</script>
