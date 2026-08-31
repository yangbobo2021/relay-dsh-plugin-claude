import { randomUUID } from "node:crypto";
import * as realSdk from "@anthropic-ai/claude-agent-sdk";
import { ClaudeSdkClient } from "../../../../sdk-client.mjs";

const cwd = new URL("../../fixtures/config-collision-project/", import.meta.url).pathname;
const executable = new URL("../../../../../../node_modules/@anthropic-ai/claude-agent-sdk-darwin-arm64/claude", import.meta.url).pathname;
const queries = [];
const sdk = { ...realSdk, query(params) { queries.push({ cwd: params.options.cwd, model: params.options.model, effort: params.options.effort, permissionMode: params.options.permissionMode, settingSources: [...params.options.settingSources], sessionId: params.options.sessionId }); return realSdk.query(params); } };
const client = new ClaudeSdkClient({ sdk, pathToClaudeCodeExecutable: executable });
const activities = [], diagnostics = [];
client.on("activity", event => activities.push(structuredClone(event)));
client.on("diagnostic", message => diagnostics.push(String(message)));
await client.start();
const session = await client.createSession({ sessionId: randomUUID(), cwd, model: "sonnet", effort: "medium", sandbox: "workspace-write", approvalPolicy: "on-request", settingSources: ["project"] });
const turn = await client.sendMessage(session.id, { cwd, model: "sonnet", effort: "medium", sandbox: "workspace-write", approvalPolicy: "on-request", settingSources: ["project"], text: "CLD-CFG-006 live collision probe. Use no tools. Output exactly CLD_CFG006_LIVE_OWNERSHIP_OK_6006 and nothing else." });
await new Promise((resolve, reject) => { const timeout = setTimeout(() => reject(new Error("timeout")), 180_000); const listener = event => { if (event.method === "turn/completed" && event.params?.turn?.id === turn.id) { clearTimeout(timeout); client.off("activity", listener); resolve(); } }; client.on("activity", listener); });
console.log(JSON.stringify({ cwd, executable, sessionId: session.id, queries, toolStarts: activities.filter(x => x.method === "item/started").length, finalText: activities.filter(x => x.method === "item/agentMessage/delta").map(x => x.params.delta).join(""), completed: activities.find(x => x.method === "turn/completed")?.params.turn, diagnostics }, null, 2));
await client.close();
