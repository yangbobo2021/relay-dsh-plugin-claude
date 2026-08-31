# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_ses003

## Environment

- Finished: 2026-08-29 20:51 Asia/Shanghai; operator: Codex protocol + live host/browser validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- DSH / SDK / Claude Code: `0.1.0-rc.8` / `0.3.233` / `2.1.233`
- Live URL / backend: `http://127.0.0.1:4394/` / `sdk`

## Configuration

- Dedicated temp DSH home/link store; existing two-turn Claude Code Session from SES-002.

## Commands and actions

Resolved unique listener, recorded hashes, SIGTERM-stopped PID 35281 and closed port, started same profile/paths
as PID 92864, health-checked, reloaded UI, sent old-token-free third prompt and compared all durable artifacts.

## Cases selected

- `cases/CLD-SES-003--host-restart-continuation.md`

## Deviations

- Startup prints a duplicate `GNotificationCenterDelegate` warning from two libvips versions; host is healthy and
  validation paths do not invoke image processing.

## Evidence index

- `evidence/CLD-SES-003/session-evidence.json`
- `evidence/CLD-SES-003/observations.md`
- `evidence/CLD-SES-003/review.md`
