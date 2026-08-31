import { randomUUID, createHash } from "node:crypto";
import { readFile, writeFile, rm, stat } from "node:fs/promises";
import * as realSdk from "@anthropic-ai/claude-agent-sdk";
import { ClaudeSdkClient } from "../../../../sdk-client.mjs";
import { ClaudeSessionRuntime } from "../../../../session-runtime.mjs";

const cwd = new URL("../../fixtures/tool-workspace/", import.meta.url).pathname;
const readPath = new URL("../../fixtures/tool-workspace/read/tool003-exact.txt", import.meta.url).pathname;
const allowPath = new URL("../../fixtures/tool-workspace/approval/perm001-allow.txt", import.meta.url).pathname;
const denyPath = new URL("../../fixtures/tool-workspace/approval/perm001-deny.txt", import.meta.url).pathname;
const executable = new URL("../../../../../../node_modules/@anthropic-ai/claude-agent-sdk-darwin-arm64/claude", import.meta.url).pathname;
const exists = async path => stat(path).then(() => true, error => error.code === "ENOENT" ? false : Promise.reject(error));
if (await exists(allowPath) || await exists(denyPath)) throw new Error("permission validation target already exists");
const sha = value => createHash("sha256").update(value).digest("hex");
const readBefore = await readFile(readPath);
const queryOptions = [];
const sdk = { ...realSdk, query(params) { queryOptions.push({ cwd: params.options.cwd, permissionMode: params.options.permissionMode, sessionId: params.options.sessionId }); return realSdk.query(params); } };
const client = new ClaudeSdkClient({ sdk, pathToClaudeCodeExecutable: executable });
const runtime = new ClaudeSessionRuntime({ client, cwd });
const activities = [], requests = [], decisions = [], diagnostics = [];
runtime.on("activity", event => activities.push(structuredClone(event)));
runtime.on("request", request => {
  requests.push(structuredClone(request));
  const path = String(request.params?.input?.file_path ?? request.params?.input?.path ?? "");
  const deny = path.endsWith("approval/perm001-deny.txt");
  const response = deny
    ? { action: "decline", message: "CLD-PERM-001 deliberate deny" }
    : { action: "accept", updatedInput: request.params.input };
  decisions.push({ id: request.id, toolName: request.params.toolName, path, action: response.action });
  runtime.resolveRequest(request.id, response);
});
runtime.on("change", snapshot => { for (const item of snapshot.diagnostics ?? []) if (!diagnostics.includes(item)) diagnostics.push(item); });
await runtime.initialize();

async function run(label, text) {
  const session = await runtime.createSession({ model: "sonnet", effort: "medium", sandbox: "workspace-write", approvalPolicy: "on-request", cwd, settingSources: [] });
  const before = activities.length;
  const turn = await runtime.sendMessage(session.id, { text, sandbox: "workspace-write", approvalPolicy: "on-request", cwd, settingSources: [] });
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("timeout")), 180000);
    const listener = event => {
      if (event.method === "turn/completed" && event.params?.turn?.id === turn.id) {
        clearTimeout(timeout); runtime.off("activity", listener); resolve();
      }
    };
    runtime.on("activity", listener);
  });
  const events = activities.slice(before);
  return {
    label, sessionId: session.id, runtimeSession: runtime.getSession(session.id),
    tools: events.filter(x => x.method === "item/started").map(x => x.params.item),
    results: events.filter(x => x.method === "item/completed").map(x => x.params.item),
    finalText: events.filter(x => x.method === "item/agentMessage/delta").map(x => x.params.delta).join(""),
    completed: events.find(x => x.method === "turn/completed")?.params.turn
  };
}
try {
  const allow = await run("allow", "CLD-PERM-001 allow branch. Use Read exactly once on read/tool003-exact.txt. Then use Write exactly once to approval/perm001-allow.txt with exact content `CLD_PERM001_ALLOWED_21001\\n`. Use no other tools. If successful output exactly CLD_PERM001_ALLOW_DONE_21001.");
  const allowBytes = await readFile(allowPath);
  const deny = await run("deny", "CLD-PERM-001 deny branch. Use Write exactly once to approval/perm001-deny.txt with exact content `CLD_PERM001_DENIED_21001\\n`. Use no other tools. After rejection output exactly CLD_PERM001_DENY_DONE_21001.");
  const state = { readBeforeSha256: sha(readBefore), readAfterSha256: sha(await readFile(readPath)), allowExists: await exists(allowPath), allowContent: allowBytes.toString(), allowSha256: sha(allowBytes), denyExists: await exists(denyPath) };
  console.log(JSON.stringify({ cwd, queryOptions, allow, deny, requests, decisions, diagnostics, state }, null, 2));
} finally {
  await runtime.close();
  await rm(allowPath, { force: true }); await rm(denyPath, { force: true });
}
