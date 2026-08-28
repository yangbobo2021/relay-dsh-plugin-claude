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

test("Claude SDK sends ordered multimodal user messages on new and resumed Sessions", async () => {
  const received = [];
  const options = [];
  const sdk = {
    query(params) {
      options.push(params.options);
      return queryObject(async function* () {
        const messages = [];
        for await (const message of params.prompt) messages.push(message);
        received.push(messages);
        yield { type: "result", session_id: params.options.sessionId ?? params.options.resume, uuid: "u1", subtype: "success", is_error: false, result: "done" };
      });
    },
  };
  const client = new ClaudeSdkClient({ sdk });
  await client.start();
  const session = await client.createSession({ sessionId: "66666666-6666-4666-8666-666666666666" });
  const activity = [];
  client.on("activity", message => activity.push(message));

  await client.sendMessage(session.id, { content: [
    { type: "image", mediaType: "image/png", data: "AQID" },
    { type: "text", text: "first image" },
  ] });
  await untilTurnCount(activity, 1);
  await client.sendMessage(session.id, { content: [
    { type: "text", text: "second image" },
    { type: "image", mediaType: "image/jpeg", data: "BAUG" },
  ] });
  await untilTurnCount(activity, 2);

  assert.equal(options[0].sessionId, session.id);
  assert.equal(options[0].resume, undefined);
  assert.equal(options[1].sessionId, undefined);
  assert.equal(options[1].resume, session.id);
  assert.deepEqual(received, [
    [{
      type: "user",
      message: { role: "user", content: [
        { type: "image", source: { type: "base64", media_type: "image/png", data: "AQID" } },
        { type: "text", text: "first image" },
      ] },
      parent_tool_use_id: null,
    }],
    [{
      type: "user",
      message: { role: "user", content: [
        { type: "text", text: "second image" },
        { type: "image", source: { type: "base64", media_type: "image/jpeg", data: "BAUG" } },
      ] },
      parent_tool_use_id: null,
    }],
  ]);
});

test("Claude SDK rejects invalid image content before query()", async () => {
  let queries = 0;
  const client = new ClaudeSdkClient({ sdk: {
    query() {
      queries += 1;
      throw new Error("must not run");
    },
  } });
  await client.start();
  const session = await client.createSession({ sessionId: "77777777-7777-4777-8777-777777777777" });

  await assert.rejects(client.sendMessage(session.id, { content: [
    { type: "image", mediaType: "image/svg+xml", data: "PHN2Zz4=" },
  ] }), error => error.code === "CLAUDE_IMAGE_INPUT_INVALID");
  assert.equal(queries, 0);
});

test("Claude SDK models advertise image input", async () => {
  const client = new ClaudeSdkClient({ sdk: { query() {} } });
  await client.start();
  const models = await client.listModels();
  assert.equal(models.length > 0, true);
  assert.equal(models.every(model => JSON.stringify(model.inputModalities) === JSON.stringify(["text", "image"])), true);
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

test("Claude SDK preserves structured tool-result images without leaking Base64 into activity", async () => {
  const sdk = {
    query(params) {
      return queryObject(async function* () {
        yield { type: "assistant", session_id: params.options.sessionId, uuid: "u1", message: {
          id: "msg-tool",
          role: "assistant",
          content: [{ type: "tool_use", id: "tool-image", name: "make_image", input: { prompt: "sunrise" } }],
        } };
        yield { type: "user", session_id: params.options.sessionId, uuid: "u2", message: {
          role: "user",
          content: [{
            type: "tool_result",
            tool_use_id: "tool-image",
            content: [{
              type: "image",
              source: { type: "base64", media_type: "image/png", data: "AQID" },
            }],
            is_error: false,
          }],
        } };
        yield { type: "assistant", session_id: params.options.sessionId, uuid: "u3", message: {
          id: "msg-final",
          role: "assistant",
          content: [{ type: "text", text: "Done." }],
        } };
        yield { type: "result", session_id: params.options.sessionId, uuid: "u4", subtype: "success", is_error: false, result: "done" };
      });
    },
  };
  const client = new ClaudeSdkClient({ sdk });
  await client.start();
  const session = await client.createSession({ sessionId: "88888888-8888-4888-8888-888888888888" });
  const activity = [];
  client.on("activity", message => activity.push(message));

  await client.sendMessage(session.id, { text: "make an image" });
  await untilTurnCompleted(activity);
  const completed = activity.find(message => (
    message.method === "item/completed" && message.params.item.id === "tool-image"
  )).params.item;

  assert.equal(completed.name, "make_image");
  assert.deepEqual(completed.input, { prompt: "sunrise" });
  assert.deepEqual(completed.images, [{ mediaType: "image/png", data: "AQID", name: undefined }]);
  assert.deepEqual(completed.output, [{ type: "image", mediaType: "image/png", omitted: true }]);
  assert.equal(JSON.stringify(completed.output).includes("AQID"), false);
});

test("the in-process DSH MCP bridge returns image bytes as an MCP image result", async () => {
  let serverOptions = null;
  const sdk = {
    createSdkMcpServer(options) {
      serverOptions = options;
      return { type: "sdk", name: options.name };
    },
    tool(name, description, inputSchema, handler) {
      return { name, description, inputSchema, handler };
    },
    query(params) {
      return queryObject(async function* () {
        yield { type: "result", session_id: params.options.sessionId, uuid: "u1", subtype: "success", is_error: false, result: "done" };
      });
    },
  };
  const client = new ClaudeSdkClient({ sdk });
  await client.start();
  const session = await client.createSession({ sessionId: "99999999-9999-4999-8999-999999999999" });
  const activity = [];
  client.on("activity", message => activity.push(message));

  await client.sendMessage(session.id, {
    text: "make an image",
    dshTools: [{ name: "make_image", description: "Make image", parameters: { type: "object", properties: {} } }],
    async executeDshTool() {
      return { content: [{ type: "image", mediaType: "image/png", data: "AQID" }], isError: false };
    },
  });
  await untilTurnCompleted(activity);

  const result = await serverOptions.tools[0].handler({}, { signal: new AbortController().signal });
  assert.deepEqual(result, {
    content: [{ type: "image", data: "AQID", mimeType: "image/png" }],
    isError: false,
  });
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

async function untilTurnCount(activity, count) {
  const deadline = Date.now() + 1_000;
  while (activity.filter(message => message.method === "turn/completed").length < count) {
    if (Date.now() > deadline) throw new Error(`timed out waiting for ${count} completed turns`);
    await new Promise(resolve => setTimeout(resolve, 0));
  }
}
