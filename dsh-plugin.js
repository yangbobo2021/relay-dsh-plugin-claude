import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { KNOWN_SESSION_EVENT_TYPES } from "@deepseek-ai/dsh-session";
import { definePlugin } from "./internal/plugin-sdk.mjs";
import { ClaudeDshAdapter, CLAUDE_ACTIVITY_EVENT, CLAUDE_PROVIDER } from "./claude-adapter.js";
import { ClaudeLinkStore } from "./claude-link-store.js";
import { handleClaudeSdkRequest } from "./claude-tools.js";

export function createDshClaudePlugin(ctx, config = {}) {
  return definePlugin({
    manifest: {
      id: "relay.dsh.claude", version: "1.0.0", provides: { "relay.dsh.claude.v1": "1.0.0" },
      requires: { "relay.execution.claude.v1": "^1.0.0" }, permissions: ["dsh:llm", "dsh:agents"],
    },
    async activate({ capabilities, defer }) {
      installClaudeSessionEventType();
      const runtime = capabilities.require("relay.execution.claude.v1");
      const adapter = new ClaudeDshAdapter({
        runtime, ready: runtime.whenReady(),
        linkStore: new ClaudeLinkStore(resolveLinkPath(config.claudeLinkPath)),
        attachments: ctx.attachments, logger: ctx.logger,
      });
      defer(ctx.llm.registerAdapter([CLAUDE_PROVIDER], adapter));
      defer(runtime.subscribeRequest(request => {
        void handleClaudeSdkRequest(ctx, { adapter, runtime, request })
          .catch(error => ctx.logger.error(`Relay failed to handle a Claude interaction: ${error?.stack ?? error}`));
      }));
      defer(ctx.on("llm/stream", (options, next) => {
        if (options.purpose || !options.sessionId) return next();
        const agent = ctx.agents.get(options.sessionId);
        return agent && adapter.servesAgent(agent) ? adapter.stream(options) : next();
      }, { global: true, prepend: true }));
      defer(ctx.on("agent/created", ({ agent }) => { adapter.attachAgent(agent); }));
      defer(ctx.on("agent-preset/selected", (sessionId, preset) => {
        const agent = ctx.agents.get(sessionId); if (agent) adapter.attachAgent(agent, preset);
      }, { global: true }));
      defer(ctx.on("agent/disposed", ({ agent }) => { adapter.detachAgent(agent.id); }));
      for (const agent of ctx.agents.list()) adapter.attachAgent(agent);
      return { capabilities: { "relay.dsh.claude.v1": Object.freeze({ provider: CLAUDE_PROVIDER }) } };
    },
  });
}

export function installClaudeSessionEventType() {
  if (KNOWN_SESSION_EVENT_TYPES.has(CLAUDE_ACTIVITY_EVENT)) return;
  if (typeof KNOWN_SESSION_EVENT_TYPES.add !== "function") throw new Error("This DSH build cannot register Relay Claude session events");
  KNOWN_SESSION_EVENT_TYPES.add(CLAUDE_ACTIVITY_EVENT);
}

function resolveLinkPath(value) {
  const configured = value ?? process.env.RELAY_CLAUDE_LINK_PATH;
  return configured ? resolve(configured) : join(homedir(), ".relay", "claude-dsh-links.json");
}
