import { randomUUID, createHash } from "node:crypto";
import { readFile, rm, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import * as realSdk from "@anthropic-ai/claude-agent-sdk";
import { ClaudeSdkClient } from "../../../../sdk-client.mjs";
import { ClaudeSessionRuntime } from "../../../../session-runtime.mjs";

const cwd = fileURLToPath(new URL("../../fixtures/%E7%8E%AF%E5%A2%83%20%E7%A9%BA%E6%A0%BC-workspace/", import.meta.url));
const sourcePath = fileURLToPath(new URL("../../fixtures/%E7%8E%AF%E5%A2%83%20%E7%A9%BA%E6%A0%BC-workspace/%E6%BA%90%20%E6%96%87%E4%BB%B6.txt", import.meta.url));
const targetPath = fileURLToPath(new URL("../../fixtures/%E7%8E%AF%E5%A2%83%20%E7%A9%BA%E6%A0%BC-workspace/%E8%BE%93%E5%87%BA%20%E6%96%87%E4%BB%B6.txt", import.meta.url));
const targetContent = "CLD_ENV002_OUTPUT_中文_32002\n";
const executable = new URL("../../../../../../node_modules/@anthropic-ai/claude-agent-sdk-darwin-arm64/claude", import.meta.url).pathname;
const exists = path => stat(path).then(() => true, error => error.code === "ENOENT" ? false : Promise.reject(error));
if (await exists(targetPath)) throw new Error("Unicode output target already exists");
const sha = value => createHash("sha256").update(value).digest("hex");
const sourceBefore = await readFile(sourcePath);
const queries = [];
const sdk = { ...realSdk, query(params) { queries.push({ cwd: params.options.cwd, sessionId: params.options.sessionId, permissionMode: params.options.permissionMode }); return realSdk.query(params); } };
const client = new ClaudeSdkClient({ sdk, pathToClaudeCodeExecutable: executable });
const runtime = new ClaudeSessionRuntime({ client, cwd });
const activities = [], requests = [];
runtime.on("activity", event => activities.push(structuredClone(event)));
runtime.on("request", request => { requests.push(structuredClone(request)); runtime.resolveRequest(request.id, { action: "accept", updatedInput: request.params.input }); });
await runtime.initialize();
try {
  const session = await runtime.createSession({ model: "sonnet", effort: "medium", sandbox: "workspace-write", approvalPolicy: "on-request", cwd, settingSources: [] });
  const before = activities.length;
  const turn = await runtime.sendMessage(session.id, { cwd, settingSources: [], sandbox: "workspace-write", approvalPolicy: "on-request", text: "CLD-ENV-002. Use Bash exactly once with command `pwd`. Then use Read exactly once on `源 文件.txt`. Then use Write exactly once to `输出 文件.txt` with exact content `CLD_ENV002_OUTPUT_中文_32002\\n`. Use no other tools. Output exactly CLD_ENV002_DONE_32002." });
  await new Promise((resolve, reject) => { const timeout = setTimeout(() => reject(new Error("timeout")), 180000); const listener = event => { if (event.method === "turn/completed" && event.params?.turn?.id === turn.id) { clearTimeout(timeout); runtime.off("activity", listener); resolve(); } }; runtime.on("activity", listener); });
  const events = activities.slice(before), targetBytes = await readFile(targetPath);
  console.log(JSON.stringify({ cwd, sourcePath, targetPath, queries, runtimeSession: runtime.getSession(session.id), tools: events.filter(x => x.method === "item/started").map(x => x.params.item), results: events.filter(x => x.method === "item/completed").map(x => x.params.item), finalText: events.filter(x => x.method === "item/agentMessage/delta").map(x => x.params.delta).join(""), completed: events.find(x => x.method === "turn/completed")?.params.turn, requests, state: { sourceSha256Before: sha(sourceBefore), sourceSha256After: sha(await readFile(sourcePath)), targetContent: targetBytes.toString(), targetSha256: sha(targetBytes), targetExact: targetBytes.toString() === targetContent } }, null, 2));
} finally { await runtime.close(); await rm(targetPath, { force: true }); }
