import assert from "node:assert/strict";
import test from "node:test";

import { ClaudeSdkClient } from "../sdk-client.mjs";

test("Claude SDK requests summarized adaptive thinking without replacing effort", async () => {
  let queryParams = null;
  const sdk = {
    query(params) {
      queryParams = params;
      return queryObject(async function* () {
        yield { type: "result", session_id: params.options.sessionId, uuid: "u1", subtype: "success", is_error: false, result: "done" };
      });
    },
  };
  const client = new ClaudeSdkClient({ sdk });
  await client.start();
  const session = await client.createSession({ sessionId: "55555555-5555-4555-8555-555555555555" });
  const activity = [];
  client.on("activity", message => activity.push(message));

  await client.sendMessage(session.id, { text: "explain the change", effort: "low" });
  await untilTurnCompleted(activity);

  assert.equal(queryParams.options.effort, "low");
  assert.deepEqual(queryParams.options.thinking, { type: "adaptive", display: "summarized" });
});

test("Claude SDK client pauses on canUseTool and resumes after Relay approval", async () => {
  let queryParams = null;
  const sdk = {
    query(params) {
      queryParams = params;
      return queryObject(async function* () {
        yield { type: "assistant", session_id: params.options.sessionId, uuid: "u1", parent_tool_use_id: null, message: {
          id: "msg-1",
          role: "assistant",
          model: "sonnet",
          stop_reason: null,
          stop_sequence: null,
          usage: {},
          content: [{ type: "tool_use", id: "tool-1", name: "Write", input: { file_path: "probe.txt", content: "ok" } }],
        } };
        const allowed = await params.options.canUseTool("Write", { file_path: "probe.txt", content: "ok" }, {
          requestId: "permission-1",
          toolUseID: "tool-1",
          title: "Claude wants to write probe.txt",
          signal: new AbortController().signal,
        });
        yield { type: "user", session_id: params.options.sessionId, uuid: "u2", parent_tool_use_id: null, message: {
          role: "user",
          content: [{ type: "tool_result", tool_use_id: "tool-1", content: JSON.stringify(allowed), is_error: false }],
        } };
        yield { type: "stream_event", session_id: params.options.sessionId, uuid: "u3", parent_tool_use_id: null, event: {
          type: "message_start",
          message: { id: "msg-2" },
        } };
        yield { type: "stream_event", session_id: params.options.sessionId, uuid: "u4", parent_tool_use_id: null, event: {
          type: "content_block_delta",
          index: 0,
          delta: { type: "thinking_delta", thinking: "checked workspace" },
        } };
        yield { type: "assistant", session_id: params.options.sessionId, uuid: "u5", parent_tool_use_id: null, message: {
          id: "msg-2",
          role: "assistant",
          model: "sonnet",
          stop_reason: null,
          stop_sequence: null,
          usage: {},
          content: [{ type: "thinking", thinking: "checked workspace" }],
        } };
        yield { type: "stream_event", session_id: params.options.sessionId, uuid: "u6", parent_tool_use_id: null, event: {
          type: "content_block_delta",
          index: 1,
          delta: { type: "text_delta", text: "done" },
        } };
        yield { type: "assistant", session_id: params.options.sessionId, uuid: "u7", parent_tool_use_id: null, message: {
          id: "msg-2",
          role: "assistant",
          model: "sonnet",
          stop_reason: "end_turn",
          stop_sequence: null,
          usage: {},
          content: [{ type: "text", text: "done" }],
        } };
        yield { type: "result", session_id: params.options.sessionId, uuid: "u8", subtype: "success", is_error: false, result: "done" };
      });
    },
  };
  const client = new ClaudeSdkClient({ sdk });
  await client.start();
  const session = await client.createSession({ sessionId: "11111111-1111-4111-8111-111111111111", cwd: "/workspace/relay" });
  const requests = [];
  const activity = [];
  client.on("request", request => {
    requests.push(request);
    client.resolveRequest(request.id, { action: "accept", updatedInput: request.params.input });
  });
  client.on("activity", message => activity.push(message));
  await client.sendMessage(session.id, { text: "write a file", model: "sonnet", effort: "low" });
  await untilTurnCompleted(activity);

  assert.equal(queryParams.options.sessionId, session.id);
  assert.equal(queryParams.options.resume, undefined);
  assert.equal(queryParams.options.permissionMode, "default");
  assert.equal(requests[0].method, "tool/requestApproval");
  assert.equal(requests[0].params.toolName, "Write");
  assert.deepEqual(activity.map(message => message.method), [
    "item/started",
    "item/completed",
    "item/reasoning/summaryTextDelta",
    "item/agentMessage/delta",
    "turn/completed",
  ]);
  assert.equal(activity.find(message => message.method === "item/reasoning/summaryTextDelta").params.delta, "checked workspace");
  assert.equal(activity.filter(message => message.method === "item/reasoning/summaryTextDelta").length, 1);
  assert.equal(activity.filter(message => message.method === "item/agentMessage/delta").length, 1);
});

test("Claude SDK client maps Relay denial back to canUseTool", async () => {
  let permissionResult = null;
  const sdk = {
    query(params) {
      return queryObject(async function* () {
        permissionResult = await params.options.canUseTool("Bash", { command: "rm -rf tmp" }, {
          requestId: "permission-2",
          toolUseID: "tool-2",
          signal: new AbortController().signal,
        });
        yield { type: "result", session_id: params.options.sessionId, uuid: "u1", subtype: "success", is_error: false, result: "blocked" };
      });
    },
  };
  const client = new ClaudeSdkClient({ sdk });
  await client.start();
  const session = await client.createSession({ sessionId: "22222222-2222-4222-8222-222222222222" });
  client.on("request", request => client.resolveRequest(request.id, { action: "decline", message: "No thanks" }));
  const activity = [];
  client.on("activity", message => activity.push(message));
  await client.sendMessage(session.id, { text: "remove tmp" });
  await untilTurnCompleted(activity);

  assert.deepEqual(permissionResult, { behavior: "deny", message: "No thanks" });
});

test("Claude SDK maps generic DSH schemas to an in-process MCP server", async () => {
  let queryParams = null;
  let serverOptions = null;
  const calls = [];
  const sdk = {
    createSdkMcpServer(options) {
      serverOptions = options;
      return { type: "sdk", name: options.name };
    },
    tool(name, description, inputSchema, handler) {
      return { name, description, inputSchema, handler };
    },
    query(params) {
      queryParams = params;
      return queryObject(async function* () {
        yield { type: "result", session_id: params.options.sessionId, uuid: "u1", subtype: "success", is_error: false, result: "done" };
      });
    },
  };
  const client = new ClaudeSdkClient({ sdk });
  await client.start();
  const session = await client.createSession({ sessionId: "44444444-4444-4444-8444-444444444444" });
  const activity = [];
  client.on("activity", message => activity.push(message));
  await client.sendMessage(session.id, {
    text: "use the probe",
    dshTools: [{
      name: "cross_plugin_probe",
      description: "Probe a separately installed DSH plugin.",
      parameters: {
        type: "object",
        properties: { value: { type: "string" }, count: { type: "integer" } },
        required: ["value"],
      },
    }],
    async executeDshTool(input) {
      calls.push(input);
      return { isError: false, content: [{ type: "text", text: "probe complete" }] };
    },
  });
  await untilTurnCompleted(activity);

  assert.deepEqual(Object.keys(queryParams.options.mcpServers), ["dsh"]);
  assert.deepEqual(queryParams.options.allowedTools, ["mcp__dsh__cross_plugin_probe"]);
  assert.equal(serverOptions.tools[0].name, "cross_plugin_probe");
  assert.equal(serverOptions.tools[0].inputSchema.value.isOptional(), false);
  assert.equal(serverOptions.tools[0].inputSchema.count.isOptional(), true);
  const result = await serverOptions.tools[0].handler({ value: "ok" }, { signal: new AbortController().signal });
  assert.deepEqual(calls[0].arguments, { value: "ok" });
  assert.equal(result.isError, false);
  assert.deepEqual(result.content, [{ type: "text", text: "probe complete" }]);
});

test("Claude SDK client interrupts and aborts an in-progress query", async () => {
  let queryParams = null;
  let interrupted = 0;
  let closed = 0;
  let releaseNext;
  const sdk = {
    query(params) {
      queryParams = params;
      return {
        async next() { return new Promise(resolve => { releaseNext = resolve; }); },
        async return() { return { done: true }; },
        [Symbol.asyncIterator]() { return this; },
        async interrupt() { interrupted += 1; },
        close() { closed += 1; releaseNext?.({ done: true }); },
      };
    },
  };
  const client = new ClaudeSdkClient({ sdk });
  await client.start();
  const session = await client.createSession({ sessionId: "33333333-3333-4333-8333-333333333333" });
  const turn = await client.sendMessage(session.id, { text: "keep working" });

  await client.interruptTurn(session.id, turn.id);

  assert.equal(interrupted, 1);
  assert.equal(closed, 1);
  assert.equal(queryParams.options.abortController.signal.aborted, true);
});

function queryObject(factory) {
  const iterator = factory();
  return {
    async next() { return iterator.next(); },
    async return() { return iterator.return?.() ?? { done: true }; },
    async throw(error) { return iterator.throw?.(error) ?? Promise.reject(error); },
    [Symbol.asyncIterator]() { return this; },
    async interrupt() { return { still_queued: [] }; },
    close() {},
  };
}

async function untilTurnCompleted(activity) {
  const deadline = Date.now() + 1_000;
  while (!activity.some(message => message.method === "turn/completed")) {
    if (Date.now() > deadline) throw new Error("timed out waiting for turn/completed");
    await new Promise(resolve => setTimeout(resolve, 0));
  }
}
