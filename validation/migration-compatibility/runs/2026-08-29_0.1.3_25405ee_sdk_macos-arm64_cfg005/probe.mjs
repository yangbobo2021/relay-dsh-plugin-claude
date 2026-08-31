import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { promisify } from "node:util";
import { ClaudeSdkClient } from "../../../../sdk-client.mjs";

const execute = promisify(execFile);
const cwd = new URL("../../fixtures/tool-workspace/", import.meta.url).pathname;
const executable = new URL("../../../../../../node_modules/@anthropic-ai/claude-agent-sdk-darwin-arm64/claude", import.meta.url).pathname;
const settingsPath = "/Users/boboyang/.claude/settings.json";
const client = new ClaudeSdkClient({ pathToClaudeCodeExecutable: executable });
const activities = [], diagnostics = [];
client.on("activity", event => activities.push(structuredClone(event)));
client.on("diagnostic", message => diagnostics.push(String(message)));
await client.start();

async function run(label) {
  const session = await client.createSession({ sessionId: randomUUID(), cwd, model: "sonnet", effort: "medium", settingSources: ["user"] });
  const before = activities.length;
  const turn = await client.sendMessage(session.id, { settingSources: ["user"], text: `CLD-CFG-005 unrelated ${label} init probe. Use no tools. Output exactly CLD_CFG005_${label}_DONE_5005 and nothing else.` });
  await new Promise((resolve, reject) => { const timeout = setTimeout(() => reject(new Error("timeout")), 180_000); const listener = event => { if (event.method === "turn/completed" && event.params?.turn?.id === turn.id) { clearTimeout(timeout); client.off("activity", listener); resolve(); } }; client.on("activity", listener); });
  const events = activities.slice(before);
  return { label, sessionId: session.id, toolStarts: events.filter(x => x.method === "item/started").length, finalText: events.filter(x => x.method === "item/agentMessage/delta").map(x => x.params.delta).join(""), completed: events.find(x => x.method === "turn/completed")?.params.turn };
}

const enabledConfig = JSON.parse(await readFile(settingsPath, "utf8")).enabledPlugins;
const enabled = await run("ENABLED");
const disabledCommand = await execute(executable, ["plugin", "disable", "relay-cld-installed-fixture@relay-cld-validation-marketplace", "--scope", "user"]);
const disabledConfig = JSON.parse(await readFile(settingsPath, "utf8")).enabledPlugins;
const disabled = await run("DISABLED");
console.log(JSON.stringify({ cwd, executable, enabledConfig, enabled, disabledCommand: disabledCommand.stdout.trim(), disabledConfig, disabled, diagnostics }, null, 2));
await client.close();
