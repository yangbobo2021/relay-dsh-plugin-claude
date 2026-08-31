import { randomUUID, createHash } from "node:crypto";
import { readFile, writeFile, rm, stat } from "node:fs/promises";
import * as realSdk from "@anthropic-ai/claude-agent-sdk";
import { ClaudeSdkClient } from "../../../../sdk-client.mjs";
import { ClaudeSessionRuntime } from "../../../../session-runtime.mjs";

const cwd = new URL("../../fixtures/tool-workspace/", import.meta.url).pathname;
const outsidePath = "/private/tmp/relay-cld-perm002-outside.txt";
const outsideContent = "CLD_PERM002_OUTSIDE_SECRET_22002\n";
const executable = new URL("../../../../../../node_modules/@anthropic-ai/claude-agent-sdk-darwin-arm64/claude", import.meta.url).pathname;
const exists = path => stat(path).then(() => true, error => error.code === "ENOENT" ? false : Promise.reject(error));
if (await exists(outsidePath)) throw new Error("outside validation fixture already exists");
await writeFile(outsidePath, outsideContent);
const queryOptions = [];
const sdk = { ...realSdk, query(params) { queryOptions.push({ cwd: params.options.cwd, permissionMode: params.options.permissionMode, sessionId: params.options.sessionId }); return realSdk.query(params); } };
const client = new ClaudeSdkClient({ sdk, pathToClaudeCodeExecutable: executable });
const runtime = new ClaudeSessionRuntime({ client, cwd });
const activities = [], requests = [], decisions = [];
let branch = "deny";
runtime.on("activity", event => activities.push(structuredClone(event)));
runtime.on("request", request => {
  requests.push({ branch, request: structuredClone(request) });
  const response = branch === "deny"
    ? { action: "decline", message: "CLD-PERM-002 deliberate outside deny" }
    : { action: "accept", updatedInput: request.params.input };
  decisions.push({ branch, id: request.id, toolName: request.params.toolName, input: structuredClone(request.params.input), blockedPath: request.params.blockedPath, decisionReason: request.params.decisionReason, action: response.action });
  runtime.resolveRequest(request.id, response);
});
await runtime.initialize();

async function run(label, decision, finalMarker) {
  branch = decision;
  const session = await runtime.createSession({ model: "sonnet", effort: "medium", sandbox: "workspace-write", approvalPolicy: "on-request", cwd, settingSources: [] });
  const before = activities.length;
  const turn = await runtime.sendMessage(session.id, {
    text: `CLD-PERM-002 ${decision} branch. Use Read exactly once on absolute path ${outsidePath}. Use no other tool. After the decision output exactly ${finalMarker}.`,
    sandbox: "workspace-write", approvalPolicy: "on-request", cwd, settingSources: []
  });
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("timeout")), 180000);
    const listener = event => { if (event.method === "turn/completed" && event.params?.turn?.id === turn.id) { clearTimeout(timeout); runtime.off("activity", listener); resolve(); } };
    runtime.on("activity", listener);
  });
  const events = activities.slice(before);
  return { label, sessionId: session.id, tools: events.filter(x => x.method === "item/started").map(x => x.params.item), results: events.filter(x => x.method === "item/completed").map(x => x.params.item), finalText: events.filter(x => x.method === "item/agentMessage/delta").map(x => x.params.delta).join(""), completed: events.find(x => x.method === "turn/completed")?.params.turn };
}
try {
  const deny = await run("deny", "deny", "CLD_PERM002_DENY_DONE_22002");
  const allow = await run("allow", "allow", "CLD_PERM002_ALLOW_DONE_22002");
  const bytes = await readFile(outsidePath);
  console.log(JSON.stringify({ cwd, outsidePath, outsideContentSha256: createHash("sha256").update(bytes).digest("hex"), queryOptions, deny, allow, requests, decisions, outsideUnchanged: bytes.toString() === outsideContent }, null, 2));
} finally {
  await runtime.close(); await rm(outsidePath, { force: true });
}
