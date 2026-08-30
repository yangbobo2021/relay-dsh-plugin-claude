import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const [specification, english, chinese, manifestText, clientSource] = await Promise.all([
  readFile(new URL("docs/spec/claude-native-session-import.md", root), "utf8"),
  readFile(new URL("README.md", root), "utf8"),
  readFile(new URL("README.zh.md", root), "utf8"),
  readFile(new URL("package.json", root), "utf8"),
  readFile(new URL("src/client/index.ts", root), "utf8"),
]);
const manifest = JSON.parse(manifestText);
const normalized = specification.replace(/\s+/g, " ");

test("native Claude Session import specification locks the public SDK and fail-closed boundaries", () => {
  for (const api of ["listSessions", "getSessionInfo", "getSessionMessages"]) {
    assert.match(specification, new RegExp(`\\b${api}\\b`));
  }
  assert.match(normalized, /must not parse Claude's private JSONL storage/);
  assert.match(normalized, /`includeWorktrees: false`, and `includeProgrammatic: false`/);
  assert.match(normalized, /must not label a candidate as completed/);
  assert.match(normalized, /keeps the binding, and creates no replacement Session/);
  assert.match(normalized, /one-time DSH presentation snapshot/);
});

test("bilingual setup, package contents, and client injection expose the same import feature", () => {
  assert.match(english, /compact Claude import icon/);
  assert.match(english, /Target Workspace/);
  assert.match(english, /Scan Sessions/);
  assert.match(english, /same native Claude\s+Session/);
  assert.match(chinese, /紧凑 Claude 导入图标/);
  assert.match(chinese, /目标 Workspace/);
  assert.match(chinese, /扫描会话/);
  assert.match(chinese, /同一个原生 Claude Session/);
  assert.match(normalized, /34 by 34 pixels/);
  assert.match(normalized, /28 by 28 pixels/);
  assert.ok(manifest.files.includes("docs/spec/claude-native-session-import.md"));
  assert.ok(manifest.dsh.client.inject.includes("@deepseek-ai/dsh-client-ui-sidebar"));
  assert.match(clientSource, /sidebar\.footer\.action/);
  assert.match(clientSource, /sessionIds/);
});
