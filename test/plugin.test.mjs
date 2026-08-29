import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { apply } from "../lib/host-plugin.js";
import { PluginHost } from "../internal/plugin-sdk.mjs";
import { createClaudeExecutionPlugin } from "../plugin.mjs";

test("Claude plugin exposes operation capabilities and closes its backend", async () => {
  const client = new FakeClaudeClient();
  const host = new PluginHost();
  await host.activate([createClaudeExecutionPlugin({
    client,
    cwd: "/workspace",
    plugins: [{ type: "local", path: "/plugins/fixture" }],
  })]);
  const execution = host.capabilities.require("relay.execution.claude.v1", "^1.0.0");

  await execution.whenReady();
  assert.deepEqual(execution.listModels().map((model) => model.id), ["claude-test"]);
  assert.equal("runtime" in execution, false);
  assert.equal("client" in execution, false);
  await execution.createSession();
  assert.deepEqual(client.created.plugins, [{ type: "local", path: "/plugins/fixture" }]);
  const requests = [];
  const stop = execution.subscribeRequest((request) => requests.push(request.id));
  client.emit("request", { id: "request-1", method: "test", params: {} });
  assert.deepEqual(requests, ["request-1"]);
  stop();
  client.emit("request", { id: "request-2", method: "test", params: {} });
  assert.deepEqual(requests, ["request-1"]);

  await host.dispose();
  assert.equal(client.closed, true);
});

test("DSH Host claudePlugins configuration reaches business Session creation", async (context) => {
  const directory = await mkdtemp(join(tmpdir(), "relay-claude-local-plugin-config-"));
  const previousDshHome = process.env.DSH_HOME;
  process.env.DSH_HOME = join(directory, "dsh-home");
  context.after(async () => {
    if (previousDshHome === undefined) delete process.env.DSH_HOME;
    else process.env.DSH_HOME = previousDshHome;
    await rm(directory, { recursive: true, force: true });
  });
  const client = new FakeClaudeClient();
  const cleanups = [];
  let adapter;
  const ctx = {
    attachments: {},
    logger: console,
    agents: { list: () => [], get: () => null },
    approval: {},
    sessions: {},
    sessionPersistence: {},
    tools: {},
    typert: {},
    userQuestions: {},
    workspaceRegistry: { async resolveByPath() { return null; } },
    sessionTitle: {},
    webServer: { register() { return () => {}; } },
    llm: {
      registerAdapter(_providers, candidate) {
        adapter = candidate;
        return () => {};
      },
    },
    effect(effect) {
      const cleanup = effect();
      cleanups.push(cleanup);
      return cleanup;
    },
    on() { return () => {}; },
  };

  await apply(ctx, {
    claude: { client },
    claudePlugins: [{ type: "local", path: "/plugins/from-dsh-host" }],
    claudeLinkPath: join(directory, "links.json"),
  });
  await adapter.ensureSession("dsh-session");

  assert.deepEqual(client.created.plugins, [{ type: "local", path: "/plugins/from-dsh-host" }]);
  for (const cleanup of cleanups.reverse()) await cleanup?.();
});

class FakeClaudeClient extends EventEmitter {
  constructor() {
    super();
    this.closed = false;
  }

  async start() {}
  async listModels() { return [{ id: "claude-test", isDefault: true }]; }
  async createSession(config) {
    this.created = structuredClone(config);
    return { id: "claude-session", cwd: config.cwd, turns: [] };
  }
  async close() { this.closed = true; }
}
