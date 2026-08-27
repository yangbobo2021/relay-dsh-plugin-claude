# DSH Interaction Bridge Specification

## Scope

The Claude Agent SDK can pause a turn to request permission for a native Claude
tool or to ask the user a structured question. The plugin routes those requests
through the owning DSH Session so DSH remains the authority for human
interaction and conversation continuity.

This bridge applies to the Claude Agent SDK backend. The CLI backend uses the
Claude executable's own non-interactive permission mode and does not emit these
SDK request objects.

## Composition contract

`approval` and `userQuestions` are required Host injections. They are provided
by sibling plugins in the official DSH composition, so listing them in the Host
plugin's exported `inject` array is what binds them into the Claude consumer
fiber and makes activation wait for both services.

The bridge must not read either service as an undeclared context property. It
must not make either dependency optional, and it must not bypass DSH approval or
question handling when a service is missing, cancelled, or fails.

## Request ownership

Every request carries a Claude Session id. The adapter must resolve that id to
one live DSH Session and obtain its live Agent before invoking a DSH interaction
service. Unknown, stale, or unowned Session ids are rejected without asking the
user and without executing the requested tool.

## Approval mapping

For `tool/requestApproval`:

| DSH outcome | Claude SDK response |
| --- | --- |
| `allowed-once` | `accept`, preserving the requested input |
| `rejected` | `decline` |
| `cancelled` | `decline` |
| `unavailable` | `decline` |

Thrown service errors reject the pending Claude SDK request. No error path may
be converted into an implicit allow.

## Question mapping

For `tool/requestUserInput`, the bridge maps at most three Claude questions to
DSH questions, waits for `userQuestions.ask()`, and maps selected or custom
answers back to the Claude SDK. Cancellation or provider failure rejects the
pending SDK request. Empty option lists receive explicit Continue and Cancel
choices so the DSH question remains answerable.

Unsupported interaction methods are rejected and never fall through to tool
execution.

## Verification contract

The following layers are required:

1. A unit contract test fails when either required Host injection is absent.
2. A Cordis composition test mounts interaction services as sibling providers,
   mounts the Claude consumer with its exported `inject`, and completes one
   approval plus one question request.
3. Handler tests cover allow, deny, answer, cancellation, unknown Session, and
   unsupported request mappings.
4. An interaction E2E test uses an official DSH Web profile and two independent
   Claude Sessions. Both trigger a native Claude `Write` request and expose the
   DSH approval UI. Rejecting the first must leave its target absent. Allowing
   the second must resume Claude and write the exact requested content.
5. A release-package smoke test installs the generated tarball into a fresh
   official DSH Web profile, verifies the managed preset, and boots the Web
   application successfully.

The E2E record must identify the DSH version and plugin commit and retain
screenshots of both pending approvals and both completed conversations.
