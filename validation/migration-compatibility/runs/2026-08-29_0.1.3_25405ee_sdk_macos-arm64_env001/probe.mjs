import { randomUUID } from "node:crypto";
import { chmod, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { ClaudeSdkClient } from "../../../../sdk-client.mjs";

const cwd = new URL("../../fixtures/tool-workspace/", import.meta.url).pathname;
const binDir = new URL("bin/", import.meta.url).pathname.replace(/\/$/, "");
const executableFixture = new URL("bin/relay-cld-path-probe", import.meta.url).pathname;
const settingsPath = new URL("../../fixtures/tool-workspace/.claude/settings.json", import.meta.url).pathname;
const executable = new URL("../../../../../../node_modules/@anthropic-ai/claude-agent-sdk-darwin-arm64/claude", import.meta.url).pathname;
let original = null;
try { original = await readFile(settingsPath); } catch (error) { if (error.code !== "ENOENT") throw error; }
const baselinePathContainsFixture = String(process.env.PATH ?? "").split(":").includes(binDir);
if (baselinePathContainsFixture) throw new Error("fixture bin unexpectedly present in host PATH");
await chmod(executableFixture, 0o755);
const projectSettings = Buffer.from(JSON.stringify({ env: { PATH: `${binDir}:${process.env.PATH ?? ""}` } }, null, 2) + "\n");
const client = new ClaudeSdkClient({ pathToClaudeCodeExecutable: executable });
const activities = [], requests = [], diagnostics = [];
client.on("activity", event => activities.push(structuredClone(event)));
client.on("request", request => { requests.push(structuredClone(request)); client.resolveRequest(request.id, { action: "accept", updatedInput: request.params.input }); });
client.on("diagnostic", message => diagnostics.push(String(message)));
await client.start();
async function run(label, settingSources, finalMarker) {
  const session = await client.createSession({ sessionId: randomUUID(), cwd, model: "sonnet", effort: "medium", settingSources });
  const before = activities.length;
  const turn = await client.sendMessage(session.id, { settingSources, text: `Run Bash exactly once with exact command \`relay-cld-path-probe\` and no other tool or fallback. Then output exactly ${finalMarker}.` });
  await new Promise((resolve, reject) => { const timeout = setTimeout(() => reject(new Error("timeout")), 180000); const listener = event => { if (event.method === "turn/completed" && event.params?.turn?.id === turn.id) { clearTimeout(timeout); client.off("activity", listener); resolve(); } }; client.on("activity", listener); });
  const events = activities.slice(before);
  return { label, sessionId: session.id, tools: events.filter(x => x.method === "item/started").map(x => x.params.item), results: events.filter(x => x.method === "item/completed").map(x => x.params.item), finalText: events.filter(x => x.method === "item/agentMessage/delta").map(x => x.params.delta).join(""), completed: events.find(x => x.method === "turn/completed")?.params.turn };
}
let restored = false;
async function restore() { if (restored) return; if (original === null) await rm(settingsPath, { force: true }); else await writeFile(settingsPath, original); restored = true; }
try {
  await mkdir(new URL("../../fixtures/tool-workspace/.claude/", import.meta.url), { recursive: true }); await writeFile(settingsPath, projectSettings);
  const configured = await run("project-path", ["project"], "CLD_ENV001_CONFIGURED_DONE_31001");
  const control = await run("no-source-control", [], "CLD_ENV001_CONTROL_DONE_31001");
  await restore();
  console.log(JSON.stringify({ cwd, binDir, executableFixture, baselinePathContainsFixture, configured, control, requests, diagnostics, originalSettingsExisted: original !== null, restored }, null, 2));
} finally { await restore(); await client.close(); }
