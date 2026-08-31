import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile, rm } from "node:fs/promises";
import * as realSdk from "@anthropic-ai/claude-agent-sdk";
import { ClaudeSdkClient } from "../../../../sdk-client.mjs";
import { ClaudeSessionRuntime } from "../../../../session-runtime.mjs";

const cwd = new URL("../../fixtures/tool-workspace/", import.meta.url).pathname;
const settingsPath = new URL("../../fixtures/tool-workspace/.claude/settings.json", import.meta.url).pathname;
const fixture = new URL("project-settings.json", import.meta.url).pathname;
const executable = new URL("../../../../../../node_modules/@anthropic-ai/claude-agent-sdk-darwin-arm64/claude", import.meta.url).pathname;
let original = null;
try { original = await readFile(settingsPath); } catch (error) { if (error.code !== "ENOENT") throw error; }
const queries = [];
const sdk = { ...realSdk, query(params) { queries.push({ cwd: params.options.cwd, permissionMode: params.options.permissionMode, settingSources: params.options.settingSources, allowedTools: params.options.allowedTools ?? [], sessionId: params.options.sessionId }); return realSdk.query(params); } };
const client = new ClaudeSdkClient({ sdk, pathToClaudeCodeExecutable: executable });
const runtime = new ClaudeSessionRuntime({ client, cwd });
const activities = [], requests = [], callbacks = [];
runtime.on("activity", event => activities.push(structuredClone(event)));
runtime.on("request", request => { requests.push(structuredClone(request)); runtime.resolveRequest(request.id, { action: "decline", message: "CLD-PERM-004 safety deny" }); });
await runtime.initialize();
const schema = { name: "PermissionProbe", description: "Return the exact permission validation marker.", parameters: { type: "object", properties: {}, additionalProperties: false } };
async function executeDshTool(call) { callbacks.push({ at: Date.now(), name: call.name, arguments: structuredClone(call.arguments), callId: call.callId }); return { content: [{ type: "text", text: "CLD_PERM004_MCP_EXECUTED_24004" }] }; }

async function run(label, settingSources, text, dshTools = undefined) {
  const session = await runtime.createSession({ model: "sonnet", effort: "medium", sandbox: "workspace-write", approvalPolicy: "on-request", cwd, settingSources });
  const before = activities.length, callbackBefore = callbacks.length, requestBefore = requests.length;
  const turn = await runtime.sendMessage(session.id, { text, sandbox: "workspace-write", approvalPolicy: "on-request", cwd, settingSources, ...(dshTools ? { dshTools, executeDshTool } : {}) });
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("timeout")), 180000);
    const listener = event => { if (event.method === "turn/completed" && event.params?.turn?.id === turn.id) { clearTimeout(timeout); runtime.off("activity", listener); resolve(); } };
    runtime.on("activity", listener);
  });
  const events = activities.slice(before);
  return { label, sessionId: session.id, tools: events.filter(x => x.method === "item/started").map(x => x.params.item), results: events.filter(x => x.method === "item/completed").map(x => x.params.item), finalText: events.filter(x => x.method === "item/agentMessage/delta").map(x => x.params.delta).join(""), completed: events.find(x => x.method === "turn/completed")?.params.turn, callbackDelta: callbacks.slice(callbackBefore), requestDelta: requests.slice(requestBefore) };
}
let restored = false;
async function restore() { if (restored) return; if (original === null) await rm(settingsPath, { force: true }); else await writeFile(settingsPath, original); restored = true; }
try {
  await mkdir(new URL("../../fixtures/tool-workspace/.claude/", import.meta.url), { recursive: true });
  await writeFile(settingsPath, await readFile(fixture));
  const mcpControl = await run("mcp-control", [], "Call PermissionProbe exactly once with no arguments and no other tool. Then output exactly CLD_PERM004_MCP_CONTROL_DONE_24004.", [schema]);
  const mcpDenied = await run("mcp-denied", ["project"], "Call PermissionProbe exactly once with no arguments and no other tool. If blocked, do not retry. Then output exactly CLD_PERM004_MCP_DENY_DONE_24004.", [schema]);
  const agentControl = await run("agent-control", [], "Use Agent exactly once in the foreground with subagent_type general-purpose and prompt `Use no tools. Reply exactly CLD_PERM004_CHILD_CONTROL_24004`. Use no other tool. Then output exactly CLD_PERM004_AGENT_CONTROL_DONE_24004.");
  const agentDenied = await run("agent-denied", ["project"], "Use Agent exactly once in the foreground with subagent_type general-purpose and prompt `Use no tools. Reply exactly CLD_PERM004_CHILD_DENIED_24004`. Use no other tool. If blocked, do not retry. Then output exactly CLD_PERM004_AGENT_DENY_DONE_24004.");
  await restore();
  console.log(JSON.stringify({ originalSettingsExisted: original !== null, queries, mcpControl, mcpDenied, agentControl, agentDenied, callbacks, requests, restored }, null, 2));
} finally { await restore(); await runtime.close(); }
