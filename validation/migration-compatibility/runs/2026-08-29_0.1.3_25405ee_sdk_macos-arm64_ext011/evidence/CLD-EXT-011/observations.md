# CLD-EXT-011 Observations

- Claude CLI validates the marketplace/plugin and reports exactly one enabled user install with the
  expected ID/version/path. `plugin details` inventories exactly one Skill: `installed-discovery`.
- Installed manifest and Skill bytes match the canonical source digests.
- The business prompt contains neither plugin ID, Skill name, nor fixture marker. It requests a
  distinct unrelated marker and forbids tools.
- Fresh SDK initialization records one initial 14-Skill listing containing exactly one
  `relay-cld-installed-fixture:installed-discovery` entry plus its exact description.
- The same listing retains project control `relay-cld-project-skill` and user/built-in control
  `dataviz`; the auxiliary title Session also independently lists the installed plugin Skill.
- The business native transcript has zero tool uses. DSH has zero Claude tool activities and zero
  approval requests, one completed turn, the matching Claude binding, and the exact probe final.
- CLI uninstall and marketplace removal restore CLI listing to `[]` and the pre-run settings and
  known-marketplace files byte-for-byte. Fixture-created empty registry/cache artifacts are absent.
