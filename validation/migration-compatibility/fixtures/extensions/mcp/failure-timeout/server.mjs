#!/usr/bin/env node

import { appendFile } from 'node:fs/promises'
import { McpServer } from '/Users/boboyang/work/Relay/node_modules/@modelcontextprotocol/sdk/dist/esm/server/mcp.js'
import { StdioServerTransport } from '/Users/boboyang/work/Relay/node_modules/@modelcontextprotocol/sdk/dist/esm/server/stdio.js'

const logPath = process.env.RELAY_CLD_EXT010_LOG

async function record(event, fields = {}) {
  if (!logPath) return
  await appendFile(logPath, `${JSON.stringify({ event, at: Date.now(), pid: process.pid, ...fields })}\n`, 'utf8')
}

const server = new McpServer({ name: 'relay-cld-failure-timeout-fixture', version: '1.0.0' })

server.registerTool(
  'explicit_failure',
  { description: 'Return one deterministic explicit MCP error result.' },
  async () => {
    await record('tool-call', { tool: 'explicit_failure' })
    return { isError: true, content: [{ type: 'text', text: 'CLD_EXT010_EXPLICIT_ERROR_1010' }] }
  },
)

server.registerTool(
  'slow_timeout',
  { description: 'Wait eight seconds so a configured 1500ms MCP timeout can be observed.' },
  async () => {
    await record('tool-call-start', { tool: 'slow_timeout' })
    await new Promise(resolve => setTimeout(resolve, 8000))
    await record('tool-call-late-finish', { tool: 'slow_timeout' })
    return { content: [{ type: 'text', text: 'CLD_EXT010_FORBIDDEN_LATE_RESULT_1010' }] }
  },
)

await record('process-start')
await server.connect(new StdioServerTransport())
await record('transport-connected')
