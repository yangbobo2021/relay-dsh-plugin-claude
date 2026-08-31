import { randomUUID } from "node:crypto";
import * as realSdk from "@anthropic-ai/claude-agent-sdk";
import { ClaudeSdkClient } from "../../../../sdk-client.mjs";

const sharedCwd = new URL("../../fixtures/config-project/shared-project/", import.meta.url).pathname;
const siblingCwd = new URL("../../fixtures/config-project/sibling-project/", import.meta.url).pathname;
const executable = new URL("../../../../../../node_modules/@anthropic-ai/claude-agent-sdk-darwin-arm64/claude", import.meta.url).pathname;
delete process.env.CLAUDE_CONFIG_DIR;
const queries = [];
const sdk = { ...realSdk, query(params) {
  queries.push({ sessionId: params.options.sessionId, cwd: params.options.cwd, settingSources: structuredClone(params.options.settingSources) });
  return realSdk.query(params);
} };
const client = new ClaudeSdkClient({ sdk, pathToClaudeCodeExecutable: executable });
const activities = [], requests = [], diagnostics = [];
client.on("activity", event => activities.push(structuredClone(event)));
client.on("request", request => { requests.push(structuredClone(request)); client.resolveRequest(request.id, { action: "allowOnce" }); });
client.on("diagnostic", message => diagnostics.push(String(message)));
await client.start();

async function run(label, cwd) {
  const session = await client.createSession({ sessionId: randomUUID(), cwd, model: "sonnet", effort: "medium", settingSources: ["project"] });
  const before = activities.length;
  const turn = await client.sendMessage(session.id, {
    text: `CLD-CFG-002 ${label}. Invoke Bash exactly once with command \`printf CFG002_SHARED_PROJECT_ACTIVE_2002\` and no other tool. Then output exactly CLD_CFG002_${label.toUpperCase().replaceAll("-", "_")}_DONE_2002 and nothing else.`,
    settingSources: ["project"],
  });
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`${label} timeout`)), 180_000);
    const listener = event => { if (event.method === "turn/completed" && event.params?.turn?.id === turn.id) { clearTimeout(timeout); client.off("activity", listener); resolve(); } };
    client.on("activity", listener);
  });
  const events = activities.slice(before);
  return { label, cwd, sessionId: session.id, turnId: turn.id,
    tools: events.filter(x => x.method === "item/started").map(x => x.params.item),
    results: events.filter(x => x.method === "item/completed").map(x => x.params.item),
    finalText: events.filter(x => x.method === "item/agentMessage/delta").map(x => x.params.delta).join(""),
    completed: events.find(x => x.method === "turn/completed")?.params.turn };
}

const sharedProject = await run("shared-project", sharedCwd);
const siblingProject = await run("sibling-project", siblingCwd);
console.log(JSON.stringify({ executable, queries, sharedProject, siblingProject, requests, diagnostics }, null, 2));
await client.close();
