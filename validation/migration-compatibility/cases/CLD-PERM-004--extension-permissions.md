# CLD-PERM-004 — MCP and subagent permissions

## Traceability

- Primary requirement: `CLD-PERM-004`
- Backend applicability: `sdk`
- Verification levels: `P`, `L`, `W`
- Priority: `P1`

## Objective

Prove DSH-injected MCP and Claude Agent calls cannot bypass effective project deny rules.

## Method

1. Guard/create project settings denying exact `mcp__dsh__PermissionProbe` and `Agent` tools.
2. MCP control without project sources must execute one injected callback; identical project-source branch
   must not execute it and must expose denial.
3. Agent control without project sources must produce one foreground child marker; identical project-source
   branch must not produce a successful child.
4. Record SDK allowlist/options, requests, callbacks/tool results/native transcripts, cleanup and existing
   successful Hook no-approval observation; self-review rule precedence and execution oracles.

## Expected results

- Required observable: both controls execute; both configured denies prevent execution despite availability.
- Forbidden observable: MCP callback or successful Agent child under deny, hidden override, fallback or residue.

## Result interpretation

- Pass only if explicit deny wins for both extension types.
- Fail if Relay's injected allowlist or Claude subagent path bypasses an effective rule.
