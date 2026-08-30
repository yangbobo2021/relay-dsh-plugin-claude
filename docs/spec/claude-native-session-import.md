# Native Claude Session Import

This specification defines how `relay-dsh-plugin-claude` discovers an existing
Claude terminal Session, creates its DSH presentation, and continues the exact
same native Session. It is the delivery contract for migration case
`CLD-SES-004`.

## Supported backend and source boundary

Import is available only when the active Claude Agent SDK exposes the public
`listSessions`, `getSessionInfo`, and `getSessionMessages` functions. The Host
must call those APIs and must not parse Claude's private JSONL storage. The CLI
fallback reports `CLAUDE_SESSION_IMPORT_UNAVAILABLE`; it must not return an empty
or fabricated inventory.

The scan calls `listSessions` with the exact registered DSH Workspace path,
`includeWorktrees: false`, and `includeProgrammatic: false`. This matches the
Claude terminal `/resume` inventory: SDK/headless, daemon, worktree, sidechain,
and other-Workspace Sessions are not import candidates. Every returned `cwd` is
canonicalized and checked again by the plugin because SDK filtering alone is not
the authorization boundary.

The public SDK inventory is a point-in-time snapshot. It does not expose a
durable running/idle field, so DSH must not label a candidate as completed or
promise that another Claude client is no longer writing it.

## Inventory and selection

The sidebar footer exposes a Claude-specific icon action: 34 by 34 pixels while
expanded and 28 by 28 pixels in the 56-pixel collapsed rail, so Claude and Codex
fit side by side. Its localized accessible name is also its Tooltip; it renders
no inline label in the shared horizontal footer row. Opening the action presents
a visible Workspace selector. The current Session owner, then the recent
Workspace, is only an initial choice. The user may change it, and the plugin must
not scan until the user invokes **Scan Sessions**.

Each candidate exposes the full native Session ID, deterministic title, source
path, source `lastModified`, and either `ready` or `recoverable` status. The
ordering is descending source activity time with Session ID as a deterministic
tie-breaker. Already-bound Sessions remain in aggregate counts but are not
selectable or disclosed as candidates. Sessions outside the exact Workspace are
neither counted nor disclosed.

The UI defaults to every eligible candidate and supports selecting one, several,
all, or none. An empty selection cannot be submitted. The request carries the
exact selected `sessionIds`. Before creating or mutating a DSH Session, the Host
rescans and validates the entire selection. Empty, malformed, duplicate,
unknown, cross-Workspace, stale, or already-bound IDs reject the selection
without partial mutation. Omitting `sessionIds` retains the Host's import-all
API behavior; an explicit empty array is invalid.

After selection validation, an individual persistence or DSH composition
failure may produce a partial batch result. Its durable import state remains
recoverable and retrying the same source must continue that transaction instead
of creating a second DSH Session.

## History projection

The Host reads the selected source again with `getSessionInfo` and
`getSessionMessages` immediately before reserving its binding. The source ID and
canonical `cwd` must still match. DSH receives a deterministic presentation seed
containing:

- top-level user text, whether the public SDK returns it as a string or text blocks;
- visible assistant text and SDK `thinking` blocks as DSH reasoning;
- a tool call only when its matching tool result exists;
- textual tool-result content and its error flag.

Malformed messages, pre-turn assistant content, system/private blocks, unmatched
tool calls or results, non-text tool-result blocks, and unknown future block
types are skipped and counted. They must never be converted into explanatory
model text. The source transcript is read-only and is never changed by import.

The initial DSH title comes from `customTitle`, `summary`, or `firstPrompt`, and
the DSH list recency comes from the source timestamps. History projection and
title persistence must complete before Workspace attachment is committed.

Import creates a one-time DSH presentation snapshot. It does not poll the source
or merge turns written later by a second Claude client. Turns sent through DSH
after import are persisted normally by DSH and the native Claude Session.

## Binding and recovery

One DSH Session binds at most one native Claude Session, and one native Claude
Session binds at most one DSH Session. Imported DSH IDs are deterministic from
the complete source Session ID. The binding and the monotonic transaction states
`reserved`, `session-created`, `hydrated`, `attached`, and `committed` are
persisted before the next state is attempted.

Restart, duplicate request, concurrent request, and retry must converge on the
same DSH Session and native Session. Opening or sending the next DSH turn resumes
the exact imported native Session ID. If resume fails because the source is busy,
missing, or temporarily unavailable, the plugin reports
`CLAUDE_IMPORTED_SESSION_RESUME_FAILED`, keeps the binding, and creates no
replacement Session.

## Web route

The Host exposes one exact POST route at `/api/relay/claude/import`. It accepts
JSON only, bounds request size, resolves the requested path through DSH's
registered Workspace service, and returns no-store responses. Loopback requests
are accepted. A non-loopback caller requires a constant-time checked Bearer token
configured by `claudeImportToken` or `RELAY_CLAUDE_IMPORT_TOKEN`.

## Delivery acceptance

Delivery requires all of the following evidence:

1. The historical plugin revision reproduces the absence of native Session
   discovery/import for the same source fixture.
2. Focused tests cover SDK capability failure, exact inventory options,
   Workspace isolation, deterministic ordering, selection atomicity, source
   revalidation, projection, one-to-one durability, concurrency, retry, and the
   no-replacement resume rule.
3. Client tests cover the icon-only 34/28-pixel geometry, expanded and collapsed
   owner states, Tooltip/accessibility semantics, visible Workspace choice, no
   automatic scan, exact selected path, candidate selection, request payloads,
   chunked NDJSON progress, error handling, disabled empty submission, and
   refresh order.
4. A real installed SDK lists and reads a native terminal Session using only the
   public APIs.
5. Official DSH imports that Session, displays the projected history and title,
   and sends the next turn to the same complete native Session ID.
6. A combined Claude + Codex browser check and screenshots prove both actions fit
   in expanded and collapsed sidebars and that the selector dialog is readable.
7. Typecheck, the full repository test suite, build, package-content inspection,
   and remote CI all pass.
