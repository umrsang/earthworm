const state = {
  page: new URLSearchParams(window.location.search).get("page") || "today",
  theme: "dark",
  favorites: new Set(["travel"]),
  reviewSelected: new Set(["r1", "r2"]),
  answerState: "idle",
  answerText: "",
  authMode:
    new URLSearchParams(window.location.search).get("mode") === "register" ? "register" : "login",
  showPassword: false,
  uploadStep: Math.min(
    4,
    Math.max(1, Number(new URLSearchParams(window.location.search).get("step")) || 1),
  ),
  uploadVisibility: "private",
  settings: {
    autoNext: false,
    showAnswer: true,
    typingSound: false,
    reduceMotion: false,
  },
};

const courses = [
  {
    id: "daily",
    title: "日常英语 · 从开口到自如",
    description: "从高频生活场景出发，掌握真正用得上的表达。",
    level: "A2 · 官方",
    stats: ["12 课", "286 句", "约 3.5 小时"],
    cover: "",
    progress: 42,
  },
  {
    id: "travel",
    title: "旅行英语生存指南",
    description: "机场、酒店、餐厅与问路，一次旅行所需的关键表达。",
    level: "A2 · 热门",
    stats: ["8 课", "168 句", "约 2 小时"],
    cover: "travel",
    progress: 0,
  },
  {
    id: "business",
    title: "职场会议表达",
    description: "清晰表达观点、提问和回应，让会议沟通更自然。",
    level: "B1 · 新课",
    stats: ["10 课", "220 句", "约 3 小时"],
    cover: "business",
    progress: 0,
  },
];

const reviewItems = [
  {
    id: "r1",
    en: "Could you say that again?",
    zh: "你能再说一遍吗？",
    source: "旅行英语 · 机场",
    mastery: 2,
  },
  {
    id: "r2",
    en: "I'd like to check in.",
    zh: "我想办理入住。",
    source: "旅行英语 · 酒店",
    mastery: 3,
  },
  {
    id: "r3",
    en: "That works for me.",
    zh: "我觉得这样可以。",
    source: "职场会议 · 协商",
    mastery: 1,
  },
  {
    id: "r4",
    en: "It depends on the weather.",
    zh: "这取决于天气。",
    source: "日常英语 · 周末",
    mastery: 4,
  },
];

const main = document.querySelector("#main");
const modalRoot = document.querySelector("#modal-root");
const toastRoot = document.querySelector("#toast-root");

function icon(name) {
  const map = {
    play: "▶",
    book: "▤",
    review: "↻",
    wrong: "!",
    clock: "◷",
    spark: "✦",
    check: "✓",
    arrow: "→",
    plus: "+",
    sound: "◖",
    hint: "◇",
    pause: "Ⅱ",
  };
  return map[name] || "·";
}

function button(text, action, type = "", extra = "") {
  return `<button class="button ${type}" data-action="${action}" ${extra}>${text}</button>`;
}

function header(eyebrow, title, desc, actions = "") {
  return `
    <header class="page-header">
      <div>
        <p class="eyebrow">${eyebrow}</p>
        <h1>${title}</h1>
        <p class="muted">${desc}</p>
      </div>
      ${actions ? `<div class="header-actions">${actions}</div>` : ""}
    </header>`;
}

function authPage() {
  const isLogin = state.authMode === "login";
  return `
    <div class="auth-page">
      <section class="auth-story">
        <button class="brand auth-brand" data-page="today" aria-label="返回产品首页">
          <span class="brand-mark">E</span>
          <span><strong>Earthworm</strong><small>Learning OS</small></span>
        </button>
        <div class="auth-story-copy">
          <span class="status-pill purple">每天 15 分钟，真正掌握英语表达</span>
          <h1>把零散学习，变成<br /><em>每天都能完成的进步。</em></h1>
          <p>课程学习、到期复习和错题巩固被整理进同一份计划。你只需要开始，系统会记住剩下的事情。</p>
          <div class="auth-proof">
            <div><strong>12 天</strong><span>示例连续学习</span></div>
            <div><strong>84%</strong><span>示例首次正确率</span></div>
            <div><strong>15 分钟</strong><span>推荐每日目标</span></div>
          </div>
        </div>
        <article class="auth-preview card">
          <div class="auth-preview-head"><span>今日学习</span><strong>12 / 20 句</strong></div>
          <div class="progress-track"><i style="width:60%"></i></div>
          <div class="auth-preview-task"><span class="task-icon mint">✓</span><div><strong>热身复习</strong><small>5 个到期表达 · 已完成</small></div></div>
          <div class="auth-preview-task"><span class="task-icon">▤</span><div><strong>旅行英语 · 酒店入住</strong><small>第 3 课 · 继续学习</small></div></div>
        </article>
      </section>

      <section class="auth-panel">
        <div class="auth-form-wrap">
          <div class="auth-mobile-brand"><span class="brand-mark">E</span><strong>Earthworm</strong></div>
          <p class="eyebrow">${isLogin ? "WELCOME BACK" : "START LEARNING"}</p>
          <h2>${isLogin ? "欢迎回来" : "创建你的学习账号"}</h2>
          <p class="muted">${isLogin ? "继续今天的学习计划和到期复习。" : "注册后会自动保存学习进度并同步设置。"}</p>

          <form class="auth-form" data-form="auth">
            <div class="field">
              <label for="auth-username">用户名</label>
              <input id="auth-username" name="username" autocomplete="username" placeholder="输入 2–32 位用户名" />
              <small class="field-message" data-field-message="username"></small>
            </div>
            <div class="field">
              <div class="field-label-row"><label for="auth-password">密码</label>${isLogin ? '<button type="button" class="text-button" data-action="forgot-password">忘记密码？</button>' : ""}</div>
              <div class="password-field">
                <input id="auth-password" name="password" type="${state.showPassword ? "text" : "password"}" autocomplete="${isLogin ? "current-password" : "new-password"}" placeholder="${isLogin ? "输入密码" : "至少 8 位，包含字母和数字"}" />
                <button type="button" data-action="toggle-password" aria-label="${state.showPassword ? "隐藏密码" : "显示密码"}">${state.showPassword ? "隐藏" : "显示"}</button>
              </div>
              <small class="field-message" data-field-message="password"></small>
            </div>
            ${
              isLogin
                ? `<label class="check-row"><input type="checkbox" checked /> <span>在这台设备上保持登录</span></label>`
                : `<div class="field"><label for="auth-confirm">确认密码</label><input id="auth-confirm" name="confirm" type="password" autocomplete="new-password" placeholder="再次输入密码" /><small class="field-message" data-field-message="confirm"></small></div>
                   <label class="check-row"><input id="auth-agreement" type="checkbox" /> <span>我已阅读并同意<a href="#">服务条款</a>和<a href="#">隐私政策</a></span></label>`
            }
            <button type="submit" class="button primary auth-submit">${isLogin ? "登录并继续学习" : "注册并开始学习"} →</button>
          </form>

          <div class="auth-switch">
            <span>${isLogin ? "还没有账号？" : "已经有账号？"}</span>
            <button data-action="${isLogin ? "show-register" : "show-login"}">${isLogin ? "免费创建账号" : "返回登录"}</button>
          </div>
          <button class="button ghost auth-back" data-page="today">← 暂不登录，返回首页</button>
        </div>
      </section>
    </div>`;
}

function uploadPage() {
  const step = state.uploadStep;
  return `
    <div class="page upload-page">
      ${header(
        "CREATOR STUDIO",
        step === 4 ? "课程包已创建" : "导入课程包",
        step === 4
          ? "内容已保存为私有课程包，你可以继续编辑或开始预览。"
          : "上传 ZIP 后先在浏览器中解析与校验，确认无误后才会发布。",
        step === 4 ? "" : button("格式要求", "format-guide", "ghost"),
      )}
      ${
        step < 4
          ? `<div class="upload-stepper" aria-label="上传进度">
              ${uploadStepItem(1, "选择文件", step)}
              ${uploadStepItem(2, "校验与编辑", step)}
              ${uploadStepItem(3, "发布设置", step)}
            </div>`
          : ""
      }
      <section class="upload-content">${step === 1 ? uploadSelectStep() : step === 2 ? uploadValidateStep() : step === 3 ? uploadPublishStep() : uploadSuccessStep()}</section>
    </div>`;
}

function uploadStepItem(number, label, current) {
  const status = number < current ? "done" : number === current ? "active" : "";
  return `<div class="upload-step ${status}"><span>${number < current ? "✓" : number}</span><strong>${label}</strong></div>`;
}

function uploadSelectStep() {
  return `
    <div class="upload-select-layout">
      <article class="card upload-dropzone" data-action="simulate-file">
        <span class="upload-icon">⇧</span>
        <h2>拖入课程包 ZIP 文件</h2>
        <p class="muted">或点击选择文件。解析在本地进行，校验完成前不会上传。</p>
        ${button("选择 ZIP 文件", "simulate-file", "primary")}
        <small>最大 50MB · 最多 50 课 · 解压后不超过 200MB</small>
      </article>
      <aside class="card upload-guide-card">
        <p class="eyebrow">BEFORE UPLOAD</p>
        <h2>上传前检查</h2>
        <ul class="check-list">
          <li><span>1</span><div><strong>包含 data 目录</strong><small>每个课程对应一个 JSON 文件</small></div></li>
          <li><span>2</span><div><strong>英文和中文不可为空</strong><small>音标、标签和视频为可选字段</small></div></li>
          <li><span>3</span><div><strong>导入后默认私有</strong><small>公开发布需要再次确认</small></div></li>
        </ul>
        <button class="button ghost" data-action="download-sample">下载示例课程包</button>
      </aside>
    </div>
    <div class="upload-footer">${button("取消", "cancel-upload", "ghost")}</div>`;
}

function uploadValidateStep() {
  return `
    <div class="upload-summary card">
      <div class="file-chip"><span>ZIP</span><div><strong>travel-english.zip</strong><small>3.8MB · 已完成本地解析</small></div></div>
      <div class="upload-summary-metrics">
        <div><strong>8</strong><span>课程</span></div><div><strong>168</strong><span>语句</span></div><div><strong class="trend-up">0</strong><span>错误</span></div><div><strong class="warning-text">2</strong><span>警告</span></div>
      </div>
      <button class="button small ghost" data-action="reset-upload">重新选择</button>
    </div>
    <div class="upload-validate-layout section">
      <section class="card card-pad">
        <div class="section-head"><div><p class="eyebrow">VALIDATION</p><h2>校验结果</h2></div><div class="tabs"><button class="tab is-active">全部</button><button class="tab">只看问题 2</button></div></div>
        <div class="validation-list">
          <article class="validation-row warning"><span>!</span><div><strong>data/03.json · 第 18 条</strong><p>缺少音标，将保留为空；不影响发布。</p></div><button class="button small ghost" data-action="locate-upload-field">定位</button></article>
          <article class="validation-row warning"><span>!</span><div><strong>data/06.json · 第 4 条</strong><p>英文内容与第 2 课第 11 条相似，请确认是否重复。</p></div><button class="button small ghost" data-action="locate-upload-field">定位</button></article>
          <article class="validation-row success"><span>✓</span><div><strong>课程数据结构正确</strong><p>8 个课程文件均符合字段要求。</p></div></article>
        </div>
      </section>
      <aside class="card card-pad">
        <p class="eyebrow">PACKAGE INFO</p><h2>课程包信息</h2>
        <div class="field"><label>标题</label><input value="旅行英语生存指南" /></div>
        <div class="field"><label>描述</label><textarea>机场、酒店、餐厅与问路，一次旅行所需的关键表达。</textarea></div>
        <div class="field"><label>课程预览</label><button class="button ghost" data-action="preview-upload-data">查看前 20 条数据 →</button></div>
      </aside>
    </div>
    <div class="upload-footer">${button("返回", "upload-prev", "ghost")}${button("重新校验", "revalidate-upload", "ghost")}${button("下一步：发布设置 →", "upload-next", "primary")}</div>`;
}

function uploadPublishStep() {
  const visibility = state.uploadVisibility;
  return `
    <div class="upload-publish-layout">
      <section class="card card-pad upload-cover-card">
        <p class="eyebrow">COURSE PROFILE</p><h2>课程信息</h2>
        <div class="upload-cover-preview"><span>A2</span><strong>旅行英语<br />生存指南</strong><small>8 课 · 168 句</small></div>
        <button class="button ghost" data-action="change-cover">更换封面</button>
        <div class="field"><label>难度</label><select class="select"><option>A2 初级</option><option>A1 入门</option><option>B1 中级</option></select></div>
        <div class="field"><label>标签</label><input value="旅行, 场景口语, 生存英语" /></div>
      </section>
      <section class="card card-pad">
        <p class="eyebrow">VISIBILITY</p><h2>谁可以看到这个课程包？</h2>
        <p class="muted">首次导入建议先保存为私有，预览确认后再公开。</p>
        <div class="visibility-list">
          ${visibilityOption("private", "私有", "仅你自己可见，可继续编辑和预览。", "锁", visibility)}
          ${visibilityOption("public", "公开", "所有用户可搜索和学习，需要确认内容版权。", "地球", visibility)}
          ${visibilityOption("member", "会员专享", "仅创始会员可以访问。", "冠", visibility)}
        </div>
        ${
          visibility === "public"
            ? '<label class="check-row publish-confirm"><input id="publish-confirm" type="checkbox" /> <span>我确认内容有权公开，并同意接受内容审核</span></label>'
            : ""
        }
        <div class="publish-note"><span>i</span><p><strong>当前选择：${visibility === "private" ? "私有" : visibility === "public" ? "公开" : "会员专享"}</strong><br />发布后仍可在课程管理中调整可见性。</p></div>
      </section>
    </div>
    <div class="upload-footer">${button("← 上一步", "upload-prev", "ghost")}${button("保存为私有草稿", "save-upload-draft", "ghost")}${button(visibility === "public" ? "公开发布课程包" : "创建课程包", "publish-upload", "primary")}</div>`;
}

function visibilityOption(value, title, desc, mark, current) {
  return `<button class="visibility-option ${current === value ? "is-active" : ""}" data-action="select-visibility" data-value="${value}"><span class="visibility-mark">${mark}</span><div><strong>${title}</strong><p>${desc}</p></div><i>${current === value ? "●" : "○"}</i></button>`;
}

function uploadSuccessStep() {
  return `<article class="card upload-success">
    <span class="complete-mark">✓</span>
    <p class="eyebrow">IMPORT COMPLETE</p><h1>旅行英语生存指南</h1>
    <p class="muted">8 个课程、168 条语句已保存。当前状态为私有，尚未出现在课程中心。</p>
    <div class="complete-metrics"><div><strong>8</strong><span>课程</span></div><div><strong>168</strong><span>语句</span></div><div><strong>0</strong><span>错误</span></div><div><strong>私有</strong><span>可见性</span></div></div>
    <div class="button-row" style="justify-content:center">${button("查看课程包", "course-detail", "primary")}${button("继续编辑", "edit-course", "mint")}${button("再上传一个", "restart-upload", "ghost")}${button("返回创作台", "cancel-upload", "ghost")}</div>
  </article>`;
}

function todayPage() {
  return `
    <div class="page">
      ${header(
        "2026 · 7 月 28 日 · 星期二",
        "晚上好，林小满",
        "今天再完成 8 句，就能保持你的 12 天连续学习。",
        `<button class="icon-button" data-action="notifications" aria-label="通知">♢<span class="dot"></span></button>
         <button class="icon-button" data-action="theme" aria-label="切换主题">${state.theme === "dark" ? "☾" : "☀"}</button>`,
      )}

      <section class="hero-grid">
        <article class="card today-hero">
          <div class="hero-copy">
            <span class="status-pill purple">今日计划 · 预计 15 分钟</span>
            <h2>从「酒店入住」继续</h2>
            <p>先完成 8 句新内容，再复习 5 个昨天容易出错的表达。</p>
            <div class="hero-progress">
              <div class="hero-progress-label"><span>已完成 12 / 20 句</span><strong>60%</strong></div>
              <div class="progress-track"><i style="width:60%"></i></div>
            </div>
            <div class="button-row">
              ${button(`${icon("play")} 继续今日计划`, "start-learning", "primary")}
              ${button("调整计划", "edit-plan", "ghost")}
            </div>
          </div>
        </article>
        <article class="card goal-ring-wrap">
          <div>
            <div class="goal-ring"><div><strong>9</strong><small>/ 15 分钟</small></div></div>
            <p class="goal-foot">还需约 6 分钟完成目标</p>
          </div>
        </article>
      </section>

      <section class="section">
        <div class="section-head">
          <div><p class="eyebrow">TODAY'S QUEUE</p><h2>今日计划</h2></div>
          <button class="button small ghost" data-action="plan-details">查看详情 →</button>
        </div>
        <div class="task-list">
          ${taskRow("mint", "check", "热身复习", "5 个到期表达", "已完成 · 4 分钟", "已完成", "mint", "view-report", "查看")}
          ${taskRow("", "book", "旅行英语 · 酒店入住", "第 3 课 · 8 / 16 句", "预计还需 6 分钟", "进行中", "purple", "start-learning", "继续")}
          ${taskRow("amber", "wrong", "今日错题巩固", "5 个高频错误", "预计 5 分钟", "待开始", "amber", "start-review", "开始")}
        </div>
      </section>

      <section class="section">
        <div class="section-head"><div><p class="eyebrow">THIS WEEK</p><h2>学习节奏</h2></div><button class="button small ghost" data-page="insights">查看数据 →</button></div>
        <div class="metric-grid">
          ${metric("本周学习", "67 分钟", "比上周 +12%", "trend-up", "◷")}
          ${metric("首次正确率", "84%", "提高 6%", "trend-up", "✓")}
          ${metric("连续学习", "12 天", "历史最佳 19 天", "", "⌁")}
          ${metric("待复习", "8 句", "今天到期", "", "↻")}
        </div>
      </section>
    </div>`;
}

function taskRow(tone, ico, title, desc, meta, status, statusTone, action, actionText) {
  return `
    <article class="card task-row">
      <span class="task-icon ${tone}">${icon(ico)}</span>
      <div><h3>${title}</h3><div class="task-meta"><span>${desc}</span><span>·</span><span>${meta}</span></div></div>
      <span class="status-pill ${statusTone}">${status}</span>
      <button class="button small ${statusTone === "purple" ? "primary" : "ghost"}" data-action="${action}">${actionText}</button>
    </article>`;
}

function metric(label, value, trend, trendClass, ico) {
  return `<article class="card metric-card">
    <div class="metric-label"><span>${label}</span><span>${ico}</span></div>
    <div class="metric-value">${value}</div>
    <small class="${trendClass || "subtle"}">${trend}</small>
  </article>`;
}

function coursesPage() {
  return `
    <div class="page">
      ${header(
        "COURSE LIBRARY",
        "找到适合你的下一门课",
        "根据你的 A2 水平和近期薄弱点，为你整理了更合适的内容。",
        button(`${icon("plus")} 创建课程包`, "new-course", "primary"),
      )}
      <div class="section-head">
        <div class="tabs">
          <button class="tab is-active">为你推荐</button>
          <button class="tab">全部课程</button>
          <button class="tab">我的课程</button>
          <button class="tab">已收藏</button>
        </div>
      </div>
      <div class="filter-row">
        <label class="search">⌕<input id="course-search" placeholder="搜索课程、主题或创建者" /></label>
        <select class="select" aria-label="等级"><option>全部等级</option><option>A1</option><option>A2</option><option>B1</option></select>
        <select class="select" aria-label="主题"><option>全部主题</option><option>日常</option><option>旅行</option><option>职场</option></select>
        <select class="select" aria-label="排序"><option>推荐排序</option><option>最受欢迎</option><option>最新发布</option></select>
      </div>
      <section class="section">
        <div class="section-head"><div><p class="eyebrow">FOR YOU</p><h2>为你推荐</h2></div><span class="subtle">共 18 门课程</span></div>
        <div class="course-grid" id="course-grid">${courses.map(courseCard).join("")}</div>
      </section>
      <section class="section">
        <article class="card empty-state">
          <div><span class="empty-icon">✦</span><h2>想学更具体的主题？</h2><p class="muted">告诉我们你的学习目标，我们会持续优化推荐。</p>${button("设置学习偏好", "preferences", "ghost")}</div>
        </article>
      </section>
    </div>`;
}

function courseCard(course) {
  const favored = state.favorites.has(course.id);
  return `
    <article class="card course-card" data-course-title="${course.title}">
      <div class="course-cover ${course.cover}">
        <span class="course-level">${course.level}</span>
        <button class="favorite ${favored ? "is-on" : ""}" data-action="favorite" data-id="${course.id}" aria-label="${favored ? "取消收藏" : "收藏"}">${favored ? "★" : "☆"}</button>
        ${course.id === "daily" ? '<span class="status-pill mint">适合你的 A2 水平</span>' : ""}
      </div>
      <div class="course-body">
        <h3>${course.title}</h3>
        <p>${course.description}</p>
        <div class="course-stats">${course.stats.map((s) => `<span>${s}</span>`).join("")}</div>
        ${course.progress ? `<div class="progress-track"><i style="width:${course.progress}%"></i></div>` : ""}
        <div class="card-actions">
          <button class="button small ghost" data-action="course-detail" data-id="${course.id}">查看课程</button>
          <button class="button small ${course.progress ? "primary" : "mint"}" data-action="${course.progress ? "start-learning" : "add-course"}">${course.progress ? "继续学习" : "开始学习"}</button>
        </div>
      </div>
    </article>`;
}

function courseDetailPage() {
  return `
    <div class="page">
      <button class="button small ghost" data-page="courses">← 返回课程中心</button>
      <article class="card course-detail-hero section">
        <div class="course-detail-copy">
          <div class="chips"><span class="status-pill purple">A2 初级</span><span class="status-pill">官方课程</span><span class="status-pill mint">已加入</span></div>
          <h1>日常英语 · 从开口到自如</h1>
          <p class="muted">从问候、自我介绍到日常安排，用 12 个真实场景建立稳定的英语表达能力。</p>
          <div class="course-stats"><span>12 课</span><span>286 句</span><span>约 3.5 小时</span><span>8,429 人学习</span></div>
          <div class="button-row">
            ${button(`${icon("play")} 继续第 3 课`, "start-learning", "primary")}
            ${button("加入今日计划", "add-to-plan", "mint")}
            ${button("☆ 收藏", "favorite-detail", "ghost")}
            ${button("分享", "share", "ghost")}
          </div>
        </div>
      </article>
      <section class="section">
        <div class="section-head"><div><p class="eyebrow">CURRICULUM</p><h2>课程大纲</h2></div><span class="muted">已完成 2 / 12 课</span></div>
        <div class="lesson-list">
          ${lesson(1, "第一次见面", "问候、名字与基础寒暄", "已完成", "mint", "复习")}
          ${lesson(2, "聊聊日常", "时间、工作与每日安排", "已完成", "mint", "复习")}
          ${lesson(3, "周末计划", "邀请、建议与回应", "进行中", "purple", "继续")}
          ${lesson(4, "在咖啡店", "点单、偏好与结账", "未开始", "", "开始")}
          ${lesson(5, "问路与交通", "位置、方向与公共交通", "未开始", "", "开始")}
        </div>
      </section>
    </div>`;
}

function lesson(n, title, desc, status, tone, actionText) {
  return `<article class="card lesson-row">
    <span class="lesson-number">${n}</span>
    <div><h3>${title}</h3><small class="subtle">${desc} · 约 12 分钟</small></div>
    <span class="status-pill ${tone}">${status}</span>
    <button class="button small ${tone === "purple" ? "primary" : "ghost"}" data-action="start-learning">${actionText}</button>
  </article>`;
}

function reviewPage() {
  const selected = state.reviewSelected.size;
  return `
    <div class="page">
      ${header(
        "SMART REVIEW",
        "今天有 8 个表达需要复习",
        "这些内容正处在容易遗忘的时间点，现在复习效果最好。",
        `${button(`${icon("play")} 快速复习 5 题`, "start-review", "primary")}${button("自选复习", "toggle-review-select", "ghost")}`,
      )}
      <div class="metric-grid">
        ${metric("今日到期", "8", "建议今天完成", "", "↻")}
        ${metric("错题", "13", "近 30 天累计", "", "!")}
        ${metric("即将到期", "21", "未来 3 天", "", "◷")}
        ${metric("已掌握", "486", "本月新增 34", "trend-up", "✓")}
      </div>
      <div class="review-layout section">
        <section class="card card-pad">
          <div class="section-head">
            <div class="tabs"><button class="tab is-active">今日到期</button><button class="tab">错题</button><button class="tab">全部</button></div>
            <span class="subtle">已选 ${selected} 项</span>
          </div>
          <div id="review-list">${reviewItems.map(reviewRow).join("")}</div>
          <div class="button-row" style="margin-top:18px">
            ${button(`开始已选（${selected}）`, "start-selected-review", selected ? "primary" : "", selected ? "" : "disabled")}
            ${button("稍后复习", "snooze-review", "ghost")}
          </div>
        </section>
        <aside>
          <article class="card side-card">
            <p class="eyebrow">REVIEW HEALTH</p><h2>复习健康度</h2>
            <div class="goal-ring" style="width:118px;height:118px;margin:20px auto;background:conic-gradient(var(--mint) 0 82%,var(--surface-3) 82%)"><div><strong style="font-size:25px">82</strong><small>状态良好</small></div></div>
            <p class="muted" style="font-size:12px;text-align:center">按时完成今天的 8 题，健康度可提升到 91。</p>
          </article>
          <article class="card side-card">
            <h3>复习原则</h3><p class="subtle" style="font-size:12px">系统会根据答题次数、提示使用和遗忘情况安排下次复习。</p>
            <button class="button small ghost" data-action="review-rules">查看计算方式 →</button>
          </article>
        </aside>
      </div>
    </div>`;
}

function reviewRow(item) {
  return `<div class="review-item">
    <input type="checkbox" data-review-id="${item.id}" ${state.reviewSelected.has(item.id) ? "checked" : ""} aria-label="选择 ${item.en}" />
    <div class="review-word"><strong>${item.en}</strong><small>${item.zh} · ${item.source}</small></div>
    <div class="mastery" aria-label="熟练度 ${item.mastery}">${[1, 2, 3, 4, 5].map((n) => `<i class="${n <= item.mastery ? "on" : ""}"></i>`).join("")}</div>
    <button class="button small ghost" data-action="play-sound">${icon("sound")} 播放</button>
  </div>`;
}

function insightsPage() {
  return `
    <div class="page">
      ${header(
        "LEARNING INSIGHTS",
        "你的学习正在变得更稳定",
        "过去 30 天，你完成了 462 句练习，首次正确率提升了 6%。",
        `<select class="select" aria-label="时间范围"><option>近 30 天</option><option>近 7 天</option><option>近 90 天</option><option>今年</option></select>${button("导出 CSV", "export", "ghost")}`,
      )}
      <div class="metric-grid">
        ${metric("学习时长", "5.8 小时", "较上期 +18%", "trend-up", "◷")}
        ${metric("完成句数", "462", "较上期 +54", "trend-up", "▤")}
        ${metric("首次正确率", "84%", "较上期 +6%", "trend-up", "✓")}
        ${metric("复习按时率", "78%", "仍有提升空间", "", "↻")}
      </div>
      <div class="insight-layout section">
        <article class="card chart-card">
          <div class="section-head"><div><p class="eyebrow">ACTIVITY</p><h2>近 7 天学习时长</h2></div><span class="status-pill mint">本周 67 分钟</span></div>
          <div class="bar-chart">
            ${[48, 72, 36, 90, 60, 82, 68].map((h, i) => `<div class="bar ${i === 6 ? "today" : ""}" style="height:${h}%"><span>${["三", "四", "五", "六", "日", "一", "今"][i]}</span></div>`).join("")}
          </div>
          <div class="chart-foot"><span>每天保持 10–15 分钟，比周末一次长时间学习更稳定。</span><button class="button small ghost" data-action="metric-info">查看计算方式</button></div>
        </article>
        <aside>
          <article class="card side-card">
            <p class="eyebrow">WEAK POINTS</p><h2>近期薄弱点</h2>
            <div class="mini-stat"><span>介词搭配</span><strong class="trend-down">68%</strong></div>
            <div class="mini-stat"><span>一般过去时</span><strong>74%</strong></div>
            <div class="mini-stat"><span>礼貌请求</span><strong class="trend-up">88%</strong></div>
            <button class="button mint" style="width:100%;margin-top:16px" data-action="start-review">开始专项复习</button>
          </article>
        </aside>
      </div>
      <section class="section">
        <div class="section-head"><div><p class="eyebrow">HISTORY</p><h2>最近学习记录</h2></div><button class="button small ghost" data-action="history">查看全部 →</button></div>
        <div class="task-list">
          ${taskRow("mint", "check", "旅行英语 · 酒店入住", "完成 16 句 · 正确率 88%", "今天 21:34 · 8 分钟", "已完成", "mint", "view-report", "报告")}
          ${taskRow("", "review", "到期复习", "完成 5 句 · 正确率 80%", "今天 21:20 · 4 分钟", "已完成", "mint", "view-report", "报告")}
        </div>
      </section>
    </div>`;
}

function creatorPage() {
  return `
    <div class="page">
      ${header(
        "CREATOR STUDIO",
        "创作工作台",
        "创建、校验和发布课程内容，并了解学习者真正遇到的问题。",
        button(`${icon("plus")} 新建课程包`, "new-course", "primary"),
      )}
      <div class="metric-grid">
        ${metric("公开课程", "3", "1 个草稿待发布", "", "▤")}
        ${metric("总学习人数", "1,284", "近 30 天 +126", "trend-up", "⌁")}
        ${metric("完成次数", "3,651", "近 30 天 482", "trend-up", "✓")}
        ${metric("内容问题", "2", "等待处理", "trend-down", "!")}
      </div>
      <section class="section">
        <div class="section-head"><div><p class="eyebrow">YOUR CONTENT</p><h2>我的课程包</h2></div><div class="tabs"><button class="tab is-active">全部</button><button class="tab">已发布</button><button class="tab">草稿</button></div></div>
        <div class="creator-list">
          ${creatorRow("旅", "旅行英语生存指南", "已发布", "168", "842", "2026-07-26")}
          ${creatorRow("商", "商务邮件高频表达", "草稿", "96", "—", "2026-07-28")}
          ${creatorRow("面", "英语面试准备", "私有", "124", "—", "2026-07-21")}
        </div>
      </section>
      <section class="section hero-grid">
        <article class="card card-pad">
          <p class="eyebrow">QUALITY</p><h2>发布检查</h2><p class="muted">“商务邮件高频表达”还有 2 个问题需要处理。</p>
          <div class="mini-stat"><span>第 4 课为空</span><button class="button small ghost" data-action="locate-issue">定位</button></div>
          <div class="mini-stat"><span>3 条英文内容重复</span><button class="button small ghost" data-action="locate-issue">定位</button></div>
        </article>
        <article class="card card-pad">
          <p class="eyebrow">QUICK START</p><h2>从已有内容开始</h2><p class="muted">支持 ZIP、JSON 和 CSV。导入后会先校验，不会直接公开。</p>
          <div class="button-row">${button("导入课程包", "upload-course", "mint")}${button("查看格式", "format-guide", "ghost")}</div>
        </article>
      </section>
    </div>`;
}

function creatorRow(mark, title, status, statements, learners, updated) {
  const tone = status === "已发布" ? "mint" : status === "草稿" ? "amber" : "";
  return `<article class="card creator-row">
    <span class="creator-thumb">${mark}</span>
    <div><h3>${title}</h3><span class="status-pill ${tone}">${status}</span></div>
    <div class="creator-cell"><span>语句</span><strong>${statements}</strong></div>
    <div class="creator-cell"><span>学习人数</span><strong>${learners}</strong></div>
    <div class="creator-cell"><span>最近更新</span><strong>${updated}</strong></div>
    <button class="button small ghost" data-action="edit-course">继续编辑</button>
  </article>`;
}

function settingsPage() {
  return `
    <div class="page">
      ${header("PREFERENCES", "设置", "你的设置会自动保存，并同步到已登录设备。", `<span class="status-pill mint">✓ 已保存</span>${button("恢复默认", "reset-settings", "ghost")}`)}
      <div class="settings-layout">
        <aside class="card card-pad settings-nav">
          <button class="is-active">每日计划</button><button>学习与答题</button><button>发音与声音</button><button>快捷键</button><button>外观</button><button>通知</button><button>数据与隐私</button>
        </aside>
        <section class="card setting-card">
          <p class="eyebrow">DAILY PLAN</p><h2>每日学习计划</h2><p class="muted">系统会根据目标自动安排新内容和到期复习。</p>
          <div class="setting-row">
            <div><strong>每日目标</strong><p>建议保持一个可持续的小目标。</p></div>
            <select class="select"><option>15 分钟</option><option>10 分钟</option><option>20 分钟</option><option>30 分钟</option></select>
          </div>
          <div class="setting-row">
            <div><strong>新内容占比</strong><p>剩余部分用于到期复习和错题。</p></div>
            <select class="select"><option>60%</option><option>40%</option><option>50%</option><option>70%</option></select>
          </div>
          ${settingToggle("正确后自动下一题", "减少重复操作，反馈显示 1.2 秒后进入下一题。", "autoNext")}
          ${settingToggle("输错三次显示答案", "显示答案后自动加入高优先复习。", "showAnswer")}
          ${settingToggle("键盘打字音效", "仅在学习输入框中播放。", "typingSound")}
          ${settingToggle("减少动画", "关闭庆祝彩屑和较大位移动画。", "reduceMotion")}
          <div class="setting-row">
            <div><strong>主题</strong><p>原型中的主题切换会即时生效。</p></div>
            <div class="segmented"><button class="button small ${state.theme === "light" ? "primary" : "ghost"}" data-action="light-theme">浅色</button><button class="button small ${state.theme === "dark" ? "primary" : "ghost"}" data-action="dark-theme">深色</button></div>
          </div>
        </section>
      </div>
    </div>`;
}

function settingToggle(title, desc, key) {
  return `<div class="setting-row"><div><strong>${title}</strong><p>${desc}</p></div><button class="switch ${state.settings[key] ? "is-on" : ""}" data-setting="${key}" role="switch" aria-checked="${state.settings[key]}" aria-label="${title}"></button></div>`;
}

function learnPage() {
  const expectedWords = ["I'd", "like", "to", "check", "in."];
  const typedWords =
    state.answerState === "correct"
      ? expectedWords
      : state.answerText.trimStart().split(/\s+/).filter(Boolean);
  const activeIndex = Math.min(
    typedWords.length === 0
      ? 0
      : state.answerText.endsWith(" ")
        ? typedWords.length
        : typedWords.length - 1,
    expectedWords.length - 1,
  );
  const wordSlots = expectedWords
    .map((word, index) => {
      const typed = typedWords[index] || "";
      const classes = [
        "word-slot",
        state.answerState === "correct" ? "is-correct" : "",
        state.answerState !== "correct" && index === activeIndex ? "is-active" : "",
      ]
        .filter(Boolean)
        .join(" ");
      const caret =
        state.answerState !== "correct" && index === activeIndex ? '<i class="caret"></i>' : "";
      return `<span class="${classes}" data-word-index="${index}" style="--chars:${Math.max(word.length, 2)}"><span class="slot-value">${typed}</span>${caret}</span>`;
    })
    .join("");

  return `
    <div class="page learn-page">
      <div class="learn-topbar">
        <div class="learn-brand-exit">
          <span class="learn-brand-mini">E</span>
          <button class="button ghost" data-action="exit-learning">← <span>退出学习</span></button>
        </div>
        <div class="learn-progress"><strong>酒店入住 · 9 / 16</strong><div class="progress-track"><i style="width:56%"></i></div></div>
        <div class="learn-tools">
          <span class="learn-timer">${icon("clock")} 06:18</span>
          <button class="button ghost" data-action="pause">${icon("pause")} <span>暂停</span></button>
          <button class="button ghost" data-action="learn-settings">⚙ <span>设置</span></button>
        </div>
      </div>
      <article class="card question-card">
        <div class="question-label">中译英 · 第 9 题</div>
        <div class="question-text"><h1>我想办理入住。</h1><p class="muted">请直接使用键盘输入英文</p></div>
        <div class="word-answer-area" data-action="focus-answer">
          ${wordSlots}
          <input id="answer-input" class="word-capture" autocomplete="off" value="${state.answerState === "correct" ? "I'd like to check in." : state.answerText}" aria-label="输入英文答案" />
        </div>
        <div class="input-guide">每条下划线代表一个单词 · Enter 提交答案</div>
        <div class="feedback ${state.answerState === "correct" ? "correct" : ""}">${state.answerState === "correct" ? "✓ 回答正确！这是办理入住最自然的表达。" : "按 Enter 提交答案"}</div>
      </article>
      <div class="learn-actions">
        <div>
          ${button("← 上一题", "prev-question", "ghost")}
          ${button(`${icon("hint")} 提示`, "hint", "ghost")}
          ${button(`${icon("sound")} 发音`, "play-sound", "ghost")}
        </div>
        <div>
          ${button("不认识", "dont-know", "ghost")}
          ${button(state.answerState === "correct" ? "下一题 →" : "提交答案 ↵", state.answerState === "correct" ? "next-question" : "submit-answer", "primary")}
        </div>
      </div>
    </div>`;
}

function completionPage() {
  return `
    <div class="page">
      <article class="card complete-card">
        <span class="complete-mark">✓</span>
        <p class="eyebrow">LESSON COMPLETE</p>
        <h1>第 3 课完成！</h1>
        <p class="muted">你对“酒店入住”相关表达已经很熟悉了。3 个错题已安排到明天复习。</p>
        <div class="complete-metrics">
          <div><strong>88%</strong><span>首次正确率</span></div>
          <div><strong>8:24</strong><span>学习用时</span></div>
          <div><strong>3</strong><span>待复习</span></div>
          <div><strong>+16</strong><span>今日完成</span></div>
        </div>
        <div class="button-row" style="justify-content:center">
          ${button("继续下一课 →", "next-course", "primary")}
          ${button("复习 3 个错题", "start-review", "mint")}
          ${button("生成打卡图", "share-card", "ghost")}
          ${button("返回课程", "course-detail", "ghost")}
        </div>
      </article>
    </div>`;
}

function render() {
  const pages = {
    today: todayPage,
    courses: coursesPage,
    "course-detail": courseDetailPage,
    review: reviewPage,
    insights: insightsPage,
    creator: creatorPage,
    settings: settingsPage,
    learn: learnPage,
    completion: completionPage,
    auth: authPage,
    upload: uploadPage,
  };
  document.body.classList.toggle("focus-mode", state.page === "learn");
  document.body.classList.toggle("auth-mode", state.page === "auth");
  main.innerHTML = (pages[state.page] || todayPage)();
  updateNav();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateNav() {
  const mapped =
    state.page === "course-detail"
      ? "courses"
      : state.page === "learn" || state.page === "completion"
        ? ""
        : state.page;
  document.querySelectorAll("[data-page]").forEach((el) => {
    el.classList.toggle("is-active", el.dataset.page === mapped);
  });
}

function navigate(page) {
  state.page = page;
  if (page !== "learn") {
    state.answerState = "idle";
    state.answerText = "";
  }
  render();
  main.focus({ preventScroll: true });
}

function showToast(message, type = "success") {
  const symbol = type === "success" ? "✓" : type === "warning" ? "!" : "i";
  toastRoot.innerHTML = `<div class="toast"><span class="toast-icon">${symbol}</span><div><strong>${message}</strong><div class="subtle">操作已在原型中模拟</div></div></div>`;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => (toastRoot.innerHTML = ""), 2800);
}

function openModal(title, content, confirmText = "保存", onConfirm = null) {
  modalRoot.innerHTML = `
    <div class="modal-backdrop" data-action="close-modal">
      <section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onclick="event.stopPropagation()">
        <div class="modal-head"><div><p class="eyebrow">EARTHWORM</p><h2 id="modal-title">${title}</h2></div><button class="modal-close" data-action="close-modal" aria-label="关闭">×</button></div>
        ${content}
        <div class="modal-actions"><button class="button ghost" data-action="close-modal">取消</button><button class="button primary" data-action="modal-confirm">${confirmText}</button></div>
      </section>
    </div>`;
  const confirm = modalRoot.querySelector('[data-action="modal-confirm"]');
  confirm?.addEventListener("click", () => {
    onConfirm?.();
    closeModal();
  });
  modalRoot.querySelector(".modal-close")?.focus();
}

function closeModal() {
  modalRoot.innerHTML = "";
}

function planModal() {
  openModal(
    "调整每日计划",
    `<div class="field"><label>每日学习目标</label><select class="select" style="width:100%"><option>15 分钟</option><option>10 分钟</option><option>20 分钟</option><option>30 分钟</option></select></div>
     <div class="field" style="margin-top:14px"><label>新内容占比</label><select class="select" style="width:100%"><option>60% 新内容 · 40% 复习</option><option>50% 新内容 · 50% 复习</option></select></div>
     <div class="field" style="margin-top:14px"><label>学习日</label><div class="chips">${["一", "二", "三", "四", "五", "六", "日"].map((d) => `<button class="chip">${d}</button>`).join("")}</div></div>
     <p class="subtle" style="margin-top:16px">重新生成不会改变今天已经完成的任务。</p>`,
    "保存并重新生成",
    () => showToast("今日计划已更新"),
  );
}

function pauseModal() {
  openModal(
    "本次学习已暂停",
    `<div class="goal-ring" style="margin:12px auto 20px;width:118px;height:118px;background:conic-gradient(var(--purple) 0 56%,var(--surface-3) 56%)"><div><strong style="font-size:25px">9 / 16</strong><small>已学习 6:18</small></div></div><p class="muted" style="text-align:center">休息一下。继续学习时会从当前题恢复计时。</p>`,
    "继续学习",
    () => showToast("已继续计时"),
  );
}

function newCourseModal() {
  openModal(
    "新建课程包",
    `<div class="task-list">
      <button class="card task-row" data-action="new-blank" style="text-align:left"><span class="task-icon">+</span><div><h3>空白课程包</h3><small class="subtle">从课程和语句结构开始创建</small></div><span></span><span>→</span></button>
      <button class="card task-row" data-action="upload-course" style="text-align:left"><span class="task-icon mint">⇧</span><div><h3>导入已有文件</h3><small class="subtle">支持 ZIP、JSON 和 CSV</small></div><span></span><span>→</span></button>
      <button class="card task-row" data-action="template-course" style="text-align:left"><span class="task-icon amber">▤</span><div><h3>使用模板</h3><small class="subtle">选择场景课或词汇课结构</small></div><span></span><span>→</span></button>
    </div>`,
    "继续",
    () => showToast("已创建私有草稿"),
  );
}

document.addEventListener("click", (event) => {
  const pageTarget = event.target.closest("[data-page]");
  if (pageTarget) {
    navigate(pageTarget.dataset.page);
    return;
  }

  const target = event.target.closest("[data-action]");
  if (!target) return;
  const action = target.dataset.action;

  const actionMap = {
    "start-learning": () => navigate("learn"),
    "start-review": () => navigate("learn"),
    "start-selected-review": () =>
      state.reviewSelected.size ? navigate("learn") : showToast("请至少选择一项", "warning"),
    "course-detail": () => navigate("course-detail"),
    "view-report": () => navigate("completion"),
    "next-question": () => navigate("completion"),
    "next-course": () => navigate("learn"),
    "edit-plan": planModal,
    "plan-details": planModal,
    "new-course": newCourseModal,
    "upload-course": () => {
      closeModal();
      state.uploadStep = 1;
      navigate("upload");
    },
    "show-register": () => {
      state.authMode = "register";
      state.showPassword = false;
      render();
    },
    "show-login": () => {
      state.authMode = "login";
      state.showPassword = false;
      render();
    },
    "toggle-password": () => {
      state.showPassword = !state.showPassword;
      render();
      document.querySelector("#auth-password")?.focus();
    },
    "forgot-password": () =>
      openModal(
        "重置密码",
        "<p class='muted'>当前版本由管理员重置密码。请联系管理员并提供你的用户名；新版本将支持邮件自助重置。</p>",
        "知道了",
      ),
    "simulate-file": () => {
      state.uploadStep = 2;
      render();
      showToast("课程包解析完成：0 个错误，2 个警告");
    },
    "download-sample": () => showToast("示例课程包下载任务已创建"),
    "cancel-upload": () => {
      state.uploadStep = 1;
      navigate("creator");
    },
    "reset-upload": () => {
      state.uploadStep = 1;
      render();
    },
    "upload-prev": () => {
      state.uploadStep = Math.max(1, state.uploadStep - 1);
      render();
    },
    "upload-next": () => {
      state.uploadStep = Math.min(3, state.uploadStep + 1);
      render();
    },
    "select-visibility": () => {
      state.uploadVisibility = target.dataset.value;
      render();
    },
    "publish-upload": () => {
      if (
        state.uploadVisibility === "public" &&
        !document.querySelector("#publish-confirm")?.checked
      ) {
        showToast("公开发布前请先确认内容版权", "warning");
        return;
      }
      state.uploadStep = 4;
      render();
      showToast("课程包创建成功");
    },
    "save-upload-draft": () => {
      state.uploadVisibility = "private";
      state.uploadStep = 4;
      render();
      showToast("已保存为私有草稿");
    },
    "restart-upload": () => {
      state.uploadStep = 1;
      state.uploadVisibility = "private";
      render();
    },
    "revalidate-upload": () => showToast("重新校验完成，仍有 2 个非阻塞警告"),
    "locate-upload-field": () => showToast("已定位到对应数据行"),
    "preview-upload-data": () =>
      openModal(
        "数据预览",
        "<div class='mini-stat'><span>01</span><strong>I'd like to check in.</strong></div><div class='mini-stat'><span>02</span><strong>Could you say that again?</strong></div><div class='mini-stat'><span>03</span><strong>Where is the boarding gate?</strong></div>",
        "关闭",
      ),
    "change-cover": () => showToast("已打开封面选择器"),
    "close-modal": closeModal,
    theme: () => setTheme(state.theme === "dark" ? "light" : "dark"),
    "light-theme": () => setTheme("light"),
    "dark-theme": () => setTheme("dark"),
    favorite: () => {
      const id = target.dataset.id;
      state.favorites.has(id) ? state.favorites.delete(id) : state.favorites.add(id);
      render();
      showToast(state.favorites.has(id) ? "已收藏课程" : "已取消收藏");
    },
    "favorite-detail": () => showToast("已收藏课程"),
    "add-course": () => {
      showToast("课程已加入“我的课程”");
      setTimeout(() => navigate("course-detail"), 450);
    },
    "add-to-plan": () => showToast("已加入明日计划"),
    share: () => showToast("课程链接已复制"),
    "share-card": () => showToast("打卡图已生成"),
    "play-sound": () => showToast("正在播放美式发音"),
    "focus-answer": () => document.querySelector("#answer-input")?.focus(),
    hint: () => {
      const feedback = document.querySelector(".feedback");
      if (feedback) feedback.textContent = "提示：5 个单词，首字母 I · l · t · c · i";
    },
    "dont-know": () => {
      state.answerState = "correct";
      state.answerText = "I'd like to check in.";
      render();
      const feedback = document.querySelector(".feedback");
      if (feedback) feedback.textContent = "答案：I'd like to check in. 已加入高优先复习。";
    },
    "submit-answer": submitAnswer,
    pause: pauseModal,
    "learn-settings": () =>
      openModal(
        "本次学习设置",
        "<div class='setting-row'><div><strong>自动播放发音</strong><p>进入下一题后自动朗读英文。</p></div><button class='switch is-on' role='switch' aria-checked='true'></button></div><div class='setting-row'><div><strong>正确后自动下一题</strong><p>反馈显示 1.2 秒后自动继续。</p></div><button class='switch' role='switch' aria-checked='false'></button></div>",
        "完成",
      ),
    "exit-learning": () =>
      openModal(
        "结束本次学习？",
        "<p class='muted'>当前进度已保存在本机。登录状态下会在联网后自动同步。</p>",
        "保存并返回",
        () => navigate("today"),
      ),
    notifications: () =>
      openModal(
        "通知",
        "<div class='task-list'><div class='card card-pad'><strong>8 个表达今天到期</strong><p class='subtle'>现在复习约需 5 分钟。</p></div><div class='card card-pad'><strong>连续学习即将达到 13 天</strong><p class='subtle'>完成今日计划即可保持记录。</p></div></div>",
        "全部已读",
        () => showToast("通知已全部标记为已读"),
      ),
    profile: () =>
      openModal(
        "林小满",
        "<div class='mini-stat'><span>账号</span><strong>linxiaoman</strong></div><div class='mini-stat'><span>等级</span><strong>A2</strong></div><div class='mini-stat'><span>连续学习</span><strong>12 天</strong></div>",
        "关闭",
      ),
    preferences: () => navigate("settings"),
    "reset-settings": () =>
      openModal(
        "恢复默认设置？",
        "<p class='muted'>学习模式、答题、声音、快捷键和外观会全部恢复默认。此操作会同步到其他设备。</p>",
        "恢复默认",
        () => {
          state.settings = {
            autoNext: false,
            showAnswer: true,
            typingSound: false,
            reduceMotion: false,
          };
          render();
          showToast("设置已恢复默认");
        },
      ),
    export: () => showToast("CSV 导出任务已创建"),
    "snooze-review": () => showToast("所选内容已延后 1 天"),
    "review-rules": () =>
      openModal(
        "复习计算方式",
        "<p class='muted'>首次正确、提示使用、看答案和遗忘次数会共同影响下次复习时间。熟练度越高，间隔越长。</p><div class='mini-stat'><span>首次正确</span><strong>间隔延长</strong></div><div class='mini-stat'><span>使用提示</span><strong>小幅延长</strong></div><div class='mini-stat'><span>看答案</span><strong>明日复习</strong></div>",
        "知道了",
      ),
    "metric-info": () =>
      openModal(
        "指标计算方式",
        "<p class='muted'>首次正确率 = 未使用答案且第一次提交正确的题数 ÷ 本期有效题数。跳过题计入未正确。</p>",
        "知道了",
      ),
    "locate-issue": () => showToast("已定位到编辑器中的问题字段"),
    "edit-course": () => showToast("已打开课程编辑草稿"),
    "format-guide": () =>
      openModal(
        "课程包格式",
        "<p class='muted'>支持 ZIP、JSON、CSV。ZIP 最大 50MB、最多 50 课、每课最多 1000 句。导入后默认保存为私有草稿。</p>",
        "知道了",
      ),
    history: () => showToast("完整学习历史将在当前页展开"),
    "prev-question": () => showToast("已回到上一题"),
  };

  actionMap[action]?.();
});

document.addEventListener("submit", (event) => {
  if (event.target.dataset.form !== "auth") return;
  event.preventDefault();

  const form = event.target;
  const username = form.elements.username.value.trim();
  const password = form.elements.password.value;
  const confirm = form.elements.confirm?.value || "";
  const messages = {
    username: username.length < 2 || username.length > 12 ? "请输入 2–12 位用户名" : "",
    password:
      state.authMode === "register"
        ? /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password)
          ? ""
          : "至少 8 位，并同时包含字母和数字"
        : password
          ? ""
          : "请输入密码",
    confirm: state.authMode === "register" && confirm !== password ? "两次输入的密码不一致" : "",
  };

  Object.entries(messages).forEach(([name, message]) => {
    const messageNode = form.querySelector(`[data-field-message="${name}"]`);
    if (messageNode) messageNode.textContent = message;
    form.elements[name]?.closest(".field")?.classList.toggle("has-error", Boolean(message));
  });

  if (state.authMode === "register" && !form.querySelector("#auth-agreement")?.checked) {
    showToast("请先阅读并同意服务条款与隐私政策", "warning");
    return;
  }
  if (Object.values(messages).some(Boolean)) return;

  showToast(
    state.authMode === "login" ? "登录成功，正在恢复学习进度" : "注册成功，已为你创建学习计划",
  );
  setTimeout(() => navigate("today"), 650);
});

document.addEventListener("change", (event) => {
  const reviewId = event.target.dataset.reviewId;
  if (reviewId) {
    event.target.checked
      ? state.reviewSelected.add(reviewId)
      : state.reviewSelected.delete(reviewId);
    render();
  }
});

document.addEventListener("click", (event) => {
  const setting = event.target.closest("[data-setting]");
  if (setting) {
    const key = setting.dataset.setting;
    state.settings[key] = !state.settings[key];
    render();
    showToast("设置已保存");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modalRoot.innerHTML) closeModal();
  if (event.key === "Enter" && state.page === "learn" && !modalRoot.innerHTML) {
    event.preventDefault();
    state.answerState === "correct" ? navigate("completion") : submitAnswer();
  }
});

function submitAnswer() {
  const input = document.querySelector("#answer-input");
  if (!input) return;
  if (!input.value.trim()) {
    const feedback = document.querySelector(".feedback");
    if (feedback) {
      feedback.textContent = "请先输入答案";
      feedback.style.color = "var(--red)";
    }
    input.focus();
    return;
  }
  state.answerState = "correct";
  state.answerText = "I'd like to check in.";
  render();
}

function updateWordSlots(value) {
  const expectedWords = ["I'd", "like", "to", "check", "in."];
  const typedWords = value.trimStart().split(/\s+/).filter(Boolean);
  const activeIndex = Math.min(
    typedWords.length === 0 ? 0 : value.endsWith(" ") ? typedWords.length : typedWords.length - 1,
    expectedWords.length - 1,
  );
  document.querySelectorAll(".word-slot").forEach((slot, index) => {
    const valueNode = slot.querySelector(".slot-value");
    if (valueNode) valueNode.textContent = typedWords[index] || "";
    slot.classList.toggle("is-active", index === activeIndex);
    slot.querySelector(".caret")?.remove();
    if (index === activeIndex) {
      slot.insertAdjacentHTML("beforeend", '<i class="caret"></i>');
    }
  });
}

function setTheme(theme) {
  state.theme = theme;
  document.documentElement.dataset.theme = theme;
  render();
  showToast(theme === "dark" ? "已切换深色主题" : "已切换浅色主题");
}

function setupSearch() {
  document.addEventListener("input", (event) => {
    if (event.target.id === "course-search") {
      const query = event.target.value.toLowerCase();
      document.querySelectorAll(".course-card").forEach((card) => {
        card.style.display = card.dataset.courseTitle.toLowerCase().includes(query) ? "" : "none";
      });
      return;
    }
    if (event.target.id === "answer-input") {
      state.answerText = event.target.value;
      updateWordSlots(state.answerText);
    }
  });
}

setupSearch();
render();
