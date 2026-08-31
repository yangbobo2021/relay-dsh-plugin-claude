# CLD-EXT-011 — CLI-installed plugin discovery through SDK

## Traceability

- Primary requirement: `CLD-EXT-011`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `P`, `L`, `W`
- Priority: `P0`

## Objective

Prove that a fixture plugin installed by the active Claude CLI is discovered during a fresh
Claude Agent SDK initialization used by the Relay/DSH plugin.

## Method

1. Record user plugin/settings, Workspace, attachment-object, link, and native-session baselines.
2. Validate the immutable local marketplace/plugin, add its marketplace at user scope, install
   `relay-cld-installed-fixture@relay-cld-validation-marketplace` through the active Claude CLI,
   and independently require CLI JSON listing plus installed-cache/manifest digests.
3. Start a fresh tool-workspace Relay Claude Session and submit an unrelated exact no-tool probe so
   plugin discovery cannot be caused by the prompt. Do not invoke the fixture Skill in this case.
4. Require the initial native SDK `skill_listing` to contain exactly one namespaced
   `installed-discovery:relay-cld-installed-fixture` entry and the fixture description, while the
   user/project control skills remain present and the business turn contains zero tools.
5. Compare CLI, installed cache, native SDK, DSH binding/final, source/state baselines, and then
   self-review. Uninstall the fixture, remove the temporary marketplace, and prove cleanup.

## Expected results

- Required observable: CLI reports one enabled user install; a fresh SDK initialization exposes its
  namespaced Skill in the initial listing; unrelated probe completes exactly with zero tools.
- Forbidden observable: discovery only after prompt naming, direct local-path loading, invocation,
  duplicate namespace, missing user/project controls, state mutation, or leaked install/marketplace.

## Result interpretation

- Pass only when CLI installation, fresh SDK discovery, prompt independence, and cleanup all pass.
- Fail if the CLI install succeeds but SDK initialization omits or misnames the plugin component.
- Blocked only if the active Claude CLI cannot perform a local marketplace install for unrelated
  infrastructure reasons.
