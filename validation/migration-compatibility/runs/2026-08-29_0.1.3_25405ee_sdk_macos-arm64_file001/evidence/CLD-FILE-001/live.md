# CLD-FILE-001 Live Evidence

## Fixture isolation

- Text fixture: 66 bytes; SHA-256
  `c62191203ac9f3f71f6a1b097d488d474d4a11d27f7d56ff5c01853b38b795bb`.
- It is outside the selected Workspace. Its marker was never typed or sent in a prompt.

## Product invocation check

- Fresh composer selected Claude Sonnet/Medium and Workspace Write.
- Live `input[type=file]` count: `0`; visible controls contain no upload/attachment action.
- The command palette contains only `export`, `feedback`, `goal`, `permission`, and
  `model`; `no-file-control.png` captures that state.
- Pasting the exact fixture as a `text/plain` clipboard file item produced no attachment
  chip or draft text. The send button remained disabled after one second.
- `text-file-paste.png` captures the empty composer after the attempted file paste.

## State boundary

- New Claude native records: `0`; new attachment objects: `0`; link-store SHA-256 stayed
  `1e425a63a333e25ac320ab4115d80f9bad43576cb417a06f418f9217831bc139`.
- DSH created one 469-byte empty Session shell,
  `session-f0cd7f43-ffca-4721-aad1-dacc0616c344`, containing only `session`, permission,
  sandbox, approval-policy, and agent-preset events. No user message or turn exists.
- Marker hits across isolated DSH archives: `0`; marker hits across Workspace-native
  Claude JSONL records: `0`; Host emitted no output during the attempt.

Result: **fail**. The product cannot submit a text/source attachment to Claude.
