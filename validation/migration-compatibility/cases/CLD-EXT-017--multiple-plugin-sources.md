# CLD-EXT-017 — Multiple plugin sources

## Traceability

- Primary requirement: `CLD-EXT-017`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `P`, `L`, `W`
- Priority: `P1`

## Objective

Prove that two CLI-installed plugins from two independent local marketplaces can coexist when each
contains the same `installed-discovery` component basename, with no discovery or attribution collision.

## Method

1. Record exact user-plugin/settings/source/state baselines; validate/add both immutable marketplaces,
   install both plugins, and require CLI listing/details plus exact installed digests.
2. Fresh Relay Session with a prompt containing neither result marker: require initial Skill listing
   to contain each fully namespaced `installed-discovery` exactly once and retain controls.
3. Call first namespaced Skill exactly once, then second namespaced Skill exactly once, no other tool,
   retry or fallback; require each canonical meta body and plugin/Skill attribution in order.
4. Require exact ordered composite final from the two body-only markers; compare native/DSH/UI and
   Workspace/object/source/state evidence; self-review namespace and order.
5. Uninstall both plugins, remove both marketplaces, delete only fixture-created orphan/empty paths,
   and restore all user bytes exactly.

## Expected results

- Required observable: both colliding basenames appear once under different namespaces; each exact
  invocation loads/attributes its own body and the ordered final includes both unique markers.
- Forbidden observable: unnamespaced alias, one source masking the other, wrong/cross attribution,
  duplicate component, reordered result, unrelated tool/mutation, or leaked install/marketplace.

## Result interpretation

- Pass only when dual discovery, both invocations/attributions, order, and cleanup pass.
- Fail if either source is lost or the shared basename collides.
- Blocked only for unrelated Claude service/CLI infrastructure outage.
