# 课程包上传功能说明

## 📖 功能概述

课程包上传功能允许用户通过网页界面上传自己创建的课程包，系统会自动解析课程包结构并导入到数据库中。

## ✨ 主要特性

1. **自动解析课程包结构**
   - 支持从 `package.json` 读取课程包元信息
   - 如果没有 `package.json`，自动从文件夹名或压缩包名获取课程包名称
2. **课程单元映射**
   - 自动读取 `data/` 目录下的所有 JSON 文件
   - 按文件名数字顺序排列课程单元
   - 显示每个单元的数据条数
3. **数据预览**
   - 可以查看每个课程单元的前5条数据
   - 实时显示数据统计信息
4. **信息编辑**
   - 上传后可以编辑课程包标题和描述
   - 可以编辑每个课程单元的名称和描述
5. **一键上传**
   - 确认信息后一键上传到服务器
   - 自动创建课程包和所有课程单元

## 🎯 使用场景

### 场景1：教师创建课程包

教师可以根据教学大纲创建课程包，包含多个单元的学习内容，上传后学生即可学习。

### 场景2：内容创作者分享课程

内容创作者可以创建特定主题的课程包（如商务英语、旅游英语等），上传后分享给其他用户。

### 场景3：课程包迁移

可以将现有的课程包导出为 ZIP 格式，在其他环境中重新上传。

## 📦 课程包格式

### 目录结构

```
课程包名称/
├── package.json          # 课程包元信息（可选但推荐）
├── docs/                 # 文档目录（可选）
│   ├── 课程规划.md
│   └── 单词句子汇总.md
└── data/                 # 课程数据目录（必需）
    ├── 01.json          # 第1单元数据
    ├── 02.json          # 第2单元数据
    └── 03.json          # 第3单元数据
```

### package.json 格式

```json
{
  "name": "elementary-grade-1-2",
  "title": "小学1-2年级英语",
  "description": "通过游戏化的拆句子拼句子方式，帮助孩子建立英语学习兴趣",
  "version": "1.0.0"
}
```

### 课程数据格式

```json
[
  {
    "chinese": "你好",
    "english": "hello",
    "soundmark": "/həˈloʊ/"
  }
]
```

## 🚀 使用流程

### 1. 准备课程包

按照上述格式创建课程包目录和文件。

### 2. 打包压缩

将课程包目录压缩成 `.zip` 格式。

### 3. 访问上传页面

访问 `/course-pack/upload` 页面。

### 4. 选择文件

点击"选择课程包压缩文件"按钮，选择准备好的 ZIP 文件。

### 5. 查看解析结果

系统会自动解析课程包，显示：

- 课程包基本信息
- 课程单元列表
- 每个单元的数据统计

### 6. 编辑信息（可选）

可以修改：

- 课程包标题和描述
- 每个课程单元的名称和描述

### 7. 确认上传

点击"确认上传"按钮，系统会将课程包导入数据库。

### 8. 查看结果

上传成功后会自动跳转到课程包列表页面，可以看到刚上传的课程包。

## 🔧 技术实现

### 前端

- **页面**: `apps/client/pages/course-pack/upload.vue`
- **技术栈**: Vue 3 + Nuxt 3 + TypeScript
- **依赖**: jszip（用于解析 ZIP 文件）

### 后端

- **Controller**: `apps/api/src/course-pack/course-pack.controller.ts`
- **Service**: `apps/api/src/course-pack/course-pack.service.ts`
- **DTO**: `apps/api/src/course-pack/dto/upload-course-pack.dto.ts`
- **API**: `POST /api/course-pack/upload`

### 数据流

```
用户上传 ZIP 文件
    ↓
前端解析 ZIP（jszip）
    ↓
提取 package.json 和 data/*.json
    ↓
显示解析结果供用户确认
    ↓
用户确认后发送到后端
    ↓
后端调用 game-data-sdk 的 createCoursePack
    ↓
写入数据库（coursePack、course、statement 表）
    ↓
返回成功结果
```

## 📝 数据库结构

### coursePack 表

- id: 课程包ID
- title: 标题
- description: 描述
- creatorId: 创建者ID
- shareLevel: 分享级别（private/public/founder_only）
- order: 排序
- isFree: 是否免费

### course 表

- id: 课程ID
- coursePackId: 所属课程包ID
- title: 标题
- description: 描述
- order: 排序

### statement 表

- id: 语句ID
- courseId: 所属课程ID
- chinese: 中文
- english: 英文
- soundmark: 音标
- order: 排序

## ✅ 验证和测试

### 测试课程包

项目提供了一个测试课程包：`packages/courses/example-courses/test-course-pack/`

包含：

- 完整的 package.json
- 2个课程单元
- 共20条测试数据

### 测试步骤

1. 将 `test-course-pack` 文件夹压缩成 ZIP
2. 访问 `/course-pack/upload` 页面
3. 上传压缩文件
4. 验证解析结果
5. 确认上传
6. 在课程包列表中查看

## 🔒 权限控制

- 需要登录才能上传课程包
- 上传的课程包默认为私有（private）
- 只有创建者可以看到自己的私有课程包
- 可以通过后台修改分享级别

## 📊 限制和约束

- 文件格式：仅支持 .zip
- 文件大小：建议不超过 50MB
- 课程单元数量：建议不超过 20个
- 每个单元数据量：建议 50-300 条

## 🐛 常见问题

### Q: 上传后找不到课程包？

A: 默认上传的课程包是私有的，只在你的账号下可见。检查课程包列表页面。

### Q: 解析失败怎么办？

A: 检查 ZIP 文件结构，确保有 data/ 文件夹和至少一个 JSON 文件。

### Q: 可以修改已上传的课程包吗？

A: 目前需要重新上传。后续版本会添加编辑功能。

### Q: 支持批量上传吗？

A: 目前一次只能上传一个课程包。

## 🔮 未来计划

- [ ] 支持在线编辑课程包
- [ ] 支持课程包版本管理
- [ ] 支持课程包导出
- [ ] 支持批量上传
- [ ] 支持课程包模板
- [ ] 支持课程包分享和协作
- [ ] 支持课程包评分和评论

## 📚 相关文档

- [课程包设计规则](../packages/courses/example-courses/readme.md)
- [课程包数据说明](../packages/courses/data/README.md)
- [上传指南](../packages/courses/data/UPLOAD_GUIDE.md)
- [测试课程包](../packages/courses/example-courses/test-course-pack/README.md)
