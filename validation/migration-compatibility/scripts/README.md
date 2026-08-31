# Claude Validation Scripts

Scripts in this directory automate Claude-only setup, execution, redaction, evidence
collection, and report generation. Each script must:

- accept explicit fixture and output paths;
- declare `sdk` or `cli` fallback applicability;
- avoid a user's real Claude configuration and credentials in captured output;
- print exact SDK, executable, DSH, plugin, and commit identifiers;
- write only inside the selected run directory or temporary fixture directory;
- return non-zero when an asserted observable fails.

