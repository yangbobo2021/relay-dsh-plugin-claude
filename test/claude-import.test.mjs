import assert from "node:assert/strict";
import { mkdtemp, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { ClaudeWorkspaceImporter, importedDshSessionId } from "../claude-import.mjs";

test("Workspace scan is exact, deterministic, and excludes bound Claude Sessions", async (context) => {
  const workspace = await mkdtemp(join(tmpdir(), "relay-claude-scan-"));
  const other = await mkdtemp(join(tmpdir(), "relay-claude-other-"));
  context.after(() => Promise.all([rm(workspace, { recursive: true }), rm(other, { recursive: true })]));
  const runtime = fakeRuntime([
    session("older", workspace, 10),
    session("other", other, 40),
    session("newer", workspace, 30),
    session("bound", workspace, 20),
  ]);
  const adapter = fakeAdapter(new Map([["bound", binding("bound", "committed")]]));
  const service = new ClaudeWorkspaceImporter({ runtime, adapter, target: fakeTarget() });

  const inventory = await service.scanWorkspace(workspace);
  assert.deepEqual(inventory.entries.map(entry => [entry.session.sessionId, entry.status]), [
    ["newer", "ready"],
    ["bound", "existing"],
    ["older", "ready"],
  ]);
  assert.deepEqual(inventory.summary, { found: 3, existing: 1, recoverable: 0, ready: 2 });
});

test("Workspace scan canonicalizes an accepted symlink source path", async (context) => {
  const workspace = await mkdtemp(join(tmpdir(), "relay-claude-canonical-"));
  const alias = `${workspace}-alias`;
  await symlink(workspace, alias);
  context.after(() => Promise.all([
    rm(alias, { force: true }),
    rm(workspace, { recursive: true }),
  ]));
  const service = new ClaudeWorkspaceImporter({
    runtime: fakeRuntime([session("through-alias", alias, 10)]),
    adapter: fakeAdapter(),
    target: fakeTarget(),
  });

  const inventory = await service.scanWorkspace(workspace);
  assert.equal(inventory.entries[0].session.cwd, inventory.cwd);
  assert.notEqual(inventory.entries[0].session.cwd, alias);
});

test("selected import validates the complete selection before binding anything", async (context) => {
  const workspace = await mkdtemp(join(tmpdir(), "relay-claude-validation-"));
  context.after(() => rm(workspace, { recursive: true }));
  const runtime = fakeRuntime([session("ready", workspace, 20), session("bound", workspace, 10)]);
  const adapter = fakeAdapter(new Map([["bound", binding("bound", "committed")]]));
  const service = new ClaudeWorkspaceImporter({ runtime, adapter, target: fakeTarget() });

  for (const sessionIds of [[], ["ready", "missing"], ["ready", "ready"], ["bound"], [42]]) {
    await assert.rejects(service.importWorkspace(workspace, { sessionIds }));
    assert.equal(adapter.bindCalls.length, 0);
  }
});

test("a source that disappears after scan leaves no imported binding", async (context) => {
  const workspace = await mkdtemp(join(tmpdir(), "relay-claude-stale-"));
  context.after(() => rm(workspace, { recursive: true }));
  const runtime = fakeRuntime([session("stale", workspace, 10)]);
  runtime.readSession = async () => null;
  const adapter = fakeAdapter();
  const service = new ClaudeWorkspaceImporter({ runtime, adapter, target: fakeTarget() });

  const result = await service.importWorkspace(workspace, { sessionIds: ["stale"] });
  assert.equal(result.failed, 1);
  assert.equal(adapter.bindCalls.length, 0);
});

test("a source that moves outside the Workspace before binding leaves no imported binding", async (context) => {
  const workspace = await mkdtemp(join(tmpdir(), "relay-claude-moved-workspace-"));
  const other = await mkdtemp(join(tmpdir(), "relay-claude-moved-other-"));
  context.after(() => Promise.all([
    rm(workspace, { recursive: true }),
    rm(other, { recursive: true }),
  ]));
  const runtime = fakeRuntime([session("moved", workspace, 10)]);
  runtime.readSession = async () => session("moved", other, 10);
  const adapter = fakeAdapter();
  const service = new ClaudeWorkspaceImporter({ runtime, adapter, target: fakeTarget() });

  const result = await service.importWorkspace(workspace, { sessionIds: ["moved"] });
  assert.equal(result.failed, 1);
  assert.equal(adapter.bindCalls.length, 0);
});

test("successful and concurrent imports bind one source once and complete the transaction", async (context) => {
  const workspace = await mkdtemp(join(tmpdir(), "relay-claude-import-"));
  context.after(() => rm(workspace, { recursive: true }));
  const source = session("native-source", workspace, 10);
  const runtime = fakeRuntime([source]);
  const adapter = fakeAdapter();
  const target = fakeTarget();
  const service = new ClaudeWorkspaceImporter({ runtime, adapter, target });

  const [left, right] = await Promise.all([
    service.importSession(source, workspace),
    service.importSession(source, workspace),
  ]);
  assert.equal(left, importedDshSessionId(source.sessionId));
  assert.equal(right, left);
  assert.equal(adapter.bindCalls.length, 1);
  assert.deepEqual(target.calls, ["prepare", "hydrate", "attach", "finalize", "release"]);
  assert.equal(adapter.bindingForClaudeSession(source.sessionId).importState, "committed");

  const repeated = await service.importWorkspace(workspace);
  assert.deepEqual(repeated, { found: 1, imported: 0, existing: 1, failed: 0, failures: [] });
});

test("a failed import resumes its durable state without rebinding or duplicating completed phases", async (context) => {
  const workspace = await mkdtemp(join(tmpdir(), "relay-claude-recover-"));
  context.after(() => rm(workspace, { recursive: true }));
  const source = session("recoverable-source", workspace, 10);
  const adapter = fakeAdapter();
  let failHydrate = true;
  const target = fakeTarget();
  target.hydrate = async function hydrate() {
    this.calls.push("hydrate");
    if (failHydrate) {
      failHydrate = false;
      throw new Error("projection cache unavailable");
    }
  };
  const service = new ClaudeWorkspaceImporter({ runtime: fakeRuntime([source]), adapter, target });

  const failed = await service.importWorkspace(workspace, { sessionIds: [source.sessionId] });
  assert.equal(failed.failed, 1);
  assert.equal(adapter.bindingForClaudeSession(source.sessionId).importState, "session-created");
  assert.equal(adapter.bindCalls.length, 1);

  const recovered = await service.importWorkspace(workspace, { sessionIds: [source.sessionId] });
  assert.equal(recovered.imported, 1);
  assert.equal(adapter.bindCalls.length, 1);
  assert.equal(adapter.bindingForClaudeSession(source.sessionId).importState, "committed");
  assert.deepEqual(target.calls, [
    "prepare", "hydrate", "release",
    "prepare", "hydrate", "attach", "finalize", "release",
  ]);
});

function session(sessionId, cwd, lastModified) {
  return { sessionId, cwd, lastModified, summary: sessionId, messages: [] };
}

function fakeRuntime(sessions) {
  return {
    async listWorkspaceSessions() { return structuredClone(sessions); },
    async readSession(sessionId) {
      const source = sessions.find(candidate => candidate.sessionId === sessionId);
      return source ? structuredClone(source) : null;
    },
  };
}

function binding(claudeSessionId, importState = "reserved") {
  return {
    sessionId: importedDshSessionId(claudeSessionId),
    claudeSessionId,
    bindingMode: "imported",
    importState,
    config: { model: "sonnet", effort: "medium", cwd: "/workspace/relay" },
  };
}

function fakeAdapter(initial = new Map()) {
  const bindings = new Map(initial);
  return {
    bindCalls: [],
    configuration(_sessionId, cwd) { return { model: "sonnet", effort: "medium", cwd }; },
    bindingForClaudeSession(sessionId) { return bindings.get(sessionId) ?? null; },
    bindImportedSession(sessionId, claudeSessionId, config) {
      this.bindCalls.push({ sessionId, claudeSessionId, config });
      const record = { ...binding(claudeSessionId), sessionId, config };
      bindings.set(claudeSessionId, record);
      return structuredClone(record);
    },
    markImportState(sessionId, state) {
      const record = [...bindings.values()].find(candidate => candidate.sessionId === sessionId);
      record.importState = state;
      return structuredClone(record);
    },
  };
}

function fakeTarget() {
  return {
    calls: [],
    async prepare(input) { this.calls.push("prepare"); return input; },
    async hydrate() { this.calls.push("hydrate"); },
    async attach() { this.calls.push("attach"); },
    async finalize() { this.calls.push("finalize"); },
    async release() { this.calls.push("release"); },
  };
}
