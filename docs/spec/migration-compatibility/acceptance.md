# Claude Code Migration Compatibility Acceptance

## Requirement gate

A requirement is `verified` only when:

1. its specification row is `ready`;
2. at least one primary Claude case exists;
3. the latest applicable run passed;
4. all required evidence is present and linked;
5. the result identifies exact Claude SDK, executable, DSH, plugin, fixture, backend,
   and platform versions;
6. no open failure contradicts the claimed supported version range.

## Capability group gate

A group is complete only when every P0 requirement is verified. P1 and P2 gaps must
remain visible in the report and must not be summarized as supported.

SDK and CLI fallback support are reported independently. The migration baseline is
an SDK baseline unless a report explicitly claims a narrower CLI fallback baseline.

## Migration baseline gate

The plugin may claim Claude Code migration capability only when the P0 requirements
for all of these groups pass:

- text and multi-turn conversation;
- image input and generated artifact presentation;
- project Read, Write, Edit, Bash, test, Git, approval, and question tools;
- user, shared-project, and project-local settings;
- user, project, rules, and nested `CLAUDE.md` instructions;
- user and project Skills and MCP;
- CLI-installed and explicit local Claude plugin discovery and invocation;
- plugin Skills, commands, MCP tools, and Hooks;
- Workspace boundaries and environment inheritance;
- existing Claude Session migration applicability and normal continuation.

Small combined scenarios may be run after this gate to detect interactions, but they
do not change atomic requirement results.

