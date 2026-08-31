# Claude Code Atomic Requirements

This is the Claude-only capability catalog. Each row must be implemented as one or
more independent cases under `validation/migration-compatibility/cases/`.

`State` describes specification readiness, not current product support.

## Conversation and presentation

| ID | Priority | Atomic capability | Minimum observable | State |
| --- | --- | --- | --- | --- |
| CLD-TXT-001 | P0 | Plain text turn | One non-duplicated terminal answer | verified |
| CLD-TXT-002 | P0 | Chinese and Unicode | Exact marker survives round trip | verified |
| CLD-TXT-003 | P0 | Markdown and code blocks | Structure and whitespace remain readable | verified |
| CLD-TXT-004 | P0 | Incremental streaming | Output appears before turn completion | verified |
| CLD-TXT-005 | P1 | Thinking presentation | Thinking and final answer are distinct and non-duplicated | verified |
| CLD-TXT-006 | P0 | Multi-turn context | Second turn recalls a random first-turn marker | verified |
| CLD-TXT-007 | P0 | Stop generation | Turn stops and emits no requested terminal marker | verified |
| CLD-TXT-008 | P0 | Model selection | Agent SDK uses the model selected in DSH | verified |
| CLD-TXT-009 | P0 | Effort selection | Agent SDK receives the selected effort | verified |
| CLD-TXT-010 | P1 | Auxiliary title isolation | Title generation does not enter the business Session | verified |

## Multimodal input and artifacts

| ID | Priority | Atomic capability | Minimum observable | State |
| --- | --- | --- | --- | --- |
| CLD-IMG-001 | P0 | Single-image understanding | Correct fixed visual marker | verified |
| CLD-IMG-002 | P0 | Image OCR | Correct fixed text marker | verified |
| CLD-IMG-003 | P1 | Ordered multi-image input | Images remain distinguishable and ordered | verified |
| CLD-IMG-004 | P1 | PNG, JPEG, GIF, and WebP input | Supported formats reach the SDK intact | verified |
| CLD-IMG-005 | P0 | Invalid image rejection | Failure occurs before an SDK query starts | verified |
| CLD-IMG-006 | P0 | Image creation through Claude tools or extension | A new valid image artifact is produced | verified |
| CLD-IMG-007 | P0 | Final-path image promotion | Standard DSH image block is visible | verified |
| CLD-IMG-008 | P0 | Promoted-image persistence | Image remains visible after reload | verified |
| CLD-IMG-009 | P1 | SVG output conversion | Safe deterministic PNG is persisted | verified |
| CLD-IMG-010 | P1 | Image editing | A deterministic property of the source image changes | verified |
| CLD-FILE-001 | P1 | Text or source attachment | Requested marker is read correctly | failed |
| CLD-FILE-002 | P1 | Document or table attachment | Supported content is read or rejection is explicit | verified |

## Built-in Claude Code tools

| ID | Priority | Atomic capability | Minimum observable | State |
| --- | --- | --- | --- | --- |
| CLD-TOOL-001 | P0 | Workspace cwd | Tool cwd equals the selected DSH Workspace | verified |
| CLD-TOOL-002 | P0 | Glob, Grep, and search | Unique fixture file and marker are found | failed |
| CLD-TOOL-003 | P0 | Read | Exact fixture content is returned | verified |
| CLD-TOOL-004 | P0 | Write | Expected bytes are written inside Workspace | verified |
| CLD-TOOL-005 | P0 | Edit | Only intended lines change | verified |
| CLD-TOOL-006 | P0 | Multi-file edit | All intended files change with no unrelated diff | verified |
| CLD-TOOL-007 | P0 | Bash success | stdout and zero exit are presented | verified |
| CLD-TOOL-008 | P0 | Bash failure | stderr and non-zero exit are presented | verified |
| CLD-TOOL-009 | P1 | Long-running Bash streaming | Intermediate output is visible | failed |
| CLD-TOOL-010 | P0 | Bash interruption | Process stops and creates no late marker | verified |
| CLD-TOOL-011 | P0 | Test execution | Fixture test result is correctly interpreted | verified |
| CLD-TOOL-012 | P0 | Git inspection | Status and diff are read without mutation | verified |
| CLD-TOOL-013 | P1 | WebSearch or WebFetch | Fixed source is read or policy denial is explicit | verified |
| CLD-TOOL-014 | P0 | AskUserQuestion | Turn pauses and receives the selected answer | verified |
| CLD-TOOL-015 | P0 | Tool approval | Allow executes and deny prevents execution | verified |
| CLD-TOOL-016 | P1 | Agent/subagent tool | Child result returns to the owning turn | verified |

## User extensions

| ID | Priority | Atomic capability | Minimum observable | State |
| --- | --- | --- | --- | --- |
| CLD-EXT-001 | P0 | User Skill discovery | User-scoped fixture Skill is listed or invoked | verified |
| CLD-EXT-002 | P0 | Project Skill discovery | Skill is available only in the fixture project | verified |
| CLD-EXT-003 | P0 | Manual Skill or custom command | Invocation produces its unique marker | verified |
| CLD-EXT-004 | P1 | Automatic Skill invocation | Matching prompt loads the Skill | verified |
| CLD-EXT-005 | P0 | Skill resource and script | Bundled reference and script are usable | failed |
| CLD-EXT-006 | P0 | User STDIO MCP | Test server starts and handles a call | verified |
| CLD-EXT-007 | P0 | Project MCP | Server is scoped to the fixture project | verified |
| CLD-EXT-008 | P1 | HTTP MCP | Test server connects and handles a call | verified |
| CLD-EXT-009 | P1 | MCP text, JSON, and image results | Each result type reaches Claude intact | verified |
| CLD-EXT-010 | P1 | MCP failure and timeout | Failure is explicit and the turn remains usable | verified |
| CLD-EXT-011 | P0 | CLI-installed plugin discovery through SDK | Installed fixture plugin appears in SDK init | verified |
| CLD-EXT-012 | P0 | Local plugin path loading | Explicit local fixture plugin appears in SDK init | failed |
| CLD-EXT-013 | P0 | Plugin Skill and command | Namespaced fixture invocation runs | verified |
| CLD-EXT-014 | P1 | Plugin Agent | Fixture subagent can be invoked | verified |
| CLD-EXT-015 | P0 | Plugin MCP tool | Bundled fixture MCP tool runs | verified |
| CLD-EXT-016 | P0 | Plugin Hook | Fixture hook observes or blocks its target event | verified |
| CLD-EXT-017 | P1 | Multiple plugin sources | All plugins load without namespace collision | verified |
| CLD-EXT-018 | P1 | DSH-contributed tool | Advertised tool executes through the SDK MCP bridge | verified |
| CLD-EXT-019 | P1 | Dynamic DSH tool refresh | A later turn sees the updated tool set | verified |

## Configuration and instructions

| ID | Priority | Atomic capability | Minimum observable | State |
| --- | --- | --- | --- | --- |
| CLD-CFG-001 | P0 | User `settings.json` | A non-UI setting has observable effect | verified |
| CLD-CFG-002 | P0 | Shared project settings | Setting applies only in the fixture project | verified |
| CLD-CFG-003 | P0 | Project-local settings | Local setting overrides the shared fixture setting | verified |
| CLD-CFG-004 | P0 | Settings precedence | Local, project, and user conflict resolves as specified | verified |
| CLD-CFG-005 | P0 | Enabled plugin configuration | Enabled fixture plugin reaches SDK options and init | verified |
| CLD-CFG-006 | P0 | DSH-owned setting collision | Model, effort, permission mode, and cwd precedence is documented and observed | verified |
| CLD-CFG-007 | P1 | Settings environment values | Fixture environment value reaches Bash or extension | verified |
| CLD-CFG-008 | P1 | Supported hot reload | Changed setting affects the active Session when promised | verified |
| CLD-INS-001 | P0 | User `CLAUDE.md` | User unique instruction marker is followed | verified |
| CLD-INS-002 | P0 | Project `CLAUDE.md` | Project marker is followed only in that project | verified |
| CLD-INS-003 | P0 | Project rules | Applicable `.claude/rules` marker is followed | verified |
| CLD-INS-004 | P0 | Nested `CLAUDE.md` | Nested rule loads when its directory is accessed | verified |
| CLD-INS-005 | P1 | Imported instructions | Imported fixture instruction is followed | verified |

## Hooks, permissions, environment, and continuity

| ID | Priority | Atomic capability | Minimum observable | State |
| --- | --- | --- | --- | --- |
| CLD-HOOK-001 | P0 | User PreToolUse hook | Hook observes or blocks its fixture call | verified |
| CLD-HOOK-002 | P0 | Project PostToolUse hook | Hook observes the completed fixture call | verified |
| CLD-HOOK-003 | P1 | SessionStart or Stop hook | Correct lifecycle marker is recorded | verified |
| CLD-PERM-001 | P0 | Workspace read and write | Effective DSH/Claude policy is enforced | verified |
| CLD-PERM-002 | P0 | Outside-Workspace access | Access is denied or explicitly approved | verified |
| CLD-PERM-003 | P0 | Plan/read-only mode | No fixture mutation occurs | verified |
| CLD-PERM-004 | P1 | MCP and subagent permission | Extension calls do not bypass effective rules | verified |
| CLD-ENV-001 | P0 | PATH and executable discovery | Fixture executable can be found | verified |
| CLD-ENV-002 | P0 | Non-ASCII or spaced cwd | Tools operate in the exact path | verified |
| CLD-ENV-003 | P0 | Secret redaction | Fixture secret is absent from transcript and logs | failed |
| CLD-SES-001 | P0 | New Session binding | Exactly one Claude Session is bound | verified |
| CLD-SES-002 | P0 | Browser reload continuation | Same Claude Session continues | verified |
| CLD-SES-003 | P0 | Host restart continuation | Same Claude Session continues | verified |
| CLD-SES-004 | P0 | Existing native Session migration | Supported path continues the source Session or records an explicit gap | verified |
| CLD-SES-005 | P1 | Long-context continuation | Marker survives the supported compaction path | verified |
| CLD-SES-006 | P1 | SDK versus CLI applicability | Capability report names the active backend and does not overclaim | verified |
