import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import test from "node:test";

import { ClaudeSessionRuntime } from "../session-runtime.mjs";

test("Claude sessions keep context across turns and resume through the client", async () => {
  const client = new FakeClaudeClient();
  const runtime = new ClaudeSessionRuntime({ client, cwd: "/workspace/relay" });
  await runtime.initialize();

  const first = await runtime.createSession({ model: "sonnet", effort: "medium" });
  await runtime.sendMessage(first.id, { text: "first turn" });
  await runtime.sendMessage(first.id, { text: "second turn" });
  const second = await runtime.createSession();
  await runtime.sendMessage(second.id, { text: "other session" });
  await runtime.resumeSession(first.id, { cwd: "/workspace/relay" });
  await runtime.sendMessage(first.id, { text: "third turn" });
  await tick();

  assert.equal(runtime.snapshot().selectedSessionId, first.id);
  assert.equal(runtime.getSession(first.id).turns.length, 3);
  assert.equal(runtime.getSession(second.id).turns.length, 1);
  assert.deepEqual(client.resumed, [{ sessionId: first.id, config: { cwd: "/workspace/relay" } }]);
  await runtime.close();
});

test("Claude activity notifications remain incremental", async () => {
  const client = new FakeClaudeClient();
  const runtime = new ClaudeSessionRuntime({ client, cwd: "/workspace/relay" });
  const activity = [];
  runtime.on("activity", message => activity.push(message));
  await runtime.initialize();
  const session = await runtime.createSession();
  await runtime.sendMessage(session.id, { text: "run pwd" });
  await tick();

  assert.deepEqual(activity.map(message => message.method), [
    "item/started",
    "item/completed",
    "item/agentMessage/delta",
    "turn/completed",
  ]);
  assert.equal(runtime.getSession(session.id).turns[0].status, "completed");
  await runtime.close();
});

test("ephemeral Claude sessions are released", async () => {
  const client = new FakeClaudeClient();
  const runtime = new ClaudeSessionRuntime({ client, cwd: "/workspace/relay" });
  await runtime.initialize();

  const session = await runtime.createSession({
    sandbox: "read-only",
    approvalPolicy: "never",
    ephemeral: true,
    settingSources: [],
    systemPrompt: "Generate a title.",
  });
  assert.equal(client.created[0].ephemeral, true);
  assert.deepEqual(client.created[0].settingSources, []);
  assert.equal(client.created[0].systemPrompt, "Generate a title.");
  await runtime.releaseSession(session.id);
  assert.equal(runtime.getSession(session.id), null);
  assert.deepEqual(client.released, [session.id]);
  await runtime.close();
});

test("Claude runtime preserves multimodal content and callbacks for the SDK client", async () => {
  const client = new FakeClaudeClient();
  const runtime = new ClaudeSessionRuntime({ client, cwd: "/workspace/relay" });
  await runtime.initialize();
  const session = await runtime.createSession();
  const executeDshTool = async () => ({ isError: false, content: [] });

  await runtime.sendMessage(session.id, {
    text: "",
    content: [{ type: "image", mediaType: "image/png", data: "AQID" }],
    dshTools: [{ name: "probe" }],
    executeDshTool,
  });

  assert.deepEqual(client.sent[0].message.content, [
    { type: "image", mediaType: "image/png", data: "AQID" },
  ]);
  assert.deepEqual(client.sent[0].message.dshTools, [{ name: "probe" }]);
  assert.equal(client.sent[0].message.executeDshTool, executeDshTool);
  await runtime.close();
});

class FakeClaudeClient extends EventEmitter {
  constructor() {
    super();
    this.created = [];
    this.resumed = [];
    this.sent = [];
    this.released = [];
    this.sessionSequence = 0;
    this.turnSequence = 0;
  }

  async start() {}
  async close() {}

  async listModels() {
    return [{
      id: "sonnet",
      displayName: "Claude Sonnet",
      isDefault: true,
      defaultReasoningEffort: "medium",
      supportedReasoningEfforts: [{ reasoningEffort: "low" }, { reasoningEffort: "medium" }],
    }];
  }

  async createSession(config) {
    this.created.push(structuredClone(config));
    return { id: `claude-${++this.sessionSequence}`, cwd: config.cwd, turns: [] };
  }

  async resumeSession(sessionId, config) {
    this.resumed.push({ sessionId, config: structuredClone(config) });
    return { id: sessionId, cwd: config.cwd, turns: [] };
  }

  async sendMessage(sessionId, message) {
    this.sent.push({
      sessionId,
      message: {
        ...message,
        content: structuredClone(message.content),
        dshTools: structuredClone(message.dshTools),
      },
    });
    const id = `turn-${++this.turnSequence}`;
    queueMicrotask(() => {
      this.emit("activity", { method: "item/started", params: {
        sessionId, turnId: id, item: { type: "toolUse", id: `${id}-tool`, name: "Bash", input: { command: "pwd" }, status: "inProgress" },
      } });
      this.emit("activity", { method: "item/completed", params: {
        sessionId, turnId: id, item: { type: "toolUse", id: `${id}-tool`, name: "Bash", output: "/workspace/relay", status: "completed" },
      } });
      this.emit("activity", { method: "item/agentMessage/delta", params: { sessionId, turnId: id, itemId: `${id}-answer`, delta: "done" } });
      this.emit("activity", { method: "turn/completed", params: { sessionId, turn: { id, status: "completed", error: null, items: [] } } });
    });
    return { id, status: "inProgress", items: [] };
  }

  async releaseSession(sessionId) {
    this.released.push(sessionId);
  }
}

const tick = () => new Promise(resolve => setTimeout(resolve, 0));
