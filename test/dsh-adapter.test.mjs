import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { ClaudeDshAdapter, CLAUDE_ACTIVITY_EVENT } from "../claude-adapter.js";
import { ClaudeLinkStore } from "../claude-link-store.js";
import { handleClaudeSdkRequest } from "../claude-tools.js";
import { installClaudeSessionEventType } from "../host-plugin.js";

test("the Claude preset streams tool activity and answers into the native DSH conversation", async () => {
  const runtime = new FakeRuntime();
  const adapter = new ClaudeDshAdapter({ runtime, ready: Promise.resolve() });
  const agent = fakeAgent();
  adapter.attachAgent(agent);

  const chunks = [];
  for await (const chunk of adapter.stream({
    provider: "relay-claude",
    model: "sonnet",
    reasoningEffort: "high",
    sessionId: agent.id,
    messages: [
      { role: "user", source: { kind: "plugin" }, content: [{ type: "text", text: "runtime context" }] },
      { role: "user", source: { kind: "user" }, content: [{ type: "text", text: "actual question" }] },
    ],
  })) chunks.push(chunk);

  assert.equal(runtime.sent[0].message.text, "actual question");
  assert.equal(runtime.sent[0].message.model, "sonnet");
  assert.equal(runtime.createdConfig.settingSources.includes("project"), true);
  assert.equal(runtime.createdConfig.systemPrompt.preset, "claude_code");
  assert.equal(chunks.find(chunk => chunk.type === "reasoning-delta").text, "Checked the workspace.");
  assert.equal(chunks.find(chunk => chunk.type === "text-delta").text, "done");
  assert.equal(chunks.at(-1).replayState.claudeSessionId, "claude-1");
  assert.equal(agent.appended.filter(event => event.type === CLAUDE_ACTIVITY_EVENT).length, 2);
  assert.equal(agent.appended.at(-1).data.activity.title, "Bash");
  assert.match(agent.appended.at(-1).data.activity.input, /pwd/);
  assert.equal(agent.appended.at(-1).data.activity.output, "ok\n");
});

test("Claude models expose native reasoning effort choices", async () => {
  const runtime = new FakeRuntime();
  const adapter = new ClaudeDshAdapter({ runtime, ready: Promise.resolve() });

  const model = await adapter.resolveModel("relay-claude", "sonnet");

  assert.deepEqual(model.reasoning.efforts.map(effort => effort.id), ["low", "high"]);
  assert.equal(model.reasoning.defaultEffort, "medium");
});

test("a Relay activation reaches Claude instead of replaying the previous human message", async () => {
  const runtime = new FakeRuntime();
  const adapter = new ClaudeDshAdapter({ runtime, ready: Promise.resolve() });
  const agent = fakeAgent();
  adapter.attachAgent(agent);

  for await (const _chunk of adapter.stream({
    provider: "relay-claude",
    model: "sonnet",
    sessionId: agent.id,
    messages: [
      { role: "user", source: { kind: "user" }, content: [{ type: "text", text: "wait for the event" }] },
      { role: "user", source: { kind: "plugin", plugin: "system" }, content: [{ type: "text", text: "generic context" }] },
      {
        role: "user",
        source: { kind: "plugin", plugin: "relay" },
        content: [{ type: "text", text: "[RELAY EXTERNAL EVENT]\nevent_json: {\"marker\":\"ready\"}" }],
      },
    ],
  })) {}

  assert.equal(runtime.sent[0].message.text, "[RELAY EXTERNAL EVENT]\nevent_json: {\"marker\":\"ready\"}");
});

test("automatic title generation uses an isolated ephemeral Claude session", async () => {
  const runtime = new FakeRuntime();
  const adapter = new ClaudeDshAdapter({ runtime, ready: Promise.resolve() });
  const agent = fakeAgent();
  adapter.attachAgent(agent);

  const [mainChunks, titleChunks] = await Promise.all([
    collect(adapter.stream({
      provider: "relay-claude",
      model: "sonnet",
      sessionId: agent.id,
      messages: [{ role: "user", source: { kind: "user" }, content: [{ type: "text", text: "list project files" }] }],
    })),
    collect(adapter.stream({
      provider: "relay-claude",
      model: "sonnet",
      sessionId: agent.id,
      purpose: "session-title",
      system: "Generate a concise title.",
      messages: [{
        role: "user",
        source: { kind: "plugin", plugin: "dsh-session-title-llm" },
        content: [{ type: "text", text: "Generate the session title from this JSON array: [\"list project files\"]" }],
      }],
    })),
  ]);

  const auxiliaryConfig = runtime.createdConfigs.find(config => config.ephemeral === true);
  assert.equal(adapter.sessionFor(agent.id), "claude-1");
  assert.equal(auxiliaryConfig.sandbox, "read-only");
  assert.equal(auxiliaryConfig.approvalPolicy, "never");
  assert.deepEqual(auxiliaryConfig.settingSources, ["user"]);
  assert.deepEqual(runtime.released, ["claude-2"]);
  assert.equal(mainChunks.find(chunk => chunk.type === "text-delta").text, "done");
  assert.equal(titleChunks.find(chunk => chunk.type === "text-delta").text, "项目文件查询");
});

test("DSH-to-Claude links and configuration survive host restart", async (context) => {
  const directory = await mkdtemp(join(tmpdir(), "relay-claude-links-"));
  context.after(() => rm(directory, { recursive: true, force: true }));
  const path = join(directory, "links.json");
  const firstRuntime = new FakeRuntime();
  const first = new ClaudeDshAdapter({ runtime: firstRuntime, ready: Promise.resolve(), linkStore: new ClaudeLinkStore(path) });
  first.configure("dsh-1", { model: "sonnet", effort: "high", sandbox: "read-only" });
  const claudeSessionId = await first.ensureSession("dsh-1");

  const persisted = JSON.parse(await readFile(path, "utf8"));
  assert.equal(persisted.sessions["dsh-1"].claudeSessionId, claudeSessionId);
  const secondRuntime = new FakeRuntime();
  const second = new ClaudeDshAdapter({ runtime: secondRuntime, ready: Promise.resolve(), linkStore: new ClaudeLinkStore(path) });
  assert.equal(await second.ensureSession("dsh-1"), claudeSessionId);
  assert.equal(second.configuration("dsh-1").sandbox, "read-only");
  assert.equal(secondRuntime.created, 0);
  assert.equal(secondRuntime.resumed, 1);
});

test("concurrent first messages create one Claude session and DSH accepts durable activity", async () => {
  installClaudeSessionEventType();
  const runtime = new FakeRuntime();
  const adapter = new ClaudeDshAdapter({ runtime, ready: Promise.resolve() });
  const [left, right] = await Promise.all([adapter.ensureSession("dsh-1"), adapter.ensureSession("dsh-1")]);
  assert.equal(left, right);
  assert.equal(runtime.created, 1);
});

test("Claude SDK permission and question requests use DSH services", async () => {
  const agent = fakeAgent();
  const adapter = { dshSessionForClaudeSession: sessionId => sessionId === "claude-1" ? agent.id : null };
  const calls = { approvals: [], questions: [] };
  const ctx = {
    agents: { get: id => id === agent.id ? agent : null },
    approval: { async request(input) { calls.approvals.push(input); return "allowed-once"; } },
    userQuestions: {
      async ask(input) {
        calls.questions.push(input);
        return { answers: [{ id: "question-1", selected: ["Detailed"], custom: "with tests" }] };
      },
    },
  };
  const runtime = new InteractionRuntime();

  await handleClaudeSdkRequest(ctx, {
    adapter,
    runtime,
    request: {
      id: "approval-1",
      method: "tool/requestApproval",
      params: { sessionId: "claude-1", toolName: "Write", input: { file_path: "probe.txt" }, title: "Claude wants to write probe.txt" },
    },
  });
  assert.equal(calls.approvals[0].agent, agent);
  assert.equal(calls.approvals[0].toolName, "Claude Write");
  assert.equal(runtime.resolved.at(-1).response.action, "accept");

  await handleClaudeSdkRequest(ctx, {
    adapter,
    runtime,
    request: {
      id: "question-1",
      method: "tool/requestUserInput",
      params: { sessionId: "claude-1", input: { questions: [{
        question: "How detailed?",
        header: "Detail",
        options: [{ label: "Brief" }, { label: "Detailed" }],
      }] } },
    },
  });
  assert.equal(calls.questions[0].questions[0].question, "How detailed?");
  assert.deepEqual(runtime.resolved.at(-1).response.answers, { "How detailed?": "Detailed" });
});

test("DSH approval denial and cancellation stay fail-closed", async () => {
  const agent = fakeAgent();
  const adapter = { dshSessionForClaudeSession: () => agent.id };

  for (const outcome of ["rejected", "cancelled", "unavailable"]) {
    const runtime = new InteractionRuntime();
    const ctx = {
      agents: { get: () => agent },
      approval: { async request() { return outcome; } },
    };
    await handleClaudeSdkRequest(ctx, {
      adapter,
      runtime,
      request: {
        id: `approval-${outcome}`,
        method: "tool/requestApproval",
        params: { sessionId: "claude-1", toolName: "Bash", input: { command: "false" } },
      },
    });

    assert.equal(runtime.rejected.length, 0);
    assert.equal(runtime.resolved[0].response.action, "decline");
    assert.equal(runtime.resolved[0].response.message, `DSH approval returned ${outcome}.`);
  }
});

test("Claude interaction failures reject instead of bypassing DSH services", async () => {
  const agent = fakeAgent();
  const serviceCalls = { approvals: 0, questions: 0 };
  const ctx = {
    agents: { get: id => id === agent.id ? agent : null },
    approval: {
      async request() {
        serviceCalls.approvals += 1;
        return "allowed-once";
      },
    },
    userQuestions: {
      async ask() {
        serviceCalls.questions += 1;
        throw Object.assign(new Error("question cancelled"), { code: "ASK_ABORTED" });
      },
    },
  };
  const adapter = { dshSessionForClaudeSession: id => id === "claude-1" ? agent.id : null };
  const runtime = new InteractionRuntime();

  await handleClaudeSdkRequest(ctx, {
    adapter,
    runtime,
    request: {
      id: "unknown-session",
      method: "tool/requestApproval",
      params: { sessionId: "claude-missing", toolName: "Write", input: {} },
    },
  });
  await handleClaudeSdkRequest(ctx, {
    adapter,
    runtime,
    request: {
      id: "unsupported-request",
      method: "tool/unknownInteraction",
      params: { sessionId: "claude-1" },
    },
  });
  await handleClaudeSdkRequest(ctx, {
    adapter,
    runtime,
    request: {
      id: "cancelled-question",
      method: "tool/requestUserInput",
      params: {
        sessionId: "claude-1",
        input: { questions: [{ question: "Continue?", header: "Confirm" }] },
      },
    },
  });

  assert.equal(runtime.resolved.length, 0);
  assert.equal(serviceCalls.approvals, 0);
  assert.equal(serviceCalls.questions, 1);
  assert.match(runtime.rejected[0].error.message, /no owning live DSH Session/);
  assert.match(runtime.rejected[1].error.message, /Unsupported Claude interaction/);
  assert.equal(runtime.rejected[2].error.code, "ASK_ABORTED");
});

test("Claude forwards generic DSH tools through a provider-neutral executor", async () => {
  const calls = [];
  const runtime = new FakeRuntime();
  const agent = fakeAgent({
    tools: {
      async execute(input) {
        calls.push(input);
        return { isError: false, value: "ok", content: [{ type: "text", text: "probe complete" }] };
      },
    },
  });
  const adapter = new ClaudeDshAdapter({ runtime, ready: Promise.resolve() });
  adapter.attachAgent(agent);
  await collect(adapter.stream({
    provider: "relay-claude",
    model: "sonnet",
    sessionId: agent.id,
    messages: [{ role: "user", source: { kind: "user" }, content: [{ type: "text", text: "use the probe" }] }],
    tools: [{
      name: "cross_plugin_probe",
      description: "Probe a separately installed DSH plugin.",
      parameters: { type: "object", properties: { value: { type: "string" } }, required: ["value"] },
    }],
  }));

  assert.deepEqual(runtime.sent[0].message.dshTools.map(tool => tool.name), ["cross_plugin_probe"]);
  const result = await runtime.sent[0].message.executeDshTool({
    name: "cross_plugin_probe",
    arguments: { value: "ok" },
    callId: "claude-probe-1",
    signal: new AbortController().signal,
  });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].agent, agent);
  assert.deepEqual(calls[0].arguments, { value: "ok" });
  assert.equal(result.isError, false);

  await assert.rejects(() => runtime.sent[0].message.executeDshTool({
    name: "not_in_this_turn",
    arguments: {},
    callId: "claude-hidden-1",
    signal: new AbortController().signal,
  }), /not available for this DSH turn/);
  assert.equal(calls.length, 1);
});

class FakeRuntime extends EventEmitter {
  constructor() {
    super();
    this.models = [{
      id: "sonnet",
      displayName: "Claude Sonnet",
      isDefault: true,
      defaultReasoningEffort: "medium",
      supportedReasoningEfforts: [{ reasoningEffort: "low" }, { reasoningEffort: "high" }],
    }];
    this.sessions = new Map();
    this.sent = [];
    this.created = 0;
    this.resumed = 0;
    this.createdConfigs = [];
    this.released = [];
  }

  async createSession(config) {
    await new Promise(resolve => setTimeout(resolve, 2));
    this.createdConfig = config;
    this.createdConfigs.push(structuredClone(config));
    const session = { id: `claude-${++this.created}`, turns: [], ...config };
    this.sessions.set(session.id, session);
    return session;
  }

  async resumeSession(sessionId, config) {
    this.resumed += 1;
    this.sessions.set(sessionId, { id: sessionId, turns: [], ...config });
    return this.sessions.get(sessionId);
  }

  async sendMessage(sessionId, message) {
    this.sent.push({ sessionId, message });
    const turnId = "turn-1";
    const answerText = message.text.includes("Generate the session title") ? "项目文件查询" : "done";
    queueMicrotask(() => {
      this.emit("activity", notification("item/started", sessionId, turnId, {
        item: { type: "toolUse", id: "tool-1", name: "Bash", input: { command: "pwd" }, status: "inProgress" },
      }));
      this.emit("activity", notification("item/completed", sessionId, turnId, {
        item: { type: "toolUse", id: "tool-1", name: "Bash", status: "completed", output: "ok\n" },
      }));
      this.emit("activity", notification("item/reasoning/summaryTextDelta", sessionId, turnId, {
        itemId: "reason-1", delta: "Checked the workspace.",
      }));
      this.emit("activity", notification("item/agentMessage/delta", sessionId, turnId, { itemId: "answer-1", delta: answerText }));
      this.emit("activity", { method: "turn/completed", params: {
        sessionId, turn: { id: turnId, status: "completed", error: null, items: [] },
      } });
    });
    return { id: turnId, status: "inProgress", items: [] };
  }

  async interruptTurn() {}

  async releaseSession(sessionId) {
    this.released.push(sessionId);
    this.sessions.delete(sessionId);
  }
}

class InteractionRuntime {
  constructor() { this.resolved = []; this.rejected = []; }
  async resolveRequest(id, response) { this.resolved.push({ id, response }); }
  rejectRequest(id, error) { this.rejected.push({ id, error }); }
}

function fakeAgent({ tools = null } = {}) {
  const appended = [];
  return {
    id: "dsh-1",
    appended,
    ctx: tools ? { tools } : {},
    session: {
      header: { agentPreset: "relay-claude", cwd: "/workspace/relay" },
      events: [],
      append(type, data) { appended.push({ type, data }); },
    },
  };
}

function notification(method, sessionId, turnId, rest) {
  return { method, params: { sessionId, turnId, ...rest } };
}

async function collect(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return chunks;
}
