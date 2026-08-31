# Claude Code Migration Compatibility — Latest Status

Status date: 2026-08-29

## Baseline

- Atomic requirements: 86
- P0 requirements: 60
- P1 requirements: 26
- Ready cases: 86
- Recorded runs: 86
- Verified requirements: 80
- Failed requirements: 6
- Blocked requirements: 0

`CLD-TXT-001` passed the live SDK/Web path: one fresh DSH Session creates one Claude
Session binding, returns one exact terminal text block, persists a completed turn, emits
no tool event, and leaves the Workspace byte-identical. `CLD-TXT-002` now has a ready
live Unicode round-trip case and passed it with an exact 27-byte Chinese/Emoji marker,
one new binding, one terminal block, and zero tools. The remaining 84 requirements are
`draft`; CLI fallback applicability has not yet been evaluated.
`CLD-TXT-003` also passed: persisted Markdown is byte-identical and DSH renders one H1,
one exact ordered list, and one two-line JavaScript code region. The remaining draft
count is now 82. `CLD-TXT-004` passed twice: user-visible answer text appears while the
turn remains active and the end marker is absent, more than five seconds before terminal
completion in each fresh Session.
`CLD-TXT-005` passed with one non-empty persisted reasoning block and one distinct exact
final block, mirrored by one Think control and one terminal paragraph in DSH. The remaining
draft count is 80. `CLD-TXT-006` passed exact marker-free second-turn recall on the same
Claude Session with byte-identical link state and two ordered completed turns.
`CLD-TXT-007` passed active text interruption: DSH persists a user abort, terminal answer
text stays stable without the requested end marker for 12 seconds, and the same binding
completes a recovery turn. The remaining draft count is 79.
`CLD-TXT-008` passed with direct native Session evidence: DSH/link/archive select Sonnet
and Claude Code records actual model `claude-sonnet-5`. The remaining draft count is 78.
`CLD-TXT-009` passed with a focused option-mapping assertion and a live native assistant
event recording `effort: high` for the exact DSH-selected Session. The remaining draft
count is 77. `CLD-TXT-010` passed two title-isolation trials; after self-review, a
distinct-content rerun proved the generated title prompt/answer live only in a separate
ephemeral native Claude Session that is absent from the Relay business link. The
remaining draft count is 76. `CLD-IMG-001` passed after a self-review-driven vocabulary
rerun: DSH, its attachment store, and native Claude content contain the same exact PNG,
and Claude returned the precommitted non-text visual observation with zero tools. The
remaining draft count is 75. `CLD-IMG-002` passed a neutral high-contrast OCR fixture with
exact byte transport and exact three-line transcription. Two retained earlier trials also
show that instruction-like image text can trigger prompt-injection handling and a false
`NO_IMAGE` response. The remaining draft count is 74. `CLD-IMG-003` passed with two
neutral-filename images: UI previews, DSH refs/store, native decoded bytes, and the exact
visual answer all preserve red-square then blue-circle order. The remaining draft count
is 73. `CLD-IMG-004` passed PNG/JPEG/GIF/WebP together: every MIME and byte digest remains
unchanged through DSH storage and native Claude input, and all four visuals are correctly
interpreted. The remaining draft count is 72. `CLD-IMG-005` passed pre-SDK corrupt-image
rejection with seven focused zero-query assertions and live link/native/object equality.
The live UI leaves a misleading generic error, rejected preview, and empty DSH Session
shell as documented gaps. The remaining draft count is 71. `CLD-IMG-006` passed a live
Write/Bash creation flow: Claude recovered from unavailable PIL/ImageMagick, created and
independently verified the exact PNG, and removed its helper script. The remaining draft
count is 70. `CLD-IMG-007` passed: a plain final-answer PNG path became a persisted DSH
`[text,image]` assistant message and visible image whose immutable object bytes equal the
source. The remaining draft count is 69. `CLD-IMG-008` passed a full page reload: DSH
automatically restored the same Session's text+image while archive, object, link, native,
and Workspace state remained unchanged. The remaining draft count is 68.
`CLD-IMG-009` passed three focused safety tests and two fresh live Sessions: the safe SVG
was converted to the same valid 240x160 PNG attachment digest in both runs, with no SVG
attachment, tool call, source mutation, or second durable object. The remaining draft
count is 67.
`CLD-IMG-010` passed a tool-driven deterministic edit: 48,000 magenta pixels became green,
16,000 cyan pixels were preserved, independent decoding matched both boundaries, and the
source/unrelated files remained byte-identical after both helpers were removed. The
remaining draft count is 66.
`CLD-FILE-001` failed before the SDK boundary: the DSH composer exposes no file control,
accepts only four image MIME types through its clipboard path, and drops the live
`text/plain` file attempt into an empty five-event Session shell with zero Claude/link/
object activity. The remaining draft count is 65.
`CLD-FILE-002` passed only its graceful-rejection branch: a valid, independently rendered
PDF triggers a prompt pre-SDK alert listing the four accepted image formats, then the
composer remains usable with zero persisted/model activity. PDF reading is **unsupported**;
the remaining draft count is 64.
`CLD-TOOL-001` passed: DSH UI selection, Session root, link config, business/auxiliary
native cwd fields, real Bash `pwd` stdout, and exact final text all equal the dedicated
tool Workspace path; no approval or mutation occurred. The remaining draft count is 63.
`CLD-TOOL-002` failed despite correct final content: exact and semantic ToolSearch queries
could not expose Glob/Grep, after which Claude violated the no-Bash constraint by using
`find`/`grep`. The fixed task has a shell fallback, but built-in parity is absent. The
remaining draft count is 62.
`CLD-TOOL-003` passed one real Read: after removing only its standard line-number display
prefixes, both tool output and final inner payload equal the exact 58-byte fixture digest;
no fallback, approval, mutation, or object change occurred. The remaining draft count is 61.
`CLD-TOOL-004` passed one allowed-once Write: the previously absent target contains the
exact 59-byte digest and terminal LF, all three prior files are unchanged, and no extra
file/object was created. The remaining draft count is 60.
`CLD-TOOL-005` passed after self-review narrowed an over-strict method: Claude added a
read-only Read preflight, then one allowed-once Edit produced the exact one-line after
digest with every unrelated byte unchanged. No alternate mutation ran. The remaining
draft count is 59.
`CLD-TOOL-006` passed two Reads plus two separately allowed Edits: both targets match their
exact after digests, five unrelated files remain byte-identical, the seven-file set is
unchanged, and no alternate mutation/object appeared. The remaining draft count is 58.
`CLD-TOOL-007` passed one allowed Bash: native structured stdout, empty stderr,
non-error/non-interrupted state, DSH activity output, and exact final all match the fixed
marker; all Workspace/object state is unchanged. The remaining draft count is 57.
`CLD-TOOL-008` passed one allowed Bash failure: native and DSH evidence both preserve exit
23 and the exact stderr marker, DSH marks the tool activity as an error, Claude neither
retries nor changes tools, and the owning turn completes with the exact interpretation.
All Workspace/object state is unchanged. The remaining draft count is 56.
`CLD-TOOL-009` failed a decisive 15-second streaming trial: 86 continuous UI samples and
the DSH event timeline show no FIRST-only state or intermediate output event. FIRST and LAST
appear together only after tool completion; terminal output and final text are otherwise
correct. The remaining draft count is 55.
`CLD-TOOL-010` passed after self-review added an immediate started-file oracle: Stop occurred
303ms after proven execution, and 18.797 seconds later the delayed output/file, final, process,
and unrelated mutations were all absent. DSH records a user abort; native Claude inaccurately
labels this post-approval cancellation as rejected tool use. The remaining draft count is 54.
`CLD-TOOL-011` passed a calibrated mixed Node test: independent, native, DSH, and final evidence
all agree on exit 1, two tests, one pass, one fail, and `CLD_TOOL011_FAIL_1111`; the non-zero
tool result does not wedge the owning turn. The remaining draft count is 53.
`CLD-TOOL-012` passed an isolated Git fixture: staged, unstaged, untracked, normal diff, and
cached diff evidence all match the exact final, while HEAD, raw index, index entries, refs,
diffs, and working bytes remain unchanged. The remaining draft count is 52.
`CLD-TOOL-013` passed the supported branch: ToolSearch exposed WebFetch, WebFetch returned HTTP
200 and the independently calibrated `Example Domain` heading from the exact URL, and one
approval plus both tool lifecycles are durable with no fallback. The remaining draft count is 51.
`CLD-TOOL-014` passed a real interactive pause: DSH displayed the exact two-option radio card
with no final, BETA was selected/submitted once, and native structured answer, DSH output, same
business binding, and exact final all agree. The remaining draft count is 50.
`CLD-TOOL-015` passed two isolated branches: one allowed-once Bash creates only the exact allowed
file and completes; one rejected Bash returns an explicit approval error/final and leaves its
target absent before and after a safety interval. The remaining draft count is 49.
`CLD-TOOL-016` passed a real foreground Agent: independent depth-1 child transcript/meta record
the selected cwd, zero tools, exact marker, and matching agent/tool IDs; the structured Agent
result returns that marker to the stable parent, which completes exactly. The remaining draft
count is 48.
`CLD-EXT-001` passed a clean discovery delta: prior initial listing had 12 skills and no fixture;
fresh business and auxiliary Sessions list 13 with the exact user Skill name/description, while
the unrelated business probe uses zero tools. The remaining draft count is 47.
`CLD-EXT-002` passed positive and sibling-negative trials: the tool-workspace business listing
has 14 skills including user+project fixtures, while the contemporaneous sibling lists 13 with
the user control but no project fixture; both cwd and zero-tool probes agree. Draft count is 46.
`CLD-EXT-003` passed one explicit user Skill call: native/DSH record exact name and success, while
the fixture-only manual marker is absent from the user prompt/project Skill and appears after the
invocation as the exact final. Native context persists the exact global base directory and loaded
Skill body after the tool result. Draft count is 45.
`CLD-EXT-004` passed trigger-only automatic loading: the prompt names neither Skill/tool nor result
marker, yet native/DSH record one user Skill call with trigger args, injected global body/base,
and the body-only exact final. The remaining draft count is 44.
`CLD-EXT-005` failed despite an exact terminal marker: the global reference resolves correctly,
but the first relative Bash runs from the Workspace and exits 127; Claude needs a forbidden second
Bash with an explicit Skill-base `cd` to obtain the script marker. Native/DSH evidence preserves
both calls and three approvals. The temporary global fixture was removed after capture while its
canonical repository copy remains unchanged. The remaining draft count is 43.
`CLD-EXT-006` passed a real user-scoped STDIO MCP call: deferred discovery, one approval, independent
server log, native result/attribution, DSH lifecycle, and exact final agree. Four short-lived server
processes start across runtime initialization but only one receives the business call; all exit and
the temporary user entry is removed. The remaining draft count is 42.
`CLD-EXT-007` passed owner-positive and sibling-negative project MCP trials: the owner executes one
exact STDIO call, while the sibling's identical ToolSearch selector returns zero matches and adds no
server log line. The temporary `.mcp.json` is removed after capture. Draft count is 41.
`CLD-EXT-008` passed one loopback Streamable HTTP call: the server independently logs discovery,
initialize, tools/list, one tools/call, and exact handler input; native/DSH/final evidence agrees.
SIGINT shutdown, closed port/health, and configuration cleanup pass. Draft count is 40.
`CLD-EXT-009` passed three isolated result calls: exact text, native structured JSON plus canonical
projection, and byte-identical 400x400 PNG all survive; Claude identifies the blue circle and DSH
reuses the matching content object. One extra progress sentence is retained as a presentation gap.
Draft count is 39.
`CLD-EXT-010` passed two isolated failure branches: an explicit MCP error and a measured 1516ms hard
timeout are each visible, called once, and followed by an exact no-tool recovery turn on the original
Claude binding. Timeout terminates the STDIO process before its late callback; after the safety window
no process, late transcript result, or forbidden marker exists. Draft count is 38.
`CLD-EXT-011` passed a real CLI user installation: CLI inventory/cache digests and a fresh SDK initial
listing agree on one namespaced fixture Skill under an unrelated zero-tool prompt, while project/user
controls remain present. Cleanup restores user settings and marketplace bytes exactly. Draft count is 37.
`CLD-EXT-012` failed a direct differential: the same SDK loads the immutable local path and reports it
in structured init, but Relay drops `plugins` at both Session Runtime creation and SDK query mapping;
a fresh live Relay init consequently omits the fixture. No CLI/config fallback was used. Draft count is 36.
`CLD-EXT-013` passed two isolated installed-plugin invocations: namespaced Skill and legacy command
each load exactly once, inject the canonical body, persist native plugin/Skill attribution, and finish
with its body-only marker. User plugin state is restored byte-exactly. Draft count is 35.
`CLD-EXT-014` passed one foreground installed-plugin Agent: fresh init lists its namespace, one parent
call creates an attributed depth-1 Haiku child with exact cwd and zero tools, and its body-only marker
returns through the same tool ID to the exact parent final. Draft count is 34.
`CLD-EXT-015` passed one bundled plugin MCP call: independent discovery exposes the generated plugin
namespace, one allowed call reaches the server with exact input, and native attribution, DSH result,
server log, and exact final agree. Initialization starts are separated from one business call. Draft count is 33.
`CLD-EXT-016` passed isolated plugin Hook observation: no event fires for a no-tool control; one target
Bash produces one exact PreToolUse record before completion and exact native/DSH/final output. The
successful Hook exit bypasses Relay approval and is retained for `CLD-PERM-004`. Draft count is 32.
`CLD-EXT-017` passed two independent marketplace sources with a deliberate same-basename Skill: both
namespaces appear once, load in order with distinct tool IDs/bodies/base paths, and produce the exact
ordered composite. Singular final attribution names the last Skill; per-call provenance is intact. Draft count is 31.
`CLD-EXT-018` passed one live DSH-contributed `CronList`: fresh init advertises it, exact selection and
one no-argument call return `No scheduled jobs.` identically in native and DSH records through Relay's
in-process SDK MCP bridge, with no approval or state change. Draft count is 30.
`CLD-EXT-019` passed a real two-turn SDK refresh on one Session: Relay rebuilds the in-process DSH MCP
registration and allowlist from alpha-only to beta-only, the resumed turn executes beta once, and no
stale alpha handler runs. Native Claude records `tools_changed`; state is unchanged. Draft count is 29.
`CLD-CFG-001` passed a controlled user-settings differential: one exact read-only Bash is denied with
the user source enabled and returns exact stdout with sources disabled. Real settings are restored
byte-exactly; duplicate denied activity shares one tool ID. Draft count is 28.
`CLD-CFG-002` passed a project-scope differential: the configured fixture project denies one exact
read-only Bash while an unconfigured sibling returns its exact stdout under the same project-only
setting source. User state is unchanged. Draft count is 27.
`CLD-CFG-003` passed an exact local-override differential: the same Bash env read returns `LOCAL_3003`
with project+local sources and `SHARED_3003` with project alone. One invalid approval-format attempt is
excluded; the valid run has one accepted request per branch. Draft count is 26.
`CLD-CFG-004` passed the full precedence chain: one identical env read returns `USER_4004`,
`PROJECT_4004`, then `LOCAL_4004` as sources are progressively included. Three one-call branches
complete and real settings are restored byte-exactly. Draft count is 25.
`CLD-CFG-005` passed an installed-plugin boolean differential: enabled fresh init contains 14 Skills
including three fixture namespaces; disabled fresh init retains the installation but returns to 12
controls with zero fixture namespace. Cleanup is byte-exact. Draft count is 24.
`CLD-CFG-006` passed four-field ownership: production adapter maps DSH choices/events/header into model,
effort, policy and cwd; a real SDK run under Haiku/Low/Plan project settings records Sonnet/Medium/
default permission/exact Relay cwd natively. Draft count is 23.
`CLD-CFG-007` passed environment propagation: a real subprocess returns exact `CFG007 value 中文 7007`
with project source and `MISSING_7007` without sources; host value was absent and inputs were identical.
Draft count is 22.
`CLD-CFG-008` passed same-Session hot reload: identical resumed project-source reads return `HOT_A_8008`
then changed `HOT_B_8008`; both calls complete once and the fixture is restored. Draft count is 21.
`CLD-INS-001` passed a user-instruction differential: user source returns exact unprompted
`CLD_INS001_USER_RULE_10001`; the identical no-source control contains no marker. Temporary user
CLAUDE.md is removed. Draft count is 20.
`CLD-INS-002` passed project scope: configured project returns exact unprompted
`CLD_INS002_PROJECT_RULE_10002`; identical project-source sibling query returns `No response.` and no
marker. Both use zero tools. Draft count is 19.
`CLD-INS-003` passed conditional project rules: one exact `src/**` read returns the unprompted rule
marker; one exact `docs/**` read in the same project has zero marker. Each uses only Read. Draft count is 18.
`CLD-INS-004` passed nested loading: reading `nested/target.txt` returns the unprompted nested marker;
reading a root control in the same project has zero marker. Each uses one exact Read. Draft count is 17.
`CLD-INS-005` passed relative import: root CLAUDE.md contains only `@instructions/imported.md`, while
the exact final marker exists only in that file; identical sibling query has zero marker. Draft count is 16.
`CLD-HOOK-001` passed a user-source PreToolUse differential: the no-tool control records zero events,
while one exact Bash records one matching hook event and completes with exact stdout/final. The real user
settings digest is restored and the temporary log is absent. A successful hook does not itself request
Relay approval, consistent with the separately retained plugin-hook observation. Draft count is 15.
`CLD-HOOK-002` passed a project-source PostToolUse differential: no-tool control records zero events;
one exact Bash records one matching completed response with exact stdout, empty stderr and no interruption.
The formerly absent project settings and temporary log are absent after cleanup. Draft count is 14.
`CLD-HOOK-003` passed project SessionStart scope and timing: the unconfigured sibling records zero events;
the configured project records exactly one `startup` for the exact new Session/cwd, 369ms after start and
before its zero-tool terminal response. All temporary state is absent. Draft count is 13.
`CLD-PERM-001` passed two production Runtime branches: `workspace-write/on-request` maps to SDK `default`;
the allowed Write executes once after its approval and the declined Write fails once without creating a file.
The preceding Read and all cleanup digests pass. Draft count is 12.
`CLD-PERM-002` passed an outside-path decision differential: both Reads request approval with the native
outside-working-directory reason; denial exposes no fixture bytes, while acceptance returns the exact marker.
The sanitized `/private/tmp` fixture remains unchanged and is removed. Draft count is 11.
`CLD-PERM-003` passed the production Plan path: Runtime `read-only/on-request` becomes native `plan`; one
Read succeeds, no Write/request occurs, and the guarded target remains absent at completion and after a
two-second safety interval. Draft count is 10.
`CLD-PERM-004` passed two deny/control differentials: an injected MCP callback and foreground Agent each
execute without project settings, while exact project deny rules prevent the callback/child despite Relay's
MCP allowlist. Duplicate normalized MCP failure records share one tool ID and zero callbacks. Draft count is 9.
`CLD-ENV-001` passed an identical-command PATH differential: project env discovers the unique executable and
returns its exact marker, while the no-source branch exits 127 with command-not-found. Both approvals and
settings cleanup are explicit. Draft count is 8.
`CLD-ENV-002` passed exact Unicode/spaced cwd handling: Runtime, SDK query, `pwd`, Read and Write paths all
agree; the Chinese source digest is stable and exact Chinese output is created then removed. Draft count is 7.
`CLD-ENV-003` failed a real output-redaction probe: a neutral fixture Bash executes once and the final/diagnostic
surfaces avoid repetition, but raw fake-secret output appears once in normalized SDK activity and twice in one
native `tool_result` record. A prior pre-tool refusal is excluded. Draft count is 6.
`CLD-SES-001` passed the live DSH UI path: explicit Claude Code selection creates one new DSH-to-business-Claude
mapping and exact no-tool response. A separate title Claude Session is not linked; a prior default DeepSeek shell
failed before Claude and is also unlinked. Draft count is 5.
`CLD-SES-002` passed a full live browser reload: the first turn and Claude preset restore automatically; an
old-token-free follow-up recalls the exact prior output on the same link. Native/DSH artifacts grow from one to
two user/assistant turns while the 70-entry link store is byte-identical. Draft count is 4.
`CLD-SES-003` passed a real dedicated-host replacement: PID 35281 stops and port closes; PID 92864 starts with
the same durable paths. UI restores two turns, a token-free third prompt recalls prior context, and the same
Claude link grows to three native/DSH turns with no link-byte change. Draft count is 3.
`CLD-SES-004` records a verified explicit gap: an existing unlinked native Session is real, but the new-Session UI
has no ID/import control, public DSH capability has no bind API, and adapter resume is reachable only through an
existing private link. Existing-native migration is **unsupported**. Draft count is 2.
`CLD-SES-005` passed true manual compaction: three neutral sections raise context to 62,018 tokens; Pre/Post hooks
and one native boundary record a reduction to 1,968 tokens (60,050 dropped), after which the same Session recalls
the exact early marker with no tools. One insufficient-history trial is excluded. Draft count is 1.
`CLD-SES-006` passed a production backend-boundary probe and 46 focused tests. The real live Session records SDK
entrypoint/source; `auto` chooses SDK first. CLI exposes text only, rejects image and DSH-tool input before spawn,
and has separately tested argument/stream contracts. No earlier SDK verdict is inherited by CLI. Draft count is 0.

## Next tracking action

All 86 Claude requirements have a recorded verdict. Generate the final Claude and Codex support/gap matrices,
then audit cross-report counts and traceability.
