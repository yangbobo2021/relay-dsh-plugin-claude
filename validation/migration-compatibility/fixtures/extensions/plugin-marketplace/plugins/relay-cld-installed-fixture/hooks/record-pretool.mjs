#!/usr/bin/env node

import { appendFile } from 'node:fs/promises'

let raw = ''
for await (const chunk of process.stdin) raw += chunk
const input = JSON.parse(raw)
const record = {
  event: 'plugin-hook-observed',
  at: Date.now(),
  pid: process.pid,
  hookEventName: input.hook_event_name,
  toolName: input.tool_name,
  toolInput: input.tool_input,
  sessionId: input.session_id,
  cwd: input.cwd,
}
await appendFile('/private/tmp/relay-cld-ext016-plugin-hook-log.jsonl', `${JSON.stringify(record)}\n`, 'utf8')
