import { EventEmitter } from "node:events";
import { ClaudeDshAdapter } from "../../../../claude-adapter.js";

class Runtime extends EventEmitter {
  constructor() { super(); this.models = [{ id: "sonnet", isDefault: true, defaultReasoningEffort: "medium", supportedReasoningEfforts: [{ reasoningEffort: "low" }, { reasoningEffort: "high" }] }]; }
  snapshot() { return { models: this.models }; }
  async createSession(config) { this.createdConfig = structuredClone(config); return { id: "claude-cfg006" }; }
  async sendMessage(sessionId, message) {
    const { executeDshTool, ...serializable } = message;
    this.sent = { sessionId, message: structuredClone(serializable), executeDshToolType: typeof executeDshTool };
    queueMicrotask(() => {
      this.emit("activity", { method: "item/agentMessage/delta", params: { sessionId, turnId: "turn-cfg006", itemId: "answer", delta: "ADAPTER_CFG006_OK" } });
      this.emit("activity", { method: "turn/completed", params: { sessionId, turn: { id: "turn-cfg006", status: "completed", error: null, items: [] } } });
    });
    return { id: "turn-cfg006", status: "inProgress", items: [] };
  }
}
const runtime = new Runtime();
const adapter = new ClaudeDshAdapter({ runtime, ready: Promise.resolve() });
const agent = { id: "dsh-cfg006", ctx: {}, session: { header: { agentPreset: "relay-claude", cwd: "/fixture/dsh-owned-cwd-6006" }, events: [
  { type: "sandbox/mode", data: { mode: "read-only" } },
  { type: "approval/policy", data: { policy: "never" } },
], append() {} } };
adapter.attachAgent(agent);
const chunks = [];
for await (const chunk of adapter.stream({ provider: "relay-claude", model: "sonnet", reasoningEffort: "high", sessionId: agent.id, messages: [{ role: "user", source: { kind: "user" }, content: [{ type: "text", text: "adapter collision probe" }] }] })) chunks.push(chunk);
console.log(JSON.stringify({ createdConfig: runtime.createdConfig, sent: runtime.sent, chunks }, null, 2));
