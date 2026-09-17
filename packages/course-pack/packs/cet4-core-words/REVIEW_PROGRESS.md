# cet4-core-words 课程包核对进度

> 核对范围：soundmark、posTags、syntaxTags、中英文翻译、句子语法
> 音标约定：**美式标注**（保留 r 音，如 /ər/、/ɑːr/、/ɜːr/、/oʊ/、/ɑː/）
> 核对方式：逐条人工核对，边查边改

## 进度总览

| 文件 | 状态 | 备注 |
|------|------|------|
| 01.json | ✅ 已完成 | 无问题 |
| 02.json | ✅ 已完成 | 修正 3 处 |
| 03.json | ✅ 已完成 | 修正 10 处 |
| 04.json | ✅ 已完成 | 修正 5 处 |
| 05.json | ✅ 已完成 | 修正 9 处 |
| 06.json | ✅ 已完成 | 修正 6 处 |
| 07.json | ✅ 已完成 | 修正 5 处 |
| 08.json | ✅ 已完成 | 修正 8 处 |
| 09.json | 待核对 | |
| 10.json | 待核对 | |
| ... | 待核对 | |
| 89.json | 待核对 | |

## 已发现问题汇总

（按文件记录，格式：`单词` - 问题描述 → 修正）

### 01.json
- 无（音标 r 音按美式约定保留）

### 02.json
- `appeal` - posTags [7,7] 标为"动词"，此处为名词（a public appeal）→ 改为"名词"
- `appearance` - syntaxTags [2,6] 标为"表语 NP"，实为谓语（was always criticising...）→ 修正
- `applicant` - syntaxTags [1,1] 谓语动词，应为 [1,2]（have had）→ 修正

### 03.json
- `budget` - 音标 `/'bʌdʒɪt/` 中 `'` 应为 `ˈ` → `/ˈbʌdʒɪt/`
- `cancel` - 音标 `/'kænsl/` 中 `'` 应为 `ˈ` → `/ˈkænsl/`
- `casual` - 音标 `/'kæʒʊəl/` 中 `'` 应为 `ˈ` → `/ˈkæʒʊəl/`
- `coach` - posTags [2,2] 标为"动词"，此处为名词（a tennis coach）→ 改为"名词"
- `committee` - syntaxTags 误标为主谓结构，实为名词短语 → 改为"名词短语/固定搭配 NP"
- `classification` - syntaxTags 误标为主谓宾，实为名词短语 → 改为"名词短语/固定搭配 NP"
- `client` - syntaxTags 误标为主谓，实为名词短语 → 改为"名词短语/固定搭配 NP"
- `chap` - syntaxTags 误标为主谓，实为名词短语 → 改为"名词短语/固定搭配 NP"
- `campaign` - syntaxTags 误标为名词短语，实为完整句 → 改为主语/谓语/宾语
- `broad` - syntaxTags 误标为名词短语，实为完整句 → 改为主语/谓语/宾语

### 04.json
- `complicated` - syntaxTags 误标为主谓宾，实为名词短语 → 改为"名词短语/固定搭配 NP"
- `considerably` - syntaxTags 误标为名词短语，实为完整句 → 改为主语/系动词/表语
- `constructive` - syntaxTags [1,2] 应为系动词，[3,4] 应为表语 → 修正
- `constantly` - syntaxTags [2,2] 标为宾语，实为状语 → 改为"状语修饰 AdvP"
- `cooperative` - syntaxTags [1,2] 应为谓语动词，[3,4] 应为宾语 → 修正

### 05.json
- `couple` - syntaxTags 误标为主谓宾，实为名词短语 → 改为"名词短语/固定搭配 NP"
- `crisis` - syntaxTags 误标为名词短语，实为完整句 → 改为主语/谓语/宾语
- `deliberate` - syntaxTags 误标为主谓宾，实为名词短语 → 改为"名词短语/固定搭配 NP"
- `depressed` - syntaxTags 误标为主谓宾，实为名词短语 → 改为"名词短语/固定搭配 NP"
- `detailed` - syntaxTags 误标为主谓，实为名词短语 → 改为"名词短语/固定搭配 NP"
- `dictator` - syntaxTags 误标为主谓宾，实为名词短语 → 改为"名词短语/固定搭配 NP"
- `diploma` - syntaxTags 误标为主谓宾，实为名词短语 → 改为"名词短语/固定搭配 NP"
- `demand` - posTags [6,6] 标为"动词"，此处为名词（faster than demand）→ 改为"名词"
- `decline` - syntaxTags 缺主语，[0,0] 应为主语 NP → 修正

### 06.json
- `display` - posTags [2,2] 标为"动词"，此处为名词（a dazzling display）→ 改为"名词"
- `distribute` - posTags [0,0] 错误，目标词 distributing 在 [2,2] → 改为 [2,2]
- `diverse` - syntaxTags 误标为主谓，实为名词短语 → 改为"名词短语/固定搭配 NP"
- `efficiently` - posTags [3,3] 标为"形容词"，实为副词 → 改为"副词"
- `emergency` - posTags [0,0] 错误，目标词 emergencies 在 [7,7] → 改为 [7,7]
- `due` - syntaxTags [3,3] 应为系动词，[4,6] 应为表语 → 修正

### 07.json
- `exaggerate` - posTags [0,0] 错误，目标词 exaggerating 在 [9,9] → 改为 [9,9]
- `excessive` - syntaxTags 误标为主谓，实为名词短语 → 改为"名词短语/固定搭配 NP"
- `familiar` - syntaxTags 误标为主谓，实为名词短语 → 改为"名词短语/固定搭配 NP"
- `fate` - syntaxTags 误标为名词短语，实为完整句 → 改为主语/谓语/宾语
- `fatigue` - english 字段为畸形 JSON 对象 `{"COLLOINEXA":["metal fatigue"]}` → 改为纯文本 "metal fatigue"

### 08.json
- `figure` - syntaxTags 误标为名词短语，实为完整句 → 改为主语/谓语/宾语
- `finance` - syntaxTags 误标为主谓宾，实为名词短语 → 改为"名词短语/固定搭配 NP"
- `fitness` - syntaxTags 误标为主谓宾，实为名词短语 → 改为"名词短语/固定搭配 NP"
- `flexible` - syntaxTags [3,3] 标为宾语，实为表语 → 改为"表语 AdjP"
- `foothold` - syntaxTags [1,2] 应为谓语动词，[3,3] 应为宾语 → 修正
- `fortunately` - syntaxTags [0,1] 主语错误，[0,0] 为副词状语，主语应为 [1,1] → 修正
- `function` - posTags [4,4] 标为"动词"，此处为名词（that function was...）→ 改为"名词"
- `fuss` - syntaxTags 主谓宾标注与句子结构不符 → 修正

## 待办
- [x] 完成 01-08 的修正
- [ ] 核对 09-89 文件
- [ ] 全部完成后更新本文件状态