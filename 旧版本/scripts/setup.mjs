import { exec as childProcessExec } from "child_process";
import { chdir } from "process";

// 执行命令的通用函数
function executeCommand(command, env = {}) {
  return new Promise((resolve, reject) => {
    console.log(`📦 执行命令: ${command}`);
    const child = childProcessExec(
      command,
      { env: { ...process.env, ...env }, stdio: "inherit" },
      (error, stdout, stderr) => {
        if (error) {
          console.error(`❌ 错误: ${error.message}`);
          return reject(error);
        }
        if (stderr) {
          console.log(`⚠️  ${stderr}`);
        }
        resolve(stdout);
      },
    );

    // 继承标准流，允许交互
    child.stdout?.pipe(process.stdout);
    child.stderr?.pipe(process.stderr);
    process.stdin.pipe(child.stdin);
  });
}

async function buildSchema() {
  console.log("📐 构建 Schema...");
  await executeCommand("pnpm -F @earthworm/schema build");
  console.log("✅ Schema 构建完成");
}

async function buildGameDataSDK() {
  console.log("🎮 构建 Game Data SDK...");
  await executeCommand("pnpm -F @earthworm/game-data-sdk build");
  console.log("✅ Game Data SDK 构建完成");
}

async function initDatabase(type = "default", env = {}) {
  console.log(`🗄️  初始化数据库 (${type})...`);

  let command;
  switch (type) {
    case "test":
      command = "pnpm -F @earthworm/db run init:test";
      break;
    case "ci":
      command = "pnpm -F @earthworm/db run init:ci";
      break;
    default:
      command = "pnpm -F @earthworm/db run init -- --force";
  }

  await executeCommand(command, env);
  console.log("✅ 数据库初始化完成");
}

async function uploadCourses(env = {}) {
  console.log("📚 上传课程数据...");
  await executeCommand("pnpm -F @earthworm/xingrong-courses upload", env);
  console.log("✅ 课程数据上传完成");
}

async function dbStudio() {
  console.log("🎨 启动 Drizzle Studio...");
  await executeCommand("pnpm -F @earthworm/db db:studio");
}

async function main() {
  try {
    changeToProjectRoot();

    const action = process.argv[2] || "init";
    const nodeEnv = process.env.NODE_ENV; // 从环境变量读取

    const env = nodeEnv ? { NODE_ENV: nodeEnv, ...process.env } : { ...process.env };
    const envLabel = nodeEnv ? ` (${nodeEnv})` : "";

    console.log(`\n🚀 执行: ${action}${envLabel}\n`);

    switch (action) {
      case "init":
        console.log("📥 安装依赖...");
        await executeCommand("pnpm install");
        console.log("✅ 依赖安装完成\n");

        await buildSchema();
        await buildGameDataSDK();
        await initDatabase("default", env);
        await uploadCourses(env);

        console.log("\n✨ 项目初始化成功！");
        console.log("\n接下来你可以运行:");
        console.log("  pnpm dev         - 启动开发服务器");
        console.log("  pnpm dev:office  - 启动办公室版本");
        console.log("\n");
        break;

      case "db:init":
        await buildSchema();
        await buildGameDataSDK();
        await initDatabase("default", env);
        await uploadCourses(env);
        console.log("\n✨ 数据库初始化完成！");
        break;

      case "db:init:test":
        await buildSchema();
        await buildGameDataSDK();
        await initDatabase("test", env);
        console.log("\n✨ 测试数据库初始化完成！");
        break;

      case "db:init:ci":
        await buildSchema();
        await buildGameDataSDK();
        await initDatabase("ci", env);
        console.log("\n✨ CI 数据库初始化完成！");
        break;

      case "db:upload":
        await uploadCourses(env);
        console.log("\n✨ 课程数据上传完成！");
        break;

      case "db:studio":
        await dbStudio();
        break;

      default:
        console.error(`❌ 未知操作: ${action}`);
        printUsage();
        process.exit(1);
    }
  } catch (error) {
    console.error("\n❌ 操作失败:", error.message);
    process.exit(1);
  }
}

function changeToProjectRoot() {
  const currentDir = new URL(import.meta.url).pathname;
  // 处理 Windows 路径：/E:/dev/... -> E:/dev/...
  let projectRoot = currentDir.substring(0, currentDir.lastIndexOf("/scripts"));

  // 移除开头的 / 如果存在（Windows 路径问题）
  if (projectRoot.startsWith("/") && projectRoot[2] === ":") {
    projectRoot = projectRoot.substring(1);
  }

  // 解码 URL 编码的字符（比如空格 %20）
  projectRoot = decodeURIComponent(projectRoot);

  chdir(projectRoot);
}

function printUsage() {
  console.log(`
使用方法:
  node scripts/setup.mjs <action> [env_type]

动作 (action):
  init       - 完整初始化 (install + schema + sdk + db + upload)
  db:init    - 数据库初始化 (schema + sdk + db + upload)
  db:init:test  - 测试数据库初始化
  db:init:ci    - CI 数据库初始化
  db:upload  - 上传课程数据
  db:studio  - 启动 Drizzle Studio

环境 (env_type):
  office     - 办公室版本
  (省略)     - 默认版本

示例:
  node scripts/setup.mjs init          # 完整初始化
  node scripts/setup.mjs init office   # 办公室版本初始化
  node scripts/setup.mjs db:init:test  # 测试数据库
  node scripts/setup.mjs db:upload office # 办公室版本上传
  `);
}

main();
