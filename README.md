# Claude Code Conversations for DeepSeek Harness

> Unreleased adaptation: this branch targets DSH `0.1.2-alpha.2`. npm versions and tags are unchanged; installation examples for published releases do not establish compatibility with the new DSH. See [compatibility notes](docs/dsh-0.1.2-alpha.2.md).

[![npm version](https://img.shields.io/npm/v/relay-dsh-plugin-claude?label=npm)](https://www.npmjs.com/package/relay-dsh-plugin-claude)
[![CI](https://github.com/yangbobo2021/relay-dsh-plugin-claude/actions/workflows/ci.yml/badge.svg)](https://github.com/yangbobo2021/relay-dsh-plugin-claude/actions/workflows/ci.yml)
[![npm downloads](https://img.shields.io/npm/dm/relay-dsh-plugin-claude?label=downloads)](https://www.npmjs.com/package/relay-dsh-plugin-claude)
[![GitHub stars](https://img.shields.io/github/stars/yangbobo2021/relay-dsh-plugin-claude?style=flat)](https://github.com/yangbobo2021/relay-dsh-plugin-claude/stargazers)
[![MIT license](https://img.shields.io/github/license/yangbobo2021/relay-dsh-plugin-claude)](LICENSE)
[![DSH compatibility](https://img.shields.io/badge/DSH-0.1.1--rc.2-2f7d68)](https://github.com/deepseek-ai/deepseek-harness)
[![npm provenance](https://img.shields.io/badge/npm_provenance-verified-2f9e44)](https://www.npmjs.com/package/relay-dsh-plugin-claude/v/0.1.5)

English | [中文](README.zh.md)

**npm package:** [`relay-dsh-plugin-claude`](https://www.npmjs.com/package/relay-dsh-plugin-claude)
· [All Relay DSH plugins](https://github.com/yangbobo2021/Relay/blob/codex/relay-foundation/docs/dsh-plugins.md)

**Run Claude Code inside official DeepSeek Harness without switching interfaces
or maintaining a DSH fork.**

`relay-dsh-plugin-claude` adds **Claude Code as a native conversation backend**
to the official [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)
(DSH) Web UI. You keep DSH's workspace, conversation history, composer,
approvals, questions, and tool display while each DSH Session continues one
Claude Agent SDK session. The plugin installs independently; no Relay checkout
is required.

## Try It on Official DSH

Complete normal Claude Code authentication with `claude` before the first
Session. The install requires Node.js 22.13 or newer and `pnpm` on `PATH`. Then
stop DSH Web, install the tested release candidate, and restart DSH:

```bash
npx @deepseek-ai/dsh@0.1.1-rc.2 plugin --profile web add relay-dsh-plugin-claude@next
npx @deepseek-ai/dsh@0.1.1-rc.2 web
```

Open **New Session**, select a workspace, choose **Claude Code** from the mode
menu, and send a message.

![Codex and Claude Code in the DSH New Session mode menu](docs/images/dsh-new-session-backends.jpg)

The screenshot was captured from official DSH `0.1.1-rc.2` with the Codex and
Claude plugins installed. If you install only this plugin, only **Claude Code**
is added.

[Review all Relay DSH plugins](https://github.com/yangbobo2021/Relay/blob/codex/relay-foundation/docs/dsh-plugins.md)
· [report an install result](https://github.com/yangbobo2021/relay-dsh-plugin-claude/issues)

If this removes an interface switch from your DSH workflow,
[star this plugin](https://github.com/yangbobo2021/relay-dsh-plugin-claude).
That signal helps other DSH users find a tested Claude Code backend.

## Do I Need This Plugin?

Install it when you want to:

- use Claude Code inside DSH instead of switching to a separate Claude Code
  interface;
- keep DSH's native conversation history, composer, approvals, questions, and
  tool presentation;
- let one DSH Session continue the same Claude Agent SDK session across turns;
- use Claude models, reasoning, interruption, and DSH-contributed tools in the
  same conversation.

You do not need it to use DSH's standard agents. It also does not add Relay
Events, file browsing, or a terminal panel. Those are separate optional plugins.

## Complete Setup and Compatibility

The steps below were validated with:

- DeepSeek Harness `0.1.1-rc.2`, commit
  [`b150a551`](https://github.com/deepseek-ai/deepseek-harness/commit/b150a551b8d465e31e418e1b2eaf5e79bbb7d28e)
- Node.js 22.13 or newer
- `pnpm` available on `PATH`

DSH is currently a developer preview and may introduce compatibility-breaking
changes. This repository tracks official releases and records its tested version
here.

### 1. Prepare Claude Code authentication

The Claude Agent SDK is installed as a normal dependency of this plugin. Before
starting your first DSH Claude session, complete normal local Claude Code setup
and authentication for the user that will run DSH.

Follow the official [Claude Code setup documentation](https://code.claude.com/docs/en/setup),
then start Claude Code once to verify that authentication succeeds:

```bash
claude
```

Credentials stay under Claude Code's normal local authentication mechanism; this
plugin does not collect them.

### 2. Choose a package source and install

Stop a running DSH Web process before changing Profile bundles. Choose one of
the following sources.

#### Stable npm release

The published npm package name is
[`relay-dsh-plugin-claude`](https://www.npmjs.com/package/relay-dsh-plugin-claude).
Use `@latest` to install the current stable release:

```bash
npx @deepseek-ai/dsh@0.1.1-rc.2 plugin --profile web add relay-dsh-plugin-claude@latest
```

At the time of writing, `latest` resolves to stable version `0.1.5`. The linked
npm page is the source of truth for the current version.

#### npm prerelease (recommended during DSH preview)

Use `@next` to try the newest release candidate that has passed the repository's
CI publishing and official DSH compatibility checks. The current candidate also
contains the latest model-selection synchronization fix:

```bash
npx @deepseek-ai/dsh@0.1.1-rc.2 plugin --profile web add relay-dsh-plugin-claude@next
```

At the time of writing, `next` resolves to `0.1.5`.

#### GitHub development build

Install the current `main` branch when testing an unreleased change:

```bash
npx @deepseek-ai/dsh@0.1.1-rc.2 plugin --profile web add github:yangbobo2021/relay-dsh-plugin-claude#main
```

`main` can change at any time. For a reproducible GitHub install, pin a Tag or
full Commit SHA instead. For example:

```bash
npx @deepseek-ai/dsh@0.1.1-rc.2 plugin --profile web add github:yangbobo2021/relay-dsh-plugin-claude#v0.1.5
```

The official DSH CLI initializes the `web` Profile if it does not exist, asks
`pnpm` to install the selected package and Claude Agent SDK dependencies, and
adds the plugin's bundle layer. No Relay checkout is required. The first
installation can take longer while platform-specific Claude Agent SDK packages
are downloaded; wait for pnpm's final `Done` message or an explicit error. If
you already installed the `dsh` command, replace the
`npx @deepseek-ai/dsh@0.1.1-rc.2` prefix with `dsh` in any command above.

### 3. Start or restart DSH Web

```bash
npx @deepseek-ai/dsh@0.1.1-rc.2 web
```

If you use an installed command, run `dsh web` instead. Bundle membership is read
at startup, so restarting after installation, update, or removal is required.

### 4. Start a Claude Code conversation

1. Open the DSH URL printed in the terminal. The default is
   `http://127.0.0.1:3080`.
2. On first launch, read the DSH testing notice and select **Continue**.
3. Select **Add workspace** in the left sidebar and choose the project directory
   Claude may work in.
4. Select **New Session**.
5. Open the mode menu labeled **Standard mode** and choose **Claude Code**.
6. Enter a message and send it. Choose the backend before the first message;
   existing sessions keep the backend with which they were created.

There is no separate activation command. A successful install plus a DSH restart
activates the bundle and registers the managed **Claude Code** mode automatically.

### 5. Import an existing Claude terminal Session

1. Select **Import sessions...** below the Workspace list, then choose **Import
   from Claude**.
2. In the dialog, confirm or change the visible **Target Workspace**, then select
   **Scan Sessions**. The current Session owner or recent Workspace is only the
   initial selection; scanning never starts before this confirmation.
3. Review the full Session IDs, titles, source paths, activity times, and import
   status. Select one, several, or all Sessions.
4. Select **Import selected**, then open the imported DSH Session.
5. Send the next message and confirm that it continues the same native Claude
   Session.

The selector uses the Claude Agent SDK's public Session APIs and matches the
terminal `/resume` scope. It excludes worktrees, SDK/headless Sessions,
already-bound Sessions, and Sessions outside the explicitly selected Workspace.
The imported history is a one-time presentation snapshot of user text, visible
assistant text and thinking, and completed textual tool activity. Unknown or
private blocks are skipped; Claude's source transcript is never modified.

The SDK inventory does not expose a durable running/idle status. Avoid writing
the same Session from another Claude client while continuing it in DSH. If
resume fails, DSH keeps the exact imported binding for retry and never silently
creates a replacement Session. Import is unavailable with the CLI fallback.
See
[`docs/spec/claude-native-session-import.md`](docs/spec/claude-native-session-import.md)
for the complete contract and delivery cases.

## What Works

- One persistent Claude Agent SDK session per DSH Session
- Model and reasoning selection
- Streaming answers and tool activity in the native DSH conversation
- Image-and-text prompts through the default Claude Agent SDK backend
- Durable in-conversation previews for workspace images referenced by Claude's
  final answer
- DSH approval and user-question flows
- Interruption and session continuation
- Selective import and exact-ID continuation of existing Claude terminal Sessions
- Generic DSH tools exposed through an in-process Claude SDK MCP server
- Dedicated native Claude `Glob` and `Grep` search tools on every SDK query
- Pre-persistence redaction of sensitive environment values from tool output

### Sensitive environment output

Before each new or resumed SDK turn, the plugin resolves Claude's effective
environment and classifies credential-bearing variable names such as `SECRET`,
`TOKEN`, `PASSWORD`, and `API_KEY`. Exact occurrences of those values in tool
results are replaced before the result reaches Claude, DSH activity, or the
native Claude JSONL transcript. Variables explicitly listed in Claude sandbox
credential settings are protected as well. Ordinary environment values and
successful tool outputs without a match are left unchanged.

This protection covers successful tool results; it does not rewrite user
prompts, tool inputs, arbitrary values that are not identifiable from host
configuration, or SDK execution failures without a replaceable tool output.
See
[`docs/spec/claude-tool-output-redaction.md`](docs/spec/claude-tool-output-redaction.md)
for the complete contract and acceptance cases.

### Explicit local Claude plugins

Trusted Host configuration can load an uninstalled local Claude plugin into
business conversations by setting `claudePlugins` on this DSH plugin:

```yaml
config:
  claudePlugins:
    - type: local
      path: /absolute/path/to/plugin
```

The order and optional `skipMcpDiscovery` Boolean are forwarded to every new and
resumed Claude Agent SDK query. Hidden title-generation Sessions use no local
plugins. A non-empty list is rejected when the CLI fallback is active because
the CLI backend cannot honor this SDK option. Local plugins execute as the DSH
user, so configure only reviewed paths. See
[`docs/spec/claude-local-plugins.md`](docs/spec/claude-local-plugins.md) for the
full contract and acceptance cases.

Tools execute through the owning Agent's DSH tool runtime and remain subject to
DSH permissions and Claude approval behavior. The tool bridge requires the
default SDK backend. If a developer explicitly selects the CLI fallback, the
plugin refuses contributed DSH tools and image input instead of silently
dropping them.

When Claude's successful final answer references a PNG, JPG, WebP, GIF, or SVG
in the Session workspace, the plugin snapshots that completed file into DSH's
attachment store and emits a standard assistant image block. SVG input is
rendered once, in memory, to a constrained PNG before it enters DSH; no sibling
PNG is created in the workspace, and external resources or scripts are not
loaded. Conversation
history uses the immutable attachment, so later edits or deletion of the source
file do not change the image already shown in the message. Remote URLs and paths
outside the Session workspace are never imported.

## Plugin Boundary and Relay

This repository was designed and compatibility-tested in
[Relay](https://github.com/yangbobo2021/Relay), an open-source project for
long-running agent work, external-event delivery, reusable DSH workbench views,
and multiple conversation backends.

The plugin is independently installable. Its only Relay package dependency is
the provider-neutral session import hub, which the package manager installs
automatically. It has no runtime dependency on the Relay application, Relay
Events, or another feature plugin. It does not replace the official DSH layout
or install Files and Terminal views. This separation lets a user install only
Claude while the broader Relay project can compose Codex, Claude, events, waits,
monitors, and workbench extensions when those capabilities are needed.

Explore or star Relay to follow that broader work:
<https://github.com/yangbobo2021/Relay>.

## Update, Inspect, or Remove

Stop DSH Web before changing the bundle, then restart it afterward.

```bash
# Show why the plugin is installed
dsh plugin --profile web why relay-dsh-plugin-claude

# Update the npm dependency
dsh plugin --profile web update relay-dsh-plugin-claude

# Remove it
dsh plugin --profile web remove relay-dsh-plugin-claude
```

Use the `npx @deepseek-ai/dsh@0.1.1-rc.2` prefix instead of `dsh` when you do not
have a persistent DSH command.

## Troubleshooting

### Claude Code is missing from the mode menu

Restart DSH Web. Then run `dsh plugin --profile web why
relay-dsh-plugin-claude`. If pnpm cannot find the package, repeat the npm
installation command and read its final error.

### The first message reports an authentication error

Start `claude` in the same user environment that starts DSH and complete normal
Claude Code authentication. Restart DSH afterward.

### The composer is disabled

DSH requires a workspace before starting a coding conversation. Select **Add
workspace**, choose a directory, and return to **New Session**.

### Installation says pnpm is missing

Install pnpm using its [official installation guide](https://pnpm.io/installation)
and confirm `pnpm --version` works in the same terminal.

### DSH changed and the plugin no longer starts

DSH is a developer preview. Include the output of `dsh --version`, the plugin
source revision, and the startup error in a
[GitHub issue](https://github.com/yangbobo2021/relay-dsh-plugin-claude/issues).

## Development

```bash
git clone https://github.com/yangbobo2021/relay-dsh-plugin-claude.git
cd relay-dsh-plugin-claude
npm install
DSH_ROOT=/path/to/deepseek-harness npm run verify
npm pack
```

`npm run verify` runs type checking, tests, and the production build. Boundary
tests reject accidental runtime dependencies on Relay or another feature plugin.

## Feedback

Report bugs and feature requests in this repository's
[issue tracker](https://github.com/yangbobo2021/relay-dsh-plugin-claude/issues).
