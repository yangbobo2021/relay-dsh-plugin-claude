# Self-review

## Process validity

- The file is sanitized, guarded, deterministic and physically outside the exact selected cwd.
- Fresh identical Sessions differ only in approval decision; native reason independently asserts the boundary.
- Unique content serves as a leakage oracle in result/final, while a file digest guards accidental mutation.

## Result reliability

- Each branch has one exact Read, one matching request/tool ID and no fallback.
- Deny cannot access the marker; allow returns it exactly only after acceptance.
- Transcript hashes and post-run file absence make the evidence traceable without persistent outside data.

## Verdict

Pass. Relay/Claude requires an explicit decision for outside-Workspace access and enforces both deny and allow.
