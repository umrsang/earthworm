# 上传指南

1. 进入 `packages/courses/packs/<pack-name>`。
2. 确认存在 `package.json` 和 `data/*.json`。
3. 将整个课程包目录压缩为 `.zip`。
4. 打开 `/course-pack/upload` 页面上传。

## 上传前检查

- `package.json` 中 `name` 唯一且稳定。
- `data` 文件按 `01.json`、`02.json` 递增。
- 每个 JSON 文件是数组。
- 每条记录都包含 `chinese`、`english`、`soundmark`。
