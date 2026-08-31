# Claude Code Verification Methods

## Verification levels

| Level | Name | Purpose | Model/account required |
| --- | --- | --- | --- |
| `S` | Static | Package, source, configuration, and boundary inspection | No |
| `P` | Protocol | Fake Agent SDK/CLI messages and adapter conversion | No |
| `A` | Automated integration | Real DSH contracts with deterministic fake backend or fixture tool | No |
| `L` | Live Claude | Signed-in real Claude Agent SDK capability check | Yes |
| `W` | DSH Web E2E | Visible official DSH behavior and persisted presentation | Yes |

Use the lowest level that proves the requirement. A protocol pass does not satisfy a
requirement whose minimum observable is user-visible or depends on real Claude-owned
configuration, Skills, MCP, Hooks, or plugins. Such a requirement must also have `L`
or `W` evidence.

SDK and CLI fallback results are recorded separately. A live SDK pass cannot be used
as a CLI fallback pass, and a CLI pass cannot prove SDK-only approval, image, MCP, or
plugin behavior.

## Case contract

Every case records:

- one primary `CLD-*` requirement ID;
- active backend applicability: `sdk`, `cli`, or both as separate subcases;
- exact preconditions and isolated fixture;
- exact command, SDK option, prompt, or DSH interaction;
- expected protocol, filesystem, transcript, and presentation observables;
- cleanup steps;
- required evidence and redaction rules;
- automation level and whether a real account is required.

One case may provide secondary coverage for other requirements, but it cannot replace
their own primary cases.

## Result states

- `pass`: every expected observable is present and no forbidden observable occurred.
- `fail`: the plugin executed but at least one expectation was violated.
- `blocked`: execution could not reach the behavior because of environment, account,
  service, or test-infrastructure failure.
- `not-run`: the case was not attempted in this run.
- `not-applicable`: allowed only when the requirement specification explicitly permits it.

## Required run metadata

- date and timezone;
- plugin version and Git commit;
- dirty/clean repository state;
- Claude Agent SDK and Claude Code executable versions;
- selected SDK or CLI backend;
- DSH version and commit;
- Node.js version, OS, architecture, and browser when applicable;
- isolated fixture revision or digest;
- exact setting sources, plugin paths, and commands;
- start/end time and operator or automation identity.

## Evidence rules

- Keep sanitized init messages, transcripts, SDK/CLI excerpts, filesystem diffs,
  screenshots, and logs under the immutable run directory.
- Plugin-loading cases retain the init `plugins`, `skills`, and `slash_commands`
  fields without credentials or unrelated user configuration.
- Record hashes for binary fixtures and output artifacts.
- Never store credentials, real customer content, home-directory configuration, or
  private production logs.
- A screenshot alone cannot prove SDK options, filesystem mutation, or setting-source
  precedence; preserve the matching machine-readable evidence.
- A blocked run remains blocked even if an earlier run passed.

