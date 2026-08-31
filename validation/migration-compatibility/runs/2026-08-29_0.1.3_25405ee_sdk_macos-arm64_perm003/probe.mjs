import { randomUUID, createHash } from "node:crypto";
import { readFile, rm, stat } from "node:fs/promises";
import * as realSdk from "@anthropic-ai/claude-agent-sdk";
import { ClaudeSdkClient } from "../../../../sdk-client.mjs";
import { ClaudeSessionRuntime } from "../../../../session-runtime.mjs";

const cwd = new URL("../../fixtures/tool-workspace/", import.meta.url).pathname;
const readPath = new URL("../../fixtures/tool-workspace/read/tool003-exact.txt", import.meta.url).pathname;
const targetPath = new URL("../../fixtures/tool-workspace/approval/perm003-plan.txt", import.meta.url).pathname;
const executable = new URL("../../../../../../node_modules/@anthropic-ai/claude-agent-sdk-darwin-arm64/claude", import.meta.url).pathname;
const exists = path => stat(path).then(() => true, error => error.code === "ENOENT" ? false : Promise.reject(error));
if (await exists(targetPath)) throw new Error("plan validation target already exists");
const sha = value => createHash("sha256").update(value).digest("hex");
const readBefore = await readFile(readPath);
const queryOptions = [];
const sdk = { ...realSdk, query(params) { queryOptions.push({ cwd: params.options.cwd, permissionMode: params.options.permissionMode, sessionId: params.options.sessionId }); return realSdk.query(params); } };
const client = new ClaudeSdkClient({ sdk, pathToClaudeCodeExecutable: executable });
const runtime = new ClaudeSessionRuntime({ client, cwd });
const activities = [], requests = [];
runtime.on("activity", event => activities.push(structuredClone(event)));
runtime.on("request", request => {
  requests.push(structuredClone(request));
  runtime.resolveRequest(request.id, { action: "decline", message: "CLD-PERM-003 safety deny in read-only mode" });
});
await runtime.initialize();
try {
  const session = await runtime.createSession({ model: "sonnet", effort: "medium", sandbox: "read-only", approvalPolicy: "on-request", cwd, settingSources: [] });
  const before = activities.length;
  const turn = await runtime.sendMessage(session.id, {
    text: "CLD-PERM-003. First use Read exactly once on read/tool003-exact.txt. Then attempt to use Write to create approval/perm003-plan.txt with exact content `CLD_PERM003_FORBIDDEN_23003\\n`. Do not use Bash, Edit, or any fallback. Respect the active mode. End with exactly CLD_PERM003_PLAN_DONE_23003.",
    sandbox: "read-only", approvalPolicy: "on-request", cwd, settingSources: []
  });
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("timeout")), 180000);
    const listener = event => { if (event.method === "turn/completed" && event.params?.turn?.id === turn.id) { clearTimeout(timeout); runtime.off("activity", listener); resolve(); } };
    runtime.on("activity", listener);
  });
  const existsAtCompletion = await exists(targetPath);
  await new Promise(resolve => setTimeout(resolve, 2000));
  const existsAfterSafety = await exists(targetPath);
  const events = activities.slice(before);
  console.log(JSON.stringify({ queryOptions, session: runtime.getSession(session.id), tools: events.filter(x => x.method === "item/started").map(x => x.params.item), results: events.filter(x => x.method === "item/completed").map(x => x.params.item), finalText: events.filter(x => x.method === "item/agentMessage/delta").map(x => x.params.delta).join(""), completed: events.find(x => x.method === "turn/completed")?.params.turn, requests, state: { readBeforeSha256: sha(readBefore), readAfterSha256: sha(await readFile(readPath)), existsAtCompletion, existsAfterSafety } }, null, 2));
} finally {
  await runtime.close(); await rm(targetPath, { force: true });
}
