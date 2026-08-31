# CLD-CFG-005 — Enabled plugin configuration

## Traceability

- Primary requirement: `CLD-CFG-005`
- Backend applicability: `sdk`
- Verification levels: `P`, `L`
- Priority: `P0`

## Objective

Prove that user `enabledPlugins` configuration controls whether an installed fixture plugin reaches a
fresh Claude SDK initialization through Relay.

## Method

1. Snapshot plugin/settings/marketplace state; add the local fixture marketplace and install its plugin
   with the Claude CLI, producing `enabledPlugins[id]=true`.
2. Run an unrelated no-tool real SDK Session and require the namespaced fixture Skill in native init.
3. Disable the same installed plugin (`enabledPlugins[id]=false`), run another fresh Session, and require
   the fixture namespace absent while a built-in control remains.
4. Compare configs, CLI inventory, native init listings and source digests; uninstall/remove and restore
   all user state byte-exactly; self-review install versus enabled causality.

## Expected results

- Required observable: enabled init contains fixture namespace; disabled init omits it.
- Forbidden observable: invoking the plugin to force discovery, stale init cache, config leakage, or incomplete cleanup.

## Result interpretation

- Pass only when the fresh-init differential follows the enabled boolean while installation remains.
- Fail if Relay/SDK ignores the boolean or drops setting sources.
