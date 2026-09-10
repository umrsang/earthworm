import { readFile } from "node:fs/promises";

import { Window } from "happy-dom";

const window = new Window({ url: "http://localhost/landing.html" });
const html = await readFile(new URL("./landing.html", import.meta.url), "utf8");
window.document.write(html.replace(/<script[^>]*src="\.\/landing\.js"[^>]*><\/script>/, ""));

Object.assign(globalThis, {
  window,
  document: window.document,
  HTMLElement: window.HTMLElement,
  Event: window.Event,
  CustomEvent: window.CustomEvent,
});

await import(`${new URL("./landing.js", import.meta.url).href}?smoke=1`);

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

["features", "method", "courses", "stories", "faq"].forEach((id) => {
  assert(document.querySelector(`#${id}`), `缺少首页区块：${id}`);
});

assert(document.querySelectorAll(".public-course-card").length === 3, "课程展示卡片数量不正确");
assert(document.querySelectorAll(".story-card").length === 3, "用户反馈卡片数量不正确");
assert(document.querySelectorAll(".faq-item").length === 5, "常见问题数量不正确");

document.querySelector("[data-action='menu']").click();
assert(document.querySelector(".mobile-menu").classList.contains("is-open"), "移动端菜单无法打开");

document.querySelector("[data-action='demo']").click();
assert(document.querySelector(".demo-modal").classList.contains("is-open"), "学习演示弹窗无法打开");
document.querySelector("[data-action='close-demo']").click();
assert(
  !document.querySelector(".demo-modal").classList.contains("is-open"),
  "学习演示弹窗无法关闭",
);

const faqButtons = document.querySelectorAll("[data-action='faq']");
faqButtons[1].click();
assert(faqButtons[1].closest(".faq-item").classList.contains("is-open"), "常见问题无法切换");

document.querySelector("[data-course-filter='travel']").click();
assert(
  document.querySelectorAll(".public-course-card:not([hidden])").length === 1,
  "课程筛选结果不正确",
);

console.log(JSON.stringify({ page: "landing", status: "passed" }));
