import assert from "node:assert/strict";
import test from "node:test";

import {
  claudeSessionImportUpdatedAtDate,
  claudeSessionImportUiPolicy,
} from "../src/client/claude-session-import-ui-policy.mjs";

test("Workspace import UI policy covers every control state", () => {
  assert.deepEqual(claudeSessionImportUiPolicy("select-workspace", 0, 0, true), {
    canClose: true, secondary: "cancel", primary: "scan", primaryDisabled: false,
  });
  assert.deepEqual(claudeSessionImportUiPolicy("select-workspace", 0, 0, false), {
    canClose: true, secondary: "cancel", primary: "scan", primaryDisabled: true,
  });
  assert.deepEqual(claudeSessionImportUiPolicy("no-workspace"), {
    canClose: true, primary: "close", primaryDisabled: false,
  });
  assert.deepEqual(claudeSessionImportUiPolicy("scanning"), {
    canClose: true, primary: "close", primaryDisabled: false,
  });
  assert.deepEqual(claudeSessionImportUiPolicy("summary", 0), {
    canClose: true, secondary: "cancel", primary: "import-selected", primaryDisabled: true,
  });
  assert.deepEqual(claudeSessionImportUiPolicy("summary", 2), {
    canClose: true, secondary: "cancel", primary: "import-selected", primaryDisabled: false,
  });
  assert.deepEqual(claudeSessionImportUiPolicy("importing", 2), {
    canClose: false, primary: "importing", primaryDisabled: true,
  });
  assert.deepEqual(claudeSessionImportUiPolicy("error"), {
    canClose: true, secondary: "cancel", primary: "retry", primaryDisabled: false,
  });
  assert.deepEqual(claudeSessionImportUiPolicy("complete", 0, 1), {
    canClose: true, secondary: "close", primary: "retry", primaryDisabled: false,
  });
  assert.deepEqual(claudeSessionImportUiPolicy("complete", 0, 0), {
    canClose: true, primary: "close", primaryDisabled: false,
  });
});

test("Workspace import renders App Server epoch seconds as real dates", () => {
  assert.equal(claudeSessionImportUpdatedAtDate(1_700_000_000)?.toISOString(), "2023-11-14T22:13:20.000Z");
  assert.equal(claudeSessionImportUpdatedAtDate(1_700_000_000_000)?.toISOString(), "2023-11-14T22:13:20.000Z");
  assert.equal(claudeSessionImportUpdatedAtDate("invalid"), null);
  assert.equal(claudeSessionImportUpdatedAtDate(null), null);
});
