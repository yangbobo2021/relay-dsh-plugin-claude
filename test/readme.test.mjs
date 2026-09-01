import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const root = new URL('../', import.meta.url)
const [english, chinese, screenshot, preset, manifestText] = await Promise.all([
  readFile(new URL('README.md', root), 'utf8'),
  readFile(new URL('README.zh.md', root), 'utf8'),
  readFile(new URL('docs/images/dsh-new-session-backends.jpg', root)),
  readFile(new URL('presets/relay-claude/preset.yml', root), 'utf8'),
  readFile(new URL('package.json', root), 'utf8'),
])
const manifest = JSON.parse(manifestText)

test('English and Chinese READMEs form a complete newcomer path', () => {
  for (const readme of [english, chinese]) {
    assert.match(readme, /github:yangbobo2021\/relay-dsh-plugin-claude/)
    assert.match(readme, /relay-dsh-plugin-claude/)
    assert.match(readme, /0\.1\.1-rc\.2/)
    assert.match(readme, /b150a551/)
    assert.match(readme, /docs\/images\/dsh-new-session-backends\.jpg/)
    assert.match(readme, /Add workspace/)
    assert.match(readme, /New Session/)
    assert.match(readme, /Standard mode/)
    assert.match(readme, /https:\/\/github\.com\/yangbobo2021\/Relay/)
    assert.doesNotMatch(readme, /dsh-plugin-suite-demo\.(?:gif|mp4)/)
  }
  assert.match(english, /English \| \[中文\]\(README\.zh\.md\)/)
  assert.match(chinese, /\[English\]\(README\.md\) \| 中文/)
  assert.match(english, /There is no separate activation command/)
  assert.match(chinese, /不需要单独的激活命令/)
  assert.match(english, /code\.claude\.com\/docs\/en\/setup/)
  assert.match(chinese, /code\.claude\.com\/docs\/en\/setup/)
})

test('README screenshot and bilingual preset ship with the package', () => {
  assert.deepEqual([...screenshot.subarray(0, 3)], [0xff, 0xd8, 0xff])
  assert.ok(screenshot.length > 10_000)
  assert.match(preset, /Run and resume a Claude Code session in DSH\./)
  assert.match(preset, /在 DSH 中运行并继续 Claude Code session。/)
  assert.ok(manifest.files.includes('README.zh.md'))
  assert.ok(manifest.files.includes('docs/images'))
})

test('README preserves standalone scope and every supported installation source', () => {
  assert.match(english, /independently installable/i)
  assert.match(english, /only Relay package dependency is\s+the provider-neutral session import hub/i)
  assert.match(english, /no runtime dependency on the Relay application, Relay\s+Events, or another feature plugin/i)
  const stableVersion = manifest.version.split('-')[0]
  const versionTag = new RegExp(
    `github:yangbobo2021/relay-dsh-plugin-claude#v${stableVersion.replaceAll('.', '\\.')}`,
  )
  for (const readme of [english, chinese]) {
    assert.match(readme, /https:\/\/www\.npmjs\.com\/package\/relay-dsh-plugin-claude/)
    assert.match(readme, /relay-dsh-plugin-claude@latest/)
    assert.match(readme, /relay-dsh-plugin-claude@next/)
    assert.match(readme, /github:yangbobo2021\/relay-dsh-plugin-claude#main/)
    assert.match(readme, versionTag)
  }
  assert.match(english, /DSH is currently a developer preview/)
})
