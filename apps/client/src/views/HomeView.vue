<template>
  <!-- 场景 A：未登录状态展示 1:1 原型产品落地页 (prototype/landing.html) -->
  <div v-if="!userStore.token" class="landing-page-container">
    <!-- 顶部固定导航栏 (1:1 复刻原型 header.site-header) -->
    <header class="site-header">
      <div class="nav-shell">
        <router-link to="/" class="brand" :aria-label="$t('app.title')">
          <span class="brand-mark">E</span>
          <span>
            <strong>{{ $t('app.title') }}</strong>
            <small>{{ $t('app.subBrand') }}</small>
          </span>
        </router-link>

        <nav class="desktop-nav" aria-label="首页导航">
          <a href="#features">{{ $t('landing.navFeatures') }}</a>
          <a href="#method">{{ $t('landing.navMethod') }}</a>
          <a href="#courses">{{ $t('landing.navCourses') }}</a>
          <a href="#stories">{{ $t('landing.navStories') }}</a>
          <a href="#faq">{{ $t('landing.navFaq') }}</a>
        </nav>

        <div class="nav-actions">
          <!-- 多语言切换 -->
          <div class="language-selector-group">
            <button
              type="button"
              class="language-selector-btn"
              :class="{ 'is-active': currentLocale === 'zh-CN' }"
              @click="switchLanguage('zh-CN')"
            >
              中文
            </button>
            <button
              type="button"
              class="language-selector-btn"
              :class="{ 'is-active': currentLocale === 'en-US' }"
              @click="switchLanguage('en-US')"
            >
              English
            </button>
          </div>

          <!-- 主题切换按钮 -->
          <button type="button" class="theme-button" @click="toggleTheme" aria-label="切换明暗主题">
            {{ isDarkTheme ? "☾" : "☀" }}
          </button>

          <button type="button" class="button ghost desktop-login" @click="goToLogin">
            {{ $t('landing.login') }}
          </button>
          <button type="button" class="button primary" @click="goToRegister">
            {{ $t('landing.freeStart') }}
          </button>
        </div>
      </div>
    </header>

    <main id="top" style="min-height: auto; margin-left: 0; padding: 0;">
      <!-- Hero 核心视觉区 (1:1 复刻原型 section.hero) -->
      <section class="section-shell hero">
        <div class="hero-copy">
          <div class="announcement">
            <span>{{ $t('landing.announcementNew') }}</span>
            {{ $t('landing.announcementText') }}
            <b>{{ $t('landing.announcementLink') }}</b>
          </div>
          <p class="eyebrow">{{ $t('landing.heroEyebrow') }}</p>
          <h1>
            {{ $t('landing.heroTitleLine1') }}<br />
            {{ $t('landing.heroTitleLine2') }}
            <span>{{ $t('landing.heroTitleSpan') }}</span>
          </h1>
          <p class="hero-lead">{{ $t('landing.heroLead') }}</p>

          <div class="hero-actions">
            <button type="button" class="button primary large" @click="goToRegister">
              {{ $t('landing.heroCtaPrimary') }}
            </button>
            <button type="button" class="button ghost large" @click="goToLogin">
              {{ $t('landing.heroCtaDemo') }}
            </button>
          </div>

          <div class="trust-row">
            <div class="avatars">
              <span>林</span>
              <span>周</span>
              <span>陈</span>
              <span>+2k</span>
            </div>
            <div>
              <strong>{{ $t('landing.trustLearners') }}</strong>
              <span>{{ $t('landing.trustDesc') }}</span>
            </div>
          </div>
        </div>

        <!-- 右侧交互式学习窗口预览 (1:1 复刻原型 .learning-window) -->
        <div class="hero-visual" aria-label="产品学习界面预览">
          <div class="visual-glow"></div>
          <article class="learning-window">
            <header>
              <div class="window-brand">
                <span>E</span>
                <strong>{{ $t('landing.windowTitle') }}</strong>
              </div>
              <div class="window-progress">
                <span>{{ $t('landing.windowProgress') }}</span>
                <i><b style="width: 60%;"></b></i>
              </div>
              <button type="button" aria-label="暂停">Ⅱ</button>
            </header>
            <div class="lesson-meta">
              <span>{{ $t('landing.windowLesson') }}</span>
              <b>{{ $t('landing.windowIndex') }}</b>
            </div>
            <div class="question-preview">
              <small>{{ $t('landing.windowQuestionPrompt') }}</small>
              <h2>{{ $t('landing.windowQuestionTitle') }}</h2>
              <div class="answer-slots" aria-label="分词输入示例">
                <span class="filled">I'd</span>
                <span class="filled">like</span>
                <span class="active">to</span>
                <span>check</span>
                <span>in.</span>
              </div>
              <p><span>⌁</span> {{ $t('landing.windowHint') }}</p>
            </div>
            <footer>
              <button type="button">{{ $t('landing.btnDontKnow') }}</button>
              <button type="button">{{ $t('landing.btnHint') }}</button>
              <button type="button" class="submit" @click="goToRegister">{{ $t('landing.btnSubmitAnswer') }}</button>
            </footer>
          </article>

          <!-- 悬浮数据卡片 1 -->
          <aside class="streak-card floating-card">
            <span>✦</span>
            <div>
              <strong>{{ $t('landing.floatingStreakTitle') }}</strong>
              <small>{{ $t('landing.floatingStreakSub') }}</small>
            </div>
          </aside>

          <!-- 悬浮数据卡片 2 -->
          <aside class="accuracy-card floating-card">
            <div class="mini-ring"><span>84%</span></div>
            <div>
              <strong>{{ $t('landing.floatingAccuracyTitle') }}</strong>
              <small>{{ $t('landing.floatingAccuracySub') }}</small>
            </div>
          </aside>
        </div>
      </section>

      <!-- 4 维量化数据条 (1:1 复刻原型 section.proof-strip) -->
      <section class="proof-strip" aria-label="产品数据">
        <div class="section-shell proof-grid">
          <div>
            <strong>{{ $t('landing.stat1Number') }}<small>{{ $t('landing.stat1Unit') }}</small></strong>
            <span>{{ $t('landing.stat1Label') }}</span>
          </div>
          <div>
            <strong>{{ $t('landing.stat2Number') }}<small>{{ $t('landing.stat2Unit') }}</small></strong>
            <span>{{ $t('landing.stat2Label') }}</span>
          </div>
          <div>
            <strong>{{ $t('landing.stat3Number') }}<small>{{ $t('landing.stat3Unit') }}</small></strong>
            <span>{{ $t('landing.stat3Label') }}</span>
          </div>
          <div>
            <strong>{{ $t('landing.stat4Number') }}<small>{{ $t('landing.stat4Unit') }}</small></strong>
            <span>{{ $t('landing.stat4Label') }}</span>
          </div>
        </div>
      </section>

      <!-- Bento 便当盒特性 (1:1 复刻原型 #features .feature-bento) -->
      <section id="features" class="content-section section-shell">
        <div class="section-heading centered">
          <p class="eyebrow">{{ $t('landing.whyEyebrow') }}</p>
          <h2>{{ $t('landing.whyTitle') }}<br /><span>{{ $t('landing.whyTitleSpan') }}</span></h2>
          <p>{{ $t('landing.whySubtitle') }}</p>
        </div>

        <div class="feature-bento">
          <!-- 特性主卡片：每日计划 -->
          <article class="feature-card feature-main">
            <div class="feature-copy">
              <span class="feature-icon purple">⌁</span>
              <p class="eyebrow">{{ $t('landing.bento1Eyebrow') }}</p>
              <h3>{{ $t('landing.bento1Title') }}</h3>
              <p>{{ $t('landing.bento1Desc') }}</p>
              <ul>
                <li>{{ $t('landing.bento1Li1') }}</li>
                <li>{{ $t('landing.bento1Li2') }}</li>
                <li>{{ $t('landing.bento1Li3') }}</li>
              </ul>
            </div>
            <div class="plan-preview">
              <div class="plan-head">
                <span>{{ $t('landing.bentoPlanHead') }}</span>
                <strong>{{ $t('landing.bentoPlanRate') }}</strong>
              </div>
              <i class="wide-progress"><b style="width: 60%;"></b></i>
              <div class="plan-row done">
                <span>✓</span>
                <div>
                  <strong>{{ $t('landing.bentoRow1Title') }}</strong>
                  <small>{{ $t('landing.bentoRow1Sub') }}</small>
                </div>
                <em>{{ $t('landing.bentoRow1Status') }}</em>
              </div>
              <div class="plan-row active">
                <span>▤</span>
                <div>
                  <strong>{{ $t('landing.bentoRow2Title') }}</strong>
                  <small>{{ $t('landing.bentoRow2Sub') }}</small>
                </div>
                <em>{{ $t('landing.bentoRow2Status') }}</em>
              </div>
              <div class="plan-row">
                <span>!</span>
                <div>
                  <strong>{{ $t('landing.bentoRow3Title') }}</strong>
                  <small>{{ $t('landing.bentoRow3Sub') }}</small>
                </div>
                <em>{{ $t('landing.bentoRow3Status') }}</em>
              </div>
            </div>
          </article>

          <!-- 特性卡片 2：智能复习 -->
          <article class="feature-card">
            <span class="feature-icon mint">↻</span>
            <p class="eyebrow">{{ $t('landing.bento2Eyebrow') }}</p>
            <h3>{{ $t('landing.bento2Title') }}</h3>
            <p>{{ $t('landing.bento2Desc') }}</p>
            <div class="review-bars">
              <i style="height: 34%;"></i>
              <i style="height: 49%;"></i>
              <i style="height: 42%;"></i>
              <i style="height: 72%;"></i>
              <i class="hot" style="height: 88%;"></i>
              <i style="height: 61%;"></i>
              <i style="height: 76%;"></i>
            </div>
          </article>

          <!-- 特性卡片 3：完整表达 -->
          <article class="feature-card">
            <span class="feature-icon amber">◎</span>
            <p class="eyebrow">{{ $t('landing.bento3Eyebrow') }}</p>
            <h3>{{ $t('landing.bento3Title') }}</h3>
            <p>{{ $t('landing.bento3Desc') }}</p>
            <div class="expression-card">
              <span>{{ $t('landing.bento3En') }}</span>
              <small>{{ $t('landing.bento3Zh') }}</small>
              <b>{{ $t('landing.bento3Audio') }}</b>
            </div>
          </article>
        </div>
      </section>

      <!-- 科学学习三步闭环 (1:1 复刻原型 section#method) -->
      <section id="method" class="method-section">
        <div class="section-shell">
          <div class="section-heading">
            <p class="eyebrow">{{ $t('landing.methodEyebrow') }}</p>
            <h2>{{ $t('landing.methodTitle') }}</h2>
            <p>{{ $t('landing.methodSubtitle') }}</p>
          </div>
          <div class="method-grid">
            <article>
              <span class="step-number">{{ $t('landing.step1Num') }}</span>
              <div class="step-visual choose">
                <i>旅行</i><i>职场</i><i>日常</i>
              </div>
              <h3>{{ $t('landing.step1Title') }}</h3>
              <p>{{ $t('landing.step1Desc') }}</p>
            </article>
            <article>
              <span class="step-number">{{ $t('landing.step2Num') }}</span>
              <div class="step-visual type">
                <strong>我想办理入住。</strong>
                <div><i>I'd</i><i>like</i><i class="typing">to</i><i></i></div>
              </div>
              <h3>{{ $t('landing.step2Title') }}</h3>
              <p>{{ $t('landing.step2Desc') }}</p>
            </article>
            <article>
              <span class="step-number">{{ $t('landing.step3Num') }}</span>
              <div class="step-visual improve">
                <div><strong>84%</strong><span>正确率</span></div>
                <i>↗ 6%</i>
              </div>
              <h3>{{ $t('landing.step3Title') }}</h3>
              <p>{{ $t('landing.step3Desc') }}</p>
            </article>
          </div>
        </div>
      </section>

      <!-- 精选课程库 (1:1 复刻原型 section#courses) -->
      <section id="courses" class="content-section section-shell">
        <div class="section-heading heading-row">
          <div>
            <p class="eyebrow">{{ $t('landing.coursesEyebrow') }}</p>
            <h2>{{ $t('landing.coursesTitle') }}</h2>
          </div>
          <div class="course-tabs" role="tablist">
            <button
              type="button"
              :class="{ 'is-active': activeCourseFilter === 'all' }"
              @click="activeCourseFilter = 'all'"
            >
              {{ $t('landing.tabAll') }}
            </button>
            <button
              type="button"
              :class="{ 'is-active': activeCourseFilter === 'daily' }"
              @click="activeCourseFilter = 'daily'"
            >
              {{ $t('landing.tabDaily') }}
            </button>
            <button
              type="button"
              :class="{ 'is-active': activeCourseFilter === 'travel' }"
              @click="activeCourseFilter = 'travel'"
            >
              {{ $t('landing.tabTravel') }}
            </button>
            <button
              type="button"
              :class="{ 'is-active': activeCourseFilter === 'work' }"
              @click="activeCourseFilter = 'work'"
            >
              {{ $t('landing.tabWork') }}
            </button>
          </div>
        </div>

        <div class="course-showcase">
          <!-- 课程 1：日常英语 -->
          <article
            v-if="activeCourseFilter === 'all' || activeCourseFilter === 'daily'"
            class="public-course-card"
          >
            <div class="course-cover daily">
              <span>{{ $t('landing.course1Level') }}</span>
              <div class="cover-scene"><i></i><b>HELLO!</b></div>
              <em>{{ $t('landing.course1Tag') }}</em>
            </div>
            <div class="course-body">
              <div class="course-meta">
                <span>{{ $t('landing.course1Badge') }}</span>
                <b>{{ $t('landing.course1Score') }}</b>
              </div>
              <h3>{{ $t('landing.course1Title') }}</h3>
              <p>{{ $t('landing.course1Desc') }}</p>
              <footer>
                <span>{{ $t('landing.course1Meta') }}</span>
                <button type="button" class="text-button" @click="goToLogin">{{ $t('landing.btnViewCourse') }}</button>
              </footer>
            </div>
          </article>

          <!-- 课程 2：旅行英语 -->
          <article
            v-if="activeCourseFilter === 'all' || activeCourseFilter === 'travel'"
            class="public-course-card"
          >
            <div class="course-cover travel">
              <span>{{ $t('landing.course2Level') }}</span>
              <div class="cover-scene"><i></i><b>BOARDING</b></div>
              <em>{{ $t('landing.course2Tag') }}</em>
            </div>
            <div class="course-body">
              <div class="course-meta">
                <span>{{ $t('landing.course2Badge') }}</span>
                <b>{{ $t('landing.course2Score') }}</b>
              </div>
              <h3>{{ $t('landing.course2Title') }}</h3>
              <p>{{ $t('landing.course2Desc') }}</p>
              <footer>
                <span>{{ $t('landing.course2Meta') }}</span>
                <button type="button" class="text-button" @click="goToLogin">{{ $t('landing.btnViewCourse') }}</button>
              </footer>
            </div>
          </article>

          <!-- 课程 3：职场会议 -->
          <article
            v-if="activeCourseFilter === 'all' || activeCourseFilter === 'work'"
            class="public-course-card"
          >
            <div class="course-cover work">
              <span>{{ $t('landing.course3Level') }}</span>
              <div class="cover-scene"><i></i><b>MEETING</b></div>
              <em>{{ $t('landing.course3Tag') }}</em>
            </div>
            <div class="course-body">
              <div class="course-meta">
                <span>{{ $t('landing.course3Badge') }}</span>
                <b>{{ $t('landing.course3Score') }}</b>
              </div>
              <h3>{{ $t('landing.course3Title') }}</h3>
              <p>{{ $t('landing.course3Desc') }}</p>
              <footer>
                <span>{{ $t('landing.course3Meta') }}</span>
                <button type="button" class="text-button" @click="goToLogin">{{ $t('landing.btnViewCourse') }}</button>
              </footer>
            </div>
          </article>
        </div>

        <div class="center-action">
          <button type="button" class="button ghost large" @click="goToLogin">
            {{ $t('landing.btnBrowseAllCourses') }}
          </button>
        </div>
      </section>

      <!-- 学员真实故事 (1:1 复刻原型 section#stories) -->
      <section id="stories" class="stories-section">
        <div class="section-shell">
          <div class="section-heading centered">
            <p class="eyebrow">{{ $t('landing.storiesEyebrow') }}</p>
            <h2>{{ $t('landing.storiesTitle') }}</h2>
          </div>
          <div class="story-grid">
            <article class="story-card featured">
              <div class="quote">“</div>
              <p>{{ $t('landing.story1Quote') }}</p>
              <footer>
                <span class="person-avatar violet">{{ $t('landing.story1Name')[0] }}</span>
                <div>
                  <strong>{{ $t('landing.story1Name') }}</strong>
                  <small>{{ $t('landing.story1Meta') }}</small>
                </div>
                <b>{{ $t('landing.story1Badge') }}</b>
              </footer>
            </article>

            <article class="story-card">
              <div class="stars">★★★★★</div>
              <p>{{ $t('landing.story2Quote') }}</p>
              <footer>
                <span class="person-avatar green">{{ $t('landing.story2Name')[0] }}</span>
                <div>
                  <strong>{{ $t('landing.story2Name') }}</strong>
                  <small>{{ $t('landing.story2Meta') }}</small>
                </div>
              </footer>
            </article>

            <article class="story-card">
              <div class="stars">★★★★★</div>
              <p>{{ $t('landing.story3Quote') }}</p>
              <footer>
                <span class="person-avatar orange">{{ $t('landing.story3Name')[0] }}</span>
                <div>
                  <strong>{{ $t('landing.story3Name') }}</strong>
                  <small>{{ $t('landing.story3Meta') }}</small>
                </div>
              </footer>
            </article>
          </div>
        </div>
      </section>

      <!-- 常见问题 FAQ 手风琴 (1:1 复刻原型 section#faq) -->
      <section id="faq" class="content-section section-shell faq-section">
        <div class="section-heading">
          <p class="eyebrow">{{ $t('landing.faqEyebrow') }}</p>
          <h2>{{ $t('landing.faqTitle') }}</h2>
          <p><a href="javascript:void(0);">{{ $t('landing.faqContact') }}</a></p>
        </div>
        <div class="faq-list">
          <article class="faq-item" :class="{ 'is-open': openFaqIndex === 1 }">
            <button type="button" @click="toggleFaq(1)">
              <span>{{ $t('landing.faq1Q') }}</span>
              <b>{{ openFaqIndex === 1 ? "−" : "+" }}</b>
            </button>
            <div v-show="openFaqIndex === 1">
              <p>{{ $t('landing.faq1A') }}</p>
            </div>
          </article>

          <article class="faq-item" :class="{ 'is-open': openFaqIndex === 2 }">
            <button type="button" @click="toggleFaq(2)">
              <span>{{ $t('landing.faq2Q') }}</span>
              <b>{{ openFaqIndex === 2 ? "−" : "+" }}</b>
            </button>
            <div v-show="openFaqIndex === 2">
              <p>{{ $t('landing.faq2A') }}</p>
            </div>
          </article>

          <article class="faq-item" :class="{ 'is-open': openFaqIndex === 3 }">
            <button type="button" @click="toggleFaq(3)">
              <span>{{ $t('landing.faq3Q') }}</span>
              <b>{{ openFaqIndex === 3 ? "−" : "+" }}</b>
            </button>
            <div v-show="openFaqIndex === 3">
              <p>{{ $t('landing.faq3A') }}</p>
            </div>
          </article>

          <article class="faq-item" :class="{ 'is-open': openFaqIndex === 4 }">
            <button type="button" @click="toggleFaq(4)">
              <span>{{ $t('landing.faq4Q') }}</span>
              <b>{{ openFaqIndex === 4 ? "−" : "+" }}</b>
            </button>
            <div v-show="openFaqIndex === 4">
              <p>{{ $t('landing.faq4A') }}</p>
            </div>
          </article>

          <article class="faq-item" :class="{ 'is-open': openFaqIndex === 5 }">
            <button type="button" @click="toggleFaq(5)">
              <span>{{ $t('landing.faq5Q') }}</span>
              <b>{{ openFaqIndex === 5 ? "−" : "+" }}</b>
            </button>
            <div v-show="openFaqIndex === 5">
              <p>{{ $t('landing.faq5A') }}</p>
            </div>
          </article>
        </div>
      </section>

      <!-- 底部 Final CTA Banner (1:1 复刻原型 section.final-cta) -->
      <section class="final-cta section-shell">
        <div class="cta-glow"></div>
        <div>
          <p class="eyebrow">{{ $t('landing.ctaEyebrow') }}</p>
          <h2>{{ $t('landing.ctaTitle') }}</h2>
          <p>{{ $t('landing.ctaSubtitle') }}</p>
          <div>
            <button type="button" class="button light large" @click="goToRegister">
              {{ $t('landing.ctaButton') }}
            </button>
            <span>{{ $t('landing.ctaFootnote') }}</span>
          </div>
        </div>
        <div class="cta-orbit" aria-hidden="true">
          <span>E</span><i></i><i></i><i></i>
        </div>
      </section>
    </main>

    <!-- 页脚 Footer (1:1 复刻原型 footer.site-footer) -->
    <footer class="site-footer">
      <div class="section-shell footer-grid">
        <div>
          <router-link to="/" class="brand">
            <span class="brand-mark">E</span>
            <span>
              <strong>{{ $t('app.title') }}</strong>
              <small>{{ $t('app.subBrand') }}</small>
            </span>
          </router-link>
          <p style="margin-top: 12px;">{{ $t('landing.footerDesc') }}</p>
        </div>
        <div>
          <strong>{{ $t('landing.footerCol1Title') }}</strong>
          <a href="#features">{{ $t('landing.navFeatures') }}</a>
          <a href="#method">{{ $t('landing.navMethod') }}</a>
          <a href="#courses">{{ $t('landing.navCourses') }}</a>
        </div>
        <div>
          <strong>{{ $t('landing.footerCol2Title') }}</strong>
          <a href="#faq">{{ $t('landing.navFaq') }}</a>
          <router-link to="/login">{{ $t('landing.login') }}</router-link>
        </div>
        <div>
          <strong>{{ $t('landing.footerCol3Title') }}</strong>
          <a href="javascript:void(0);">{{ $t('landing.footerTerms') }}</a>
          <a href="javascript:void(0);">{{ $t('landing.footerPrivacy') }}</a>
          <a href="javascript:void(0);">{{ $t('landing.footerRules') }}</a>
        </div>
      </div>
      <div class="section-shell footer-bottom">
        <span>{{ $t('landing.footerCopy') }}</span>
        <span>{{ $t('landing.footerTagline') }}</span>
      </div>
    </footer>
  </div>

  <!-- 场景 B：已登录状态 1:1 复刻原型 desktop-today.png 今日工作台 -->
  <div v-else class="app-shell">
    <!-- 左侧固定主侧边栏 -->
    <aside class="sidebar" aria-label="主导航">
      <router-link to="/" class="brand" :aria-label="$t('app.title')">
        <span class="brand-mark">E</span>
        <span>
          <strong>{{ $t('app.title') }}</strong>
          <small>{{ $t('app.subBrand') }}</small>
        </span>
      </router-link>

      <nav class="main-nav">
        <button type="button" class="nav-item is-active">
          <span class="nav-icon">⌂</span>
          <span>{{ $t('today.navToday') }}</span>
        </button>
        <button type="button" class="nav-item">
          <span class="nav-icon">▤</span>
          <span>{{ $t('today.navCourses') }}</span>
        </button>
        <button type="button" class="nav-item">
          <span class="nav-icon">↻</span>
          <span>{{ $t('today.navReview') }}</span>
          <span class="nav-badge">8</span>
        </button>
        <button type="button" class="nav-item">
          <span class="nav-icon">⌁</span>
          <span>{{ $t('today.navInsights') }}</span>
        </button>
        <button type="button" class="nav-item">
          <span class="nav-icon">✎</span>
          <span>{{ $t('today.navCreator') }}</span>
        </button>
      </nav>

      <div class="sidebar-bottom">
        <div class="goal-mini">
          <div class="goal-mini-head">
            <span>{{ $t('today.goalProgress') }}</span>
            <strong>60%</strong>
          </div>
          <div class="progress-track">
            <i style="width: 60%;"></i>
          </div>
          <small>{{ $t('today.goalProgressDetail') }}</small>
        </div>

        <button type="button" class="nav-item">
          <span class="nav-icon">⚙</span>
          <span>{{ $t('today.navSettings') }}</span>
        </button>

        <button type="button" class="profile-chip" @click="toggleUserMenu">
          <span class="avatar">{{ userInitial }}</span>
          <span>
            <strong>{{ userDisplayName }}</strong>
            <small>{{ $t('today.streakPrefix') }} 12 {{ $t('today.streakSuffix') }}</small>
          </span>
          <span class="chevron">⌄</span>
        </button>
      </div>
    </aside>

    <!-- 工作台核心主内容 -->
    <main class="today-main-layout">
      <div class="page">
        <header class="page-header">
          <div>
            <p class="eyebrow">{{ formattedHeaderDate }}</p>
            <h1 class="page-title">{{ greetingText }}{{ userDisplayName }}</h1>
            <p class="muted">{{ $t('today.todaySubtitle') }}</p>
          </div>

          <div class="header-actions">
            <div class="language-selector-group">
              <button
                type="button"
                class="language-selector-btn"
                :class="{ 'is-active': currentLocale === 'zh-CN' }"
                @click="switchLanguage('zh-CN')"
              >
                中文
              </button>
              <button
                type="button"
                class="language-selector-btn"
                :class="{ 'is-active': currentLocale === 'en-US' }"
                @click="switchLanguage('en-US')"
              >
                English
              </button>
            </div>

            <button type="button" class="icon-button" aria-label="通知">
              ♢<span class="dot"></span>
            </button>

            <button type="button" class="button ghost small" @click="handleLogout">
              {{ $t('auth.logout') }}
            </button>
          </div>
        </header>

        <section class="hero-grid">
          <article class="card today-hero">
            <div class="hero-copy">
              <span class="status-pill purple">{{ $t('today.heroTag') }}</span>
              <h2>{{ $t('today.heroTitle') }}</h2>
              <p>{{ $t('today.heroDesc') }}</p>

              <div class="hero-progress">
                <div class="hero-progress-label">
                  <span>{{ $t('today.heroProgressLabel') }}</span>
                  <strong>60%</strong>
                </div>
                <div class="progress-track">
                  <i style="width: 60%;"></i>
                </div>
              </div>

              <div class="button-row">
                <button type="button" class="button primary">
                  ▶ {{ $t('today.btnContinueToday') }}
                </button>
                <button type="button" class="button ghost">
                  {{ $t('today.btnAdjustPlan') }}
                </button>
              </div>
            </div>
          </article>

          <article class="card goal-ring-wrap">
            <div>
              <div class="goal-ring">
                <div>
                  <strong>{{ $t('today.goalRingTime') }}</strong>
                  <small>{{ $t('today.goalRingTotal') }}</small>
                </div>
              </div>
              <p class="goal-foot">{{ $t('today.goalRingFoot') }}</p>
            </div>
          </article>
        </section>

        <section class="section">
          <div class="section-head">
            <div>
              <p class="eyebrow">{{ $t('today.queueTag') }}</p>
              <h2>{{ $t('today.queueTitle') }}</h2>
            </div>
            <button type="button" class="button small ghost">
              {{ $t('today.viewDetails') }}
            </button>
          </div>

          <div class="task-list">
            <article class="card task-row">
              <span class="task-icon mint">✓</span>
              <div>
                <h3>{{ $t('today.task1Title') }}</h3>
                <div class="task-meta">
                  <span>{{ $t('today.task1Meta1') }}</span>
                  <span>·</span>
                  <span>{{ $t('today.task1Meta2') }}</span>
                </div>
              </div>
              <span class="status-pill mint">{{ $t('today.task1Status') }}</span>
              <button type="button" class="button small ghost">
                {{ $t('today.task1Action') }}
              </button>
            </article>

            <article class="card task-row">
              <span class="task-icon">▤</span>
              <div>
                <h3>{{ $t('today.task2Title') }}</h3>
                <div class="task-meta">
                  <span>{{ $t('today.task2Meta1') }}</span>
                  <span>·</span>
                  <span>{{ $t('today.task2Meta2') }}</span>
                </div>
              </div>
              <span class="status-pill purple">{{ $t('today.task2Status') }}</span>
              <button type="button" class="button small primary">
                {{ $t('today.task2Action') }}
              </button>
            </article>

            <article class="card task-row">
              <span class="task-icon amber">!</span>
              <div>
                <h3>{{ $t('today.task3Title') }}</h3>
                <div class="task-meta">
                  <span>{{ $t('today.task3Meta1') }}</span>
                  <span>·</span>
                  <span>{{ $t('today.task3Meta2') }}</span>
                </div>
              </div>
              <span class="status-pill amber">{{ $t('today.task3Status') }}</span>
              <button type="button" class="button small ghost">
                {{ $t('today.task3Action') }}
              </button>
            </article>
          </div>
        </section>

        <section class="section">
          <div class="section-head">
            <div>
              <p class="eyebrow">{{ $t('today.rhythmTag') }}</p>
              <h2>{{ $t('today.rhythmTitle') }}</h2>
            </div>
            <button type="button" class="button small ghost">
              {{ $t('today.viewInsights') }}
            </button>
          </div>

          <div class="metric-grid">
            <article class="card metric-card">
              <div class="metric-label">
                <span>{{ $t('today.metric1Label') }}</span>
                <span>◷</span>
              </div>
              <div class="metric-value">{{ $t('today.metric1Val') }}</div>
              <small class="trend-up">{{ $t('today.metric1Trend') }}</small>
            </article>

            <article class="card metric-card">
              <div class="metric-label">
                <span>{{ $t('today.metric2Label') }}</span>
                <span>✓</span>
              </div>
              <div class="metric-value">{{ $t('today.metric2Val') }}</div>
              <small class="trend-up">{{ $t('today.metric2Trend') }}</small>
            </article>

            <article class="card metric-card">
              <div class="metric-label">
                <span>{{ $t('today.metric3Label') }}</span>
                <span>⌁</span>
              </div>
              <div class="metric-value">{{ $t('today.metric3Val') }}</div>
              <small class="subtle">{{ $t('today.metric3Trend') }}</small>
            </article>

            <article class="card metric-card">
              <div class="metric-label">
                <span>{{ $t('today.metric4Label') }}</span>
                <span>↻</span>
              </div>
              <div class="metric-value">{{ $t('today.metric4Val') }}</div>
              <small class="subtle">{{ $t('today.metric4Trend') }}</small>
            </article>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { ROUTE_PATHS } from "../constants";
import { setLanguage } from "../locales";
import { useUserStore } from "../stores/user";

const { t, locale } = useI18n();
const router = useRouter();
const userStore = useUserStore();

// 落地页互动状态
const activeCourseFilter = ref<"all" | "daily" | "travel" | "work">("all");
const openFaqIndex = ref<number | null>(1);
const isDarkTheme = ref(true);

const currentLocale = computed(() => locale.value);

const userDisplayName = computed(() => {
  return userStore.profile?.nickname || userStore.profile?.username || "林小满";
});

const userInitial = computed(() => {
  const name = userDisplayName.value;
  return name.charAt(0).toUpperCase();
});

function toggleFaq(index: number) {
  openFaqIndex.value = openFaqIndex.value === index ? null : index;
}

function toggleTheme() {
  isDarkTheme.value = !isDarkTheme.value;
  const targetTheme = isDarkTheme.value ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", targetTheme);
}

function switchLanguage(lang: string) {
  setLanguage(lang);
}

function goToLogin() {
  router.push(ROUTE_PATHS.LOGIN);
}

function goToRegister() {
  router.push(ROUTE_PATHS.REGISTER);
}

function handleLogout() {
  userStore.logout();
}

function toggleUserMenu() {
  if (confirm(t("auth.logout") + "?")) {
    handleLogout();
  }
}

const greetingText = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return t("today.greetingMorning");
  if (hour < 18) return t("today.greetingAfternoon");
  return t("today.greetingEvening");
});

const formattedHeaderDate = computed(() => {
  const d = new Date();
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const date = d.getDate();
  const weekdaysZh = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
  const weekdaysEn = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const weekday = locale.value === "zh-CN" ? weekdaysZh[d.getDay()] : weekdaysEn[d.getDay()];
  const monthText = locale.value === "zh-CN" ? `${month} 月` : `Month ${month}`;
  const dayText = locale.value === "zh-CN" ? `${date} 日` : `${date}`;
  return `${year} · ${monthText} ${dayText} · ${weekday}`;
});

onMounted(async () => {
  if (userStore.token && !userStore.profile) {
    await userStore.fetchProfile();
  }
});
</script>
