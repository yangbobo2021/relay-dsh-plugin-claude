import { randomUUID } from "node:crypto";
import * as realSdk from "@anthropic-ai/claude-agent-sdk";
import { ClaudeSdkClient } from "../../../../sdk-client.mjs";

const cwd = new URL("../../fixtures/config-local-project/", import.meta.url).pathname;
const executable = new URL("../../../../../../node_modules/@anthropic-ai/claude-agent-sdk-darwin-arm64/claude", import.meta.url).pathname;
const queries = [];
const sdk = { ...realSdk, query(params) { queries.push({ sessionId: params.options.sessionId, cwd: params.options.cwd, settingSources: [...params.options.settingSources] }); return realSdk.query(params); } };
const client = new ClaudeSdkClient({ sdk, pathToClaudeCodeExecutable: executable });
const activities = [], requests = [], diagnostics = [];
client.on("activity", event => activities.push(structuredClone(event)));
client.on("request", request => { requests.push(structuredClone(request)); client.resolveRequest(request.id, { action: "accept", updatedInput: request.params.input }); });
client.on("diagnostic", message => diagnostics.push(String(message)));
await client.start();

async function run(label, settingSources) {
  const session = await client.createSession({ sessionId: randomUUID(), cwd, model: "sonnet", effort: "medium", settingSources });
  const before = activities.length;
  const turn = await client.sendMessage(session.id, { settingSources, text:
    `CLD-CFG-003 ${label}. Invoke Bash exactly once with command \`printf %s "$CLD_CFG003_PRECEDENCE"\` and no other tool. Then output exactly CLD_CFG003_${label}_DONE_3003 and nothing else.` });
  await new Promise((resolve, reject) => { const timeout = setTimeout(() => reject(new Error("timeout")), 180_000); const listener = event => { if (event.method === "turn/completed" && event.params?.turn?.id === turn.id) { clearTimeout(timeout); client.off("activity", listener); resolve(); } }; client.on("activity", listener); });
  const events = activities.slice(before);
  return { label, sessionId: session.id, turnId: turn.id,
    tools: events.filter(x => x.method === "item/started").map(x => x.params.item),
    results: events.filter(x => x.method === "item/completed").map(x => x.params.item),
    finalText: events.filter(x => x.method === "item/agentMessage/delta").map(x => x.params.delta).join(""),
    completed: events.find(x => x.method === "turn/completed")?.params.turn };
}

const withLocal = await run("WITH_LOCAL", ["project", "local"]);
const projectOnly = await run("PROJECT_ONLY", ["project"]);
console.log(JSON.stringify({ executable, cwd, queries, withLocal, projectOnly, requests, diagnostics }, null, 2));
await client.close();
