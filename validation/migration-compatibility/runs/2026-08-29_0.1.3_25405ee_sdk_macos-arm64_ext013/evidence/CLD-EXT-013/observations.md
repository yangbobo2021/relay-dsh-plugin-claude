# CLD-EXT-013 Observations

- CLI validates and installs version 1.0.1, then inventories exactly two components:
  `installed-command` and `installed-discovery`.
- Both fresh native initial listings contain exactly the two expected plugin namespaces plus project
  and user/built-in controls.
- Skill branch calls only `Skill` with exact discovery namespace. Native meta then injects the exact
  canonical body and base directory, and the assistant record attributes both plugin and Skill.
- Command branch calls only `Skill` with exact command namespace. Native meta injects the exact
  command body, and the assistant record carries the expected plugin/command attribution.
- DSH records one completed `Skill` activity, zero approval requests, one completed turn, and the
  exact body-derived final in each independent Session.
- Prompts contain no result markers, so neither final can be copied from user input.
- Uninstall cleanup restores user settings and marketplace bytes exactly and removes every
  fixture-created registry/cache path.
