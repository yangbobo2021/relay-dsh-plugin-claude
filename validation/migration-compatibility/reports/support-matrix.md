# Claude migration support matrix

Status date: 2026-08-29

## Verdict

| Classification | Count | Share | Meaning |
| --- | ---: | ---: | --- |
| Supported | 78 | 90.7% | The user task/capability completed through the tested SDK-backed product path |
| Partial | 3 | 3.5% | The task has a fallback or delayed output, but original Claude behavior is not preserved |
| Unsupported | 5 | 5.8% | The requested capability cannot currently complete through the product path |
| Total | 86 | 100% | Every atomic requirement has a case, run result and self-review |

These figures describe the default **Claude Agent SDK** backend. The CLI fallback is not equivalent and must be
read through `backend-applicability.md`. `verified` means the validation is complete, so an explicit rejection or
proven product gap can be verified while the user capability remains unsupported.

## Supported capabilities

| Area | Requirement IDs | User-visible capability |
| --- | --- | --- |
| Conversation | `CLD-TXT-001–010` | Text, Unicode, Markdown/code, streaming, thinking, context, stop, model/effort and title isolation |
| Images/artifacts | `CLD-IMG-001–010` | Understanding/OCR/order/formats, rejection, creation, promotion, persistence, SVG conversion and editing |
| Built-in tools | `CLD-TOOL-001`, `003–008`, `010–016` | cwd, read/write/edit, Bash results/interruption, tests, Git, Web, questions, approvals and subagents |
| Extensions | `CLD-EXT-001–004`, `006–011`, `013–019` | Skills, user/project/HTTP MCP, typed results/failures, installed plugins, agents, Hooks and dynamic DSH tools |
| Config/instructions | `CLD-CFG-001–008`, `CLD-INS-001–005` | User/project/local settings, precedence/plugins/env/hot reload and layered/imported instructions |
| Hooks/policy/environment/session | `CLD-HOOK-001–003`, `CLD-PERM-001–004`, `CLD-ENV-001–002`, `CLD-SES-001–003`, `005–006` | Hooks, policy enforcement, PATH/Unicode cwd, new/reloaded/restarted Session, compaction and backend boundary |

## Partial and unsupported capabilities

| Status | Requirement | Capability | Observed result and migration impact |
| --- | --- | --- | --- |
| Unsupported | `CLD-FILE-001` | Text/source attachment | Composer has no generic file intake; text file does not reach Claude. |
| Unsupported | `CLD-FILE-002` | Document/table attachment | PDF reading is unavailable; only explicit pre-SDK rejection works. |
| Partial | `CLD-TOOL-002` | Glob/Grep/search parity | Glob/Grep are unavailable; Claude completes the fixed task only by shell `find`/`grep`. |
| Partial | `CLD-TOOL-009` | Long Bash streaming | `FIRST` and `LAST` appear together only after the command completes. |
| Partial | `CLD-EXT-005` | Skill resource/script | Reference resolves, but a relative bundled script starts in Workspace and needs an explicit Skill-base `cd` retry. |
| Unsupported | `CLD-EXT-012` | Explicit local plugin path | Direct SDK supports the path, but Relay drops the `plugins` option; installed-plugin paths remain supported. |
| Unsupported | `CLD-ENV-003` | Secret redaction | Sanitized secret appears in SDK activity and native tool-result transcript. |
| Unsupported | `CLD-SES-004` | Existing native Session migration | No UI or public API can import/bind an unlinked native Claude Session. |

## Supported paths with retained limitations

- `CLD-IMG-002`: neutral OCR passes; instruction-like text inside an image can trigger injection handling.
- `CLD-IMG-005`: invalid bytes fail before SDK query, but the UI leaves a misleading generic error/empty shell.
- `CLD-EXT-009`: MCP text/JSON/image all survive, with one extra progress sentence in presentation.
- `CLD-SES-001`: a new DSH Session defaults to Standard/DeepSeek; users must select Claude Code before the
  first message.

## Backend applicability

- SDK: the live/default baseline for this matrix; images, DSH MCP bridge and DSH approval/question flows apply.
- CLI: text-only fallback; image and DSH-contributed-tool inputs are explicitly rejected before process spawn.
- CLI model/effort/settings/session flags are contract-tested, but the SDK case matrix is not inherited by CLI.

## Evidence and coverage

- Requirement catalog: `../../../docs/spec/migration-compatibility/requirements.md`
- Case directory: `../cases/`
- Run directory: `../runs/`
- Backend boundary: `backend-applicability.md`
- Narrative evidence index: `latest.md`
- Coverage: 86 requirements, 86 cases, 86 recorded runs, 86 unique requirement results, no missing ID.
