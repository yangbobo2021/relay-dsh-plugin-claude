#!/usr/bin/env node

import { appendFile } from 'node:fs/promises'
import { McpServer } from '/Users/boboyang/work/Relay/node_modules/@modelcontextprotocol/sdk/dist/esm/server/mcp.js'
import { StreamableHTTPServerTransport } from '/Users/boboyang/work/Relay/node_modules/@modelcontextprotocol/sdk/dist/esm/server/streamableHttp.js'
import { createMcpExpressApp } from '/Users/boboyang/work/Relay/node_modules/@modelcontextprotocol/sdk/dist/esm/server/express.js'
import { z } from '/Users/boboyang/work/Relay/node_modules/zod/index.js'

const port = Number(process.env.RELAY_CLD_EXT008_PORT)
const logPath = process.env.RELAY_CLD_EXT008_LOG

if (!Number.isInteger(port) || port < 1024 || port > 65535 || !logPath) {
  throw new Error('RELAY_CLD_EXT008_PORT and RELAY_CLD_EXT008_LOG are required')
}

async function record(event, fields = {}) {
  await appendFile(logPath, `${JSON.stringify({ event, pid: process.pid, ...fields })}\n`, 'utf8')
}

function createFixtureServer() {
  const server = new McpServer({ name: 'relay-cld-http-fixture', version: '1.0.0' })
  server.registerTool(
    'echo_http_transport',
    {
      description: 'Return the exact sanitized value with an HTTP MCP provenance prefix.',
      inputSchema: { value: z.string() },
    },
    async ({ value }) => {
      await record('tool-call', { tool: 'echo_http_transport', value })
      return { content: [{ type: 'text', text: `CLD_EXT008_HTTP_OUTPUT_0808:${value}` }] }
    },
  )
  return server
}

const app = createMcpExpressApp()

app.post('/mcp', async (request, response) => {
  await record('http-request', {
    method: request.body?.method ?? null,
    hasSessionHeader: Boolean(request.headers['mcp-session-id']),
  })
  const server = createFixtureServer()
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  })
  try {
    await server.connect(transport)
    await transport.handleRequest(request, response, request.body)
  } catch (error) {
    await record('http-error', { message: error instanceof Error ? error.message : String(error) })
    if (!response.headersSent) response.status(500).json({ error: 'fixture transport failure' })
  } finally {
    await transport.close().catch(() => {})
    await server.close().catch(() => {})
  }
})

app.get('/health', (_request, response) => response.json({ status: 'ok' }))

const httpServer = app.listen(port, '127.0.0.1', async () => {
  await record('listen', { host: '127.0.0.1', port })
  process.stdout.write(`CLD_EXT008_HTTP_READY:${port}\n`)
})

async function shutdown(signal) {
  await record('shutdown', { signal })
  httpServer.close(() => process.exit(0))
}

process.once('SIGINT', () => void shutdown('SIGINT'))
process.once('SIGTERM', () => void shutdown('SIGTERM'))
