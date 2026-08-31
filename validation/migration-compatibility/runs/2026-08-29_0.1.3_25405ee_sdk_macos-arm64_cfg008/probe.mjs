import { randomUUID } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import * as realSdk from "@anthropic-ai/claude-agent-sdk";
import { ClaudeSdkClient } from "../../../../sdk-client.mjs";

const cwd = new URL("../../fixtures/config-hot-project/", import.meta.url).pathname;
const settingsPath = `${cwd}.claude/settings.json`;
const executable = new URL("../../../../../../node_modules/@anthropic-ai/claude-agent-sdk-darwin-arm64/claude", import.meta.url).pathname;
const command = `node -e 'process.stdout.write(process.env.CLD_CFG008_HOT || "MISSING_8008")'`;
const originalSettings = await readFile(settingsPath);
const changedSettings = Buffer.from('{\n  "env": {\n    "CLD_CFG008_HOT": "HOT_B_8008"\n  }\n}\n');
const queries = [];
const sdk = { ...realSdk, query(params) { queries.push({ sessionId: params.options.sessionId ?? params.options.resume, isResume: Boolean(params.options.resume), settingSources: [...params.options.settingSources] }); return realSdk.query(params); } };
const client = new ClaudeSdkClient({ sdk, pathToClaudeCodeExecutable: executable });
const activities = [], requests = [], diagnostics = [];
client.on("activity", event => activities.push(structuredClone(event)));
client.on("request", request => { requests.push(structuredClone(request)); client.resolveRequest(request.id, { action: "accept", updatedInput: request.params.input }); });
client.on("diagnostic", message => diagnostics.push(String(message)));
await client.start();
const session = await client.createSession({ sessionId: randomUUID(), cwd, model: "sonnet", effort: "medium", settingSources: ["project"] });
async function run(turnNumber) {
  const before = activities.length;
  const turn = await client.sendMessage(session.id, { settingSources: ["project"], text: `CLD-CFG-008 turn ${turnNumber}. Invoke Bash exactly once with command \`${command}\` and no other tool. Then output exactly CLD_CFG008_TURN${turnNumber}_DONE_8008 and nothing else.` });
  await new Promise((resolve, reject) => { const timeout = setTimeout(() => reject(new Error("timeout")), 180_000); const listener = event => { if (event.method === "turn/completed" && event.params?.turn?.id === turn.id) { clearTimeout(timeout); client.off("activity", listener); resolve(); } }; client.on("activity", listener); });
  const events = activities.slice(before); return { turnNumber, turnId: turn.id, tools: events.filter(x => x.method === "item/started").map(x => x.params.item), results: events.filter(x => x.method === "item/completed").map(x => x.params.item), finalText: events.filter(x => x.method === "item/agentMessage/delta").map(x => x.params.delta).join(""), completed: events.find(x => x.method === "turn/completed")?.params.turn };
}
let restored = false;
async function restore() { if (!restored) { await writeFile(settingsPath, originalSettings); restored = true; } }
try {
  const turn1 = await run(1);
  await writeFile(settingsPath, changedSettings);
  const turn2 = await run(2);
  await restore();
  console.log(JSON.stringify({ cwd, settingsPath, executable, command, sessionId: session.id, queries, turn1, turn2, requests, diagnostics, originalBytes: originalSettings.length, changedBytes: changedSettings.length, restored }, null, 2));
} finally {
  await restore();
  await client.close();
}
