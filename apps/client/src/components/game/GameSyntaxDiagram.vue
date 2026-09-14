<template>
  <section ref="container" class="game-syntax-diagram" :aria-label="$t('game.syntaxTitle')">
    <div class="game-syntax-scroll">
      <svg :width="diagramWidth" :height="diagramHeight" :viewBox="`0 0 ${diagramWidth} ${diagramHeight}`" role="img">
        <g v-for="word in laidOutWords" :key="`word-${word.index}`">
          <template v-if="posLabel(word.index)">
            <rect
              :x="word.center - labelWidth(posLabel(word.index)) / 2 - LABEL_PADDING"
              :y="word.rowTop + POS_Y - LABEL_HEIGHT / 2"
              :width="labelWidth(posLabel(word.index)) + LABEL_PADDING * 2"
              :height="LABEL_HEIGHT"
              :rx="LABEL_RADIUS"
              fill="rgba(59, 130, 246, 0.18)"
            />
            <text
              :x="word.center"
              :y="word.rowTop + POS_Y"
              text-anchor="middle"
              dominant-baseline="middle"
              :font-size="posFontSize"
              font-weight="700"
              fill="#93c5fd"
            >{{ posLabel(word.index) }}</text>
          </template>
          <text
            :x="word.center"
            :y="word.rowTop + WORD_Y"
            text-anchor="middle"
            :font-size="wordFontSize"
            font-weight="650"
            :fill="wordColor(word.index)"
            :textLength="word.compressed ? word.right - word.left : undefined"
            :lengthAdjust="word.compressed ? 'spacingAndGlyphs' : undefined"
          >{{ word.value }}</text>
        </g>

        <g v-for="segment in tagSegments" :key="segment.key">
          <path
            :d="bracketPath(segment)"
            fill="none"
            :stroke="tagColor(segment.label).stroke"
            :stroke-width="BRACKET_STROKE_WIDTH"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <text
            :x="segmentCenter(segment)"
            :y="segmentLabelY(segment)"
            text-anchor="middle"
            dominant-baseline="middle"
            :font-size="syntaxFontSize"
            font-weight="700"
            :fill="tagColor(segment.label).stroke"
          >{{ segment.label }}</text>
        </g>
      </svg>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import type { CourseStatement } from "../../api/course-pack";
import { getExpectedWords } from "../../composables/game/sentenceAnswer";

interface TagColor { stroke: string; word: string }
interface PositionedWord { index: number; value: string; row: number; rowTop: number; center: number; left: number; right: number; compressed: boolean }
interface RowRange { row: number; start: number; end: number }
interface TagSegment { key: string; start: number; end: number; label: string; row: number; layer: number }

const props = defineProps<{ statement: CourseStatement }>();
const container = ref<HTMLElement | null>(null);
const containerWidth = ref(0);
/** 词性、单词和首层花括号相对于每一行顶部的纵向位置。 */
const POS_Y = 18;
const WORD_Y = 67;
const BRACKET_START_Y = 80;

/** 花括号主体、中央尖角及多层句法标注之间的纵向尺寸。 */
const BRACKET_HEIGHT = 6;
const BRACKET_TIP_HEIGHT = 4;
const LAYER_HEIGHT = 32;
const ROW_BOTTOM_PADDING = 24;

/** 桌面端与移动端的单词、词性和句法标签字号。 */
const DESKTOP_WORD_FONT_SIZE = 48;
const MOBILE_WORD_FONT_SIZE = 16;
const DESKTOP_POS_FONT_SIZE = 12;
const MOBILE_POS_FONT_SIZE = 9;
const DESKTOP_SYNTAX_FONT_SIZE = 13;
const MOBILE_SYNTAX_FONT_SIZE = 10;

/** 响应式排版使用的单词间距、画布边距和移动端断点。 */
const DESKTOP_WORD_GAP = 38;
const MOBILE_WORD_GAP = 14;
const HORIZONTAL_PADDING = 28;
const MOBILE_BREAKPOINT = 720;

/** 单词上方词性标签的内边距、高度和圆角。 */
const LABEL_PADDING = 5;
const LABEL_HEIGHT = 20;
const LABEL_RADIUS = 5;

/** SVG 花括号线宽，以及容器尚未完成测量时的最小安全宽度。 */
const BRACKET_STROKE_WIDTH = 2;
const MIN_RENDER_WIDTH = 1;
const FALLBACK_COLOR: TagColor = { stroke: "#a5b4fc", word: "#ffffff" };
const LABEL_COLORS: Record<string, TagColor> = {
  主语: { stroke: "#fbbf24", word: "#fde68a" },
  谓语: { stroke: "#c084fc", word: "#e9d5ff" },
  宾语: { stroke: "#22d3ee", word: "#a5f3fc" },
  表语: { stroke: "#34d399", word: "#a7f3d0" },
  状语: { stroke: "#fb923c", word: "#fed7aa" },
  定语: { stroke: "#f472b6", word: "#fbcfe8" },
  补语: { stroke: "#a78bfa", word: "#ddd6fe" },
};

const words = computed(() => getExpectedWords(props.statement.english));
const measureContext = typeof document === "undefined" ? null : document.createElement("canvas").getContext("2d");
const compactLayout = computed(() => containerWidth.value > 0 && containerWidth.value <= MOBILE_BREAKPOINT);
const wordFontSize = computed(() => compactLayout.value ? MOBILE_WORD_FONT_SIZE : DESKTOP_WORD_FONT_SIZE);
const posFontSize = computed(() => compactLayout.value ? MOBILE_POS_FONT_SIZE : DESKTOP_POS_FONT_SIZE);
const syntaxFontSize = computed(() => compactLayout.value ? MOBILE_SYNTAX_FONT_SIZE : DESKTOP_SYNTAX_FONT_SIZE);
const wordGap = computed(() => compactLayout.value ? MOBILE_WORD_GAP : DESKTOP_WORD_GAP);
let resizeObserver: ResizeObserver | null = null;

function wordWidth(word: string): number {
  if (measureContext) {
    measureContext.font = `650 ${wordFontSize.value}px system-ui, sans-serif`;
    return measureContext.measureText(word).width;
  }
  return word.length * wordFontSize.value * 0.58;
}
function validRange(start: number, end: number): boolean { return Number.isInteger(start) && Number.isInteger(end) && start >= 0 && end >= start && end < words.value.length; }

/** 根据容器实际宽度逐词排版，单词空间不足时整体移到下一行。 */
const positionedWords = computed<PositionedWord[]>(() => {
  const availableWidth = Math.max(MIN_RENDER_WIDTH, containerWidth.value);
  const contentLeft = Math.min(HORIZONTAL_PADDING, availableWidth / 2);
  const contentRight = Math.max(contentLeft, availableWidth - contentLeft);
  const maximumColumnWidth = Math.max(MIN_RENDER_WIDTH, contentRight - contentLeft);
  const result: PositionedWord[] = [];
  let row = 0;
  let cursor = contentLeft;

  words.value.forEach((value, index) => {
    const measuredWidth = wordWidth(value);
    const measuredLabelWidth = labelWidth(posLabel(index)) + LABEL_PADDING * 2;
    const desiredContentWidth = Math.max(measuredWidth, measuredLabelWidth);
    const maximumContentWidth = Math.max(MIN_RENDER_WIDTH, maximumColumnWidth - wordGap.value);
    const contentWidth = Math.min(desiredContentWidth, maximumContentWidth);
    const occupiedWidth = Math.min(maximumColumnWidth, contentWidth + wordGap.value);
    if (cursor > contentLeft && cursor + occupiedWidth > contentRight) {
      row += 1;
      cursor = contentLeft;
    }
    const left = cursor + Math.min(wordGap.value / 2, occupiedWidth / 2);
    const right = Math.min(contentRight, left + contentWidth);
    result.push({ index, value, row, rowTop: 0, center: (left + right) / 2, left, right, compressed: measuredWidth > right - left });
    cursor += occupiedWidth;
  });

  /** 每一行按自身内容宽度居中，避免宽屏答案贴在画布左侧。 */
  const rows = new Map<number, PositionedWord[]>();
  result.forEach((word) => {
    const rowWords = rows.get(word.row) || [];
    rowWords.push(word);
    rows.set(word.row, rowWords);
  });
  rows.forEach((rowWords) => {
    const first = rowWords[0];
    const last = rowWords[rowWords.length - 1];
    const offset = (availableWidth - (last.right - first.left)) / 2 - first.left;
    rowWords.forEach((word) => {
      word.left += offset;
      word.right += offset;
      word.center += offset;
    });
  });
  return result;
});

const rowRanges = computed<RowRange[]>(() => {
  const ranges: RowRange[] = [];
  positionedWords.value.forEach((word) => {
    const range = ranges[word.row];
    if (range) range.end = word.index;
    else ranges.push({ row: word.row, start: word.index, end: word.index });
  });
  return ranges;
});

/** 跨行句法范围按行拆段，再在每一行独立分层，保证连线始终留在可视宽度内。 */
const tagSegments = computed<TagSegment[]>(() => {
  const segments: Omit<TagSegment, "layer">[] = [];
  props.statement.syntaxTags.filter(([start, end]) => validRange(start, end)).forEach(([start, end, label], tagIndex) => {
    rowRanges.value.forEach((range) => {
      const segmentStart = Math.max(start, range.start);
      const segmentEnd = Math.min(end, range.end);
      if (segmentStart <= segmentEnd) segments.push({ key: `${tagIndex}-${range.row}`, start: segmentStart, end: segmentEnd, label, row: range.row });
    });
  });

  const occupiedLayers = new Map<number, Array<Array<{ start: number; end: number }>>>();
  return segments
    .sort((first, second) => first.row - second.row || (first.end - first.start) - (second.end - second.start))
    .map((segment) => {
      const layers = occupiedLayers.get(segment.row) || [];
      let layer = layers.findIndex((ranges) => ranges.every((range) => segment.end < range.start || segment.start > range.end));
      if (layer < 0) { layer = layers.length; layers.push([]); }
      layers[layer].push({ start: segment.start, end: segment.end });
      occupiedLayers.set(segment.row, layers);
      return { ...segment, layer };
    });
});

const rowLayerCounts = computed(() => rowRanges.value.map((range) => Math.max(1, ...tagSegments.value.filter((segment) => segment.row === range.row).map((segment) => segment.layer + 1))));
const rowHeights = computed(() => rowLayerCounts.value.map((count) => BRACKET_START_Y + count * LAYER_HEIGHT + ROW_BOTTOM_PADDING));
const rowTopOffsets = computed(() => rowHeights.value.reduce<number[]>((offsets, height, index) => [...offsets, (offsets[index] || 0) + height], [0]));
const laidOutWords = computed(() => positionedWords.value.map((word) => ({ ...word, rowTop: rowTopOffsets.value[word.row] || 0 })));
const diagramWidth = computed(() => Math.max(MIN_RENDER_WIDTH, containerWidth.value));
const diagramHeight = computed(() => Math.max(BRACKET_START_Y + LAYER_HEIGHT, rowHeights.value.reduce((total, height) => total + height, 0)));

function getWord(index: number): PositionedWord { return laidOutWords.value[index]; }
function posLabel(index: number): string { return props.statement.posTags.filter(([start, end]) => validRange(start, end) && start <= index && index <= end).map((tag) => tag[2]).join(" · "); }
function labelWidth(label: string): number { return [...label].reduce((width, character) => width + (character.charCodeAt(0) > 127 ? 12 : 7), 0); }
function tagColor(label: string): TagColor { return LABEL_COLORS[label] || FALLBACK_COLOR; }
function wordColor(index: number): string {
  const tags = props.statement.syntaxTags.filter(([start, end]) => validRange(start, end) && start <= index && index <= end);
  if (!tags.length) return FALLBACK_COLOR.word;
  const smallest = tags.reduce((first, second) => first[1] - first[0] <= second[1] - second[0] ? first : second);
  return tagColor(smallest[2]).word;
}
function segmentCenter(segment: TagSegment): number { return (getWord(segment.start).left + getWord(segment.end).right) / 2; }
function segmentLabelY(segment: TagSegment): number { return getWord(segment.start).rowTop + BRACKET_START_Y + segment.layer * LAYER_HEIGHT + BRACKET_HEIGHT + BRACKET_TIP_HEIGHT + 15; }
function bracketPath(segment: TagSegment): string {
  const left = getWord(segment.start).left;
  const right = getWord(segment.end).right;
  const middle = (left + right) / 2;
  const top = getWord(segment.start).rowTop + BRACKET_START_Y + segment.layer * LAYER_HEIGHT;
  const flat = top + BRACKET_HEIGHT;
  const tip = flat + BRACKET_TIP_HEIGHT;
  const radius = Math.min(6, Math.max(1, (middle - left) * 0.3));
  return [`M ${left} ${top}`, `L ${left} ${flat - radius}`, `Q ${left} ${flat} ${left + radius} ${flat}`, `L ${middle - radius} ${flat}`, `Q ${middle} ${flat} ${middle} ${flat + radius}`, `L ${middle} ${tip}`, `L ${middle} ${flat + radius}`, `Q ${middle} ${flat} ${middle + radius} ${flat}`, `L ${right - radius} ${flat}`, `Q ${right} ${flat} ${right} ${flat - radius}`, `L ${right} ${top}`].join(" ");
}

onMounted(() => {
  if (!container.value) return;
  resizeObserver = new ResizeObserver(([entry]) => { containerWidth.value = entry.contentRect.width; });
  resizeObserver.observe(container.value);
});
onBeforeUnmount(() => resizeObserver?.disconnect());
</script>
