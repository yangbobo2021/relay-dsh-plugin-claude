import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { ClaudeCliClient } from "../cli-client.mjs";

test("Claude CLI rejects DSH tools instead of silently omitting them", async () => {
  const client = new ClaudeCliClient();
  await client.createSession({ sessionId: "44444444-4444-4444-8444-444444444444" });
  await assert.rejects(() => client.sendMessage("44444444-4444-4444-8444-444444444444", {
    text: "use the tool",
    dshTools: [{ name: "cross_plugin_probe", description: "probe", parameters: { type: "object" } }],
  }), /cannot expose DSH tools/);
});

test("Claude CLI advertises text-only input and rejects images before spawning", async () => {
  const client = new ClaudeCliClient({ command: "/command-that-must-not-run" });
  await client.start();
  const models = await client.listModels();
  const session = await client.createSession({ sessionId: "55555555-5555-4555-8555-555555555555" });

  assert.equal(models.every(model => JSON.stringify(model.inputModalities) === JSON.stringify(["text"])), true);
  await assert.rejects(client.sendMessage(session.id, {
    text: "describe",
    content: [{ type: "image", mediaType: "image/png", data: "AQID" }],
  }), /cannot accept image input/);
  assert.equal(client.processes.size, 0);
});

test("Claude CLI client uses session, settings, effort, and permission flags", async (context) => {
  const directory = await mkdtemp(join(tmpdir(), "relay-claude-cli-"));
  context.after(() => rm(directory, { recursive: true, force: true }));
  const argsPath = join(directory, "args.json");
  const scriptPath = join(directory, "fake-claude.mjs");
  await writeFile(scriptPath, `
import { writeFileSync } from "node:fs";
writeFileSync(process.argv[2], JSON.stringify(process.argv.slice(3)));
console.log(JSON.stringify({ type: "result", result: "ok" }));
`);

  const client = new ClaudeCliClient({ command: process.execPath, args: [scriptPath, argsPath] });
  await client.start();
  const session = await client.createSession({
    sessionId: "11111111-1111-4111-8111-111111111111",
    model: "opus",
    effort: "high",
    cwd: directory,
    settingSources: ["user", "project", "local"],
  });
  const completed = onceTurnCompleted(client);
  await client.sendMessage(session.id, { text: "hello", approvalPolicy: "on-request" });
  await completed;

  const args = JSON.parse(await readFile(argsPath, "utf8"));
  assert.deepEqual(args.slice(0, 2), ["-p", "hello"]);
  assertFlag(args, "--output-format", "stream-json");
  assertFlag(args, "--model", "opus");
  assertFlag(args, "--effort", "high");
  assertFlag(args, "--permission-mode", "manual");
  assertFlag(args, "--setting-sources", "user,project,local");
  assertFlag(args, "--session-id", session.id);
});

test("Claude CLI client isolates explicit empty setting sources with safe mode", async (context) => {
  const directory = await mkdtemp(join(tmpdir(), "relay-claude-cli-safe-"));
  context.after(() => rm(directory, { recursive: true, force: true }));
  const argsPath = join(directory, "args.json");
  const scriptPath = join(directory, "fake-claude.mjs");
  await writeFile(scriptPath, `
import { writeFileSync } from "node:fs";
writeFileSync(process.argv[2], JSON.stringify(process.argv.slice(3)));
console.log(JSON.stringify({ type: "result", result: "ok" }));
`);

  const client = new ClaudeCliClient({ command: process.execPath, args: [scriptPath, argsPath] });
  await client.start();
  const session = await client.createSession({
    sessionId: "22222222-2222-4222-8222-222222222222",
    cwd: directory,
    settingSources: [],
    systemPrompt: "Generate a title.",
  });
  const completed = onceTurnCompleted(client);
  await client.sendMessage(session.id, { text: "title", approvalPolicy: "never", sandbox: "read-only" });
  await completed;

  const args = JSON.parse(await readFile(argsPath, "utf8"));
  assert.equal(args.includes("--safe-mode"), true);
  assert.equal(args.includes("--setting-sources"), false);
  assertFlag(args, "--system-prompt", "Generate a title.");
  assertFlag(args, "--permission-mode", "plan");
});

test("Claude CLI inherits process env but ignores undocumented per-message env", async (context) => {
  const directory = await mkdtemp(join(tmpdir(), "relay-claude-cli-env-"));
  context.after(() => rm(directory, { recursive: true, force: true }));
  const previousInherited = process.env.RELAY_CLAUDE_CLI_INHERITED;
  const previousInjected = process.env.RELAY_CLAUDE_CLI_INJECTED;
  context.after(() => {
    restoreEnv("RELAY_CLAUDE_CLI_INHERITED", previousInherited);
    restoreEnv("RELAY_CLAUDE_CLI_INJECTED", previousInjected);
  });
  process.env.RELAY_CLAUDE_CLI_INHERITED = "from-parent-process";
  delete process.env.RELAY_CLAUDE_CLI_INJECTED;
  const envPath = join(directory, "env.json");
  const scriptPath = join(directory, "fake-claude.mjs");
  await writeFile(scriptPath, `
import { writeFileSync } from "node:fs";
writeFileSync(process.argv[2], JSON.stringify({
  inherited: process.env.RELAY_CLAUDE_CLI_INHERITED ?? null,
  injected: process.env.RELAY_CLAUDE_CLI_INJECTED ?? null,
}));
console.log(JSON.stringify({ type: "result", result: "ok" }));
`);

  const client = new ClaudeCliClient({ command: process.execPath, args: [scriptPath, envPath] });
  await client.start();
  const session = await client.createSession({
    sessionId: "33333333-3333-4333-8333-333333333333",
    cwd: directory,
  });
  const completed = onceTurnCompleted(client);
  await client.sendMessage(session.id, {
    text: "hello",
    env: {
      RELAY_CLAUDE_CLI_INHERITED: "from-message-env",
      RELAY_CLAUDE_CLI_INJECTED: "from-message-env",
    },
  });
  await completed;

  const env = JSON.parse(await readFile(envPath, "utf8"));
  assert.deepEqual(env, {
    inherited: "from-parent-process",
    injected: null,
  });
});

function onceTurnCompleted(client) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timed out waiting for turn completion")), 1_000);
    const onActivity = (message) => {
      if (message.method !== "turn/completed") return;
      clearTimeout(timer);
      client.off("activity", onActivity);
      resolve(message);
    };
    client.on("activity", onActivity);
  });
}

function assertFlag(args, flag, value) {
  const index = args.indexOf(flag);
  assert.notEqual(index, -1, `${flag} is present`);
  assert.equal(args[index + 1], value);
}

function restoreEnv(name, value) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}
