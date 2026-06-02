<template>
  <div class="mx-auto w-full max-w-6xl px-6 py-12">
    <h2 class="mb-2 text-2xl font-bold text-white">短语结构标注 - 效果演示</h2>
    <p class="mb-10 text-sm text-gray-500">
      词性（上方蓝色）· 单词颜色区分句法成分 · 下方花括号标注范围
    </p>

    <div
      v-for="(s, sIdx) in sentences"
      :key="sIdx"
      class="mb-20"
    >
      <!-- 全 SVG 渲染 -->
      <div class="flex justify-center overflow-x-auto">
        <svg
          :width="svgWidth(s)"
          :height="svgHeight(s)"
          :viewBox="`0 0 ${svgWidth(s)} ${svgHeight(s)}`"
          font-family="system-ui, -apple-system, sans-serif"
        >
          <!-- 词性标签：每个词正上方 -->
          <g
            v-for="(t, i) in s.tokens"
            :key="`pos-${i}`"
          >
            <!-- 蓝色背景圆角矩形 -->
            <rect
              :x="tokenCx(i, s) - posLabelW(getPosLabel(i, s.posTags)) / 2 - 4"
              :y="POS_Y - 9"
              :width="posLabelW(getPosLabel(i, s.posTags)) + 8"
              height="18"
              rx="4"
              fill="rgba(59,130,246,0.18)"
            />
            <text
              :x="tokenCx(i, s)"
              :y="POS_Y"
              text-anchor="middle"
              dominant-baseline="middle"
              font-size="11"
              font-weight="600"
              fill="#93c5fd"
            >
              {{ getPosLabel(i, s.posTags) }}
            </text>
          </g>

          <!-- 单词：颜色由所属最小句法成分决定 -->
          <text
            v-for="(t, i) in s.tokens"
            :key="`word-${i}`"
            :x="tokenCx(i, s)"
            :y="WORD_Y"
            text-anchor="middle"
            font-size="38"
            font-weight="600"
            :fill="wordColor(i, s)"
          >
            {{ t.word }}
          </text>

          <!-- 花括号层 -->
          <g
            v-for="(tag, ti) in layeredTags(s)"
            :key="`br-${ti}`"
          >
            <path
              :d="curlyBracket(tag, ti, s)"
              fill="none"
              :stroke="tagStroke(tag.type)"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <!-- 标签文字在尖角正下方 -->
            <text
              :x="tagMidX(tag, s)"
              :y="bracketLabelY(ti)"
              text-anchor="middle"
              dominant-baseline="middle"
              font-size="11"
              font-weight="600"
              :fill="tagStroke(tag.type)"
            >
              {{ tag.label }}
            </text>
          </g>
        </svg>
      </div>

      <!-- 音标 + 中文 -->
      <div class="mt-4 text-center text-sm text-gray-500">{{ s.soundmark }}</div>
      <div class="mt-1 text-center text-base text-gray-400">{{ s.chinese }}</div>

      <!-- 图例：显示当前句子实际用到的句法成分和颜色 -->
      <div class="mt-5 flex flex-wrap justify-center gap-2">
        <span
          v-for="tag in s.syntaxTags"
          :key="tag.label"
          class="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
          :style="{ background: tagBg(tag.type), color: tagStroke(tag.type) }"
        >
          <span
            class="inline-block h-2 w-2 rounded-full"
            :style="{ background: tagStroke(tag.type) }"
          ></span>
          {{ tag.label }}
        </span>
      </div>

      <!-- 折叠数据 -->
      <details class="mt-6">
        <summary class="cursor-pointer text-xs text-gray-600 hover:text-gray-400">
          查看数据格式
        </summary>
        <div class="mt-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <pre class="overflow-x-auto text-xs leading-relaxed text-gray-400">{{
            JSON.stringify({ posTags: s.posTags, syntaxTags: s.syntaxTags }, null, 2)
          }}</pre>
        </div>
      </details>
    </div>
  </div>
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
interface SentenceData {
  tokens: Token[];
  posTags: Tag[];
  syntaxTags: Tag[];
  chinese: string;
  soundmark: string;
}

// ─── 布局常量（SVG 坐标） ────────────────────────────────────────────────────
const POS_Y = 16; // 词性标签中心 y
const WORD_Y = 58; // 单词 baseline y
const BR_START = 68; // 所有括号竖线顶端
const BR_H = 16; // 竖线段高度（从顶端到开始弯曲的位置）
const TIP_H = 14; // 尖角深度（更高的尖角）
const TIP_W = 32; // 尖角宽度（左右各延伸多少px，让尖角更宽）
const LABEL_GAP = 14; // 尖角到标签中心的固定距离（不随层级变化）

// ─── 列宽计算 ────────────────────────────────────────────────────────────────
function colW(word: string): number {
  const l = word.length;
  if (l <= 1) return 60;
  if (l <= 2) return 76;
  if (l <= 3) return 96;
  if (l <= 5) return 118;
  if (l <= 7) return 140;
  return 162;
}

const WORD_FONT = 38;

// 用 Canvas measureText 精确测量文字宽度（运行时一次性创建）
const _measureCanvas = typeof document !== "undefined" ? document.createElement("canvas") : null;
const _measureCtx = _measureCanvas?.getContext("2d") ?? null;
if (_measureCtx) _measureCtx.font = `600 ${WORD_FONT}px system-ui, -apple-system, sans-serif`;

/** 精确测量单词渲染宽度（与 SVG text 同字体同字号） */
function wordPxW(word: string): number {
  if (_measureCtx) return _measureCtx.measureText(word).width;
  // SSR fallback：按字符数估算
  return word.length * WORD_FONT * 0.58;
}

/** 词列左边 x */
function colLeft(idx: number, s: SentenceData): number {
  const pad = 24;
  let x = pad;
  for (let i = 0; i < idx; i++) x += colW(s.tokens[i].word);
  return x;
}

/** 词列右边 x */
function colRight(idx: number, s: SentenceData): number {
  return colLeft(idx, s) + colW(s.tokens[idx].word);
}

/** 词列中心 x */
function tokenCx(idx: number, s: SentenceData): number {
  return colLeft(idx, s) + colW(s.tokens[idx].word) / 2;
}

/** 括号左脚：start 词的文字左边缘（列中心 - 词宽/2） */
function bracketLx(idx: number, s: SentenceData): number {
  const cx = tokenCx(idx, s);
  return cx - wordPxW(s.tokens[idx].word) / 2;
}

/** 括号右脚：end 词的文字右边缘（列中心 + 词宽/2） */
function bracketRx(idx: number, s: SentenceData): number {
  const cx = tokenCx(idx, s);
  return cx + wordPxW(s.tokens[idx].word) / 2;
}

/** SVG 总宽 */
function svgWidth(s: SentenceData): number {
  const pad = 24;
  return s.tokens.reduce((acc, t) => acc + colW(t.word), 0) + pad * 2;
}

/** SVG 总高 */
function svgHeight(s: SentenceData): number {
  return BR_START + BR_H + TIP_H + LABEL_GAP + 12 + 28;
}

// 按跨度排序（用于渲染顺序，不影响标签位置）
function layeredTags(s: SentenceData): Tag[] {
  return [...s.syntaxTags].sort((a, b) => a.end - a.start - (b.end - b.start));
}

/** 括号尖角固定 y */
const TIP_Y = BR_START + BR_H + TIP_H;

/** 标签 y：固定在尖角正下方，不随层级变化 */
function bracketLabelY(_ti: number): number {
  return TIP_Y + LABEL_GAP;
}

/** 花括号跨越范围的中心 x（基于内缩后的脚位） */
function tagMidX(tag: Tag, s: SentenceData): number {
  return (bracketLx(tag.start, s) + bracketRx(tag.end, s)) / 2;
}

function curlyBracket(tag: Tag, _ti: number, s: SentenceData): string {
  const lx = bracketLx(tag.start, s);
  const rx = bracketRx(tag.end, s);
  const mid = (lx + rx) / 2;
  const y0 = BR_START;
  const yFlat = y0 + BR_H; // 水平臂 y
  const yTip = yFlat + TIP_H; // 尖角 y

  // 标准花括号用圆弧（A 命令）实现：
  // 每半段有两个圆角转折，中间汇聚成尖角
  // 圆弧半径
  const r = Math.min(6, TIP_H * 0.4, (mid - lx) * 0.3);

  // 左半段：lx,y0 → 水平臂 → 外弧向右 → 内弧向下 → 尖角 mid,yTip
  // 右半段：尖角 → 内弧向右 → 外弧向上 → 水平臂 → rx,y0（镜像）

  return [
    // 左竖线 + 左外弧（向右弯）
    `M ${lx} ${y0}`,
    `L ${lx} ${yFlat - r}`,
    `A ${r} ${r} 0 0 0 ${lx + r} ${yFlat}`,
    // 左水平臂 + 左内弧（向下弯）
    `L ${mid - r} ${yFlat}`,
    `A ${r} ${r} 0 0 1 ${mid} ${yFlat + r}`,
    // 左半到尖角
    `L ${mid} ${yTip}`,
    // 右半从尖角出发（镜像）
    `L ${mid} ${yFlat + r}`,
    `A ${r} ${r} 0 0 1 ${mid + r} ${yFlat}`,
    `L ${rx - r} ${yFlat}`,
    `A ${r} ${r} 0 0 0 ${rx} ${yFlat - r}`,
    `L ${rx} ${y0}`,
  ].join(" ");
}

// ─── 颜色配置 ────────────────────────────────────────────────────────────────
const palette: Record<string, { stroke: string; word: string; bg: string }> = {
  NP: { stroke: "#fbbf24", word: "#fde68a", bg: "rgba(251,191,36,0.13)" },
  VP: { stroke: "#c084fc", word: "#e9d5ff", bg: "rgba(192,132,252,0.13)" },
  PP: { stroke: "#22d3ee", word: "#a5f3fc", bg: "rgba(34,211,238,0.13)" },
  ADVP: { stroke: "#34d399", word: "#a7f3d0", bg: "rgba(52,211,153,0.13)" },
  TP: { stroke: "#fb923c", word: "#fed7aa", bg: "rgba(251,146,60,0.13)" },
};
const fallback = { stroke: "#a5b4fc", word: "#ffffff", bg: "rgba(165,180,252,0.13)" };

function tagStroke(type?: string) {
  return (type && palette[type]?.stroke) || fallback.stroke;
}
function tagBg(type?: string) {
  return (type && palette[type]?.bg) || fallback.bg;
}

const typeDesc: Record<string, string> = {
  NP: "名词短语",
  VP: "动词短语",
  PP: "介词短语",
  ADVP: "副词短语",
  TP: "不定式短语",
};

/** 单词颜色：取该词所属最小跨度句法成分颜色 */
function wordColor(idx: number, s: SentenceData): string {
  const matches = s.syntaxTags.filter((t) => t.start <= idx && idx <= t.end);
  if (!matches.length) return "#ffffff";
  const smallest = matches.reduce((a, b) => (a.end - a.start <= b.end - b.start ? a : b));
  return (smallest.type && palette[smallest.type]?.word) || "#ffffff";
}

/** 估算词性标签文字宽度 */
function posLabelW(label: string): number {
  let w = 0;
  for (const ch of label) w += ch.charCodeAt(0) > 127 ? 12 : 7;
  return w;
}

// ─── 工具函数 ────────────────────────────────────────────────────────────────
function getPosLabel(idx: number, tags: Tag[]): string {
  return tags.find((t) => t.start === idx && t.end === idx)?.label ?? "";
}

function usedTypes(s: SentenceData): string[] {
  return [...new Set(s.syntaxTags.map((t) => t.type || "").filter(Boolean))];
}

// ─── 示例数据 ────────────────────────────────────────────────────────────────
const sentences: SentenceData[] = [
  {
    tokens: [
      { word: "I" },
      { word: "don't" },
      { word: "want" },
      { word: "to" },
      { word: "be" },
      { word: "here" },
      { word: "all" },
      { word: "the" },
      { word: "day" },
    ],
    posTags: [
      { start: 0, end: 0, label: "代词" },
      { start: 1, end: 1, label: "助动词" },
      { start: 2, end: 2, label: "动词" },
      { start: 3, end: 3, label: "不定式" },
      { start: 4, end: 4, label: "动词" },
      { start: 5, end: 5, label: "副词" },
      { start: 6, end: 6, label: "限定词" },
      { start: 7, end: 7, label: "限定词" },
      { start: 8, end: 8, label: "名词" },
    ],
    syntaxTags: [
      { start: 0, end: 0, label: "主语", type: "NP" },
      { start: 1, end: 2, label: "谓语", type: "VP" },
      { start: 3, end: 4, label: "宾语（不定式）", type: "TP" },
      { start: 5, end: 5, label: "地点状语", type: "ADVP" },
      { start: 6, end: 8, label: "时间状语", type: "NP" },
    ],
    chinese: "我不想整天待在这里",
    soundmark: "/aɪ doʊnt wɑːnt tuː biː hɪər ɔːl ðə deɪ/",
  },
  {
    tokens: [
      { word: "She" },
      { word: "is" },
      { word: "reading" },
      { word: "a" },
      { word: "book" },
      { word: "in" },
      { word: "the" },
      { word: "library" },
    ],
    posTags: [
      { start: 0, end: 0, label: "代词" },
      { start: 1, end: 1, label: "助动词" },
      { start: 2, end: 2, label: "动词" },
      { start: 3, end: 3, label: "限定词" },
      { start: 4, end: 4, label: "名词" },
      { start: 5, end: 5, label: "介词" },
      { start: 6, end: 6, label: "限定词" },
      { start: 7, end: 7, label: "名词" },
    ],
    syntaxTags: [
      { start: 0, end: 0, label: "主语", type: "NP" },
      { start: 1, end: 2, label: "谓语", type: "VP" },
      { start: 3, end: 4, label: "宾语", type: "NP" },
      { start: 5, end: 7, label: "地点状语", type: "PP" },
    ],
    chinese: "她正在图书馆看书",
    soundmark: "/ʃiː ɪz ˈriːdɪŋ ə bʊk ɪn ðə ˈlaɪbrɛri/",
  },
  {
    tokens: [
      { word: "The" },
      { word: "cat" },
      { word: "sat" },
      { word: "on" },
      { word: "the" },
      { word: "mat" },
    ],
    posTags: [
      { start: 0, end: 0, label: "限定词" },
      { start: 1, end: 1, label: "名词" },
      { start: 2, end: 2, label: "动词" },
      { start: 3, end: 3, label: "介词" },
      { start: 4, end: 4, label: "限定词" },
      { start: 5, end: 5, label: "名词" },
    ],
    syntaxTags: [
      { start: 0, end: 1, label: "主语", type: "NP" },
      { start: 2, end: 2, label: "谓语", type: "VP" },
      { start: 3, end: 5, label: "地点状语", type: "PP" },
    ],
    chinese: "猫坐在垫子上",
    soundmark: "/ðə kæt sæt ɑn ðə mæt/",
  },
];
</script>
