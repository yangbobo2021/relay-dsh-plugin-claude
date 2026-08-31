# Self-review

## Process validity

- The probe uses the production client and real model/runtime. Its SDK wrapper only records
  `createSdkMcpServer` options and query metadata, then delegates to the original functions unchanged.
- The same explicit Session ID, `resume: true` on turn 2, two completed turns, exact handler ledger and
  native transcript prevent a false pass from two fresh Sessions or prompt-only claims.
- The initial auto-path failure occurred before any model/tool observable and is explicitly excluded;
  rerunning with the exact known Relay binary removes the environmental defect without changing product.

## Result reliability

- Tool addition is proven at four layers: beta-only registration, beta-only allowlist, exact real beta
  call, exact handler result. Tool removal is proven by the absent alpha registration/allowlist and zero
  alpha handler calls on the resumed turn; its exact ToolSearch also finds no deferred reference.
- ToolSearch cannot positively discover these tools because Relay intentionally marks the SDK MCP server
  `alwaysLoad`. The review therefore does not misclassify its empty results as evidence that alpha/beta
  were absent; captured query options and actual calls are the authoritative observables.
- Prompt-supplied terminal markers prove continuity/classification only. They are not the capability
  proof. Hashes and unchanged state guard against fixture or source mutation.

## Verdict

Pass. The later turn on the same Claude Session receives and executes the updated DSH tool set without
rebinding, stale handler execution, approval, fallback or state change.
