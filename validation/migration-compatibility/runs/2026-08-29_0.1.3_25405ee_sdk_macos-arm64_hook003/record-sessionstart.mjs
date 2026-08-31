import { appendFile } from "node:fs/promises";

let raw = "";
for await (const chunk of process.stdin) raw += chunk;
const input = JSON.parse(raw);
await appendFile(
  "/private/tmp/relay-cld-hook003.jsonl",
  JSON.stringify({
    at: Date.now(),
    hookEventName: input.hook_event_name,
    source: input.source,
    sessionId: input.session_id,
    cwd: input.cwd
  }) + "\n"
);
