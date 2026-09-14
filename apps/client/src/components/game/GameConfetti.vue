<template><canvas ref="canvas" class="game-confetti-canvas" aria-hidden="true"></canvas></template>
<script setup lang="ts">
import { onUnmounted, ref, watch } from "vue";
interface Particle { x: number; y: number; vx: number; vy: number; rotation: number; rotationSpeed: number; size: number; color: string; life: number }
const props = defineProps<{ burst: number; intensity?: "normal" | "strong" }>();
const canvas = ref<HTMLCanvasElement | null>(null);
const particles: Particle[] = [];
const colors = ["#a78bfa", "#22d3ee", "#34d399", "#fbbf24", "#f472b6", "#fb923c"];
let frameId = 0;

function resize() { if (!canvas.value) return; canvas.value.width = window.innerWidth * devicePixelRatio; canvas.value.height = window.innerHeight * devicePixelRatio; }
function play() {
  if (!canvas.value || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  resize();
  const amount = props.intensity === "strong" ? 220 : 90;
  for (let index = 0; index < amount; index += 1) {
    const direction = index % 2 === 0 ? 1 : -1;
    particles.push({ x: direction > 0 ? 0 : canvas.value.width, y: canvas.value.height * (0.35 + Math.random() * 0.25), vx: direction * (4 + Math.random() * 8) * devicePixelRatio, vy: (-7 - Math.random() * 11) * devicePixelRatio, rotation: Math.random() * Math.PI, rotationSpeed: (Math.random() - 0.5) * 0.35, size: (5 + Math.random() * 7) * devicePixelRatio, color: colors[index % colors.length], life: 130 + Math.random() * 45 });
  }
  if (!frameId) animate();
}
function animate() {
  const context = canvas.value?.getContext("2d");
  if (!context || !canvas.value) return;
  context.clearRect(0, 0, canvas.value.width, canvas.value.height);
  for (let index = particles.length - 1; index >= 0; index -= 1) {
    const particle = particles[index];
    particle.x += particle.vx; particle.y += particle.vy; particle.vy += 0.3 * devicePixelRatio; particle.vx *= 0.992; particle.rotation += particle.rotationSpeed; particle.life -= 1;
    context.save(); context.translate(particle.x, particle.y); context.rotate(particle.rotation); context.globalAlpha = Math.min(1, particle.life / 30); context.fillStyle = particle.color; context.fillRect(-particle.size / 2, -particle.size / 4, particle.size, particle.size / 2); context.restore();
    if (particle.life <= 0 || particle.y > canvas.value.height + particle.size) particles.splice(index, 1);
  }
  frameId = particles.length ? requestAnimationFrame(animate) : 0;
}
watch(() => props.burst, (value, previous) => { if (value !== previous) play(); });
onUnmounted(() => { if (frameId) cancelAnimationFrame(frameId); particles.length = 0; });
</script>
