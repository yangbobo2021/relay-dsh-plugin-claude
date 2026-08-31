# CLD-EXT-013 — Plugin Skill and command

## Traceability

- Primary requirement: `CLD-EXT-013`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `P`, `L`, `W`
- Priority: `P0`

## Objective

Prove independently that a CLI-installed plugin's namespaced Skill and legacy custom command can be
selected and executed through fresh Relay Claude SDK Sessions.

## Method

1. Record user-plugin/settings, source, Workspace, object, link, and transcript baselines; validate,
   add, and install immutable fixture version 1.0.1 through Claude CLI; verify exact component inventory.
2. Skill branch: fresh Session, exact `Skill` call for
   `relay-cld-installed-fixture:installed-discovery`, no other tool/fallback, and require its body-only
   terminal marker plus matching native/DSH lifecycle.
3. Command branch: separate fresh Session, exact `Skill` call for
   `relay-cld-installed-fixture:installed-command`, no other tool/fallback, and require the command's
   body-only terminal marker plus matching native/DSH lifecycle.
4. Compare installed bytes, initial namespace listings, exact call counts/arguments, injected bodies,
   final texts, binding/source/state invariants, and self-review.
5. Uninstall, remove marketplace, delete only CLI-created orphan/empty artifacts, restore exact user
   baselines, and confirm no fixture process/config/cache remains.

## Expected results

- Required observable: each namespaced component appears initially, is selected exactly once through
  `Skill`, injects its own body, and produces its unique marker in an independent completed Session.
- Forbidden observable: unnamespaced alias, wrong component, missing body, direct prompt leakage,
  retry/fallback, shared Session contamination, unrelated mutation, or leaked installation.

## Result interpretation

- Pass only when both Skill and command branches execute and cleanup passes.
- Fail if discovery succeeds but either namespaced component cannot be invoked through Relay SDK.
- Blocked only for unrelated Claude service/CLI infrastructure outage.
