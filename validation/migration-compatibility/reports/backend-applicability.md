# Claude backend applicability

Status date: 2026-08-29

## Product verdict

The default and actually validated Claude backend is the **Claude Agent SDK**. Production `auto` starts the SDK
first and enters CLI fallback only if SDK startup fails. A retained live DSH business Session records native
entrypoint `sdk-ts` and prompt source `sdk`.

The CLI backend is an emergency, text-only fallback. Earlier SDK run verdicts do not automatically apply to it.

| Capability boundary | SDK baseline | CLI fallback |
| --- | --- | --- |
| Production selection | Default primary; live verified | Explicit `backend: cli`, or SDK-start failure |
| Plain text transport | Live verified | Client argument/stream contract verified; not rerun live in this matrix |
| Image input | Supported and live verified | **Unsupported**; explicit pre-spawn rejection |
| DSH-contributed tools | Supported and live verified through SDK MCP bridge | **Unsupported**; explicit pre-spawn rejection |
| DSH approval/question cards | Supported and live verified through SDK requests | No SDK request bridge; CLI receives native permission-mode arguments only |
| Model/effort/settings/cwd | Live verified | CLI argument mapping verified with deterministic process fixture |
| New/resumed native Session arguments | Live verified | `--session-id` and `--resume` mapping verified with deterministic process fixture |
| Built-in tools, Skills, MCP, plugins, Hooks, instructions | Individually evaluated by the SDK cases | **Not independently evaluated on CLI**; no SDK verdict inherited |
| Browser/host/session presentation | Individually evaluated by SDK + DSH live cases | **Not independently evaluated on CLI** |

## Applicability rule for the migration catalog

- The 85 runs before `CLD-SES-006` describe the SDK-backed product surface unless their case explicitly declares
  another scope.
- A DSH/Web-only result may describe composer or presentation behavior independent of backend, but it still does
  not prove CLI model execution.
- CLI support may be claimed only for the directly tested metadata, fail-closed checks and process-argument/stream
  contracts above.
- In particular, SDK image support, DSH MCP bridging, SDK approval/question requests and the extension matrix must
  never be reported as CLI support.

## Evidence

- Case: `../cases/CLD-SES-006--sdk-cli-applicability.md`
- Run: `../runs/2026-08-29_0.1.3_25405ee_sdk-cli_macos-arm64_ses006/`
- Backend source: `../../../plugin.mjs`, `../../../cli-client.mjs`, `../../../sdk-client.mjs`
- Prior live backend evidence: `../runs/2026-08-29_0.1.3_25405ee_sdk_macos-arm64_ses001/evidence/CLD-SES-001/`
