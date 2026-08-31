import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { ClaudeDshAdapter } from "../../../../claude-adapter.js";
import { ClaudeLinkStore } from "../../../../claude-link-store.js";

const sourceSessionId = "fc77673d-d4ec-415c-8631-3bce5da7ef7a";
const nativePath = `/Users/boboyang/.claude/projects/-Users-boboyang-work-Relay-integrations-claude-validation-migration-compatibility-fixtures-tool-workspace/${sourceSessionId}.jsonl`;
const linkPath = "/private/tmp/relay-cld-live002.p2EkK4/claude-links.json";
const adapterPath = new URL("../../../../claude-adapter.js", import.meta.url).pathname;
const pluginPath = new URL("../../../../dsh-plugin.js", import.meta.url).pathname;
const executionPath = new URL("../../../../plugin.mjs", import.meta.url).pathname;
const linkSourcePath = new URL("../../../../claude-link-store.js", import.meta.url).pathname;
const [native, linksBytes, adapterSource, pluginSource, executionSource, linkSource] = await Promise.all([readFile(nativePath), readFile(linkPath), readFile(adapterPath), readFile(pluginPath), readFile(executionPath), readFile(linkSourcePath)]);
const links = JSON.parse(linksBytes);
const mappings = Object.entries(links.sessions).filter(([, record]) => record.claudeSessionId === sourceSessionId);
const adapterMethods = Object.getOwnPropertyNames(ClaudeDshAdapter.prototype);
const linkStoreMethods = Object.getOwnPropertyNames(ClaudeLinkStore.prototype);
const sha = value => createHash("sha256").update(value).digest("hex");
console.log(JSON.stringify({
  sourceNative: { sessionId: sourceSessionId, exists: Boolean(await stat(nativePath)), bytes: native.length, sha256: sha(native), liveMappingCount: mappings.length },
  uiObservation: { newSessionIdTextboxCount: 0, importOrResumeButtonCount: 0 },
  api: {
    adapterMethods,
    linkStoreMethods,
    hasPublicImportOrBindMethod: [...adapterMethods, ...linkStoreMethods].some(name => /import|bind/i.test(name)),
    dshCapabilityOnlyProvider: /capabilities:\s*\{\s*"relay\.dsh\.claude\.v1":\s*Object\.freeze\(\{\s*provider:\s*CLAUDE_PROVIDER\s*\}\)/s.test(pluginSource),
    backendExecutionExposesResumeSession: /resumeSession:\s*runtime\.resumeSession\.bind\(runtime\)/.test(executionSource),
    adapterResumeRequiresExistingLink: /const linked = this\.links\.get\(sessionId\)/.test(adapterSource) && /if \(linked\)/.test(adapterSource),
    unlinkedPathCreatesNewSession: /const created = await this\.runtime\.createSession\(settings\)/.test(adapterSource),
    manualLinkStoreSetExistsButIsNotProductImport: linkStoreMethods.includes("set")
  },
  hashes: { liveLinkSha256: sha(linksBytes), adapterSha256: sha(adapterSource), dshPluginSha256: sha(pluginSource), executionPluginSha256: sha(executionSource), linkStoreSha256: sha(linkSource) },
  supportStatus: "unsupported-explicit-gap"
}, null, 2));
