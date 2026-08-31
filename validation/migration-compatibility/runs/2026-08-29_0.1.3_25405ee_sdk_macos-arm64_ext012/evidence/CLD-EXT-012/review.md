# CLD-EXT-012 Self-review

## Process review

- The direct positive control is necessary: without it, an omitted live listing could be blamed on
  an invalid fixture, unsupported SDK version, or wrong path.
- The boundary probe checks both independent loss points. It does not rely only on static source
  reading, and its fake SDK observes the exact options Relay would send.
- The live negative uses a fresh DSH/SDK initialization after byte-exact EXT-011 cleanup. Its prompt
  neither names nor invokes the plugin and confirms the real product outcome.
- Product source was intentionally not patched because the requested task is validation/reporting.

## Reliability review

- The direct control's structured `system/init.plugins`, Skill, command, native transcript, and
  terminal result are stronger than a final-text-only check.
- The Relay result is not merely absence by default: a supplied field is demonstrably discarded at
  runtime creation and final SDK query mapping, so there is no supported path to obtain the positive.
- SDK/Claude version skew is recorded. It does not explain Relay's JavaScript option omission, and
  the supported option is present in the installed SDK declaration.
- User plugin registry/cache/settings remain clean and fixture source/object state is unchanged.

## Verdict

Fail / unsupported. Claude Agent SDK local-plugin paths work, but Relay neither exposes nor forwards
the `plugins` option, so an explicit local fixture plugin cannot reach SDK initialization.
