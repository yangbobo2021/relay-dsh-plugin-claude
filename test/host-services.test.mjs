import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { Context } from "@deepseek-ai/cordis";

import { handleClaudeSdkRequest } from "../claude-tools.js";
import { inject } from "../host-plugin.js";

const INTERACTION_SERVICES = ["approval", "userQuestions"];

test("the Host plugin declares the DSH attachment service used for image input", () => {
  assert.ok(inject.includes("attachments"));
});

test("the Host plugin declares every DSH interaction service it consumes", () => {
  for (const service of INTERACTION_SERVICES) {
    assert.ok(inject.includes(service), `missing required Host injection: ${service}`);
  }
});

test("the interaction bridge specification names its required services and fail-closed behavior", async () => {
  const specification = await readFile(
    new URL("../docs/spec/dsh-interaction-bridge.md", import.meta.url),
    "utf8",
  );
  for (const service of INTERACTION_SERVICES) {
    assert.match(specification, new RegExp(`\\b${service}\\b`));
  }
  assert.match(specification, /required Host injections/);
  assert.match(specification, /must not bypass DSH approval or\s+question handling/);
});

test("Claude interaction requests resolve through sibling DSH service providers", async (context) => {
  const agent = { id: "dsh-1" };
  const calls = { approvals: [], questions: [] };
  const services = {
    agents: { get: id => id === agent.id ? agent : null },
    llm: {},
    sessions: {},
    sessionPersistence: {},
    tools: {},
    typert: {},
    webServer: {},
    approval: {
      async request(input) {
        calls.approvals.push(input);
        return "allowed-once";
      },
    },
    attachments: {},
    userQuestions: {
      async ask(input) {
        calls.questions.push(input);
        return { answers: [{ id: "question-1", selected: ["Detailed"] }] };
      },
    },
  };
  const { consumer, dispose } = await composeHostContext(services);
  context.after(dispose);
  const runtime = new InteractionRuntime();
  const adapter = { dshSessionForClaudeSession: id => id === "claude-1" ? agent.id : null };

  await handleClaudeSdkRequest(consumer, {
    adapter,
    runtime,
    request: {
      id: "approval-1",
      method: "tool/requestApproval",
      params: {
        sessionId: "claude-1",
        toolName: "Write",
        input: { file_path: "probe.txt" },
      },
    },
  });
  await handleClaudeSdkRequest(consumer, {
    adapter,
    runtime,
    request: {
      id: "question-1",
      method: "tool/requestUserInput",
      params: {
        sessionId: "claude-1",
        input: {
          questions: [{
            question: "How detailed?",
            header: "Detail",
            options: [{ label: "Brief" }, { label: "Detailed" }],
          }],
        },
      },
    },
  });

  assert.equal(runtime.rejected.length, 0);
  assert.equal(calls.approvals.length, 1);
  assert.equal(calls.questions.length, 1);
  assert.deepEqual(runtime.resolved, [
    {
      id: "approval-1",
      response: {
        action: "accept",
        updatedInput: { file_path: "probe.txt" },
        message: "DSH approval returned allowed-once.",
      },
    },
    {
      id: "question-1",
      response: { action: "answer", answers: { "How detailed?": "Detailed" } },
    },
  ]);
});

async function composeHostContext(services) {
  const root = new Context();
  const fibers = [];
  for (const [name, value] of Object.entries(services)) {
    fibers.push(await root.plugin({
      name: `provider:${name}`,
      apply(ctx) { ctx.provide(name, value); },
    }));
  }
  let consumer;
  fibers.push(await root.plugin({
    name: "relay-dsh-plugin-claude",
    inject,
    apply(ctx) { consumer = ctx; },
  }));
  return {
    consumer,
    async dispose() {
      for (const fiber of fibers.reverse()) await fiber.dispose();
    },
  };
}

class InteractionRuntime {
  constructor() {
    this.resolved = [];
    this.rejected = [];
  }

  async resolveRequest(id, response) {
    this.resolved.push({ id, response });
  }

  rejectRequest(id, error) {
    this.rejected.push({ id, error });
  }
}
