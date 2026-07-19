<template>
  <div class="flex justify-center overflow-x-auto">
    <svg
      :width="svgWidth()"
      :height="svgHeight()"
      :viewBox="`0 0 ${svgWidth()} ${svgHeight()}`"
      font-family="system-ui, -apple-system, sans-serif"
    >
      <!-- 词性标签：每个词正上方 -->
      <g
        v-for="(t, i) in props.tokens"
        :key="`pos-${i}`"
      >
        <template v-if="getPosLabel(i, props.posTags)">
          <rect
            :x="tokenCx(i) - posLabelW(getPosLabel(i, props.posTags)) / 2 - 4"
            :y="POS_Y - 9"
            :width="posLabelW(getPosLabel(i, props.posTags)) + 8"
            height="18"
            rx="4"
            fill="rgba(59,130,246,0.18)"
          />
          <text
            :x="tokenCx(i)"
            :y="POS_Y"
            text-anchor="middle"
            dominant-baseline="middle"
            font-size="11"
            font-weight="600"
            fill="#93c5fd"
          >
            {{ getPosLabel(i, props.posTags) }}
          </text>
        </template>
      </g>

      <!-- 单词：颜色由所属最小句法成分决定 -->
      <text
        v-for="(t, i) in props.tokens"
        :key="`word-${i}`"
        :x="tokenCx(i)"
        :y="WORD_Y"
        text-anchor="middle"
        font-size="38"
        font-weight="600"
        :fill="wordColor(i)"
      >
        {{ t.word }}
      </text>

      <!-- 花括号层（仅有 syntaxTags 时渲染） -->
      <g
        v-for="(tag, ti) in layeredTags()"
        :key="`br-${ti}`"
      >
        <path
          :d="curlyBracket(tag)"
          fill="none"
          :stroke="tagStroke(tag)"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <text
          :x="tagMidX(tag)"
          :y="bracketLabelY()"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="11"
          font-weight="600"
          :fill="tagStroke(tag)"
        >
          {{ tag.label }}
        </text>
      </g>
    </svg>
  </div>

  <!-- 音标 + 中文 -->
  <div class="mt-4 text-center text-sm text-gray-500">{{ props.soundmark }}</div>
  <div class="mt-1 text-center text-base text-gray-400">{{ props.chinese }}</div>
</template>

<script setup lang="ts">
// ─── 类型 ────────────────────────────────────────────────────────────────────
interface Token {
  word: string;
}
interface Tag {
  start: number;
  end: number;
  label: string;
  type?: string;
}

const props = defineProps<{
  tokens: Token[];
  posTags: Tag[];
  syntaxTags: Tag[];
  chinese: string;
  soundmark: string;
}>();

// ─── 布局常量 ─────────────────────────────────────────────────────────────────
const POS_Y = 16;
const WORD_Y = 58;
const BR_START = 68;
const BR_H = 16;
const TIP_H = 14;
const LABEL_GAP = 14;

// ─── Canvas measureText ───────────────────────────────────────────────────────
const WORD_FONT = 38;
const _canvas = typeof document !== "undefined" ? document.createElement("canvas") : null;
const _ctx = _canvas?.getContext("2d") ?? null;
if (_ctx) _ctx.font = `600 ${WORD_FONT}px system-ui, -apple-system, sans-serif`;

function wordPxW(word: string): number {
  if (_ctx) return _ctx.measureText(word).width;
  return word.length * WORD_FONT * 0.58;
}

// ─── 列宽 ─────────────────────────────────────────────────────────────────────
function colW(word: string): number {
  // 基于实际像素宽度 + padding，确保长单词不会贴在一起
  return wordPxW(word) + 32;
}

function colLeft(idx: number): number {
  const pad = 24;
  let x = pad;
  for (let i = 0; i < idx; i++) x += colW(props.tokens[i].word);
  return x;
}

function tokenCx(idx: number): number {
  return colLeft(idx) + colW(props.tokens[idx].word) / 2;
}

function bracketLx(idx: number): number {
  return tokenCx(idx) - wordPxW(props.tokens[idx].word) / 2;
}

function bracketRx(idx: number): number {
  return tokenCx(idx) + wordPxW(props.tokens[idx].word) / 2;
}

function svgWidth(): number {
  const pad = 24;
  return props.tokens.reduce((acc, t) => acc + colW(t.word), 0) + pad * 2;
}

function svgHeight(): number {
  return props.syntaxTags.length ? BR_START + BR_H + TIP_H + LABEL_GAP + 12 + 28 : BR_START + 28;
}

// ─── 花括号 ───────────────────────────────────────────────────────────────────
function layeredTags(): Tag[] {
  return [...props.syntaxTags].sort((a, b) => a.end - a.start - (b.end - b.start));
}

const TIP_Y = BR_START + BR_H + TIP_H;

function bracketLabelY(): number {
  return TIP_Y + LABEL_GAP;
}

function tagMidX(tag: Tag): number {
  return (bracketLx(tag.start) + bracketRx(tag.end)) / 2;
}

function curlyBracket(tag: Tag): string {
  const lx = bracketLx(tag.start);
  const rx = bracketRx(tag.end);
  const mid = (lx + rx) / 2;
  const y0 = BR_START;
  const yFlat = y0 + BR_H;
  const yTip = yFlat + TIP_H;
  const r = Math.min(6, TIP_H * 0.4, (mid - lx) * 0.3);

  return [
    `M ${lx} ${y0}`,
    `L ${lx} ${yFlat - r}`,
    `A ${r} ${r} 0 0 0 ${lx + r} ${yFlat}`,
    `L ${mid - r} ${yFlat}`,
    `A ${r} ${r} 0 0 1 ${mid} ${yFlat + r}`,
    `L ${mid} ${yTip}`,
    `L ${mid} ${yFlat + r}`,
    `A ${r} ${r} 0 0 1 ${mid + r} ${yFlat}`,
    `L ${rx - r} ${yFlat}`,
    `A ${r} ${r} 0 0 0 ${rx} ${yFlat - r}`,
    `L ${rx} ${y0}`,
  ].join(" ");
}

// ─── 颜色 ─────────────────────────────────────────────────────────────────────
// 按句法角色（label）分配颜色，避免同 type 但不同角色撞色
const labelPalette: Record<string, { stroke: string; word: string; bg: string }> = {
  主语: { stroke: "#fbbf24", word: "#fde68a", bg: "rgba(251,191,36,0.13)" },
  谓语: { stroke: "#c084fc", word: "#e9d5ff", bg: "rgba(192,132,252,0.13)" },
  宾语: { stroke: "#22d3ee", word: "#a5f3fc", bg: "rgba(34,211,238,0.13)" },
  表语: { stroke: "#34d399", word: "#a7f3d0", bg: "rgba(52,211,153,0.13)" },
  状语: { stroke: "#fb923c", word: "#fed7aa", bg: "rgba(251,146,60,0.13)" },
  定语: { stroke: "#f472b6", word: "#fbcfe8", bg: "rgba(244,114,182,0.13)" },
  补语: { stroke: "#a78bfa", word: "#ddd6fe", bg: "rgba(167,139,250,0.13)" },
};
const fallback = { stroke: "#a5b4fc", word: "#ffffff", bg: "rgba(165,180,252,0.13)" };

function getTagColor(tag: Tag) {
  return labelPalette[tag.label] || fallback;
}

function tagStroke(tag: Tag) {
  return getTagColor(tag).stroke;
}

function wordColor(idx: number): string {
  const matches = props.syntaxTags.filter((t) => t.start <= idx && idx <= t.end);
  if (!matches.length) return "#ffffff";
  const smallest = matches.reduce((a, b) => (a.end - a.start <= b.end - b.start ? a : b));
  return getTagColor(smallest).word;
}

// ─── 工具 ─────────────────────────────────────────────────────────────────────
function getPosLabel(idx: number, tags: Tag[]): string {
  return tags.find((t) => t.start === idx && t.end === idx)?.label ?? "";
}

function posLabelW(label: string): number {
  let w = 0;
  for (const ch of label) w += ch.charCodeAt(0) > 127 ? 12 : 7;
  return w;
}
</script>
