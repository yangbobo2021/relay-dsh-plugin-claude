import { randomUUID } from "node:crypto";
import * as realSdk from "@anthropic-ai/claude-agent-sdk";
import { ClaudeSdkClient } from "../../../../sdk-client.mjs";

const cwd = new URL("../../fixtures/tool-workspace/", import.meta.url).pathname;
const pathToClaudeCodeExecutable = new URL(
  "../../../../../../node_modules/@anthropic-ai/claude-agent-sdk-darwin-arm64/claude",
  import.meta.url,
).pathname;
const registrations = [];
const queryOptions = [];
const sdk = {
  ...realSdk,
  createSdkMcpServer(options) {
    registrations.push({
      name: options.name,
      version: options.version,
      alwaysLoad: options.alwaysLoad,
      toolNames: options.tools.map(tool => tool.name),
    });
    return realSdk.createSdkMcpServer(options);
  },
  query(params) {
    queryOptions.push({
      sessionId: params.options.sessionId ?? params.options.resume,
      isResume: Boolean(params.options.resume),
      allowedTools: structuredClone(params.options.allowedTools ?? []),
      mcpServerNames: Object.keys(params.options.mcpServers ?? {}),
    });
    return realSdk.query(params);
  },
};
const client = new ClaudeSdkClient({ sdk, pathToClaudeCodeExecutable, requestTimeoutMs: 180_000 });
const activities = [];
const requests = [];
const diagnostics = [];
const executions = [];

client.on("activity", event => activities.push(structuredClone(event)));
client.on("request", request => {
  requests.push(structuredClone(request));
  client.resolveRequest(request.id, { action: "decline", message: "No approval is allowed in CLD-EXT-019" });
});
client.on("diagnostic", message => diagnostics.push(String(message)));

await client.start();
const requestedSessionId = randomUUID();
const session = await client.createSession({
  sessionId: requestedSessionId,
  cwd,
  model: "sonnet",
  effort: "medium",
  approvalPolicy: "never",
  settingSources: [],
  systemPrompt: { type: "preset", preset: "claude_code" },
});

const schema = name => ({
  name,
  description: `CLD-EXT-019 dynamic bridge probe ${name}`,
  parameters: {
    type: "object",
    properties: { token: { type: "string" } },
    required: ["token"],
    additionalProperties: false,
  },
});

const execute = turn => async input => {
  executions.push({ turn, name: input.name, arguments: input.arguments, callId: input.callId });
  const expected = turn === 1 ? "refresh_alpha" : "refresh_beta";
  const token = turn === 1 ? "A-1919" : "B-1919";
  if (input.name !== expected || input.arguments?.token !== token) {
    return { isError: true, content: [{ type: "text", text: `UNEXPECTED_${turn}_${input.name}` }] };
  }
  return {
    isError: false,
    content: [{ type: "text", text: turn === 1 ? "ALPHA_RESULT_1919" : "BETA_RESULT_1919" }],
  };
};

async function runTurn(turn, message) {
  const before = activities.length;
  const started = await client.sendMessage(session.id, message);
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`turn ${turn} timed out`)), 180_000);
    const onActivity = event => {
      if (event.method === "turn/completed" && event.params?.turn?.id === started.id) {
        clearTimeout(timeout);
        client.off("activity", onActivity);
        resolve();
      }
    };
    client.on("activity", onActivity);
  });
  return { turn, turnId: started.id, activities: activities.slice(before) };
}

const turn1 = await runTurn(1, {
  text: [
    "CLD-EXT-019 controlled validation. The only contributed probe is refresh_alpha.",
    "Use ToolSearch exactly once with {\"query\":\"select:refresh_alpha\",\"max_results\":5}.",
    "Invoke refresh_alpha exactly once with {\"token\":\"A-1919\"}. Use no other tool.",
    "After seeing ALPHA_RESULT_1919, output exactly CLD_EXT019_TURN1_OK_1919 and nothing else.",
  ].join(" "),
  dshTools: [schema("refresh_alpha")],
  executeDshTool: execute(1),
  approvalPolicy: "never",
  settingSources: [],
});

const turn2 = await runTurn(2, {
  text: [
    "CLD-EXT-019 turn 2: the contributed tool set changed; refresh_alpha was removed and refresh_beta was added.",
    "First use ToolSearch exactly with {\"query\":\"select:refresh_beta\",\"max_results\":5}.",
    "Then invoke refresh_beta exactly once with {\"token\":\"B-1919\"}.",
    "Then use ToolSearch exactly with {\"query\":\"select:refresh_alpha\",\"max_results\":5}; do not invoke alpha.",
    "Use no other tool. If beta returned BETA_RESULT_1919 and alpha has no matching deferred tool, output exactly CLD_EXT019_TURN2_REFRESH_OK_1919 and nothing else.",
  ].join(" "),
  dshTools: [schema("refresh_beta")],
  executeDshTool: execute(2),
  approvalPolicy: "never",
  settingSources: [],
});

const summarize = record => ({
  turn: record.turn,
  turnId: record.turnId,
  completed: record.activities.filter(event => event.method === "turn/completed").map(event => event.params.turn),
  tools: record.activities.filter(event => event.method === "item/started" && event.params?.item?.type === "toolUse").map(event => ({
    id: event.params.item.id,
    name: event.params.item.name,
    input: event.params.item.input,
  })),
  toolResults: record.activities.filter(event => event.method === "item/completed" && event.params?.item?.type === "toolUse").map(event => ({
    id: event.params.item.id,
    name: event.params.item.name,
    status: event.params.item.status,
    output: event.params.item.output,
  })),
  finalText: record.activities.filter(event => event.method === "item/agentMessage/delta").map(event => event.params.delta).join(""),
});

console.log(JSON.stringify({
  requestedSessionId,
  actualSessionId: session.id,
  cwd,
  pathToClaudeCodeExecutable,
  turn1: summarize(turn1),
  turn2: summarize(turn2),
  executions,
  registrations,
  queryOptions,
  requests,
  diagnostics,
}, null, 2));

await client.close();
