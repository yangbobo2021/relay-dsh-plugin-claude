#!/usr/bin/env node

import { appendFile, readFile } from 'node:fs/promises'
import { McpServer } from '/Users/boboyang/work/Relay/node_modules/@modelcontextprotocol/sdk/dist/esm/server/mcp.js'
import { StdioServerTransport } from '/Users/boboyang/work/Relay/node_modules/@modelcontextprotocol/sdk/dist/esm/server/stdio.js'
import { z } from '/Users/boboyang/work/Relay/node_modules/zod/index.js'

const logPath = process.env.RELAY_CLD_EXT009_LOG
const imagePath = '/Users/boboyang/work/Relay/integrations/claude/validation/migration-compatibility/fixtures/image-input-workspace/ordered-second.png'

async function record(event, fields = {}) {
  if (!logPath) return
  await appendFile(logPath, `${JSON.stringify({ event, pid: process.pid, ...fields })}\n`, 'utf8')
}

const server = new McpServer({ name: 'relay-cld-result-types-fixture', version: '1.0.0' })

server.registerTool(
  'result_text',
  { description: 'Return one deterministic MCP text content block.' },
  async () => {
    await record('tool-call', { tool: 'result_text' })
    return { content: [{ type: 'text', text: 'CLD_EXT009_TEXT_0909' }] }
  },
)

server.registerTool(
  'result_json',
  {
    description: 'Return deterministic structured MCP JSON plus its canonical text mirror.',
    outputSchema: {
      kind: z.string(),
      value: z.number(),
      nested: z.object({ ok: z.boolean() }),
    },
  },
  async () => {
    await record('tool-call', { tool: 'result_json' })
    const structuredContent = { kind: 'CLD_EXT009_JSON_0909', value: 909, nested: { ok: true } }
    return {
      content: [{ type: 'text', text: JSON.stringify(structuredContent) }],
      structuredContent,
    }
  },
)

server.registerTool(
  'result_image',
  { description: 'Return one deterministic PNG MCP image content block for visual interpretation.' },
  async () => {
    await record('tool-call', { tool: 'result_image' })
    const data = (await readFile(imagePath)).toString('base64')
    return { content: [{ type: 'image', data, mimeType: 'image/png' }] }
  },
)

await record('process-start')
await server.connect(new StdioServerTransport())
await record('transport-connected')
