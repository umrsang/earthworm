import { readFile } from "node:fs/promises";

import { Window } from "happy-dom";

const page = process.argv[2] || "auth";
const prototypeUrl = `http://localhost/index.html?page=${page}`;
const window = new Window({ url: prototypeUrl });
const html = await readFile(new URL("./index.html", import.meta.url), "utf8");

window.document.write(html.replace(/<script[^>]*src="\.\/app\.js"[^>]*><\/script>/, ""));
Object.assign(globalThis, {
  window,
  document: window.document,
  HTMLElement: window.HTMLElement,
  Event: window.Event,
  CustomEvent: window.CustomEvent,
});

await import(`${new URL("./app.js", import.meta.url).href}?page=${page}`);

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

if (page === "auth") {
  assert(document.body.classList.contains("auth-mode"), "登录页没有进入独立页面模式");
  assert(document.querySelectorAll("form[data-form='auth']").length === 1, "登录表单缺失");
  document.querySelector("[data-action='show-register']").click();
  assert(document.querySelector("#auth-confirm"), "注册确认密码字段缺失");
  document
    .querySelector("form[data-form='auth']")
    .dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
  assert(
    document.querySelector("[data-field-message='username']").textContent,
    "注册字段错误提示缺失",
  );
}

if (page === "upload") {
  document.querySelector("[data-action='simulate-file']").click();
  assert(document.body.textContent.includes("校验结果"), "上传校验步骤未进入");
  document.querySelector("[data-action='upload-next']").click();
  assert(document.body.textContent.includes("发布设置"), "上传发布步骤未进入");
  document.querySelector("[data-value='public']").click();
  document.querySelector("[data-action='publish-upload']").click();
  assert(document.querySelector("#publish-confirm"), "公开发布未要求版权确认");
  document.querySelector("#publish-confirm").checked = true;
  document.querySelector("[data-action='publish-upload']").click();
  assert(document.body.textContent.includes("IMPORT COMPLETE"), "上传成功结果页缺失");
}

console.log(JSON.stringify({ page, status: "passed" }));
