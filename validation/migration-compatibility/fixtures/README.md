# Claude Fixtures

Fixtures must be deterministic, sanitized, small, and owned by this plugin. Expected
fixture families include:

- text and Unicode markers;
- known images, SVG output, and corrupt-image negative controls;
- a tiny Git project with one intentional test failure;
- user/shared-project/project-local Claude settings layers;
- user/project/nested `CLAUDE.md` and `.claude/rules` layers;
- user and project Skills and custom commands;
- STDIO and HTTP echo MCP servers;
- user and project Hooks;
- a local Claude plugin containing a Skill, command, Agent, MCP server, and Hook.

Every case records the fixture path and digest. Never copy a user's actual Claude
configuration or installed plugin contents into this directory.

