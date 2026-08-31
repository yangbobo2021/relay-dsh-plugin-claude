import { randomUUID, createHash } from "node:crypto";
import { mkdir, readFile, writeFile, rm, readdir } from "node:fs/promises";
import { join } from "node:path";
import { ClaudeSdkClient } from "../../../../sdk-client.mjs";

const cwd = new URL("../../fixtures/tool-workspace/", import.meta.url).pathname;
const settingsPath = new URL("../../fixtures/tool-workspace/.claude/settings.json", import.meta.url).pathname;
const settingsFixture = new URL("project-settings.json", import.meta.url).pathname;
const logPath = "/private/tmp/relay-cld-ses005-compact.jsonl";
const executable = new URL("../../../../../../node_modules/@anthropic-ai/claude-agent-sdk-darwin-arm64/claude", import.meta.url).pathname;
const marker = "CLD_SES005_EARLY_MARKER_45005_Q7M2";
let original = null;
try { original = await readFile(settingsPath); } catch (error) { if (error.code !== "ENOENT") throw error; }
const client = new ClaudeSdkClient({ pathToClaudeCodeExecutable: executable });
const activities = [], diagnostics = [];
client.on("activity", event => activities.push(structuredClone(event)));
client.on("diagnostic", message => diagnostics.push(String(message)));
await client.start();
async function turn(sessionId, label, text) {
  const before = activities.length;
  const started = await client.sendMessage(sessionId, { settingSources: ["project"], text });
  await new Promise((resolve, reject) => { const timeout = setTimeout(() => reject(new Error(`timeout ${label}`)), 180000); const listener = event => { if (event.method === "turn/completed" && event.params?.turn?.id === started.id) { clearTimeout(timeout); client.off("activity", listener); resolve(); } }; client.on("activity", listener); });
  const events = activities.slice(before);
  return { label, turnId: started.id, toolCount: events.filter(x => x.method === "item/started").length, finalText: events.filter(x => x.method === "item/agentMessage/delta").map(x => x.params.delta).join(""), completed: events.find(x => x.method === "turn/completed")?.params.turn };
}
async function readLog() { try { return (await readFile(logPath, "utf8")).trim().split("\n").filter(Boolean).map(JSON.parse); } catch (error) { if (error.code === "ENOENT") return []; throw error; } }
let restored = false;
async function restore() { if (restored) return; if (original === null) await rm(settingsPath, { force: true }); else await writeFile(settingsPath, original); restored = true; }
try {
  await rm(logPath, { force: true }); await mkdir(new URL("../../fixtures/tool-workspace/.claude/", import.meta.url), { recursive: true }); await writeFile(settingsPath, await readFile(settingsFixture));
  const session = await client.createSession({ sessionId: randomUUID(), cwd, model: "sonnet", effort: "medium", settingSources: ["project"] });
  const establish = await turn(session.id, "establish", `Remember this exact important migration marker for later: ${marker}. Use no tools. Reply exactly CLD_SES005_ESTABLISHED_45005.`);
  const fillerTurns = [];
  for (let index = 1; index <= 3; index += 1) {
    const filler = Array.from({ length: 1500 }, (_, item) => `neutral-${index}-${item % 17}`).join(" ");
    fillerTurns.push(await turn(session.id, `filler-${index}`, `Store this neutral context section without tools, then reply exactly CLD_SES005_FILLER_${index}_DONE. Section: ${filler}`));
  }
  const beforeCompactHooks = await readLog();
  const compact = await turn(session.id, "compact", "/compact Preserve all exact migration validation identifiers and their values for later recall.");
  const afterCompactHooks = await readLog();
  const recall = await turn(session.id, "recall", "What exact migration marker did I ask you to remember before compaction? Use no tools. Reply with that marker only.");
  const projectRoot = "/Users/boboyang/.claude/projects", entries = await readdir(projectRoot, { recursive: true });
  const relative = entries.find(entry => String(entry).endsWith(`/${session.id}.jsonl`) || String(entry) === `${session.id}.jsonl`);
  if (!relative) throw new Error("native transcript not found");
  const transcriptPath = join(projectRoot, String(relative)), transcript = await readFile(transcriptPath), lines = transcript.toString().trim().split("\n").map(JSON.parse);
  const boundaries = lines.filter(line => line.type === "system" && line.subtype === "compact_boundary");
  await restore(); await rm(logPath, { force: true });
  const sha = value => createHash("sha256").update(value).digest("hex");
  console.log(JSON.stringify({ sessionId: session.id, excludedPriorTrial: { sessionId: "d247f69a-6423-414d-88fb-c62326f82052", reason: "manual compact returned Not enough messages; no PostCompact/boundary" }, markerSha256: sha(marker), establish, fillerTurns, beforeCompactHooks, compact, afterCompactHooks, recall, boundaries, diagnostics, transcriptPath, transcriptSha256: sha(transcript), originalSettingsExisted: original !== null, restored, logRemoved: true }, null, 2));
} finally { await restore(); await rm(logPath, { force: true }); await client.close(); }
