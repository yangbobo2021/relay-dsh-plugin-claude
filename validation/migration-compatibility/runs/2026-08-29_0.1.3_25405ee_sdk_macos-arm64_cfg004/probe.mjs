import { randomUUID } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import * as realSdk from "@anthropic-ai/claude-agent-sdk";
import { ClaudeSdkClient } from "../../../../sdk-client.mjs";

const cwd = new URL("../../fixtures/config-precedence-project/", import.meta.url).pathname;
const userFixture = new URL("user-settings.json", import.meta.url).pathname;
const realSettingsPath = "/Users/boboyang/.claude/settings.json";
const executable = new URL("../../../../../../node_modules/@anthropic-ai/claude-agent-sdk-darwin-arm64/claude", import.meta.url).pathname;
const originalSettings = await readFile(realSettingsPath);
const fixtureSettings = await readFile(userFixture);
const queries = [];
const sdk = { ...realSdk, query(params) { queries.push({ sessionId: params.options.sessionId, settingSources: [...params.options.settingSources], cwd: params.options.cwd }); return realSdk.query(params); } };
const client = new ClaudeSdkClient({ sdk, pathToClaudeCodeExecutable: executable });
const activities = [], requests = [], diagnostics = [];
client.on("activity", event => activities.push(structuredClone(event)));
client.on("request", request => { requests.push(structuredClone(request)); client.resolveRequest(request.id, { action: "accept", updatedInput: request.params.input }); });
client.on("diagnostic", message => diagnostics.push(String(message)));
await client.start();

async function run(label, settingSources) {
  const session = await client.createSession({ sessionId: randomUUID(), cwd, model: "sonnet", effort: "medium", settingSources });
  const before = activities.length;
  const turn = await client.sendMessage(session.id, { settingSources, text: `CLD-CFG-004 ${label}. Invoke Bash exactly once with command \`printf %s "$CLD_CFG004_PRECEDENCE"\` and no other tool. Then output exactly CLD_CFG004_${label}_DONE_4004 and nothing else.` });
  await new Promise((resolve, reject) => { const timeout = setTimeout(() => reject(new Error("timeout")), 180_000); const listener = event => { if (event.method === "turn/completed" && event.params?.turn?.id === turn.id) { clearTimeout(timeout); client.off("activity", listener); resolve(); } }; client.on("activity", listener); });
  const events = activities.slice(before);
  return { label, sessionId: session.id, tools: events.filter(x => x.method === "item/started").map(x => x.params.item), results: events.filter(x => x.method === "item/completed").map(x => x.params.item), finalText: events.filter(x => x.method === "item/agentMessage/delta").map(x => x.params.delta).join(""), completed: events.find(x => x.method === "turn/completed")?.params.turn };
}

let restored = false;
async function restore() { if (!restored) { await writeFile(realSettingsPath, originalSettings); restored = true; } }
try {
  await writeFile(realSettingsPath, fixtureSettings);
  const userOnly = await run("USER_ONLY", ["user"]);
  const throughProject = await run("THROUGH_PROJECT", ["user", "project"]);
  const throughLocal = await run("THROUGH_LOCAL", ["user", "project", "local"]);
  await restore();
  console.log(JSON.stringify({ cwd, executable, queries, userOnly, throughProject, throughLocal, requests, diagnostics, originalSettingsBytes: originalSettings.length, restored }, null, 2));
} finally {
  await restore();
  await client.close();
}
