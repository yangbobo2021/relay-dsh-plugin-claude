# 在 DeepSeek Harness 中使用 Claude Code 对话

[![npm 版本](https://img.shields.io/npm/v/relay-dsh-plugin-claude?label=npm)](https://www.npmjs.com/package/relay-dsh-plugin-claude)
[![CI](https://github.com/yangbobo2021/relay-dsh-plugin-claude/actions/workflows/ci.yml/badge.svg)](https://github.com/yangbobo2021/relay-dsh-plugin-claude/actions/workflows/ci.yml)
[![npm 月下载量](https://img.shields.io/npm/dm/relay-dsh-plugin-claude?label=downloads)](https://www.npmjs.com/package/relay-dsh-plugin-claude)
[![GitHub Stars](https://img.shields.io/github/stars/yangbobo2021/relay-dsh-plugin-claude?style=flat)](https://github.com/yangbobo2021/relay-dsh-plugin-claude/stargazers)
[![MIT 许可证](https://img.shields.io/github/license/yangbobo2021/relay-dsh-plugin-claude)](LICENSE)
[![DSH 兼容版本](https://img.shields.io/badge/DSH-0.1.1--rc.2-2f7d68)](https://github.com/deepseek-ai/deepseek-harness)
[![npm 来源证明](https://img.shields.io/badge/npm_provenance-verified-2f9e44)](https://www.npmjs.com/package/relay-dsh-plugin-claude/v/0.1.5)

[English](README.md) | 中文

**npm 包名：** [`relay-dsh-plugin-claude`](https://www.npmjs.com/package/relay-dsh-plugin-claude)
· [全部 Relay DSH 插件](https://github.com/yangbobo2021/Relay/blob/codex/relay-foundation/docs/dsh-plugins.zh.md)

**无需切换界面或维护 DSH Fork，直接在官方 DeepSeek Harness 中运行 Claude
Code。**

`relay-dsh-plugin-claude` 为官方
[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）Web
界面增加原生 **Claude Code 对话后端**。你可以继续使用 DSH 的工作区、对话
历史、输入框、审批、提问和工具展示；每个 DSH Session 会持续绑定一个 Claude
Agent SDK Session。本插件可独立安装，不需要下载 Relay 仓库。

## 在官方 DSH 中立即试用

首次创建 Session 前，请先运行 `claude` 完成 Claude Code 的正常认证。安装
要求 Node.js 22.13 或更高版本，并且 `pnpm` 已加入 `PATH`。然后停止 DSH Web，
安装经过测试的候选版本并重新启动：

```bash
npx @deepseek-ai/dsh@0.1.1-rc.2 plugin --profile web add relay-dsh-plugin-claude@next
npx @deepseek-ai/dsh@0.1.1-rc.2 web
```

打开 **New Session**，选择工作区，再从模式菜单中选择 **Claude Code** 并发送
消息。

![DSH 新建会话菜单中的 Codex 和 Claude Code](docs/images/dsh-new-session-backends.jpg)

上图来自安装了 Codex 和 Claude 插件的官方 DSH `0.1.1-rc.2`。如果只安装
本插件，菜单中只会新增 **Claude Code**。

[查看全部 Relay DSH 插件](https://github.com/yangbobo2021/Relay/blob/codex/relay-foundation/docs/dsh-plugins.zh.md)
· [反馈安装结果](https://github.com/yangbobo2021/relay-dsh-plugin-claude/issues)

如果它能让你少切换一个界面，欢迎
[Star 本插件](https://github.com/yangbobo2021/relay-dsh-plugin-claude)。
这些真实信号能帮助更多 DSH 用户找到经过验证的 Claude Code 后端。

## 什么情况下需要这个插件？

以下情况适合安装：

- 希望直接在 DSH 中使用 Claude Code，而不必切换到单独的 Claude Code
  界面；
- 希望保留 DSH 原生的对话历史、输入框、审批、提问和工具展示；
- 希望一个 DSH Session 在多轮对话中持续使用同一个 Claude Agent SDK
  Session；
- 希望在同一对话中使用 Claude 模型、reasoning、中断以及 DSH 插件贡献的
  工具。

使用 DSH 标准 Agent 不需要安装本插件。本插件也不提供 Relay Events、文件
浏览和终端面板，这些能力由其他可选插件提供。

## 完整安装与兼容性说明

以下步骤已经在这些版本上实际验证：

- DeepSeek Harness `0.1.1-rc.2`，commit
  [`b150a551`](https://github.com/deepseek-ai/deepseek-harness/commit/b150a551b8d465e31e418e1b2eaf5e79bbb7d28e)
- Node.js 22.13 或更高版本
- `pnpm` 已加入 `PATH`

DSH 当前仍是开发者预览版本，可能发生不兼容修改。本仓库会跟进官方版本，
并在这里记录已经验证的版本。

### 1. 准备 Claude Code 认证

Claude Agent SDK 会作为本插件的普通依赖一起安装。首次创建 DSH Claude
会话前，请为运行 DSH 的用户完成 Claude Code 的本地配置和认证。

按照官方 [Claude Code 安装说明](https://code.claude.com/docs/en/setup)完成
设置，然后启动一次 Claude Code，确认认证成功：

```bash
claude
```

认证信息仍由 Claude Code 原有的本地机制管理，本插件不会收集认证信息。

### 2. 选择安装来源并安装

修改 Profile 插件前，请先停止正在运行的 DSH Web，然后从以下来源中选择
一种。

#### npm 正式版

本插件发布到 npm 的正式包名是
[`relay-dsh-plugin-claude`](https://www.npmjs.com/package/relay-dsh-plugin-claude)。
使用 `@latest` 安装当前稳定版本：

```bash
npx @deepseek-ai/dsh@0.1.1-rc.2 plugin --profile web add relay-dsh-plugin-claude@latest
```

本文更新时，`latest` 指向稳定版 `0.1.5`。最新版本请以链接中的 npm 页面
为准。

#### npm 预发布版（DSH 预览阶段推荐）

使用 `@next` 安装已经通过本仓库 CI 发布流程和官方 DSH 兼容性测试的最新
候选版本。当前候选版本还包含最新的模型选择同步修复：

```bash
npx @deepseek-ai/dsh@0.1.1-rc.2 plugin --profile web add relay-dsh-plugin-claude@next
```

本文更新时，`next` 指向 `0.1.5`。

#### GitHub 开发版

如需测试尚未发布的修改，可以直接安装当前 `main` 分支：

```bash
npx @deepseek-ai/dsh@0.1.1-rc.2 plugin --profile web add github:yangbobo2021/relay-dsh-plugin-claude#main
```

`main` 会持续变化。如需可复现的 GitHub 安装，请固定 Tag 或完整 Commit
SHA。例如：

```bash
npx @deepseek-ai/dsh@0.1.1-rc.2 plugin --profile web add github:yangbobo2021/relay-dsh-plugin-claude#v0.1.5
```

官方 DSH CLI 会在需要时初始化 `web` Profile，通过 `pnpm` 安装所选软件包和
Claude Agent SDK 依赖，并将插件加入 Bundle 配置。用户不需要下载 Relay
仓库。首次安装还会下载 Claude Agent SDK 的平台相关软件包，可能需要更长
时间；请等待 pnpm 最终显示 `Done` 或明确错误。如果已经安装了持久可用的
`dsh` 命令，可以将上述任一命令开头的
`npx @deepseek-ai/dsh@0.1.1-rc.2` 替换为 `dsh`。

### 3. 启动或重启 DSH Web

```bash
npx @deepseek-ai/dsh@0.1.1-rc.2 web
```

如果使用已经安装的命令，则执行 `dsh web`。DSH 只在启动时读取 Bundle
成员，因此安装、更新或删除插件后必须重启。

### 4. 新建 Claude Code 对话

1. 打开终端中显示的 DSH 地址，默认是 `http://127.0.0.1:3080`。
2. 首次启动时阅读 DSH 测试提示，然后点击 **Continue**。
3. 点击左侧栏的 **Add workspace**，选择允许 Claude 操作的项目目录。
4. 点击 **New Session**。
5. 打开当前显示为 **Standard mode** 的模式菜单，选择 **Claude Code**。
6. 输入消息并发送。请在发送第一条消息前选择后端；已有会话会继续使用创建
   时选择的后端。

插件不需要单独的激活命令。安装成功并重启 DSH 后，Bundle 会自动激活，
并注册由插件管理的 **Claude Code** 模式。

### 5. 导入已有的 Claude 终端会话

1. 点击工作区列表下方的 **导入会话...**，然后选择 **从 Claude 导入**。
2. 在弹窗中确认或切换可见的 **目标 Workspace**，然后点击 **扫描会话**。
   当前 Session 所属 Workspace 或最近 Workspace 只作为初始选项；确认前不会开始扫描。
3. 检查完整 Session ID、标题、源路径、活动时间和导入状态，然后选择一个、
   多个或全部会话。
4. 点击 **导入所选会话**，再打开导入后的 DSH Session。
5. 发送下一条消息，确认它继续的是同一个原生 Claude Session。

选择器只使用 Claude Agent SDK 的公开 Session API，其范围与终端 `/resume`
一致。它会排除 worktree、SDK/headless、已经绑定以及不属于用户所选精确工作区
的 Session。导入历史是一次性的展示快照，包含用户文本、可见的助手文本与
thinking，以及已有结果的文本工具活动。未知或私有块会被跳过，Claude 源转录
不会被修改。

SDK 列表不提供持久的 running/idle 状态。通过 DSH 继续会话时，应避免另一个
Claude 客户端同时写入同一个 Session。如果恢复失败，DSH 会保留原始绑定供
重试，绝不会静默创建替代 Session。CLI fallback 不支持导入。完整契约和交付
用例见
[`docs/spec/claude-native-session-import.md`](docs/spec/claude-native-session-import.md)。

## 支持的能力

- 每个 DSH Session 持续绑定一个 Claude Agent SDK Session
- 模型和 reasoning 选择
- 在 DSH 原生对话中流式显示回答和工具活动
- 通过默认 Claude Agent SDK 后端发送图片与文字组合输入
- 在对话中持久展示 Claude 最终回答所引用的工作区图片
- DSH 原生审批和用户提问流程
- 中断和会话延续
- 选择性导入已有 Claude 终端会话，并通过原始 ID 继续
- 通过进程内 Claude SDK MCP Server 提供通用 DSH 工具
- 在每次 SDK 查询中启用 Claude 原生 `Glob` 与 `Grep` 专用搜索工具
- 在工具结果持久化前脱敏其中的敏感环境变量值

### 敏感环境变量输出脱敏

每次新建或恢复 SDK turn 前，插件都会解析 Claude 的有效环境，并识别变量名中
含有 `SECRET`、`TOKEN`、`PASSWORD`、`API_KEY` 等凭据特征的值。工具结果中
与这些值完全相同的内容，会在进入 Claude、DSH activity 或 Claude 原生 JSONL
转录之前替换。Claude sandbox 凭据设置中显式列出的环境变量也会受到保护。
普通环境值及没有命中的成功工具输出保持不变。

该保护仅覆盖成功工具结果，不会改写用户消息、工具输入、无法从 Host 配置
识别的任意内容，或 SDK 未提供可替换输出的执行失败。完整契约与验收用例见
[`docs/spec/claude-tool-output-redaction.md`](docs/spec/claude-tool-output-redaction.md)。

### 显式加载本地 Claude 插件

可信的 Host 配置可以通过本 DSH 插件的 `claudePlugins` 字段，将未安装的
本地 Claude 插件加载到业务对话中：

```yaml
config:
  claudePlugins:
    - type: local
      path: /absolute/path/to/plugin
```

插件顺序和可选的 Boolean 字段 `skipMcpDiscovery` 会传递给每次新建及恢复的
Claude Agent SDK 查询。标题生成等隐藏辅助 Session 不加载这些插件。CLI
fallback 无法实现该 SDK 能力，因此非空列表会被明确拒绝。因为本地插件以
DSH 用户身份运行，只应配置经过审查的路径。完整契约和验收用例见
[`docs/spec/claude-local-plugins.md`](docs/spec/claude-local-plugins.md)。

工具通过当前 Agent 的 DSH 工具运行时执行，并继续受到 DSH 权限和 Claude
审批机制约束。工具桥接依赖默认 SDK 后端。如果开发者明确选择 CLI fallback，
插件会拒绝 DSH 贡献工具和图片输入，而不是静默丢弃它们。

Claude 成功完成回答后，如果最终回答引用了当前 Session 工作区内的 PNG、
JPG、WebP、GIF 或 SVG，插件会立即把完成后的文件快照保存到 DSH 附件库，
并输出标准 assistant 图片块。SVG 会在内存中经过安全限制后一次性转换为
PNG；工作区中不会产生同名 PNG，也不会加载外部资源或执行脚本。历史消息只
读取不可变附件，因此源文件之后被修改或删除，也不会改变消息中已经展示的
图片。远程 URL 和工作区外路径不会被导入。

## 插件边界及与 Relay 的关系

本仓库在 [Relay](https://github.com/yangbobo2021/Relay) 项目中完成设计与
兼容性验证。Relay 是面向长时间运行 Agent、外部事件投递、可复用 DSH
工作台视图和多种对话后端的开源项目。

本插件可以独立安装。唯一依赖的 Relay 包是由包管理器自动安装的中立“会话
导入中心”；运行时不依赖 Relay 应用、Relay Events 或其他功能插件，也不会
替换 DSH 官方布局或安装 Files、Terminal 视图。用户可以只安装 Claude；需要
时，Relay 项目则可以进一步组合 Codex、Claude、事件、Wait、Monitor 和工作台
扩展。

可以访问或 Star Relay 仓库，关注这些更完整的工作：
<https://github.com/yangbobo2021/Relay>。

## 更新、检查或删除

修改 Bundle 前先停止 DSH Web，完成后重新启动。

```bash
# 检查插件为何被安装
dsh plugin --profile web why relay-dsh-plugin-claude

# 更新 npm 依赖
dsh plugin --profile web update relay-dsh-plugin-claude

# 删除插件
dsh plugin --profile web remove relay-dsh-plugin-claude
```

如果没有持久安装 `dsh` 命令，请将命令开头的 `dsh` 替换为
`npx @deepseek-ai/dsh@0.1.1-rc.2`。

## 常见问题

### 模式菜单中没有 Claude Code

先重启 DSH Web，再执行 `dsh plugin --profile web why
relay-dsh-plugin-claude`。如果 pnpm 找不到插件，请重新执行 npm 安装命令，
并查看最后显示的错误。

### 第一条消息提示认证失败

在启动 DSH 的同一用户环境中运行 `claude`，完成正常的 Claude Code 认证，
然后重启 DSH。

### 输入框不可用

DSH 在开始编码对话前必须选择工作区。点击 **Add workspace**，选择一个目录，
然后返回 **New Session**。

### 安装时提示找不到 pnpm

按照 pnpm 的[官方安装说明](https://pnpm.io/installation)安装，并在同一个
终端中确认 `pnpm --version` 可以执行。

### DSH 更新后插件无法启动

DSH 仍是开发者预览版本。请在
[GitHub Issue](https://github.com/yangbobo2021/relay-dsh-plugin-claude/issues)
中附上 `dsh --version` 输出、插件源码版本和启动错误。

## 开发验证

```bash
git clone https://github.com/yangbobo2021/relay-dsh-plugin-claude.git
cd relay-dsh-plugin-claude
npm install
DSH_ROOT=/path/to/deepseek-harness npm run verify
npm pack
```

`npm run verify` 会执行类型检查、测试和生产构建。边界测试仅允许中立的会话
导入中心依赖，并会阻止插件意外增加对 Relay 应用或其他功能插件的运行时依赖。

## 反馈

请通过本仓库的
[Issue Tracker](https://github.com/yangbobo2021/relay-dsh-plugin-claude/issues)
报告错误或提出功能建议。
