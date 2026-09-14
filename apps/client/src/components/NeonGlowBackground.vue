<template>
  <!-- 全屏底层霓虹鼠标追随光晕画布，pointer-events: none 防止干扰用户交互 -->
  <div class="neon-glow-container" aria-hidden="true">
    <canvas ref="canvasRef" class="neon-glow-canvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";

/** 单个霓虹光球物理状态模型 */
interface GlowBall {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  radius: number;
  baseRadius: number;
  ease: number; // 阻尼系数 (0 ~ 1)，数值越小惯性延迟越大
  colorRgb: string; // RGB 颜色通道
  alpha: number; // 基础不透明度
  phase: number; // 待机漂移相位
  speed: number; // 待机浮动角速度
  orbitRadius: number; // 环绕漂移半径
}

const canvasRef = ref<HTMLCanvasElement | null>(null);

let animationFrameId: number | null = null;
let mouseX = -1000;
let mouseY = -1000;
let isMouseActive = false;
let screenWidth = 0;
let screenHeight = 0;

// 配置 4 个具有错落色彩与不同阻尼感的霓虹光斑（已根据需求调低亮度，呈现柔和环境光晕）
const BALL_CONFIGS = [
  { colorRgb: "139, 92, 246", alpha: 0.22, baseRadius: 260, ease: 0.075, orbitRadius: 40, speed: 0.02 },  // 极光紫 (主力跟随)
  { colorRgb: "94, 225, 189", alpha: 0.17, baseRadius: 220, ease: 0.05, orbitRadius: 65, speed: 0.016 },  // 电光薄荷 (中度延迟)
  { colorRgb: "244, 63, 94", alpha: 0.15, baseRadius: 240, ease: 0.035, orbitRadius: 85, speed: 0.012 },  // 荧光洋红 (较大延迟)
  { colorRgb: "245, 158, 11", alpha: 0.13, baseRadius: 200, ease: 0.022, orbitRadius: 105, speed: 0.009 },// 琥珀暖光 (强阻尼拖尾)
];

const balls: GlowBall[] = [];

/** 初始化光球位置分布 */
function initBalls() {
  balls.length = 0;
  const centerX = screenWidth > 0 ? screenWidth / 2 : 400;
  const centerY = screenHeight > 0 ? screenHeight / 2 : 300;

  for (let i = 0; i < BALL_CONFIGS.length; i++) {
    const cfg = BALL_CONFIGS[i];
    balls.push({
      x: centerX + (Math.random() - 0.5) * 100,
      y: centerY + (Math.random() - 0.5) * 100,
      targetX: centerX,
      targetY: centerY,
      radius: cfg.baseRadius,
      baseRadius: cfg.baseRadius,
      ease: cfg.ease,
      colorRgb: cfg.colorRgb,
      alpha: cfg.alpha,
      phase: (Math.PI * 2 * i) / BALL_CONFIGS.length,
      speed: cfg.speed,
      orbitRadius: cfg.orbitRadius,
    });
  }
}

/** 窗口尺寸自适应处理 */
function handleResize() {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  screenWidth = window.innerWidth;
  screenHeight = window.innerHeight;

  canvas.width = Math.floor(screenWidth * dpr);
  canvas.height = Math.floor(screenHeight * dpr);
  canvas.style.width = `${screenWidth}px`;
  canvas.style.height = `${screenHeight}px`;

  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.scale(dpr, dpr);
  }

  if (balls.length === 0) {
    initBalls();
  }
}

/** 鼠标指针位移监听 */
function handleMouseMove(e: MouseEvent) {
  mouseX = e.clientX;
  mouseY = e.clientY;
  isMouseActive = true;
}

/** 触摸移动监听 (移动端触控跟随) */
function handleTouchMove(e: TouchEvent) {
  if (e.touches.length > 0) {
    mouseX = e.touches[0].clientX;
    mouseY = e.touches[0].clientY;
    isMouseActive = true;
  }
}

/** 鼠标移出窗口时切为轻柔漫游状态 */
function handleMouseLeave() {
  isMouseActive = false;
}

/** 每一帧物理阻尼与发光渲染循环 */
function renderLoop() {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // 清空画布上一帧
  ctx.clearRect(0, 0, screenWidth, screenHeight);

  // 使用加色混合模式，使多层霓虹光晕交融更加明亮梦幻
  ctx.globalCompositeOperation = "screen";

  const time = performance.now() * 0.001;

  for (let i = 0; i < balls.length; i++) {
    const ball = balls[i];

    // 更新自主漂移公转偏移
    ball.phase += ball.speed;
    const offsetX = Math.cos(ball.phase + time) * ball.orbitRadius;
    const offsetY = Math.sin(ball.phase + time) * ball.orbitRadius;

    // 当鼠标活跃时，目标为鼠标位置加自身微小偏移；静止时在视口中央附近舒缓徘徊
    if (isMouseActive) {
      ball.targetX = mouseX + offsetX;
      ball.targetY = mouseY + offsetY;
    } else {
      const roamCenterX = screenWidth * 0.5;
      const roamCenterY = screenHeight * 0.45;
      ball.targetX = roamCenterX + Math.cos(ball.phase * 0.5) * (screenWidth * 0.22);
      ball.targetY = roamCenterY + Math.sin(ball.phase * 0.6) * (screenHeight * 0.18);
    }

    // 经典物理阻尼 Lerp 插值：当前坐标逐步逼近目标坐标
    ball.x += (ball.targetX - ball.x) * ball.ease;
    ball.y += (ball.targetY - ball.y) * ball.ease;

    // 伴随微弱的径向呼吸缩放
    const breath = 1 + Math.sin(time * 2 + i) * 0.08;
    const currentRadius = ball.baseRadius * breath;

    // 绘制径向渐变超级柔光霓虹圆球
    const gradient = ctx.createRadialGradient(
      ball.x,
      ball.y,
      0,
      ball.x,
      ball.y,
      currentRadius
    );

    gradient.addColorStop(0, `rgba(${ball.colorRgb}, ${ball.alpha})`);
    gradient.addColorStop(0.35, `rgba(${ball.colorRgb}, ${ball.alpha * 0.6})`);
    gradient.addColorStop(0.7, `rgba(${ball.colorRgb}, ${ball.alpha * 0.18})`);
    gradient.addColorStop(1, `rgba(${ball.colorRgb}, 0)`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, currentRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  // 恢复默认画布混合模式
  ctx.globalCompositeOperation = "source-over";

  animationFrameId = requestAnimationFrame(renderLoop);
}

onMounted(() => {
  handleResize();
  window.addEventListener("resize", handleResize, { passive: true });
  window.addEventListener("mousemove", handleMouseMove, { passive: true });
  window.addEventListener("touchmove", handleTouchMove, { passive: true });
  document.addEventListener("mouseleave", handleMouseLeave);

  animationFrameId = requestAnimationFrame(renderLoop);
});

onBeforeUnmount(() => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
  }
  window.removeEventListener("resize", handleResize);
  window.removeEventListener("mousemove", handleMouseMove);
  window.removeEventListener("touchmove", handleTouchMove);
  document.removeEventListener("mouseleave", handleMouseLeave);
});
</script>

<style scoped>
.neon-glow-container {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
  /* 硬件加速图层隔离，保证流畅渲染 */
  contain: strict;
  transform: translateZ(0);
  /* 叠加柔滑高斯模糊滤镜，使霓虹色晕更具扩散美感 */
  filter: blur(28px);
  /* 初始化显现：平滑渐现入场动画 */
  animation: neon-glow-fade-in 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.neon-glow-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
}

/* 霓虹背景初始化显现入场关键帧 */
@keyframes neon-glow-fade-in {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
