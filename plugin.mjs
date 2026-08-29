import { definePlugin } from "./internal/plugin-sdk.mjs";
import { ClaudeCliClient } from "./cli-client.mjs";
import { ClaudeSdkClient } from "./sdk-client.mjs";
import { ClaudeSessionRuntime } from "./session-runtime.mjs";

export const CLAUDE_EXECUTION_CAPABILITY = "relay.execution.claude.v1";

export function createClaudeExecutionPlugin(config = {}) {
  return definePlugin({
    manifest: {
      id: "relay.execution.claude",
      version: "1.0.0",
      provides: { [CLAUDE_EXECUTION_CAPABILITY]: "1.0.0" },
      optional: { "relay.logging.v1": "^1.0.0" },
      permissions: ["process:claude", "filesystem:workspace"],
    },
    activate({ capabilities, defer }) {
      const logger = capabilities.optional("relay.logging.v1") ?? console;
      const client = config.client ?? createClaudeClient(config);
      const runtime = new ClaudeSessionRuntime({
        client,
        cwd: config.cwd ?? process.cwd(),
        plugins: config.plugins,
      });
      defer(() => runtime.close());
      const ready = runtime.initialize();
      void ready.catch((error) => {
        logger.error?.(`Relay Claude backend failed to initialize: ${error?.stack ?? error}`);
      });
      return {
        capabilities: { [CLAUDE_EXECUTION_CAPABILITY]: executionCapability(runtime, ready) },
      };
    },
  });
}

function executionCapability(runtime, ready) {
  return Object.freeze({
    whenReady: () => ready,
    listModels: () => structuredClone(runtime.models),
    hasSession: (sessionId) => runtime.sessions.has(sessionId),
    getSession: runtime.getSession.bind(runtime),
    patchSession(sessionId, patch) {
      const session = runtime.sessions.get(sessionId);
      if (session) Object.assign(session, structuredClone(patch));
      return Boolean(session);
    },
    createSession: runtime.createSession.bind(runtime),
    resumeSession: runtime.resumeSession.bind(runtime),
    sendMessage: runtime.sendMessage.bind(runtime),
    interruptTurn: runtime.interruptTurn.bind(runtime),
    releaseSession: runtime.releaseSession.bind(runtime),
    resolveRequest: runtime.resolveRequest.bind(runtime),
    rejectRequest: runtime.rejectRequest.bind(runtime),
    subscribeActivity: (listener) => subscribe(runtime, "activity", listener),
    subscribeRequest: (listener) => subscribe(runtime, "request", listener),
  });
}

function createClaudeClient(config) {
  const backend = config.backend ?? "auto";
  if (backend === "cli") return createClaudeCliClient(config);
  const sdkClient = new ClaudeSdkClient({
    pathToClaudeCodeExecutable: config.codeExecutablePath,
    requestTimeoutMs: positiveInteger(config.requestTimeoutMs, 30 * 60_000),
  });
  if (backend === "sdk") return sdkClient;
  return new FallbackClaudeClient({ primary: sdkClient, fallback: createClaudeCliClient(config) });
}

function createClaudeCliClient(config) {
  return new ClaudeCliClient({
    command: config.command ?? "claude",
    args: config.args ?? [],
    requestTimeoutMs: positiveInteger(config.requestTimeoutMs, 30 * 60_000),
  });
}

class FallbackClaudeClient extends ClaudeCliClient {
  constructor({ primary, fallback }) {
    super();
    this.primary = primary;
    this.fallback = fallback;
    this.active = primary;
    for (const event of ["activity", "request", "diagnostic", "exit"]) {
      primary.on(event, (...args) => this.emit(event, ...args));
      fallback.on(event, (...args) => this.emit(event, ...args));
    }
  }

  async start() {
    try {
      await this.primary.start();
      this.active = this.primary;
    } catch (error) {
      this.emit("diagnostic", `Claude Agent SDK unavailable; falling back to CLI: ${error.message}`);
      await this.fallback.start();
      this.active = this.fallback;
    }
  }

  listModels(...args) { return this.active.listModels(...args); }
  createSession(...args) { return this.active.createSession(...args); }
  resumeSession(...args) { return this.active.resumeSession(...args); }
  sendMessage(...args) { return this.active.sendMessage(...args); }
  interruptTurn(...args) { return this.active.interruptTurn(...args); }
  releaseSession(...args) { return this.active.releaseSession(...args); }
  resolveRequest(...args) { return this.active.resolveRequest?.(...args); }
  rejectRequest(...args) { return this.active.rejectRequest?.(...args); }
  close(...args) { return this.active.close(...args); }
}

function subscribe(emitter, event, listener) {
  emitter.on(event, listener);
  let active = true;
  return () => {
    if (!active) return;
    active = false;
    emitter.off(event, listener);
  };
}

function positiveInteger(value, fallback) {
  return Number.isSafeInteger(value) && value > 0 ? value : fallback;
}
