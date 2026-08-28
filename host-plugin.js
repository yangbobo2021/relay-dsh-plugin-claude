import { fileURLToPath } from "node:url";
import { PluginHost } from "./internal/plugin-sdk.mjs";
import { createClaudeExecutionPlugin } from "./plugin.mjs";
import { createDshClaudePlugin } from "./dsh-plugin.js";
import { installManagedPreset } from "./preset.js";
export { installClaudeSessionEventType } from "./dsh-plugin.js";

export const name = "relay-dsh-plugin-claude";
export const inject = [
  "agents",
  "approval",
  "attachments",
  "llm",
  "sessions",
  "sessionPersistence",
  "tools",
  "typert",
  "userQuestions",
  "webServer",
];

export async function apply(ctx, config = {}) {
  const host = new PluginHost();
  const release = ctx.effect(() => () => host.dispose(), "relay.claude()");
  try {
    await installManagedPreset(fileURLToPath(new URL("../presets/relay-claude", import.meta.url)), "relay-claude");
    await host.activate([
      createClaudeExecutionPlugin({
        client: config.claude?.client, backend: config.claudeBackend, command: config.claudeCommand,
        args: config.claudeArgs, codeExecutablePath: config.claudeCodeExecutablePath,
        requestTimeoutMs: config.claudeRequestTimeoutMs, cwd: config.cwd,
      }),
      createDshClaudePlugin(ctx, config),
    ]);
  } catch (error) { await release(); throw error; }
}
