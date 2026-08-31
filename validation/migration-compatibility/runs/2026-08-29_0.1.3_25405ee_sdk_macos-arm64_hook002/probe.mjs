import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { ClaudeSdkClient } from "../../../../sdk-client.mjs";

const cwd = new URL("../../fixtures/tool-workspace/", import.meta.url).pathname;
const executable = new URL("../../../../../../node_modules/@anthropic-ai/claude-agent-sdk-darwin-arm64/claude", import.meta.url).pathname;
const settingsPath = new URL("../../fixtures/tool-workspace/.claude/settings.json", import.meta.url).pathname;
const fixture = new URL("project-settings.json", import.meta.url).pathname;
const logPath = "/private/tmp/relay-cld-hook002.jsonl";
let original = null;
try { original = await readFile(settingsPath); } catch (error) { if (error.code !== "ENOENT") throw error; }
const client = new ClaudeSdkClient({ pathToClaudeCodeExecutable: executable });
const activities = [], requests = [], diagnostics = [];
client.on("activity", event => activities.push(structuredClone(event)));
client.on("request", request => {
  requests.push(structuredClone(request));
  client.resolveRequest(request.id, { action: "accept", updatedInput: request.params.input });
});
client.on("diagnostic", message => diagnostics.push(String(message)));
await client.start();

async function run(label, text) {
  const session = await client.createSession({ sessionId: randomUUID(), cwd, model: "sonnet", effort: "medium", settingSources: ["project"] });
  const before = activities.length;
  const turn = await client.sendMessage(session.id, { settingSources: ["project"], text });
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("timeout")), 180000);
    const listener = event => {
      if (event.method === "turn/completed" && event.params?.turn?.id === turn.id) {
        clearTimeout(timeout); client.off("activity", listener); resolve();
      }
    };
    client.on("activity", listener);
  });
  const events = activities.slice(before);
  return {
    label,
    sessionId: session.id,
    tools: events.filter(x => x.method === "item/started").map(x => x.params.item),
    results: events.filter(x => x.method === "item/completed").map(x => x.params.item),
    finalText: events.filter(x => x.method === "item/agentMessage/delta").map(x => x.params.delta).join(""),
    completed: events.find(x => x.method === "turn/completed")?.params.turn
  };
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
  const control = await run("control", "CLD-HOOK-002 no-tool control. Use no tools. Output exactly CLD_HOOK002_CONTROL_DONE_12002.");
  const controlRecords = await readLog();
  const target = await run("target", "CLD-HOOK-002 target. Invoke Bash exactly once with command `printf HOOK002_TARGET_12002` and no other tool. Then output exactly CLD_HOOK002_TARGET_DONE_12002.");
  const targetRecords = await readLog();
  await restore(); await rm(logPath, { force: true });
  console.log(JSON.stringify({ cwd, originalSettingsExisted: original !== null, control, controlRecords, target, targetRecords, requests, diagnostics, restored, logRemoved: true }, null, 2));
} finally {
  await restore(); await rm(logPath, { force: true }); await client.close();
}
