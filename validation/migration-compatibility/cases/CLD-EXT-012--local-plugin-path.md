# CLD-EXT-012 — Local plugin path loading

## Traceability

- Primary requirement: `CLD-EXT-012`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `P`, `L`
- Priority: `P0`

## Objective

Prove whether Relay can pass the Claude Agent SDK's explicit `plugins: [{type: "local", path}]`
option so a local fixture plugin is discovered without CLI installation or user-config mutation.

## Method

1. Confirm CLI/plugin/cache/user configuration contains no fixture installation and record source,
   state, object, link, and transcript baselines.
2. Positive control: call the same installed Claude Agent SDK directly with only the immutable local
   plugin path and no setting sources; submit an unrelated no-tool prompt and require the initial SDK
   listing to contain the namespaced fixture Skill exactly once.
3. Relay option-boundary probe: pass `plugins` into public Session/client configuration with capturing
   fakes and require it to survive both runtime creation and final SDK `query()` options.
4. Live negative/positive confirmation as indicated by step 3: fresh DSH Session with no CLI install,
   unrelated no-tool prompt, inspect initial native listing and DSH final. Do not install the plugin or
   invoke its Skill.
5. Compare direct SDK, Relay boundary, native/DSH/UI, config/state/source evidence; self-review and
   classify the capability without modifying product source.

## Expected results

- Required observable: direct SDK positive control and Relay path both expose exactly one
  `relay-cld-installed-fixture:installed-discovery` initial entry from the explicit path.
- Forbidden observable: reliance on CLI install, user/project settings, prompt naming/invocation,
  duplicated namespace, silent option drop, unrelated mutation, or leaked configuration.

## Result interpretation

- Pass only when Relay preserves the explicit plugin config through the real SDK initialization.
- Fail when the SDK control works but Relay drops or cannot express the local plugin option.
- Blocked only if the direct SDK control is unavailable for an unrelated infrastructure reason.
