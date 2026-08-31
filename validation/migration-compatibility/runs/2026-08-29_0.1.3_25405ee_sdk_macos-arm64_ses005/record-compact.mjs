import { appendFile } from "node:fs/promises";

let raw = "";
for await (const chunk of process.stdin) raw += chunk;
const input = JSON.parse(raw);
await appendFile("/private/tmp/relay-cld-ses005-compact.jsonl", JSON.stringify({ at: Date.now(), hookEventName: input.hook_event_name, trigger: input.trigger, customInstructions: input.custom_instructions ?? null, compactSummary: input.compact_summary ?? null, sessionId: input.session_id, cwd: input.cwd }) + "\n");
