import assert from "node:assert/strict";
import test from "node:test";

import { installModelSelection } from "../model-selection.mjs";

test("a preset change during model discovery still selects the Claude provider", async () => {
  const harness = modelHarness("standard");
  const stop = installModelSelection(harness.ctx, "relay-claude", "relay-claude", "relay-codex");
  harness.setPreset("relay-claude");
  harness.releaseFirstQuery();

  await waitFor(() => harness.selections.length === 1);
  assert.deepEqual(harness.selections, [{
    sessionId: "session-1",
    provider: "relay-claude",
    model: "claude-default",
  }]);
  assert.equal(harness.modelQueries(), 2);
  stop();
});

function modelHarness(initialProvider) {
  let state = { current: "session-1", byId: { "session-1": { id: "session-1", blank: true, projectionValues: { agentPreset: "standard" } } } };
  let currentProvider = initialProvider;
  let firstResolver;
  let queries = 0;
  const listeners = new Set();
  const selections = [];
  const response = () => ({
    current: { provider: currentProvider },
    groups: [
      { id: "standard", models: [{ id: "standard-default" }] },
      { id: "relay-claude", models: [{ id: "claude-default" }] },
    ],
  });
  const directory = {
    load() {
      queries += 1;
      if (queries === 1) return new Promise(resolve => { firstResolver = () => resolve(response()); });
      return Promise.resolve(response());
    },
    async select(selection) {
      selections.push({ sessionId: "session-1", ...selection });
      currentProvider = selection.provider;
      return;
    },
  };
  return {
    ctx: {
      modelDirectories: { directoryFor: () => directory },
      sessions: { list: { getSnapshot: () => state, subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); } } },
    },
    selections,
    modelQueries: () => queries,
    releaseFirstQuery: () => firstResolver(),
    setPreset(agentPreset) {
      state = { ...state, byId: { ...state.byId, "session-1": { ...state.byId["session-1"], projectionValues: { agentPreset } } } };
      for (const listener of listeners) listener();
    },
  };
}

async function waitFor(predicate) {
  const deadline = Date.now() + 1_000;
  while (!predicate()) {
    if (Date.now() >= deadline) throw new Error("timed out waiting for model selection");
    await new Promise(resolve => setTimeout(resolve, 0));
  }
}


test("an already selected Claude provider does not reset its model on list projection changes", async () => {
  const harness = modelHarness("relay-claude");
  const stop = installModelSelection(harness.ctx, "relay-claude", "relay-claude", "relay-codex");
  harness.setPreset("relay-claude");
  harness.releaseFirstQuery();
  await waitFor(() => harness.modelQueries() === 2);
  await new Promise(resolve => setTimeout(resolve, 5));
  assert.deepEqual(harness.selections, []);
  harness.setPreset("relay-claude");
  await new Promise(resolve => setTimeout(resolve, 5));
  assert.deepEqual(harness.selections, []);
  stop();
});

test("disposing Claude synchronization prevents late directory responses from selecting a model", async () => {
  const harness = modelHarness("standard");
  const stop = installModelSelection(harness.ctx, "relay-claude", "relay-claude", "relay-codex");
  harness.setPreset("relay-claude");
  stop();
  harness.releaseFirstQuery();
  await new Promise(resolve => setTimeout(resolve, 5));
  assert.deepEqual(harness.selections, []);
});

test("a missing session directory cannot throw out of the Session-list subscriber", async () => {
  const harness = modelHarness("standard");
  harness.ctx.modelDirectories.directoryFor = () => { throw new Error("session scope is not ready"); };
  const stop = installModelSelection(harness.ctx, "relay-claude", "relay-claude", "relay-codex");
  harness.setPreset("relay-claude");
  await new Promise(resolve => setTimeout(resolve, 5));
  assert.deepEqual(harness.selections, []);
  stop();
});
