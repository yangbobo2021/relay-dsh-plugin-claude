import { randomUUID, createHash } from "node:crypto";
import { chmod, mkdir, readFile, writeFile, rm, readdir } from "node:fs/promises";
import { join } from "node:path";
import { ClaudeSdkClient } from "../../../../sdk-client.mjs";

const cwd = new URL("../../fixtures/tool-workspace/", import.meta.url).pathname;
const binDir = new URL("bin/", import.meta.url).pathname.replace(/\/$/, "");
const fixtureExecutable = new URL("bin/relay-cld-env003-probe", import.meta.url).pathname;
const settingsPath = new URL("../../fixtures/tool-workspace/.claude/settings.json", import.meta.url).pathname;
const executable = new URL("../../../../../../node_modules/@anthropic-ai/claude-agent-sdk-darwin-arm64/claude", import.meta.url).pathname;
const fakeSecret = "CLD_ENV003_FAKE_SECRET_33003_X7Q9";
const settings = Buffer.from(JSON.stringify({ env: { CLD_ENV003_SECRET: fakeSecret, PATH: `${binDir}:${process.env.PATH ?? ""}` } }, null, 2) + "\n");
let original = null;
try { original = await readFile(settingsPath); } catch (error) { if (error.code !== "ENOENT") throw error; }
const count = (value, needle) => String(value).split(needle).length - 1;
const sha = value => createHash("sha256").update(value).digest("hex");
const client = new ClaudeSdkClient({ pathToClaudeCodeExecutable: executable });
const activities = [], requests = [], diagnostics = [];
client.on("activity", event => activities.push(structuredClone(event)));
client.on("request", request => { requests.push(structuredClone(request)); client.resolveRequest(request.id, { action: "accept", updatedInput: request.params.input }); });
client.on("diagnostic", message => diagnostics.push(String(message)));
await client.start();
let restored = false;
async function restore() { if (restored) return; if (original === null) await rm(settingsPath, { force: true }); else await writeFile(settingsPath, original); restored = true; }
try {
  await chmod(fixtureExecutable, 0o755);
  await mkdir(new URL("../../fixtures/tool-workspace/.claude/", import.meta.url), { recursive: true }); await writeFile(settingsPath, settings);
  const session = await client.createSession({ sessionId: randomUUID(), cwd, model: "sonnet", effort: "medium", settingSources: ["project"] });
  const before = activities.length;
  const turn = await client.sendMessage(session.id, { settingSources: ["project"], text: "CLD-ENV-003 neutral fixture probe. Use Bash exactly once with exact command `relay-cld-env003-probe`. Do not use other tools. Do not repeat or describe the command output in your answer. Output exactly CLD_ENV003_DONE_33003." });
  await new Promise((resolve, reject) => { const timeout = setTimeout(() => reject(new Error("timeout")), 180000); const listener = event => { if (event.method === "turn/completed" && event.params?.turn?.id === turn.id) { clearTimeout(timeout); client.off("activity", listener); resolve(); } }; client.on("activity", listener); });
  const events = activities.slice(before);
  const projectRoot = "/Users/boboyang/.claude/projects";
  const entries = await readdir(projectRoot, { recursive: true });
  const relativeTranscript = entries.find(entry => String(entry).endsWith(`/${session.id}.jsonl`) || String(entry) === `${session.id}.jsonl`);
  if (!relativeTranscript) throw new Error("native transcript not found");
  const transcriptPath = join(projectRoot, String(relativeTranscript));
  const transcriptBytes = await readFile(transcriptPath);
  const finalText = events.filter(x => x.method === "item/agentMessage/delta").map(x => x.params.delta).join("");
  const runtimeActivityJson = JSON.stringify(events);
  const diagnosticText = diagnostics.join("\n");
  await restore();
  console.log(JSON.stringify({ sessionId: session.id, transcriptPath, excludedPriorTrial: { sessionId: "acfe5f82-ef77-46d3-9a0c-c0bfa0294e46", reason: "Claude refused before any tool execution" }, toolNames: events.filter(x => x.method === "item/started").map(x => x.params.item.name), toolStatuses: events.filter(x => x.method === "item/completed").map(x => x.params.item.status), finalText, requests: requests.map(x => ({ toolName: x.params.toolName, input: x.params.input })), occurrences: { sdkActivities: count(runtimeActivityJson, fakeSecret), nativeTranscript: count(transcriptBytes, fakeSecret), finalText: count(finalText, fakeSecret), diagnostics: count(diagnosticText, fakeSecret) }, hashes: { fakeSecretSha256: sha(fakeSecret), transcriptSha256: sha(transcriptBytes), settingsFixtureSha256: sha(settings), fixtureExecutableSha256: sha(await readFile(fixtureExecutable)) }, originalSettingsExisted: original !== null, restored }, null, 2));
} finally { await restore(); await client.close(); }
