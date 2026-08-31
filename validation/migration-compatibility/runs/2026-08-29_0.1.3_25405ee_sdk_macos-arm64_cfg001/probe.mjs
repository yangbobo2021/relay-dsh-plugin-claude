import { randomUUID } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import * as realSdk from "@anthropic-ai/claude-agent-sdk";
import { ClaudeSdkClient } from "../../../../sdk-client.mjs";

const cwd = new URL("../../fixtures/tool-workspace/", import.meta.url).pathname;
const fixtureConfigDir = new URL("config-dir/", import.meta.url).pathname;
const realSettingsPath = "/Users/boboyang/.claude/settings.json";
const originalSettings = await readFile(realSettingsPath);
const testSettings = await readFile(`${fixtureConfigDir}settings.json`);
const executable = new URL(
  "../../../../../../node_modules/@anthropic-ai/claude-agent-sdk-darwin-arm64/claude",
  import.meta.url,
).pathname;
delete process.env.CLAUDE_CONFIG_DIR;

const queryOptions = [];
const sdk = {
  ...realSdk,
  query(params) {
    queryOptions.push({
      sessionId: params.options.sessionId ?? params.options.resume,
      settingSources: structuredClone(params.options.settingSources),
      permissionMode: params.options.permissionMode,
    });
    return realSdk.query(params);
  },
};
const client = new ClaudeSdkClient({ sdk, pathToClaudeCodeExecutable: executable });
const activities = [];
const requests = [];
const diagnostics = [];
client.on("activity", event => activities.push(structuredClone(event)));
client.on("request", request => {
  requests.push(structuredClone(request));
  client.resolveRequest(request.id, { action: "allowOnce" });
});
client.on("diagnostic", message => diagnostics.push(String(message)));
await client.start();

async function run(label, settingSources, finalText) {
  const session = await client.createSession({
    sessionId: randomUUID(), cwd, model: "sonnet", effort: "medium", settingSources,
  });
  const before = activities.length;
  const started = await client.sendMessage(session.id, {
    text: [
      `CLD-CFG-001 ${label} controlled validation.`,
      "Invoke Bash exactly once with command `printf CFG001_USER_SETTING_ACTIVE_1001` and no other tool.",
      `After the tool outcome, output exactly ${finalText} and nothing else.`,
    ].join(" "),
    settingSources,
  });
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`${label} timed out`)), 180_000);
    const listener = event => {
      if (event.method === "turn/completed" && event.params?.turn?.id === started.id) {
        clearTimeout(timeout); client.off("activity", listener); resolve();
      }
    };
    client.on("activity", listener);
  });
  const events = activities.slice(before);
  return {
    label,
    sessionId: session.id,
    turnId: started.id,
    status: events.find(event => event.method === "turn/completed")?.params?.turn,
    tools: events.filter(event => event.method === "item/started").map(event => event.params.item),
    results: events.filter(event => event.method === "item/completed").map(event => event.params.item),
    finalText: events.filter(event => event.method === "item/agentMessage/delta").map(event => event.params.delta).join(""),
  };
}

let restored = false;
async function restoreSettings() {
  if (restored) return;
  await writeFile(realSettingsPath, originalSettings);
  restored = true;
}

try {
  await writeFile(realSettingsPath, testSettings);
  const userSource = await run("user-source", ["user"], "CLD_CFG001_USER_SOURCE_DONE_1001");
  await restoreSettings();
  const noSource = await run("no-source-control", [], "CLD_CFG001_NO_SOURCE_DONE_1001");
  console.log(JSON.stringify({
    cwd, fixtureConfigDir, realSettingsPath, executable, queryOptions, userSource, noSource,
    requests, diagnostics, originalSettingsBytes: originalSettings.length, restored,
  }, null, 2));
} finally {
  await restoreSettings();
  await client.close();
}
