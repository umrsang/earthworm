---
AIGC:
  ContentProducer: '001191110102MAD55U9H0F10002'
  ContentPropagator: '001191110102MAD55U9H0F10002'
  Label: '1'
  ProduceID: 'da100ce1-649b-4eee-be09-0781100f2332'
  PropagateID: 'da100ce1-649b-4eee-be09-0781100f2332'
  ReservedCode1: 'ce22527a-fb85-4c89-9a89-7ee56043ae33'
  ReservedCode2: 'ce22527a-fb85-4c89-9a89-7ee56043ae33'
---

# Earthworm UI 设计规范

> 基于 Logto 官网风格，全局深色主题设计语言。后续开发 UI 需遵循本规范。

---

## 1. 全局基础

### 背景色
- 主背景：`bg-[#0a0a16]`（近炭黑色，微紫调）
- 统一在 `layouts/default.vue` 中设置，所有页面继承
- 禁止使用 `bg-white`、`bg-gray-*` 作为页面底色

### 文字色
- 主文字：`text-white`
- 次要文字：`text-gray-400`
- 辅助/描述文字：`text-gray-500`
- 禁用 `dark:` 前缀，全局已强制深色模式

### 主题色
- 品色：**紫色系**（`purple-400` / `purple-500` / `purple-600`）
- 禁止使用 `fuchsia`、`blue`、`emerald` 等作为主强调色
- 成功/完成状态可用 `emerald`/`green`
- 错误状态使用 `red`

---

## 2. 卡片样式

### 标准卡片
```
rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6
transition-all duration-300 hover:border-purple-500/20 hover:bg-white/[0.04]
```

### 要点
- 圆角统一 `rounded-2xl`（16px）
- 边框使用极低透明度白色：`border-white/[0.06]`
- 背景使用极低透明度白色：`bg-white/[0.02]`
- Hover 时边框变紫色：`hover:border-purple-500/20`
- 禁止使用 `bg-white`、`bg-gray-900`、`dark:bg-*` 写法

---

## 3. 按钮

### 主要按钮（CTA）
```
rounded-full bg-purple-600 px-8 py-3.5 text-base font-semibold text-white
shadow-lg shadow-purple-600/25 transition-all duration-300
hover:bg-purple-500 hover:shadow-purple-500/30 hover:scale-105 active:scale-100
```

### 次级按钮（边框）
```
rounded-full border border-purple-500/40 bg-purple-500/10 px-5 py-2.5
text-sm font-medium text-purple-400
transition-all duration-300 hover:border-purple-500 hover:bg-purple-500/20 hover:text-purple-300
```

### 幽灵按钮（纯文字）
```
text-gray-400 transition-colors hover:text-purple-400
```

### 要点
- 按钮统一 `rounded-full` 圆角
- 禁用 daisyUI `btn`、`btn-outline`、`btn-ghost` 等类名
- 禁用 `bg-blue-*` 作为按钮背景
- 图标 + 文字按钮用 `inline-flex items-center gap-2`

---

## 4. 输入框

### 文字输入
```
rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3
text-white placeholder-gray-600
focus:border-purple-500/30 focus:outline-none focus:ring-1 focus:ring-purple-500/20
```

### 游戏单词输入框底线
```
border-b-2 border-b-white/[0.15]
激活态: text-purple-400 border-b-purple-400
错误态: text-red-500 border-b-red-500
```

---

## 5. 进度条

```
容器: overflow-hidden rounded-full bg-purple-500/10
填充: rounded-full bg-gradient-to-r from-purple-500 to-purple-400 transition-all duration-300
```

---

## 6. 弹窗/模态框

### 标准弹窗
```
rounded-2xl border border-white/[0.06] bg-[#12122a] p-6 shadow-2xl shadow-purple-900/20
```

### 要点
- 禁用 daisyUI `card bg-base-100`（在深色全局下会显示为白色）
- 关闭按钮使用 `text-gray-400 hover:text-white hover:bg-white/10`
- 关闭按钮定位用 `absolute -right-1 top-0`，内容区加 `pr-8` 避免遮挡

---

## 7. 导航栏

- Logo 文字：`text-white text-2xl font-extrabold`
- 导航链接：`text-gray-400 hover:text-purple-400`
- 登录按钮使用主按钮样式

---

## 8. 排版层级

| 级别 | 用途 | 样式 |
|------|------|------|
| H1 | 页面主标题 | `text-4xl font-extrabold sm:text-5xl lg:text-6xl` |
| H2 | 区块标题 | `text-2xl font-bold text-white` |
| H3 | 卡片标题 | `text-lg font-semibold text-white` |
| 正文 | 主要内容 | `text-base text-gray-400` |
| 辅助 | 描述/标签 | `text-sm text-gray-500` |
| 极小 | 时间戳/备注 | `text-xs text-gray-600` |

---

## 9. 间距规范

- 页面容器：`mx-auto max-w-screen-xl px-6`
- 区块间距：`py-24`（大区块之间）
- 卡片网格间距：`gap-5` 或 `gap-6`
- 组件内间距：`p-5` 或 `p-6`

---

## 10. 图标使用

- 优先使用 `@iconify-icons` 的 `i-ph-*`（Phosphor Icons）
- 图标尺寸：`h-5 w-5`（标准）/ `h-4 w-4`（小）/ `h-6 w-6`（大）
- 图标颜色继承父级 `text-*` 或单独设置
- 禁用内联 SVG 字符串（会因截断导致编译错误），统一用 `UIcon` 组件

---

## 11. 装饰效果

### 背景光斑
```
absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[800px]
rounded-full bg-purple-600/10 blur-[120px] pointer-events-none
```

### 标签徽章
```
inline-flex items-center gap-2 rounded-full border border-white/10
bg-white/5 px-4 py-1.5 text-sm text-gray-400
```

### 特性标签
```
flex items-center gap-3 rounded-xl border border-white/5
bg-white/[0.02] px-4 py-3
```

---

## 12. 禁止事项

- 禁止使用 `dark:` 前缀（全局已强制深色，`dark:` 不会生效且增加混乱）
- 禁止使用 `bg-white`、`bg-gray-100`、`bg-gray-200` 等浅色背景
- 禁止使用 `border-gray-300`、`border-gray-400`（在深色背景下显眼，用 `border-white/[0.06]` 替代）
- 禁止使用 `fuchsia` 色系（已统一为 `purple`）
- 禁止使用 `blue` 作为按钮或强调色
- 禁止使用 daisyUI `btn`、`card`、`bg-base-100` 等组件类（在深色全局下表现异常）
- 禁止在模板中内联长 SVG 字符串（使用 `UIcon` 组件替代）

---

## 13. 响应式断点

- 移动端：< `sm`（640px），单列布局
- 平板：`sm` - `lg`，双列布局
- 桌面：`lg`+（1024px），三/四列布局
- 左右两栏布局使用 `flex-col lg:flex-row` 切换

> AI生成