#!/usr/bin/env node

import { appendFile } from 'node:fs/promises'
import { McpServer } from '/Users/boboyang/work/Relay/node_modules/@modelcontextprotocol/sdk/dist/esm/server/mcp.js'
import { StdioServerTransport } from '/Users/boboyang/work/Relay/node_modules/@modelcontextprotocol/sdk/dist/esm/server/stdio.js'
import { z } from '/Users/boboyang/work/Relay/node_modules/zod/index.js'

const logPath = process.env.RELAY_CLD_EXT007_LOG

async function record(event, fields = {}) {
  if (!logPath) return
  await appendFile(logPath, `${JSON.stringify({ event, pid: process.pid, ...fields })}\n`, 'utf8')
}

const server = new McpServer({ name: 'relay-cld-project-stdio-fixture', version: '1.0.0' })

server.registerTool(
  'echo_project_scope',
  {
    description: 'Return the exact sanitized value with a project-stdio provenance prefix.',
    inputSchema: { value: z.string() },
  },
  async ({ value }) => {
    await record('tool-call', { tool: 'echo_project_scope', value })
    return { content: [{ type: 'text', text: `CLD_EXT007_PROJECT_STDIO_OUTPUT_0707:${value}` }] }
  },
)

await record('process-start')
await server.connect(new StdioServerTransport())
await record('transport-connected')
