# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_ext012

## Environment

- Finished: 2026-08-29 19:12 Asia/Shanghai; operator: Codex protocol + live validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- Relay SDK runtime / direct-control SDK / backend: `0.3.233` / `0.3.248` / `sdk`
- Relay/direct Claude Code: `2.1.233` / `2.1.248`; DSH official `0.1.0-rc.8`
- Node / platform: `v25.5.0` / macOS arm64
- Repository state: validation/spec artifact additions only; product source unchanged

## Configuration

- No CLI-installed fixture plugin, user enabled-plugin entry, installed registry, or fixture cache
- Direct SDK positive control receives one explicit immutable local plugin path and no setting sources
- Fresh tool-workspace Relay Claude Sonnet/Medium/Workspace Write Session for the live negative

## Commands and actions

Confirmed a clean user-plugin baseline; ran a capturing `ClaudeSessionRuntime`/`ClaudeSdkClient`
boundary probe; ran a real direct SDK query with explicit `plugins: [{type: "local", path}]`; then ran
an unrelated fresh DSH/Relay query with no installation. Compared SDK init, native listings, final
texts, tool counts, DSH archive, UI, configuration/state/source digests, and self-reviewed the version
differential and option boundary. Product source was not modified.

## Cases selected

- `cases/CLD-EXT-012--local-plugin-path.md`

## Deviations

- Relay's public Session path exposes no plugin field, so a live positive Relay trial cannot be
  configured. The capturing boundary probe proves an injected field is dropped at both runtime and
  final `query()` layers; the fresh live trial confirms the resulting initial listing omits it.
- Direct positive control uses the currently installed SDK/Claude Code `0.3.248`/`2.1.248`, while the
  already-running Relay process records `0.3.233`/`2.1.233`. The local-plugin option exists in the
  installed SDK declaration and the failure is independently located in Relay's own option mapping.

## Evidence index

- `evidence/CLD-EXT-012/local-path-evidence.json`
- `evidence/CLD-EXT-012/observations.md`
- `evidence/CLD-EXT-012/relay-no-local-plugin.png`
- `evidence/CLD-EXT-012/review.md`
