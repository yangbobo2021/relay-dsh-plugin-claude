import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { ClaudeSdkClient } from "../../../../sdk-client.mjs";

const ownerCwd = new URL("../../fixtures/tool-workspace/", import.meta.url).pathname;
const siblingCwd = new URL("../../fixtures/plain-text-workspace/", import.meta.url).pathname;
const executable = new URL("../../../../../../node_modules/@anthropic-ai/claude-agent-sdk-darwin-arm64/claude", import.meta.url).pathname;
const settingsPath = new URL("../../fixtures/tool-workspace/.claude/settings.json", import.meta.url).pathname;
const fixture = new URL("project-settings.json", import.meta.url).pathname;
const logPath = "/private/tmp/relay-cld-hook003.jsonl";
let original = null;
try { original = await readFile(settingsPath); } catch (error) { if (error.code !== "ENOENT") throw error; }
const client = new ClaudeSdkClient({ pathToClaudeCodeExecutable: executable });
const activities = [], diagnostics = [];
client.on("activity", event => activities.push(structuredClone(event)));
client.on("diagnostic", message => diagnostics.push(String(message)));
await client.start();

async function run(label, cwd, marker) {
  const startedAt = Date.now();
  const session = await client.createSession({ sessionId: randomUUID(), cwd, model: "sonnet", effort: "medium", settingSources: ["project"] });
  const turn = await client.sendMessage(session.id, { settingSources: ["project"], text: `Use no tools. Output exactly ${marker}.` });
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("timeout")), 180000);
    const listener = event => {
      if (event.method === "turn/completed" && event.params?.turn?.id === turn.id) {
        clearTimeout(timeout); client.off("activity", listener); resolve();
      }
    };
    client.on("activity", listener);
  });
  const completedAt = Date.now();
  const events = activities.filter(event => event.params?.sessionId === session.id || event.params?.turn?.id === turn.id);
  return { label, cwd, sessionId: session.id, startedAt, completedAt, toolCount: events.filter(x => x.method === "item/started").length, finalText: events.filter(x => x.method === "item/agentMessage/delta").map(x => x.params.delta).join("") };
}
async function readLog() {
  try { return (await readFile(logPath, "utf8")).trim().split("\n").filter(Boolean).map(JSON.parse); }
  catch (error) { if (error.code === "ENOENT") return []; throw error; }
}
let restored = false;
async function restore() {
  if (restored) return;
  if (original === null) await rm(settingsPath, { force: true }); else await writeFile(settingsPath, original);
  restored = true;
}
try {
  await rm(logPath, { force: true });
  await mkdir(new URL("../../fixtures/tool-workspace/.claude/", import.meta.url), { recursive: true });
  await writeFile(settingsPath, await readFile(fixture));
  const control = await run("sibling-control", siblingCwd, "CLD_HOOK003_CONTROL_DONE_13003");
  const controlRecords = await readLog();
  const target = await run("owner-target", ownerCwd, "CLD_HOOK003_TARGET_DONE_13003");
  const targetRecords = await readLog();
  await restore(); await rm(logPath, { force: true });
  console.log(JSON.stringify({ originalSettingsExisted: original !== null, control, controlRecords, target, targetRecords, diagnostics, restored, logRemoved: true }, null, 2));
} finally {
  await restore(); await rm(logPath, { force: true }); await client.close();
}
