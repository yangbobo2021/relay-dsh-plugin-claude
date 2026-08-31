import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { ClaudeCliClient } from "../../../../cli-client.mjs";
import { ClaudeSdkClient } from "../../../../sdk-client.mjs";

const pluginPath = new URL("../../../../plugin.mjs", import.meta.url);
const cliPath = new URL("../../../../cli-client.mjs", import.meta.url);
const sdkPath = new URL("../../../../sdk-client.mjs", import.meta.url);
const liveTranscriptPath = new URL(
  "file:///Users/boboyang/.claude/projects/-Users-boboyang-work-Relay-integrations-claude-validation-migration-compatibility-fixtures-tool-workspace/3954adc5-53db-459d-bf12-be6e84063020.jsonl",
);
const [pluginSource, cliSource, sdkSource, liveTranscript] = await Promise.all([
  readFile(pluginPath, "utf8"),
  readFile(cliPath, "utf8"),
  readFile(sdkPath, "utf8"),
  readFile(liveTranscriptPath, "utf8"),
]);

const sourceAssertions = {
  autoDefault: pluginSource.includes('const backend = config.backend ?? "auto"'),
  explicitCli: pluginSource.includes('if (backend === "cli") return createClaudeCliClient(config)'),
  explicitSdk: pluginSource.includes('if (backend === "sdk") return sdkClient'),
  sdkPrimary: pluginSource.includes("new FallbackClaudeClient({ primary: sdkClient"),
  fallbackOnlyAfterSdkStartFailure:
    pluginSource.includes("await this.primary.start()") &&
    pluginSource.includes("catch (error)") &&
    pluginSource.includes("await this.fallback.start()"),
};
assert.equal(Object.values(sourceAssertions).every(Boolean), true);

const sdk = new ClaudeSdkClient();
const cli = new ClaudeCliClient({ command: "/command-that-must-never-run" });
await Promise.all([sdk.start(), cli.start()]);
const sdkModels = await sdk.listModels();
const cliModels = await cli.listModels();
assert.equal(sdkModels.every(model => model.inputModalities.join(",") === "text,image"), true);
assert.equal(cliModels.every(model => model.inputModalities.join(",") === "text"), true);

const imageSession = await cli.createSession({ sessionId: "66666666-6666-4666-8666-666666666661" });
let imageError = null;
try {
  await cli.sendMessage(imageSession.id, {
    text: "describe",
    content: [{ type: "image", mediaType: "image/png", data: "AQID" }],
  });
} catch (error) {
  imageError = error.message;
}
assert.match(imageError, /cannot accept image input/);
assert.equal(cli.processes.size, 0);

const toolSession = await cli.createSession({ sessionId: "66666666-6666-4666-8666-666666666662" });
let dshToolError = null;
try {
  await cli.sendMessage(toolSession.id, {
    text: "use the tool",
    dshTools: [{ name: "probe", description: "probe", parameters: { type: "object" } }],
  });
} catch (error) {
  dshToolError = error.message;
}
assert.match(dshToolError, /cannot expose DSH tools/);
assert.equal(cli.processes.size, 0);

const liveEntries = liveTranscript.trim().split("\n").map(JSON.parse);
const liveEntrypoints = [...new Set(liveEntries.map(entry => entry.entrypoint).filter(Boolean))];
const livePromptSources = [...new Set(liveEntries.map(entry => entry.promptSource).filter(Boolean))];
assert.deepEqual(liveEntrypoints, ["sdk-ts"]);
assert.deepEqual(livePromptSources, ["sdk"]);

const sha256 = value => createHash("sha256").update(value).digest("hex");
console.log(JSON.stringify({
  result: "pass",
  sourceAssertions,
  runtime: {
    sdkStarted: !sdk.closed,
    sdkModelInputModalities: [...new Set(sdkModels.map(model => model.inputModalities.join("+")))],
    cliStarted: !cli.closed,
    cliModelInputModalities: [...new Set(cliModels.map(model => model.inputModalities.join("+")))],
    cliImageError: imageError,
    cliDshToolError: dshToolError,
    cliProcessesAfterRejections: cli.processes.size,
  },
  liveProductEvidence: {
    claudeSessionId: "3954adc5-53db-459d-bf12-be6e84063020",
    entrypoints: liveEntrypoints,
    promptSources: livePromptSources,
    transcriptSha256: sha256(liveTranscript),
  },
  sourceSha256: {
    "plugin.mjs": sha256(pluginSource),
    "cli-client.mjs": sha256(cliSource),
    "sdk-client.mjs": sha256(sdkSource),
  },
}, null, 2));
await Promise.all([sdk.close(), cli.close()]);
