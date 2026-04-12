---
title: 'AI 辅助开发中的项目文档最佳实践'
description: '从 ETH Zurich 论文到 Claude Code 创始团队工作流——如何写好 AI Agent 能读懂的项目文档'
pubDate: 2026-04-12
tags: ['AI', 'Claude Code', 'Engineering']
---

# AI 辅助开发中的项目文档最佳实践

> 从 ETH Zurich 论文到 Claude Code 创始团队工作流——如何写好 AI Agent 能读懂的项目文档
>
> 作者：xmly | 日期：2026-04-12

---

## 目录

1. [引言](#1-引言)
2. [研究方法与信息源](#2-研究方法与信息源)
3. [核心发现：ETH Zurich 研究](#3-核心发现eth-zurich-研究)
4. [业界实践：Boris Cherny 工作流](#4-业界实践boris-cherny-工作流)
5. [渐进式披露架构](#5-渐进式披露架构progressive-disclosure)
6. [CLAUDE.md 编写 7 条铁律](#6-claudemd-编写-7-条铁律)
7. [反模式清单](#7-反模式清单)
8. [工具对比：CLAUDE.md vs AGENTS.md vs .cursorrules](#8-工具对比)
9. [Hooks：从建议到强制](#9-hooks从建议到强制)
10. [实践验证：TCF Study 项目](#10-实践验证tcf-study-项目)
11. [可复用产出：project-init Skill](#11-可复用产出project-init-skill)
12. [结论与建议](#12-结论与建议)
13. [参考文献](#13-参考文献)

---

## 1. 引言

2025-2026 年，AI coding agent 进入了一个爆发期。Claude Code、Cursor、GitHub Copilot、Gemini CLI——这些工具已经能够独立完成从写代码到发 PR 的完整流程。但有一个核心问题始终没有被很好地解决：

**如何让 AI 理解你的项目上下文？**

每个项目都有自己的约定：用什么包管理器、类型定义放在哪里、AI 调用走什么路由、数据库的 `Session` 是 HTTP session 还是练习会话。这些信息不在代码里（或者说散落在各处），AI 不会自动知道。

于是各种"项目上下文文件"涌现了：

- **CLAUDE.md** — Claude Code 的项目指令文件
- **AGENTS.md** — Linux Foundation 推动的跨工具标准（60K+ repos 采用）
- **.cursorrules** — Cursor IDE 的项目规则文件

但问题来了：这些文件应该写什么？写多长？怎么组织？"把所有你知道的都塞进去"显然不是答案——ETH Zurich 的研究甚至证明了，**写太多反而让 AI 变笨**。

本文记录了我对这个问题的系统调研：从学术论文到业界实践，从理论分析到在真实项目中验证，最终沉淀为一套可复用的方法论和工具。

---

## 2. 研究方法与信息源

本次调研覆盖了以下 5 个维度的信息源：

### 2.1 学术研究

- **论文**：*"Evaluating AGENTS.md: Are Repository-Level Context Files Helpful for Coding Agents?"*
- **作者**：Gloaguen et al., ETH Zurich
- **发表**：arXiv:2602.11988, 2026
- **贡献**：首次用实验数据验证了"项目上下文文件"对 AI coding agent 的真实效果

### 2.2 业界实践

- **人物**：Boris Cherny — Claude Code 创始团队成员
- **来源**：[howborisusesclaudecode.com](https://howborisusesclaudecode.com)
- **贡献**：分享了 Claude Code 核心团队自己的 CLAUDE.md 编写和使用策略

### 2.3 行业标准

- **标准**：AGENTS.md — Linux Foundation 支持的跨工具项目上下文标准
- **采用**：60,000+ GitHub 仓库
- **贡献**：提供了一个与工具无关的通用基线

### 2.4 官方文档

- **来源**：Anthropic Claude Code 官方文档
- **内容**：CLAUDE.md 规范、Skills 系统、Hooks 机制、context window 管理

### 2.5 实践项目

- **项目**：TCF Study — 个人法语 TCF Canada B2 备考系统
- **规模**：5628 道真题，Next.js 16 + React 19 + Prisma 7 + SQLite
- **贡献**：作为真实项目验证调研结论，完成 CLAUDE.md 重构和 Skill 开发

---

## 3. 核心发现：ETH Zurich 研究

### 3.1 研究设计

Gloaguen 等人使用 SWE-bench 基准测试，对比了三种场景下 AI coding agent 的任务成功率和成本：

| 场景 | 描述 |
|------|------|
| 无文件 (Baseline) | 仓库中没有任何上下文文件 |
| 自动生成 (Auto-generated) | 用 AI 自动生成的上下文文件 |
| 人工编写 (Human-written) | 开发者手动编写的上下文文件 |

### 3.2 五个关键发现

#### 发现一：自动生成文件让 AI 变笨

> 自动生成的上下文文件导致任务成功率 **下降 3%**，同时成本 **上升 20%**。

这是最反直觉的发现。你可能以为"有总比没有好"，但数据说不是。自动生成的文件充斥着冗余信息（目录结构、显而易见的框架约定），不仅没帮到 AI，反而干扰了它的判断。

**启示**：运行 `claude /init` 或其他自动生成命令后，如果不经过人工编辑就直接 commit，等于给项目加了一个负面 debuff。

#### 发现二：人工编写文件有微弱正向效果

> 人工编写的上下文文件带来 **约 +4% 的任务成功率提升**。

注意，是"微弱"——不是 20%、不是 50%。这意味着上下文文件不是魔法。它的价值在于那些 AI **真的不知道**的项目特定信息。

**启示**：每一行都应该被问一个问题——"如果不写这行，AI 会犯错吗？"如果答案是"不会"，删掉。

#### 发现三：目录概览完全冗余

> AI agent 自己就能发现文件结构。提供目录概览 **没有带来任何可测量的改善**。

AI coding agent 有 `ls`、`glob`、`find` 等工具。它们天生擅长探索代码结构。你在 CLAUDE.md 里贴一棵 50 行的目录树，不仅白占 token，而且可能和实际结构不一致（因为你忘了更新）。

**启示**：永远不要在上下文文件中写目录结构。除非某个目录的用途偏离了框架的标准约定。

#### 发现四：过度约束降低任务成功率

> 过于严格的限制性指令 **降低了 AI 完成任务的能力**。

比如 "Never create new files"、"Don't use any third-party libraries"、"Always use functional components" ——这些过于笼统的约束让 AI 在需要灵活决策时束手束脚。

**启示**：约束要具体到场景。与其 "Never create new files"，不如 "Add utilities to `lib/utils.ts` instead of creating new files"。

#### 发现五：具体工具名是变革性的

> 在上下文文件中指定具体的工具名（如 `uv` 而非 "package manager"），使 AI 正确使用该工具的概率 **提升 160 倍**。

这是整个研究中效果最显著的发现。差距不是百分之几十，是 **160 倍**。原因很简单：AI 的训练数据里 `pip` 出现的频率远高于 `uv`，不告诉它用 `uv`，它就会默认用 `pip`。

**启示**：写 `pnpm` 不写 "package manager"。写 `prisma db push` 不写 "sync database schema"。写 `vitest` 不写 "test runner"。具体性是上下文文件最大的价值。

### 3.3 一句话总结

> **Write manually, keep it short, be specific, don't over-constrain.**
>
> 手动编写、保持精简、具体明确、不要过度约束。

---

## 4. 业界实践：Boris Cherny 工作流

Boris Cherny 是 Claude Code 创始团队的成员。他公开分享了团队内部使用 Claude Code 的工作流，其中关于 CLAUDE.md 的实践尤其有参考价值。

### 4.1 团队共享的 CLAUDE.md

- **大小**：约 2,500 tokens（~60-80 行）
- **所有权**：团队共享，进入 git 版本控制
- **更新策略**："每次 Claude 犯错 → 加一条规则。当规则足够稳定后，定期精简。"

这个"犯错驱动"的策略很务实。你不需要一开始就想清楚所有规则——在实践中发现 AI 反复犯同一个错，那就加一条。当这条规则已经变成项目常识（比如所有人都知道用 `pnpm`），就可以删掉。

### 4.2 Skills = 版本化的团队知识

Boris 提到团队把频繁执行的任务封装为 Skills（检入 git），这样知识不是存在某个人脑子里，而是存在代码库里，所有 Claude 实例都能使用。

**举例**：代码 review 时，team 的 Skill 会让 Claude 生成多个 sub-agent，这些 sub-agent 互相挑战和审查对方的意见——类似一个"内部辩论"机制。

### 4.3 并行 Session 策略

- **本地**：同时运行 5 个 Claude Code 实例（不同目录/任务）
- **Web**：5-10 个 claude.ai web session 并行
- **工作流**：先用 Plan Mode 设计方案，确认后开 auto-accept 模式执行

这种并行策略的核心思路是：AI 的等待时间可以被其他 session 填充。你不需要盯着一个 session 等它完成，可以同时推进多条线。

### 4.4 核心启示

| 实践 | 启示 |
|------|------|
| CLAUDE.md 60-80 行 | 精简比全面更重要 |
| 犯错驱动更新 | 不需要一步到位，迭代比预设更有效 |
| Skills 进 git | 团队知识应该版本化 |
| 并行 session | 吞吐量比单 session 深度更重要 |

---

## 5. 渐进式披露架构（Progressive Disclosure）

这是本次调研中最重要的架构模式。

### 5.1 三层结构

```
Tier 1: CLAUDE.md（始终加载，<80 行，~2,500 tokens）
  └─ 通用规则、命令、技术栈概览
  └─ 指向 Tier 2 和 Tier 3 的指针

Tier 2: Skills（.claude/skills/*/SKILL.md，按需加载）
  └─ 任务特定的工作流和指令
  └─ 每个 Skill <500 行
  └─ 仅在 Skill 触发时加载

Tier 3: 参考文档（docs/，按需加载）
  └─ 架构设计、数据库 Schema、部署细节
  └─ Claude 只在处理相关任务时才读取
  └─ 没有大小限制（Claude 自行决定读多少）
```

### 5.2 为什么这很重要：Token 经济学

要理解渐进式披露为什么关键，需要先理解 Claude Code 的 token 消耗模型：

| 组成部分 | Token 消耗 | 备注 |
|----------|-----------|------|
| 系统 prompt + 工具定义 | ~20,000 | 每个 session 固定消耗 |
| CLAUDE.md 内容 | ~2,500 | **每轮对话都加载** |
| Skill 元数据（所有 Skill 的 name + description） | ~3,000 | 每轮加载，用于匹配 |
| 当前活跃 Skill 的完整内容 | ~5,000 | 仅在触发时加载 |
| 用户代码上下文 | 可变 | Claude 读取的文件 |

关键数字：

- **Context window**：200K tokens
- **质量下降点**：当 context 使用率达到 **20-40%** 时，AI 输出质量开始下降
- **自动压缩触发点**：context 使用率达到 **~83.5%** 时触发
- **压缩损失**：自动压缩仅保留 **~20-30%** 的原始信息（有损）

### 5.3 推演

假设你的 CLAUDE.md 有 300 行（~8,000 tokens）。在一个 50 轮的对话中：

- CLAUDE.md 总消耗：50 × 8,000 = **400,000 tokens**（远超 200K context window）
- 系统 prompt 总消耗：50 × 20,000 = **1,000,000 tokens**

当然，实际上 Claude Code 不会让 context 无限增长——它会压缩早期消息。但重点是：**CLAUDE.md 的每一行在每一轮对话中都有成本**。一行没用的信息，乘以 50 轮，就是 50 次无谓的消耗。

相比之下，`docs/architecture.md` 只在 Claude 实际需要看架构时才读取——可能在 50 轮对话中只读 1-2 次。

### 5.4 三条规则

1. **CLAUDE.md 只放"每轮都可能需要"的信息** — 技术栈、关键命令、架构约定
2. **低频但重要的信息放 docs/** — 数据库 schema、部署步骤、API 设计
3. **任务特定的流程放 Skills** — 代码 review checklist、发布流程、调试步骤

---

## 6. CLAUDE.md 编写 7 条铁律

综合 ETH Zurich 的研究数据和 Boris Cherny 的实践经验，提炼出以下 7 条规则：

### 规则 1：60-80 行上限

**为什么**：每行 CLAUDE.md 每轮对话都消耗 token。80 行 ≈ 2,500 tokens 是一个合理的平衡点。超过这个长度，要么拆到 `docs/`，要么检查是否有冗余。

**怎么做**：写完后 `wc -l CLAUDE.md`，超过 80 行就立刻重构。

### 规则 2：写具体的工具名

**为什么**：ETH 研究证明，具体工具名提升正确使用率 160 倍。

```markdown
# BAD
Use the package manager to install dependencies.
Run the test suite before committing.

# GOOD
pnpm install
vitest run
```

**心法**：如果命令可以直接复制到终端执行，就对了。如果需要人翻译一步（"test suite" → vitest），就不对。

### 规则 3：每个禁止都配一个替代

**为什么**：AI agent 需要前进的路径。只告诉它"不能做 X"，它就卡住了。

```markdown
# BAD
- Never use axios
- Don't create new utility files

# GOOD
- Use native fetch() instead of axios (no HTTP client dependency)
- Add utilities to lib/utils.ts instead of creating new files
```

### 规则 4：不写 AI 已经知道的

**为什么**：AI 的训练数据包含了绝大多数主流框架的最佳实践。写 "React components go in components/" 等于教 Claude 1+1=2。

```markdown
# BAD（删掉这些）
- Use TypeScript for all files
- Put React components in the components/ directory
- Use async/await instead of callbacks
- Use App Router for Next.js routing

# GOOD（只写偏离标准的）
- 所有 AI 调用走 lib/ai-router.ts，不要直接 import openai
- Session 在本项目中表示"一次刷题会话"，不是 HTTP session
```

### 规则 5：不写 Linter 能管的

**为什么**：ESLint、Prettier、`.editorconfig` 是确定性的——它们总是执行。CLAUDE.md 是建议性的——Claude 可能忽略（尤其在 context 压力大时）。

```markdown
# BAD（这些应该在 .eslintrc / .prettierrc 里）
- Use 2-space indentation
- Always use semicolons
- Import order: React first, then third-party, then local

# 用 hooks 代替
# .claude/settings.json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Write|Edit",
      "command": "npx prettier --write $FILE_PATH"
    }]
  }
}
```

### 规则 6：不写目录结构概览

**为什么**：ETH 研究直接证明了这一点——AI agent 自己就能发现文件结构，目录概览没有带来任何改善。而且目录概览最容易过期（加了个文件忘了更新文档）。

```markdown
# BAD（50 行目录树）
app/
  components/
    Button.tsx
    Modal.tsx
    ...

# GOOD（只提偏离标准的目录）
- lib/context/ 下放 React Context（不在 components/ 下，因为它们是状态管理不是 UI）
```

### 规则 7：映射领域术语

**为什么**：领域术语的歧义是 AI 犯错的最大来源之一。在备考系统中 `Session` 是一次练习；在 Web 框架中 `Session` 是 HTTP 会话。不说清楚，Claude 很可能搞混。

```markdown
# GOOD
- Session = 一次刷题练习会话（包含多道题），不是 HTTP session
- Attempt = 用户对一道题的一次作答记录
- Skill = listening / reading / speaking / writing 四大考试能力之一
```

---

## 7. 反模式清单

### 7.1 百科全书型 🚫

**症状**：CLAUDE.md 超过 200 行，包含目录结构、数据库 schema、API 文档、部署步骤。

**后果**：每轮对话浪费大量 token，AI 在 200K context 的前 40% 就开始质量下降。而且信息越多，真正重要的规则越容易被"淹没"。

**治疗**：拆！架构详情 → `docs/architecture.md`，数据库 → `docs/database.md`，部署 → `docs/deployment.md`。CLAUDE.md 只保留指针。

### 7.2 只禁不疏型 🚫

**症状**："Never use X"、"Don't do Y"、"Avoid Z"——满篇禁令，没有替代方案。

**后果**：AI agent 像一个被告知"不许走路、不许跑、不许爬"的人——它没有合法的前进路径，要么卡住，要么用一种你没想到的更糟糕的方式绕过去。

**治疗**：每个"不要 X"后面加"用 Y 代替"。

### 7.3 说了等于没说型 🚫

**症状**："Use TypeScript"、"Follow REST conventions"、"Write clean code"。

**后果**：这些是 AI 训练数据里出现频率最高的内容。写了不加分，反而消耗 token。

**治疗**：删掉所有"AI 不需要你教"的规则。只保留项目特定的偏离。

### 7.4 代劳 Linter 型 🚫

**症状**：在 CLAUDE.md 里写缩进规则、分号风格、引号类型、import 排序。

**后果**：CLAUDE.md 是**建议性的**（advisory）——context 压力大时 Claude 可能无视。而 ESLint/Prettier 是**确定性的**（deterministic）——它们总是执行。把确定性的事交给建议性的机制，就是在制造不确定性。

**治疗**：把格式化规则移到 `.eslintrc` + `.prettierrc`。如果需要 Claude 自动格式化，用 hooks。

### 7.5 自动生成不编辑型 🚫

**症状**：运行 `claude /init`，commit，走人。

**后果**：ETH 研究的最核心发现——自动生成的上下文文件让 AI 的任务成功率**下降 3%**。比没有文件更差。

**治疗**：自动生成只是一个**起点**，必须经过人工审查、删减、补充项目特定信息后才有价值。

---

## 8. 工具对比

### 8.1 对比表

| 特性 | CLAUDE.md | AGENTS.md | .cursorrules |
|------|-----------|-----------|-------------|
| 所属工具 | Claude Code | 跨工具标准 | Cursor IDE |
| 采用规模 | Claude 生态 | 60K+ repos (Linux Foundation) | Cursor 用户 |
| 层级支持 | 全局 + 项目 + 子目录 + CLAUDE.local.md | 仅项目根目录 | 项目根目录 (legacy) 或 `.cursor/rules/*.mdc` |
| 作用域 | 基于目录层级 | 单文件 | 基于 glob 模式 (.mdc) |
| 最佳场景 | Claude 特有功能（Skills 引用、hooks 提示） | 多工具团队的通用基线 | Cursor 特有的 tab completion hints |

### 8.2 决策框架

```
你独自使用 Claude Code？
  └─ 是 → 只用 CLAUDE.md，一个文件简单清楚
  └─ 否 → 团队里有人用 Cursor/Copilot/Gemini CLI？
           └─ 是 → AGENTS.md（通用规则） + CLAUDE.md（Claude 特有内容）
           └─ 否 → CLAUDE.md 即可
```

**关键点**：当同时使用 AGENTS.md 和 CLAUDE.md 时，在 CLAUDE.md 顶部加 `@AGENTS.md` 引用，避免信息重复。通用规则（技术栈、命令、约定）放 AGENTS.md，Claude 特定内容（Skills 触发、hooks 配置提示）放 CLAUDE.md。

---

## 9. Hooks：从建议到强制

### 9.1 Advisory vs Mandatory

CLAUDE.md 中的所有内容本质上是**建议**（advisory）。Claude 读取它、尽量遵循，但在 context 压力大的时候可能"忘记"或"忽略"某些规则。

如果你有一些规则是**绝对不能违反的**，应该使用 Hooks——它们由系统执行，不是 Claude 的"记忆"。

### 9.2 Hooks 机制

Hooks 在 `.claude/settings.json` 中配置，在特定事件发生时自动执行 shell 命令：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "npx prettier --write $FILE_PATH"
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "command": "echo $COMMAND | grep -qv 'rm -rf /' || exit 1"
      }
    ]
  }
}
```

- **PostToolUse**：在 Claude 写入/编辑文件**后**自动执行（如格式化）
- **PreToolUse**：在 Claude 执行命令**前**拦截检查（如阻止危险命令）

### 9.3 分工原则

| 放 CLAUDE.md | 放 Hooks |
|-------------|----------|
| 架构指导（"AI 调用走 ai-router.ts"） | 自动格式化（Prettier） |
| 命名约定（"Session = 刷题会话"） | 自动类型检查（TypeScript） |
| 领域知识（"userId 默认值为 default"） | 阻止危险命令 |
| 技术栈偏好（"用 pnpm 不用 npm"） | 文件大小限制 |

**经验法则**：如果一个规则的违反会导致**立即可见的问题**（格式错乱、类型报错、误删文件），用 hooks。如果违反只会导致**长期技术债务**（架构不一致、命名混乱），用 CLAUDE.md。

---

## 10. 实践验证：TCF Study 项目

### 10.1 项目背景

TCF Study 是一个个人法语 TCF Canada B2 备考系统：

- **规模**：5,628 道真题
- **技术栈**：Next.js 16 + React 19 + Tailwind CSS 4 + Prisma 7 + SQLite
- **功能**：选择题刷题、AI 解析、AI 对话辅导、学习笔记、每日复习推送

### 10.2 重构实践

按照调研结论，我对项目的 CLAUDE.md 进行了重构。

**重构前（~70 行）的问题**：

- ❌ 包含了部分目录结构描述
- ❌ 有一些 AI 已经知道的规则（如 "Use Tailwind utility classes"）
- ❌ 部分约束只有禁止没有替代方案
- ❌ 数据库约定过于详细（应该在 docs/database.md）

**重构后（55 行）**：

```markdown
# TCF Canada B2 Study System

@AGENTS.md

## Overview
Personal TCF Canada B2 exam prep. 5628 questions + AI tutoring.
Next.js 16 (App Router) + React 19 + Tailwind CSS 4 + Prisma 7 + SQLite.

## Commands
npm run dev / build / start / typecheck / lint
npm run db:push / db:import / db:studio
npm run bark:daily          # Bark push notification

## Architecture Rules
- Shared types ONLY in lib/types.ts — never define interfaces in components
- Constants ONLY in lib/constants.ts
- All AI calls go through lib/ai-router.ts — never import openai directly
- Prompts in lib/prompts.ts — never inline prompt strings in routes
- Settings via SettingsContext (lib/context/settings-context.tsx) — never localStorage
- AI models stored in AiModel DB table — never hardcode model lists

## Database Conventions
- All user-facing tables have userId String @default("default")
- Public tables (Question, CheatSheetSection, AiModel, Setting): no userId
- Session = practice quiz session, NOT HTTP session
- Attempt = one answer to one question

## Docs
- docs/architecture.md — system diagram, API routes, data flow
- docs/database.md — all models, fields, indexes
- docs/ai-routing.md — model config, provider routing
- docs/deployment.md — VPS setup, Bark cron, backup
```

### 10.3 重构前后对比

| 维度 | 重构前 | 重构后 |
|------|--------|--------|
| 行数 | ~70 行 | 55 行 |
| 目录结构 | 有（~15 行） | 无 |
| 显而易见的规则 | 3-4 条 | 0 |
| "禁止"无替代方案 | 2 处 | 0 |
| 领域术语映射 | 无 | Session、Attempt |
| docs/ 引用 | 有 | 有 |

### 10.4 配套文档

重构后的信息去哪里了？拆分到了 4 个 docs/ 文件：

| 文件 | 内容 | 大小 |
|------|------|------|
| `docs/architecture.md` | 系统架构图、目录结构、数据流、页面状态 | ~180 行 |
| `docs/database.md` | 所有 Model、字段、索引、关系图、userId 模式 | ~185 行 |
| `docs/ai-routing.md` | AI 多模型路由、Provider 配置、函数签名 | ~100 行 |
| `docs/deployment.md` | VPS 部署步骤、Nginx、HTTPS、Bark cron、备份 | ~125 行 |

这些文件的总量约 590 行，但 Claude 只在需要时才读取。比如修改数据库时读 `database.md`，部署时读 `deployment.md`。不像 CLAUDE.md 那样每轮都加载。

---

## 11. 可复用产出：project-init Skill

### 11.1 什么是 Skill

Claude Code 的 Skills 是一种可复用的指令集，存放在 `.claude/skills/` 目录下。每个 Skill 包含：

- **SKILL.md**：带 YAML frontmatter（name + description，用于触发匹配）和 markdown body（具体指令）
- **references/**（可选）：深度参考文档
- **scripts/**（可选）：辅助脚本

Skills 支持全局安装（`~/.claude/skills/`，所有项目可用）和项目级安装（`.claude/skills/`，仅当前项目）。

### 11.2 project-init Skill

基于本次调研，我开发了一个全局 Skill `project-init`，安装在 `~/.claude/skills/project-init/`。

**触发方式**：说 "init project"、"新项目"、"初始化项目" 或执行 `/project-init`。

**5 阶段流程**：

```
Phase 1: 收集信息
  → 项目类型、技术栈、数据库、部署方式、团队情况

Phase 2: 生成 CLAUDE.md
  → 按 WHAT/WHY/HOW 组织，遵循 7 条铁律，60-80 行

Phase 3: 生成 docs/ 骨架
  → architecture.md（必须）、database.md / deployment.md（按需）

Phase 4: 生成 AGENTS.md（可选）
  → 仅当团队使用多个 AI 工具时

Phase 5: 配置建议
  → Hooks、.gitignore、CLAUDE.local.md
```

**文件结构**：

```
~/.claude/skills/project-init/
├── SKILL.md                      # 主文件：5 阶段流程 + 7 条规则
└── references/
    └── claude-md-guide.md        # 深度参考：研究发现 + 反模式 + 示例
```

---

## 12. 结论与建议

### 12.1 三条核心原则

经过学术研究、业界实践和项目验证，AI 项目文档的最佳实践可以浓缩为三条：

1. **少即是多**：60-80 行 CLAUDE.md + 按需加载的 docs/，优于 300 行的巨型文件。研究证明信息过载会降低 AI 性能。

2. **只写 AI 不知道的**：项目特定的约定、领域术语映射、具体工具名——这些是上下文文件的真正价值。框架常识、编码风格让 linter 和 AI 的训练数据去处理。

3. **渐进式披露**：CLAUDE.md（每轮加载）→ Skills（按需加载）→ docs/（深度参考）。信息的加载频率应该匹配其使用频率。

### 12.2 推荐流程

新项目启动时：

```
1. 写 CLAUDE.md（<80 行）
   - 技术栈 + 版本
   - 关键命令（可复制粘贴）
   - 架构约定（只写 AI 不知道的）
   - 领域术语映射
   - docs/ 引用

2. 创建 docs/ 骨架
   - architecture.md（必须）
   - database.md（如有数据库）
   - deployment.md（如需部署）

3. 配置 hooks（如需强制规则）
   - PostToolUse: auto-format
   - PreToolUse: 安全检查

4. 迭代优化
   - Claude 犯了错？加规则
   - 规则稳定了？精简
   - 定期审计：wc -l CLAUDE.md
```

### 12.3 未来展望

- **跨工具标准化**：AGENTS.md 的 60K+ repos 采用量预示着项目上下文文件会成为标配。未来可能出现类似 `.editorconfig` 的统一标准。
- **更智能的加载策略**：目前 Claude Code 的 Skills 需要人工设计 trigger 条件。未来可能实现基于任务自动匹配和加载最相关的上下文。
- **Token 效率优化**：随着 context window 从 200K 向 1M+ 发展，token 压力会缓解，但"信噪比"仍然是核心问题。更大的窗口不等于更好的效果——精简、相关的上下文始终优于庞杂的信息。

---

## 13. 参考文献

1. Gloaguen, T. et al. (2026). *Evaluating AGENTS.md: Are Repository-Level Context Files Helpful for Coding Agents?* arXiv:2602.11988. ETH Zurich. — 首次用实验数据评估项目上下文文件对 AI coding agent 的效果。

2. Cherny, B. (2026). *How Boris Uses Claude Code*. https://howborisusesclaudecode.com — Claude Code 创始团队成员分享的实战工作流。

3. Anthropic. (2026). *Claude Code Documentation*. https://docs.anthropic.com/en/docs/claude-code — CLAUDE.md、Skills、Hooks 的官方技术文档。

4. Linux Foundation. (2025-2026). *AGENTS.md Specification*. — 跨工具项目上下文文件的行业标准。

5. Cursor. (2025-2026). *.cursorrules / .cursor/rules/ Documentation*. — Cursor IDE 的项目规则系统文档。

---

> **致谢**：本文的调研和写作全程使用 Claude Code (Claude Opus 4.6) 完成，包括论文查找、信息整合、代码实践和文档撰写。项目实践部分基于 TCF Study 法语备考系统。
