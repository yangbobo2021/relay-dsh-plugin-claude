import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const manifest = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
const lock = JSON.parse(await readFile(new URL('../package-lock.json', import.meta.url), 'utf8'))

test('Claude depends on and loads the neutral session import hub first', async () => {
  assert.equal(manifest.dependencies['relay-dsh-plugin-session-import'], manifest.version)
  assert.equal(lock.packages[''].dependencies['relay-dsh-plugin-session-import'], manifest.version)
  assert.match(lock.packages['node_modules/relay-dsh-plugin-session-import'].resolved, /#3e4f633c6845f6d91d8f04bd34719ba5c7ae4fe9$/)
  assert.ok(manifest.dsh.client.inject.includes('relay-dsh-plugin-session-import'))

  const patch = await readFile(new URL('../cordis.patch.yml', import.meta.url), 'utf8')
  assert.match(patch, /id: relay-session-import-for-claude\s+name: 'relay-dsh-plugin-session-import'/)
  assert.ok(patch.indexOf('relay-session-import-for-claude') < patch.indexOf('relay-claude-host'))
})

test('Claude contributes a provider instead of a standalone footer trigger', async () => {
  const source = await readFile(new URL('../src/client/index.ts', import.meta.url), 'utf8')
  assert.match(source, /ctx\.slots\.inject\('relay\.session-import\.provider'/)
  assert.doesNotMatch(source, /id: 'relay-claude-session-import'/)

  const css = await readFile(new URL('../src/client/ClaudeSessionImportAction.module.css', import.meta.url), 'utf8')
  assert.doesNotMatch(css, /\.trigger\s*\{/)
})

test('Claude anchors the DSH Session event module before augmenting it', async () => {
  const source = await readFile(new URL('../src/client/claude-activity.ts', import.meta.url), 'utf8')
  assert.match(source, /import type \{ SessionEventMap \} from '@deepseek-ai\/dsh-session\/types'/)
  assert.match(source, /type SessionEventContractAnchor = SessionEventMap/)
})
