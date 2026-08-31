# CLD-TXT-004 Validation Review

## Reasonableness

- Derived markers eliminate prompt-presence ambiguity; paragraph-only sampling excludes
  the collapsed thinking control.
- Stop-button state is the user-visible running oracle, while the end marker is an
  independent content oracle. Requiring active+begin+no-end proves a partial answer.
- Long numbered payloads make the streaming window large enough for repeated sampling.

## Reliability

- Two fresh Sessions reproduce the ordering with more than five seconds of separation.
- The machine timing trace, partial screenshot, final screenshot, completed archives,
  unique markers, and zero tools agree. Both screenshots were reviewed at original size.

## Verdict

**Pass, high confidence.** DSH exposes live Claude assistant text several seconds before
turn completion; the behavior is reproduced and directly visible with the Stop control.
