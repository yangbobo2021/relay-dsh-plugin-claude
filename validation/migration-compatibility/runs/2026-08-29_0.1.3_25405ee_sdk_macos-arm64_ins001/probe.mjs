import { randomUUID } from "node:crypto";
import { copyFile, rm } from "node:fs/promises";
import * as realSdk from "@anthropic-ai/claude-agent-sdk";
import { ClaudeSdkClient } from "../../../../sdk-client.mjs";

const cwd = new URL("../../fixtures/plain-text-workspace/", import.meta.url).pathname;
const fixture = new URL("user-CLAUDE.md", import.meta.url).pathname;
const userInstruction = "/Users/boboyang/.claude/CLAUDE.md";
const executable = new URL("../../../../../../node_modules/@anthropic-ai/claude-agent-sdk-darwin-arm64/claude", import.meta.url).pathname;
const queries = [];
const sdk = { ...realSdk, query(params) { queries.push({ sessionId: params.options.sessionId, settingSources: [...params.options.settingSources], cwd: params.options.cwd }); return realSdk.query(params); } };
const client = new ClaudeSdkClient({ sdk, pathToClaudeCodeExecutable: executable });
const activities = [], diagnostics = [];
client.on("activity", event => activities.push(structuredClone(event)));
client.on("diagnostic", message => diagnostics.push(String(message)));
await client.start();
async function run(label, settingSources) {
  const session = await client.createSession({ sessionId: randomUUID(), cwd, model: "sonnet", effort: "medium", settingSources });
  const before = activities.length;
  const turn = await client.sendMessage(session.id, { settingSources, text: `CLD_INS001_QUERY — state the validation response. Use no tools.` });
  await new Promise((resolve, reject) => { const timeout = setTimeout(() => reject(new Error("timeout")), 180_000); const listener = event => { if (event.method === "turn/completed" && event.params?.turn?.id === turn.id) { clearTimeout(timeout); client.off("activity", listener); resolve(); } }; client.on("activity", listener); });
  const events = activities.slice(before); return { label, sessionId: session.id, toolStarts: events.filter(x => x.method === "item/started").length, finalText: events.filter(x => x.method === "item/agentMessage/delta").map(x => x.params.delta).join(""), completed: events.find(x => x.method === "turn/completed")?.params.turn };
}
let present = false;
async function removeUserInstruction() { if (present) { await rm(userInstruction); present = false; } }
try {
  await copyFile(fixture, userInstruction); present = true;
  const userSource = await run("USER_SOURCE", ["user"]);
  await removeUserInstruction();
  const noSourceControl = await run("NO_SOURCE", []);
  console.log(JSON.stringify({ cwd, executable, fixture, userInstruction, queries, userSource, noSourceControl, diagnostics, userInstructionPresentAfterControl: present }, null, 2));
} finally {
  await removeUserInstruction();
  await client.close();
}
