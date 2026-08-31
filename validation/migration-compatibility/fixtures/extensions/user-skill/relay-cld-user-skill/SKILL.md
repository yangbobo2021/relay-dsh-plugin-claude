---
name: relay-cld-user-skill
description: Relay Claude migration fixture. Use when the user explicitly requests relay-cld-user-skill, says CLD_EXT004_AUTO_TRIGGER_0404, or asks to validate this skill's bundled reference and script.
---

# Relay Claude User Skill Fixture

This is a sanitized migration-validation fixture.

- For an explicit manual invocation without an automatic-trigger or resource request, reply exactly
  `CLD_EXT003_MANUAL_SKILL_0303` and add nothing else.
- When the user says `CLD_EXT004_AUTO_TRIGGER_0404`, reply exactly
  `CLD_EXT004_AUTO_SKILL_0404` and add nothing else.
- When asked to validate bundled resources, use Read on `references/marker.txt`, use Bash to run
  `bash scripts/emit-marker.sh` from this skill's base directory, then reply exactly
  `CLD_EXT005_BUNDLE_OK_0505` only if both exact markers are observed.
