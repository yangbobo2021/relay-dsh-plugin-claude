# CLD-EXT-017 Observations

- CLI lists exactly two enabled user plugins from distinct marketplace paths.
- Fresh initial listing contains exactly one fully namespaced `installed-discovery` from each source,
  no unnamespaced alias, and the normal project/user controls.
- Native calls `Skill` exactly twice in requested source order with distinct tool IDs and no other tool.
- Each call produces its own launch result and meta body with the correct canonical base path, marker,
  and matching `sourceToolUseID`.
- DSH records two completed Skill lifecycles in order and one exact composite final.
- The final assistant's singular attribution points to the second/last Skill; per-call provenance remains
  available in meta records and does not cross or collide.
- Both marketplace/install/cache registries are removed and user bytes restore exactly.
