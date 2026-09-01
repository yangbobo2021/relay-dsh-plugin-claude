import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import { EventEmitter } from "node:events";
import readline from "node:readline";
import { z } from "zod";
import { homedir } from "node:os";
import { basename, dirname, extname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { KNOWN_SESSION_EVENT_TYPES, SessionId } from "@deepseek-ai/dsh-session";
import * as llm from "@deepseek-ai/dsh-llm";
import { LlmAdapter, MessageId, freezeMessage } from "@deepseek-ai/dsh-llm";
import { cp, mkdir, open, realpath, stat } from "node:fs/promises";
import sharp from "sharp";
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
//#region internal/plugin-sdk.mjs
const SEMVER_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const PLUGIN_ID_PATTERN = /^[a-z0-9](?:[a-z0-9._-]*[a-z0-9])?$/;
const CAPABILITY_ID_PATTERN = /^[a-z0-9](?:[a-z0-9._-]*[a-z0-9])?$/;
var CapabilityRegistry = class {
	#entries = /* @__PURE__ */ new Map();
	register(name, version, value, providerId) {
		assertCapabilityName(name);
		assertSemanticVersion(version, `capability ${name}`);
		if (this.#entries.has(name)) throw new Error(`capability ${name} is already available`);
		this.#entries.set(name, Object.freeze({
			name,
			version,
			value,
			providerId
		}));
	}
	unregisterProvider(providerId) {
		for (const [name, entry] of this.#entries) if (entry.providerId === providerId) this.#entries.delete(name);
	}
	require(name, range = "*") {
		const entry = this.#entries.get(name);
		if (!entry) throw new Error(`capability ${name} is not available`);
		if (!satisfiesVersion(entry.version, range)) throw new Error(`capability ${name} ${entry.version} does not satisfy ${range}`);
		return entry.value;
	}
	optional(name, range = "*") {
		if (!this.#entries.has(name)) return void 0;
		return this.require(name, range);
	}
};
var PluginHost = class {
	constructor() {
		this.capabilities = new CapabilityRegistry();
		this.active = [];
		this.disposed = false;
	}
	async activate(definitions) {
		if (this.active.length > 0) throw new Error("plugin host is already active");
		if (this.disposed) throw new Error("plugin host is disposed");
		const ordered = resolveActivationOrder(definitions);
		let current = null;
		try {
			for (const definition of ordered) {
				const access = createCapabilityAccess(definition.manifest, this.capabilities);
				const cleanups = [];
				let acceptingCleanups = true;
				const defer = (cleanup) => {
					assert.equal(typeof cleanup, "function", `plugin ${definition.manifest.id} cleanup must be a function`);
					assert.ok(acceptingCleanups, `plugin ${definition.manifest.id} cannot defer cleanup after activation`);
					cleanups.push(cleanup);
					return cleanup;
				};
				current = {
					id: definition.manifest.id,
					cleanups
				};
				let activation;
				try {
					activation = await definition.activate(Object.freeze({
						plugin: definition.manifest,
						capabilities: access,
						defer
					})) ?? {};
				} finally {
					acceptingCleanups = false;
				}
				if (typeof activation.dispose === "function") cleanups.push(activation.dispose);
				const provided = activation.capabilities ?? {};
				validateProvidedCapabilities(definition.manifest, provided);
				for (const [name, version] of Object.entries(definition.manifest.provides)) this.capabilities.register(name, version, provided[name], definition.manifest.id);
				this.active.push(current);
				current = null;
			}
		} catch (error) {
			const rollbackErrors = [];
			if (current) {
				this.capabilities.unregisterProvider(current.id);
				rollbackErrors.push(...await disposeCleanups(current.cleanups));
			}
			rollbackErrors.push(...await this.#drainActive());
			if (rollbackErrors.length > 0) throw new AggregateError([error, ...rollbackErrors], `plugin activation failed: ${error?.message ?? error}; rollback also failed`, { cause: error });
			throw error;
		}
		return this;
	}
	async dispose() {
		if (this.disposed) return;
		this.disposed = true;
		await this.#disposeActive();
	}
	async #disposeActive() {
		const errors = await this.#drainActive();
		if (errors.length === 1) throw errors[0];
		if (errors.length > 1) throw new AggregateError(errors, "multiple plugin cleanup operations failed");
	}
	async #drainActive() {
		const errors = [];
		while (this.active.length > 0) {
			const plugin = this.active.pop();
			try {
				errors.push(...await disposeCleanups(plugin.cleanups));
			} finally {
				this.capabilities.unregisterProvider(plugin.id);
			}
		}
		return errors;
	}
};
async function disposeCleanups(cleanups) {
	const errors = [];
	for (const cleanup of cleanups.reverse()) try {
		await cleanup();
	} catch (error) {
		errors.push(error);
	}
	return errors;
}
function definePlugin(definition) {
	assert.equal(typeof definition?.activate, "function", "plugin activate must be a function");
	const manifest = validateManifest(definition.manifest);
	return Object.freeze({
		manifest,
		activate: definition.activate
	});
}
function validateManifest(input) {
	assert.ok(input && typeof input === "object" && !Array.isArray(input), "plugin manifest is required");
	assert.match(input.id ?? "", PLUGIN_ID_PATTERN, "plugin id must be lowercase and stable");
	assertSemanticVersion(input.version, `plugin ${input.id}`);
	const provides = validateCapabilityMap(input.provides, "provides", { ranges: false });
	const requires = validateCapabilityMap(input.requires, "requires", { ranges: true });
	const optional = validateCapabilityMap(input.optional, "optional", { ranges: true });
	for (const name of Object.keys(requires)) assert.ok(!(name in optional), `capability ${name} cannot be both required and optional`);
	const permissions = input.permissions ?? [];
	assert.ok(Array.isArray(permissions), "plugin permissions must be an array");
	assert.ok(permissions.every((permission) => typeof permission === "string" && permission.length > 0), "plugin permissions must contain non-empty strings");
	return Object.freeze({
		id: input.id,
		version: input.version,
		provides: Object.freeze(provides),
		requires: Object.freeze(requires),
		optional: Object.freeze(optional),
		permissions: Object.freeze([...permissions])
	});
}
function satisfiesVersion(version, range) {
	const current = parseVersion(version);
	if (range === "*" || range === void 0) return true;
	if (SEMVER_PATTERN.test(range)) return compareVersions(current, parseVersion(range)) === 0;
	const majorWildcard = /^(0|[1-9]\d*)\.x$/.exec(range);
	if (majorWildcard) return current.major === Number(majorWildcard[1]);
	if (range.startsWith("^")) {
		const minimum = parseVersion(range.slice(1));
		const upper = minimum.major > 0 ? {
			major: minimum.major + 1,
			minor: 0,
			patch: 0
		} : minimum.minor > 0 ? {
			major: 0,
			minor: minimum.minor + 1,
			patch: 0
		} : {
			major: 0,
			minor: 0,
			patch: minimum.patch + 1
		};
		return compareVersions(current, minimum) >= 0 && compareVersions(current, upper) < 0;
	}
	throw new Error(`unsupported semantic version range ${range}`);
}
function resolveActivationOrder(definitions) {
	assert.ok(Array.isArray(definitions), "plugin definitions must be an array");
	const plugins = /* @__PURE__ */ new Map();
	const providers = /* @__PURE__ */ new Map();
	for (const definition of definitions) {
		assert.ok(definition?.manifest && typeof definition.activate === "function", "invalid plugin definition");
		const manifest = validateManifest(definition.manifest);
		if (plugins.has(manifest.id)) throw new Error(`duplicate plugin id ${manifest.id}`);
		plugins.set(manifest.id, definition);
		for (const [name, version] of Object.entries(manifest.provides)) {
			if (providers.has(name)) throw new Error(`capability ${name} is provided by both ${providers.get(name).id} and ${manifest.id}`);
			providers.set(name, {
				id: manifest.id,
				version
			});
		}
	}
	const dependencies = new Map([...plugins.keys()].map((id) => [id, /* @__PURE__ */ new Set()]));
	for (const definition of plugins.values()) {
		const { manifest } = definition;
		for (const [name, range] of Object.entries(manifest.requires)) {
			const provider = providers.get(name);
			if (!provider || !satisfiesVersion(provider.version, range)) {
				const found = provider ? ` (found ${provider.version})` : "";
				throw new Error(`plugin ${manifest.id} requires ${name} ${range}${found}`);
			}
			dependencies.get(manifest.id).add(provider.id);
		}
		for (const [name, range] of Object.entries(manifest.optional)) {
			const provider = providers.get(name);
			if (!provider) continue;
			if (!satisfiesVersion(provider.version, range)) throw new Error(`plugin ${manifest.id} optional capability ${name} requires ${range} (found ${provider.version})`);
			dependencies.get(manifest.id).add(provider.id);
		}
	}
	const ordered = [];
	const visiting = /* @__PURE__ */ new Set();
	const visited = /* @__PURE__ */ new Set();
	const visit = (id) => {
		if (visiting.has(id)) throw new Error(`plugin dependency cycle includes ${id}`);
		if (visited.has(id)) return;
		visiting.add(id);
		for (const dependency of dependencies.get(id)) visit(dependency);
		visiting.delete(id);
		visited.add(id);
		ordered.push(plugins.get(id));
	};
	for (const id of plugins.keys()) visit(id);
	return ordered;
}
function createCapabilityAccess(manifest, registry) {
	return Object.freeze({
		require(name) {
			const range = manifest.requires[name];
			if (!range) throw new Error(`plugin ${manifest.id} did not declare required capability ${name}`);
			return registry.require(name, range);
		},
		optional(name) {
			const range = manifest.optional[name];
			if (!range) throw new Error(`plugin ${manifest.id} did not declare optional capability ${name}`);
			return registry.optional(name, range);
		}
	});
}
function validateProvidedCapabilities(manifest, provided) {
	assert.ok(provided && typeof provided === "object" && !Array.isArray(provided), `plugin ${manifest.id} capabilities must be an object`);
	const expected = Object.keys(manifest.provides).sort();
	const actual = Object.keys(provided).sort();
	assert.deepEqual(actual, expected, `plugin ${manifest.id} provided capabilities do not match its manifest`);
	for (const name of expected) assert.notEqual(provided[name], void 0, `plugin ${manifest.id} did not provide ${name}`);
}
function validateCapabilityMap(input, label, { ranges }) {
	const map = input ?? {};
	assert.ok(map && typeof map === "object" && !Array.isArray(map), `plugin ${label} must be an object`);
	const result = {};
	for (const [name, version] of Object.entries(map)) {
		assertCapabilityName(name);
		if (ranges) satisfiesVersion("0.0.0", version);
		else assertSemanticVersion(version, `capability ${name}`);
		result[name] = version;
	}
	return result;
}
function assertCapabilityName(name) {
	assert.match(name ?? "", CAPABILITY_ID_PATTERN, "capability id must be lowercase and stable");
}
function assertSemanticVersion(version, label) {
	assert.match(version ?? "", SEMVER_PATTERN, `${label} must use a semantic version`);
}
function parseVersion(version) {
	assertSemanticVersion(version, "version");
	const [, major, minor, patch] = SEMVER_PATTERN.exec(version);
	return {
		major: Number(major),
		minor: Number(minor),
		patch: Number(patch)
	};
}
function compareVersions(left, right) {
	return left.major - right.major || left.minor - right.minor || left.patch - right.patch;
}
//#endregion
//#region cli-client.mjs
const DEFAULT_MODELS$2 = [
	{
		id: "sonnet",
		displayName: "Claude Sonnet",
		isDefault: true,
		defaultReasoningEffort: "medium",
		inputModalities: ["text"]
	},
	{
		id: "opus",
		displayName: "Claude Opus",
		isDefault: false,
		defaultReasoningEffort: "high",
		inputModalities: ["text"]
	},
	{
		id: "haiku",
		displayName: "Claude Haiku",
		isDefault: false,
		defaultReasoningEffort: "low",
		inputModalities: ["text"]
	}
];
var ClaudeCliClient = class extends EventEmitter {
	constructor({ command = "claude", args = [], requestTimeoutMs = 30 * 6e4 } = {}) {
		super();
		this.command = command;
		this.args = args;
		this.requestTimeoutMs = requestTimeoutMs;
		this.sessions = /* @__PURE__ */ new Map();
		this.processes = /* @__PURE__ */ new Map();
		this.closed = false;
	}
	async start() {
		this.closed = false;
	}
	async listModels() {
		return DEFAULT_MODELS$2;
	}
	async createSession(config = {}) {
		assertSdkOnlyPluginsAbsent(config);
		const id = config.sessionId ?? randomUUID();
		const session = {
			id,
			cwd: config.cwd ?? process.cwd(),
			created: false,
			config: structuredClone(config)
		};
		this.sessions.set(id, session);
		return {
			id,
			cwd: session.cwd,
			turns: []
		};
	}
	async resumeSession(sessionId, config = {}) {
		assertSdkOnlyPluginsAbsent(config);
		const existing = this.sessions.get(sessionId) ?? {
			id: sessionId,
			created: true
		};
		const session = {
			...existing,
			cwd: config.cwd ?? existing.cwd ?? process.cwd(),
			config: {
				...existing.config,
				...config
			}
		};
		this.sessions.set(sessionId, session);
		return {
			id: sessionId,
			cwd: session.cwd,
			turns: []
		};
	}
	async sendMessage(sessionId, message = {}) {
		assertSdkOnlyPluginsAbsent(message);
		if (message.content?.some((block) => block?.type === "image")) throw new Error("The Claude CLI backend cannot accept image input; use the Claude Agent SDK backend");
		if (Array.isArray(message.dshTools) && message.dshTools.length > 0) throw new Error("The Claude CLI backend cannot expose DSH tools; use the Claude Agent SDK backend");
		const session = this.sessions.get(sessionId) ?? await this.resumeSession(sessionId, message);
		const turnId = randomUUID();
		const child = this.spawnTurn(session, turnId, message);
		this.processes.set(turnId, child);
		return {
			id: turnId,
			status: "inProgress",
			items: []
		};
	}
	async interruptTurn(_sessionId, turnId) {
		const child = this.processes.get(turnId);
		if (!child) return;
		child.kill("SIGTERM");
	}
	async releaseSession(sessionId) {
		for (const [turnId, child] of this.processes) if (child.relayClaudeSessionId === sessionId) {
			child.kill("SIGTERM");
			this.processes.delete(turnId);
		}
		this.sessions.delete(sessionId);
	}
	async close() {
		this.closed = true;
		for (const child of this.processes.values()) child.kill("SIGTERM");
		this.processes.clear();
	}
	spawnTurn(session, turnId, message) {
		const settingSourceArgs = settingSourceArguments(message.settingSources ?? session.config?.settingSources);
		const systemPromptArgs = systemPromptArguments(message.systemPrompt ?? session.config?.systemPrompt);
		const cliArgs = [
			...this.args,
			"-p",
			message.text,
			"--output-format",
			"stream-json",
			"--verbose",
			"--include-partial-messages",
			"--model",
			message.model ?? session.config?.model ?? "sonnet",
			"--effort",
			message.effort ?? session.config?.effort ?? "medium",
			"--permission-mode",
			permissionMode(message),
			...settingSourceArgs,
			...systemPromptArgs,
			...session.created ? ["--resume", session.id] : ["--session-id", session.id]
		];
		const child = spawn(this.command, cliArgs, {
			cwd: message.cwd ?? session.cwd ?? process.cwd(),
			stdio: [
				"ignore",
				"pipe",
				"pipe"
			],
			env: { ...process.env }
		});
		child.relayClaudeSessionId = session.id;
		session.created = true;
		const state = {
			textItemId: null,
			text: "",
			activities: /* @__PURE__ */ new Set()
		};
		readline.createInterface({ input: child.stdout }).on("line", (line) => this.handleLine(session.id, turnId, line, state));
		child.stderr.setEncoding("utf8");
		child.stderr.on("data", (chunk) => this.emit("diagnostic", String(chunk)));
		child.once("error", (error) => {
			this.emit("diagnostic", `Claude CLI failed: ${error.message}`);
			this.completeTurn(session.id, turnId, "failed", error);
		});
		child.once("exit", (code, signal) => {
			this.processes.delete(turnId);
			if (signal || code) this.completeTurn(session.id, turnId, "failed", /* @__PURE__ */ new Error(`claude exited (${signal ?? code})`));
			else this.completeTurn(session.id, turnId, "completed");
		});
		return child;
	}
	handleLine(sessionId, turnId, line, state) {
		let message;
		try {
			message = JSON.parse(line);
		} catch {
			this.emitText(sessionId, turnId, state, line);
			return;
		}
		for (const event of normalizeClaudeStreamMessage(message, state)) this.emit("activity", {
			method: event.method,
			params: {
				sessionId,
				turnId,
				...event.params
			}
		});
	}
	emitText(sessionId, turnId, state, text) {
		if (!text) return;
		state.textItemId ??= `answer-${turnId}`;
		this.emit("activity", {
			method: "item/agentMessage/delta",
			params: {
				sessionId,
				turnId,
				itemId: state.textItemId,
				delta: `${text}\n`
			}
		});
	}
	completeTurn(sessionId, turnId, status, error = null) {
		this.emit("activity", {
			method: "turn/completed",
			params: {
				sessionId,
				turn: {
					id: turnId,
					status,
					error: error ? { message: error.message } : null,
					items: []
				}
			}
		});
	}
};
function assertSdkOnlyPluginsAbsent(config) {
	if (Array.isArray(config.plugins) && config.plugins.length === 0) return;
	if (config.plugins !== void 0) throw Object.assign(/* @__PURE__ */ new Error("Local Claude plugins require the Claude Agent SDK backend"), { code: "CLAUDE_LOCAL_PLUGINS_REQUIRE_SDK" });
}
function normalizeClaudeStreamMessage(message, state) {
	const events = [];
	const content = message.message?.content ?? message.content ?? [];
	for (const block of Array.isArray(content) ? content : []) {
		if (block.type === "text" && block.text) {
			state.textItemId ??= block.id ?? `answer-${message.message?.id ?? "latest"}`;
			const delta = block.text.startsWith(state.text) ? block.text.slice(state.text.length) : block.text;
			state.text = block.text;
			if (delta) events.push({
				method: "item/agentMessage/delta",
				params: {
					itemId: state.textItemId,
					delta
				}
			});
		}
		if ((block.type === "text_delta" || block.type === "content_block_delta") && (block.text ?? block.delta?.text)) {
			state.textItemId ??= block.id ?? `answer-${message.message?.id ?? "latest"}`;
			const delta = block.text ?? block.delta.text;
			state.text += delta;
			events.push({
				method: "item/agentMessage/delta",
				params: {
					itemId: state.textItemId,
					delta
				}
			});
		}
		if (block.type === "thinking" && block.thinking) events.push({
			method: "item/reasoning/summaryTextDelta",
			params: {
				itemId: block.id ?? "reasoning",
				delta: block.thinking
			}
		});
		if (block.type === "tool_use") {
			const item = {
				type: "toolUse",
				id: block.id ?? block.name,
				name: block.name,
				input: block.input,
				status: "inProgress"
			};
			if (!state.activities.has(item.id)) {
				state.activities.add(item.id);
				events.push({
					method: "item/started",
					params: { item }
				});
			}
		}
		if (block.type === "tool_result") events.push({
			method: "item/completed",
			params: { item: {
				type: "toolUse",
				id: block.tool_use_id ?? block.id,
				name: block.name,
				output: block.content,
				status: block.is_error ? "failed" : "completed"
			} }
		});
	}
	if (message.type === "result" && message.result) {
		state.textItemId ??= `answer-${message.session_id ?? "latest"}`;
		const delta = String(message.result).startsWith(state.text) ? String(message.result).slice(state.text.length) : String(message.result);
		state.text = String(message.result);
		if (delta) events.push({
			method: "item/agentMessage/delta",
			params: {
				itemId: state.textItemId,
				delta
			}
		});
	}
	return events;
}
function permissionMode(message) {
	if (message.permissionMode) return message.permissionMode;
	if (message.approvalPolicy === "never") return "plan";
	if (message.sandbox === "read-only") return "plan";
	return "manual";
}
function settingSourceArguments(value) {
	if (Array.isArray(value) && value.length === 0) return ["--safe-mode"];
	if (Array.isArray(value)) return ["--setting-sources", value.join(",")];
	if (typeof value === "string" && value.trim()) return ["--setting-sources", value];
	return ["--setting-sources", "user,project,local"];
}
function systemPromptArguments(value) {
	if (typeof value === "string" && value.trim()) return ["--system-prompt", value];
	return [];
}
//#endregion
//#region claude-plugin-config.mjs
const CLAUDE_PLUGIN_KEYS = /* @__PURE__ */ new Set([
	"type",
	"path",
	"skipMcpDiscovery"
]);
function normalizeClaudePlugins(value, label = "Claude plugins") {
	if (value === void 0) return void 0;
	if (!Array.isArray(value)) throw new TypeError(`${label} must be an array`);
	return value.map((plugin, index) => {
		const entryLabel = `${label}[${index}]`;
		if (!plugin || typeof plugin !== "object" || Array.isArray(plugin)) throw new TypeError(`${entryLabel} must be an object`);
		for (const key of Object.keys(plugin)) if (!CLAUDE_PLUGIN_KEYS.has(key)) throw new TypeError(`${entryLabel}.${key} is not supported`);
		if (plugin.type !== "local") throw new TypeError(`${entryLabel}.type must be "local"`);
		if (typeof plugin.path !== "string" || !plugin.path.trim()) throw new TypeError(`${entryLabel}.path must be a non-empty string`);
		if (plugin.skipMcpDiscovery !== void 0 && typeof plugin.skipMcpDiscovery !== "boolean") throw new TypeError(`${entryLabel}.skipMcpDiscovery must be a boolean`);
		return {
			type: "local",
			path: plugin.path,
			...plugin.skipMcpDiscovery === void 0 ? {} : { skipMcpDiscovery: plugin.skipMcpDiscovery }
		};
	});
}
//#endregion
//#region sdk-client.mjs
const DEFAULT_MODELS$1 = [
	{
		id: "sonnet",
		displayName: "Claude Sonnet",
		isDefault: true,
		defaultReasoningEffort: "medium",
		supportedReasoningEfforts: reasoningEfforts(),
		inputModalities: ["text", "image"]
	},
	{
		id: "opus",
		displayName: "Claude Opus",
		isDefault: false,
		defaultReasoningEffort: "high",
		supportedReasoningEfforts: reasoningEfforts(),
		inputModalities: ["text", "image"]
	},
	{
		id: "haiku",
		displayName: "Claude Haiku",
		isDefault: false,
		defaultReasoningEffort: "low",
		supportedReasoningEfforts: reasoningEfforts(),
		inputModalities: ["text", "image"]
	}
];
const CLAUDE_SEARCH_TOOLS = ["Glob", "Grep"];
const SENSITIVE_ENV_NAME = /(?:^|_)(?:API_?KEY|ACCESS_?KEY|SECRET(?:_ACCESS_?KEY)?|TOKEN|PASSWORD|PASSWD|CREDENTIALS?|PRIVATE_?KEY)(?:$|_)/i;
function reasoningEfforts() {
	return [
		"low",
		"medium",
		"high"
	].map((reasoningEffort) => ({ reasoningEffort }));
}
var ClaudeSdkClient = class extends EventEmitter {
	constructor({ sdk = null, pathToClaudeCodeExecutable = void 0, requestTimeoutMs = 30 * 6e4 } = {}) {
		super();
		this.sdk = sdk;
		this.pathToClaudeCodeExecutable = pathToClaudeCodeExecutable;
		this.requestTimeoutMs = requestTimeoutMs;
		this.sessions = /* @__PURE__ */ new Map();
		this.queries = /* @__PURE__ */ new Map();
		this.pendingRequests = /* @__PURE__ */ new Map();
		this.closed = false;
	}
	async start() {
		this.sdk ??= await import("@anthropic-ai/claude-agent-sdk");
		if (typeof this.sdk.query !== "function") throw new Error("Claude Agent SDK query() is unavailable");
		this.closed = false;
	}
	async listModels() {
		return DEFAULT_MODELS$1;
	}
	supportsSessionImport() {
		return typeof this.sdk?.listSessions === "function" && typeof this.sdk?.getSessionInfo === "function" && typeof this.sdk?.getSessionMessages === "function";
	}
	async listWorkspaceSessions({ cwd }) {
		if (!this.supportsSessionImport()) throw sessionImportUnavailable$1();
		return this.sdk.listSessions({
			dir: cwd,
			includeWorktrees: false,
			includeProgrammatic: false
		});
	}
	async readSession(sessionId, { cwd }) {
		if (!this.supportsSessionImport()) throw sessionImportUnavailable$1();
		const info = await this.sdk.getSessionInfo(sessionId, { dir: cwd });
		if (!info) return null;
		const messages = await this.sdk.getSessionMessages(sessionId, { dir: cwd });
		return {
			...info,
			messages
		};
	}
	async createSession(config = {}) {
		config = normalizedSessionConfig(config);
		const id = config.sessionId ?? randomUUID();
		this.sessions.set(id, {
			id,
			cwd: config.cwd ?? process.cwd(),
			created: false,
			config: structuredClone(config)
		});
		return {
			id,
			cwd: config.cwd ?? process.cwd(),
			turns: []
		};
	}
	async resumeSession(sessionId, config = {}) {
		config = normalizedSessionConfig(config);
		const existing = this.sessions.get(sessionId) ?? {
			id: sessionId,
			created: true,
			config: {}
		};
		this.sessions.set(sessionId, {
			...existing,
			cwd: config.cwd ?? existing.cwd ?? process.cwd(),
			config: {
				...existing.config,
				...structuredClone(config)
			}
		});
		return {
			id: sessionId,
			cwd: config.cwd ?? existing.cwd ?? process.cwd(),
			turns: []
		};
	}
	async sendMessage(sessionId, message = {}) {
		if (message.plugins !== void 0) throw new TypeError("Claude plugins must be configured when the Session is created or resumed");
		const session = this.sessions.get(sessionId) ?? await this.resumeSession(sessionId, message);
		const turnId = randomUUID();
		const abortController = new AbortController();
		const options = await this.queryOptions(session, message, abortController);
		const query = this.sdk.query({
			prompt: claudePrompt(message),
			options
		});
		this.queries.set(turnId, {
			query,
			abortController,
			sessionId
		});
		this.consumeQuery(session, turnId, query).catch((error) => {
			this.emit("diagnostic", `Claude SDK query failed: ${error?.stack ?? error}`);
			this.completeTurn(session.id, turnId, "failed", error);
		});
		session.created = true;
		return {
			id: turnId,
			status: "inProgress",
			items: []
		};
	}
	async interruptTurn(_sessionId, turnId) {
		const record = this.queries.get(turnId);
		if (!record) return;
		await record.query.interrupt?.().catch(() => {});
		record.abortController.abort();
		record.query.close?.();
	}
	async releaseSession(sessionId) {
		for (const [turnId, record] of this.queries) if (record.sessionId === sessionId) {
			record.abortController.abort();
			record.query.close?.();
			this.queries.delete(turnId);
		}
		this.sessions.delete(sessionId);
	}
	async close() {
		this.closed = true;
		for (const record of this.queries.values()) {
			record.abortController.abort();
			record.query.close?.();
		}
		this.queries.clear();
		for (const request of this.pendingRequests.values()) request.resolve({
			behavior: "deny",
			message: "Relay Claude SDK client closed"
		});
		this.pendingRequests.clear();
	}
	resolveRequest(requestId, response = {}) {
		const request = this.pendingRequests.get(String(requestId));
		if (!request) throw new Error(`unknown pending Claude request ${requestId}`);
		this.pendingRequests.delete(String(requestId));
		request.resolve(responseForRequest(request, response));
	}
	rejectRequest(requestId, error) {
		const request = this.pendingRequests.get(String(requestId));
		if (!request) return;
		this.pendingRequests.delete(String(requestId));
		request.resolve({
			behavior: "deny",
			message: error?.message ?? String(error)
		});
	}
	async queryOptions(session, message, abortController) {
		const plugins = normalizeClaudePlugins(session.config?.plugins);
		const cwd = message.cwd ?? session.cwd ?? process.cwd();
		const settingSources = message.settingSources ?? session.config?.settingSources ?? [
			"user",
			"project",
			"local"
		];
		const dshOptions = dshMcpOptions(this.sdk, message.dshTools, message.executeDshTool, abortController.signal);
		const redactions = await sensitiveEnvironmentRedactions(this.sdk, cwd, settingSources);
		return {
			abortController,
			cwd,
			model: message.model ?? session.config?.model,
			effort: message.effort ?? session.config?.effort,
			thinking: {
				type: "adaptive",
				display: "summarized"
			},
			permissionMode: sdkPermissionMode(message),
			settingSources,
			systemPrompt: message.systemPrompt ?? session.config?.systemPrompt,
			pathToClaudeCodeExecutable: this.pathToClaudeCodeExecutable,
			includePartialMessages: true,
			...plugins === void 0 ? {} : { plugins },
			...session.created ? { resume: session.id } : { sessionId: session.id },
			canUseTool: (toolName, input, options) => this.requestPermission(session.id, toolName, input, options),
			...redactions.length === 0 ? {} : { hooks: sensitiveOutputHooks(redactions) },
			...dshOptions,
			allowedTools: [...CLAUDE_SEARCH_TOOLS, ...dshOptions.allowedTools ?? []]
		};
	}
	requestPermission(sessionId, toolName, input, options = {}) {
		const id = options.requestId ?? randomUUID();
		return new Promise((resolve) => {
			const request = {
				id,
				method: toolName === "AskUserQuestion" ? "tool/requestUserInput" : "tool/requestApproval",
				signal: options.signal,
				params: {
					sessionId,
					toolName,
					input: structuredClone(input ?? {}),
					title: options.title,
					displayName: options.displayName,
					description: options.description,
					decisionReason: options.decisionReason,
					blockedPath: options.blockedPath,
					toolUseID: options.toolUseID,
					suggestions: structuredClone(options.suggestions ?? [])
				}
			};
			this.pendingRequests.set(String(id), {
				request,
				resolve,
				input
			});
			options.signal?.addEventListener("abort", () => this.rejectRequest(id, /* @__PURE__ */ new Error("Claude permission request was cancelled")), { once: true });
			this.emit("request", request);
		});
	}
	async consumeQuery(session, turnId, query) {
		const state = {
			currentMessageId: null,
			text: /* @__PURE__ */ new Map(),
			reasoning: /* @__PURE__ */ new Map(),
			activities: /* @__PURE__ */ new Set(),
			tools: /* @__PURE__ */ new Map()
		};
		let completed = false;
		try {
			for await (const message of query) {
				for (const event of normalizeSdkMessage(message, state)) this.emit("activity", {
					method: event.method,
					params: {
						sessionId: session.id,
						turnId,
						...event.params
					}
				});
				if (message.type === "result") {
					completed = true;
					this.completeTurn(session.id, turnId, message.is_error ? "failed" : "completed", resultError(message));
				}
			}
			if (!completed) this.completeTurn(session.id, turnId, "completed");
		} finally {
			this.queries.delete(turnId);
		}
	}
	completeTurn(sessionId, turnId, status, error = null) {
		this.emit("activity", {
			method: "turn/completed",
			params: {
				sessionId,
				turn: {
					id: turnId,
					status,
					error: error ? { message: error.message } : null,
					items: []
				}
			}
		});
	}
};
async function sensitiveEnvironmentRedactions(sdk, cwd, settingSources) {
	const environment = { ...process.env };
	const explicitSensitiveNames = /* @__PURE__ */ new Set();
	if (typeof sdk.resolveSettings === "function") {
		const resolved = await sdk.resolveSettings({
			cwd,
			settingSources
		});
		Object.assign(environment, resolved?.effective?.env ?? {});
		for (const entry of resolved?.effective?.sandbox?.credentials?.envVars ?? []) if (typeof entry?.name === "string") explicitSensitiveNames.add(entry.name);
	}
	const byValue = /* @__PURE__ */ new Map();
	for (const [name, value] of Object.entries(environment)) {
		if (!SENSITIVE_ENV_NAME.test(name) && !explicitSensitiveNames.has(name)) continue;
		if (typeof value !== "string" || value.length === 0) continue;
		const current = byValue.get(value);
		if (current === void 0 || name < current) byValue.set(value, name);
	}
	return [...byValue].map(([value, name]) => ({
		value,
		replacement: `[REDACTED_ENV:${name}]`
	})).sort((left, right) => right.value.length - left.value.length || left.replacement.localeCompare(right.replacement));
}
function sensitiveOutputHooks(redactions) {
	return { PostToolUse: [{ hooks: [async (input) => {
		const redacted = redactSensitiveToolOutput(input.tool_response, redactions);
		if (!redacted.changed) return { continue: true };
		return {
			continue: true,
			hookSpecificOutput: {
				hookEventName: "PostToolUse",
				updatedToolOutput: redacted.value
			}
		};
	}] }] };
}
function redactSensitiveToolOutput(value, redactions) {
	if (typeof value === "string") {
		let redacted = value;
		for (const entry of redactions) redacted = redacted.replaceAll(entry.value, entry.replacement);
		return {
			value: redacted,
			changed: redacted !== value
		};
	}
	if (Array.isArray(value)) {
		let changed = false;
		const redacted = value.map((item) => {
			const result = redactSensitiveToolOutput(item, redactions);
			changed ||= result.changed;
			return result.value;
		});
		return {
			value: changed ? redacted : value,
			changed
		};
	}
	if (!value || typeof value !== "object") return {
		value,
		changed: false
	};
	let changed = false;
	const entries = Object.entries(value).map(([key, item]) => {
		const result = redactSensitiveToolOutput(item, redactions);
		changed ||= result.changed;
		return [key, result.value];
	});
	return {
		value: changed ? Object.fromEntries(entries) : value,
		changed
	};
}
function normalizedSessionConfig(config) {
	const plugins = normalizeClaudePlugins(config.plugins);
	const normalized = {
		...config,
		...plugins === void 0 ? {} : { plugins }
	};
	if (plugins === void 0) delete normalized.plugins;
	return normalized;
}
function claudePrompt(message) {
	const content = Array.isArray(message.content) ? message.content : [];
	if (!content.some((block) => block?.type === "image")) return message.text;
	return oneUserMessage(content.map((block) => {
		if (block?.type === "text") return {
			type: "text",
			text: String(block.text ?? "")
		};
		if (block?.type === "image" && CLAUDE_IMAGE_MEDIA_TYPES$1.has(block.mediaType) && typeof block.data === "string") return {
			type: "image",
			source: {
				type: "base64",
				media_type: block.mediaType,
				data: block.data
			}
		};
		throw Object.assign(/* @__PURE__ */ new Error("Claude SDK received invalid multimodal message content."), { code: "CLAUDE_IMAGE_INPUT_INVALID" });
	}));
}
async function* oneUserMessage(content) {
	yield {
		type: "user",
		message: {
			role: "user",
			content
		},
		parent_tool_use_id: null
	};
}
const CLAUDE_IMAGE_MEDIA_TYPES$1 = /* @__PURE__ */ new Set([
	"image/png",
	"image/jpeg",
	"image/gif",
	"image/webp"
]);
function dshMcpOptions(sdk, schemas, execute, signal) {
	if (!Array.isArray(schemas) || schemas.length === 0) return {};
	if (typeof execute !== "function") throw new Error("Claude DSH tools require an execution callback");
	if (typeof sdk.createSdkMcpServer !== "function" || typeof sdk.tool !== "function") throw new Error("This Claude Agent SDK does not support in-process DSH tools");
	const tools = schemas.map((schema) => sdk.tool(schema.name, schema.description, jsonSchemaShape(schema.parameters), async (args, extra = {}) => dshToolResult(await execute({
		name: schema.name,
		arguments: args,
		callId: extra.toolUseID ?? extra.toolUseId ?? randomUUID(),
		signal: extra.signal ?? signal
	}))));
	return {
		mcpServers: { dsh: sdk.createSdkMcpServer({
			name: "dsh",
			version: "1.0.0",
			tools,
			alwaysLoad: true
		}) },
		allowedTools: schemas.map((schema) => `mcp__dsh__${schema.name}`)
	};
}
function jsonSchemaShape(schema) {
	if (!schema || schema.type !== "object" || typeof schema.properties !== "object" || schema.properties === null) {
		if (schema?.type === "object" && schema.properties === void 0) return {};
		throw new Error("DSH tool parameters must use an object JSON Schema");
	}
	const required = new Set(Array.isArray(schema.required) ? schema.required : []);
	return Object.fromEntries(Object.entries(schema.properties).map(([name, property]) => {
		let field;
		try {
			field = z.fromJSONSchema(property);
		} catch {
			field = z.unknown();
		}
		return [name, required.has(name) ? field : field.optional()];
	}));
}
function dshToolResult(result) {
	const content = (result.content ?? []).map((block) => {
		if (block?.type === "text") return {
			type: "text",
			text: String(block.text ?? "")
		};
		if (block?.type === "image" && typeof block.data === "string" && typeof block.mediaType === "string") return {
			type: "image",
			data: block.data,
			mimeType: block.mediaType
		};
		return {
			type: "text",
			text: JSON.stringify(block)
		};
	});
	if (content.length === 0) content.push({
		type: "text",
		text: result.isError ? "DSH tool failed" : "DSH tool completed."
	});
	return {
		content,
		isError: Boolean(result.isError)
	};
}
function normalizeSdkMessage(message, state) {
	const events = [];
	if (message.type === "stream_event") {
		const event = message.event;
		if (event?.type === "message_start") {
			state.currentMessageId = event.message?.id ?? message.uuid ?? null;
			return events;
		}
		if (event?.type === "content_block_delta" && event.delta?.type === "text_delta") {
			const itemId = streamItemId(state, "text", event.index);
			state.text.set(itemId, `${state.text.get(itemId) ?? ""}${event.delta.text}`);
			events.push({
				method: "item/agentMessage/delta",
				params: {
					itemId,
					delta: event.delta.text
				}
			});
		}
		if (event?.type === "content_block_delta" && event.delta?.type === "thinking_delta") {
			const itemId = streamItemId(state, "reason", event.index);
			state.reasoning.set(itemId, `${state.reasoning.get(itemId) ?? ""}${event.delta.thinking}`);
			events.push({
				method: "item/reasoning/summaryTextDelta",
				params: {
					itemId,
					delta: event.delta.thinking
				}
			});
		}
		return events;
	}
	if (message.type === "assistant") {
		const content = message.message?.content ?? [];
		for (const [index, block] of content.entries()) {
			if (block.type === "text" && block.text) {
				const itemId = block.id ?? messageItemId(state.text, message, "text", content, index);
				const previous = state.text.get(itemId) ?? "";
				const delta = block.text.startsWith(previous) ? block.text.slice(previous.length) : block.text;
				state.text.set(itemId, block.text);
				if (delta) events.push({
					method: "item/agentMessage/delta",
					params: {
						itemId,
						delta
					}
				});
			}
			if (block.type === "thinking" && block.thinking) {
				const itemId = block.id ?? messageItemId(state.reasoning, message, "reason", content, index);
				const previous = state.reasoning.get(itemId) ?? "";
				const delta = block.thinking.startsWith(previous) ? block.thinking.slice(previous.length) : block.thinking;
				state.reasoning.set(itemId, block.thinking);
				if (delta) events.push({
					method: "item/reasoning/summaryTextDelta",
					params: {
						itemId,
						delta
					}
				});
			}
			if (block.type === "tool_use") {
				const item = {
					type: "toolUse",
					id: block.id,
					name: block.name,
					input: block.input,
					status: "inProgress"
				};
				state.tools.set(String(block.id), {
					name: block.name,
					input: block.input
				});
				if (!state.activities.has(item.id)) {
					state.activities.add(item.id);
					events.push({
						method: "item/started",
						params: { item }
					});
				}
			}
		}
	}
	if (message.type === "user") for (const block of message.message?.content ?? []) {
		if (block.type !== "tool_result") continue;
		const tool = state.tools.get(String(block.tool_use_id)) ?? {};
		const images = structuredImagesFrom(block.content, message.tool_use_result);
		events.push({
			method: "item/completed",
			params: { item: {
				type: "toolUse",
				id: block.tool_use_id,
				name: tool.name,
				input: tool.input,
				output: redactStructuredImages(block.content),
				...images.length > 0 ? { images } : {},
				status: block.is_error ? "failed" : "completed"
			} }
		});
	}
	if (message.type === "system" && message.subtype === "permission_denied") events.push({
		method: "item/completed",
		params: { item: {
			type: "toolUse",
			id: message.tool_use_id,
			name: message.tool_name,
			output: message.message,
			status: "failed"
		} }
	});
	return events;
}
function structuredImagesFrom(...values) {
	const images = [];
	const seenObjects = /* @__PURE__ */ new Set();
	const seenImages = /* @__PURE__ */ new Set();
	const visit = (value) => {
		if (!value || typeof value !== "object" || seenObjects.has(value)) return;
		seenObjects.add(value);
		if (value.type === "image") {
			const mediaType = value.mediaType ?? value.mimeType ?? value.source?.media_type ?? value.file?.type;
			const data = value.data ?? value.source?.data ?? value.file?.base64;
			if (CLAUDE_IMAGE_MEDIA_TYPES$1.has(mediaType) && typeof data === "string") {
				const key = `${mediaType}:${data}`;
				if (!seenImages.has(key)) {
					seenImages.add(key);
					images.push({
						mediaType,
						data,
						name: value.name ?? value.file?.name
					});
				}
			}
		}
		if (Array.isArray(value)) {
			for (const item of value) visit(item);
			return;
		}
		for (const item of Object.values(value)) visit(item);
	};
	for (const value of values) visit(value);
	return images;
}
function redactStructuredImages(value) {
	if (Array.isArray(value)) return value.map(redactStructuredImages);
	if (!value || typeof value !== "object") return value;
	if (value.type === "image") return {
		type: "image",
		mediaType: value.mediaType ?? value.mimeType ?? value.source?.media_type ?? value.file?.type ?? "unknown",
		omitted: true
	};
	return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, redactStructuredImages(item)]));
}
function streamItemId(state, type, index) {
	return `${state.currentMessageId ?? "message"}-${type}-${index ?? 0}`;
}
function messageItemId(items, message, type, content, index) {
	const prefix = `${message.message?.id ?? message.uuid ?? "message"}-${type}-`;
	const ordinal = content.slice(0, index).filter((block) => block.type === (type === "reason" ? "thinking" : type)).length;
	return [...items.keys()].filter((itemId) => itemId.startsWith(prefix)).sort((left, right) => Number(left.slice(prefix.length)) - Number(right.slice(prefix.length)))[ordinal] ?? `${prefix}${index}`;
}
function responseForRequest(pending, response) {
	if (response.action === "accept" || response.action === "allow") return {
		behavior: "allow",
		updatedInput: response.updatedInput ?? pending.input
	};
	if (response.action === "answer") return {
		behavior: "allow",
		updatedInput: {
			...pending.input,
			answers: response.answers ?? {}
		}
	};
	return {
		behavior: "deny",
		message: response.message ?? "User declined this Claude tool request"
	};
}
function resultError(message) {
	if (!message?.is_error) return null;
	return new Error(message.errors?.join("\n") || message.subtype || "Claude SDK turn failed");
}
function sessionImportUnavailable$1() {
	return Object.assign(/* @__PURE__ */ new Error("The active Claude Agent SDK does not support native Session discovery and history import"), { code: "CLAUDE_SESSION_IMPORT_UNAVAILABLE" });
}
function sdkPermissionMode(message) {
	if (message.permissionMode) return message.permissionMode;
	if (message.approvalPolicy === "never") return "dontAsk";
	if (message.sandbox === "read-only") return "plan";
	return "default";
}
//#endregion
//#region session-runtime.mjs
const DEFAULT_MODELS = [
	{
		id: "sonnet",
		displayName: "Claude Sonnet",
		description: "Claude Code default balanced model",
		isDefault: true,
		defaultReasoningEffort: "medium",
		supportedReasoningEfforts: [
			{ reasoningEffort: "low" },
			{ reasoningEffort: "medium" },
			{ reasoningEffort: "high" }
		]
	},
	{
		id: "opus",
		displayName: "Claude Opus",
		description: "Claude Code high-capability model",
		isDefault: false,
		defaultReasoningEffort: "high",
		supportedReasoningEfforts: [{ reasoningEffort: "medium" }, { reasoningEffort: "high" }]
	},
	{
		id: "haiku",
		displayName: "Claude Haiku",
		description: "Claude Code fast model",
		isDefault: false,
		defaultReasoningEffort: "low",
		supportedReasoningEfforts: [{ reasoningEffort: "low" }, { reasoningEffort: "medium" }]
	}
];
var ClaudeSessionRuntime = class extends EventEmitter {
	constructor({ client = new ClaudeCliClient(), cwd = process.cwd(), plugins = void 0 } = {}) {
		super();
		this.client = client;
		this.cwd = cwd;
		this.plugins = normalizeClaudePlugins(plugins);
		this.sessions = /* @__PURE__ */ new Map();
		this.models = DEFAULT_MODELS;
		this.selectedSessionId = null;
		this.diagnostics = [];
		this.closed = false;
		this.client.on?.("activity", (message) => this.handleActivity(message));
		this.client.on?.("request", (request) => this.emit("request", request));
		this.client.on?.("diagnostic", (message) => this.addDiagnostic(message));
		this.client.on?.("exit", (details) => {
			this.addDiagnostic(`Claude backend exited: ${JSON.stringify(details)}`);
			this.emitChange();
		});
	}
	async initialize() {
		await this.client.start?.();
		const models = await this.client.listModels?.().catch((error) => {
			this.addDiagnostic(`Claude model list failed: ${error.message}`);
			return null;
		});
		if (Array.isArray(models) && models.length > 0) this.models = models;
		this.emitChange();
		return this.snapshot();
	}
	async createSession({ model, effort, sandbox = "workspace-write", approvalPolicy = "on-request", cwd = this.cwd, ephemeral = false, settingSources = [
		"user",
		"project",
		"local"
	], systemPrompt = {
		type: "preset",
		preset: "claude_code"
	}, plugins = this.plugins } = {}) {
		const selectedModel = model ?? this.models.find((candidate) => candidate.isDefault)?.id ?? "sonnet";
		const selectedEffort = effort ?? this.models.find((candidate) => candidate.id === selectedModel)?.defaultReasoningEffort ?? "medium";
		const normalizedPlugins = normalizeClaudePlugins(plugins);
		const created = await this.client.createSession?.({
			model: selectedModel,
			effort: selectedEffort,
			sandbox,
			approvalPolicy,
			cwd,
			ephemeral,
			settingSources,
			systemPrompt,
			...normalizedPlugins === void 0 ? {} : { plugins: normalizedPlugins }
		});
		const session = this.upsertSession(created ?? {}, {
			id: created?.id,
			model: selectedModel,
			effort: selectedEffort,
			sandbox,
			approvalPolicy,
			cwd,
			ephemeral,
			plugins: normalizedPlugins
		});
		if (!session.ephemeral) this.selectedSessionId = session.id;
		this.emitChange();
		return publicSession(session);
	}
	supportsSessionImport() {
		return this.client.supportsSessionImport?.() === true;
	}
	async listWorkspaceSessions({ cwd }) {
		if (!this.supportsSessionImport() || typeof this.client.listWorkspaceSessions !== "function") throw sessionImportUnavailable();
		return structuredClone(await this.client.listWorkspaceSessions({ cwd }));
	}
	async readSession(sessionId, { cwd }) {
		if (!this.supportsSessionImport() || typeof this.client.readSession !== "function") throw sessionImportUnavailable();
		const source = await this.client.readSession(sessionId, { cwd });
		return source === null ? null : structuredClone(source);
	}
	async resumeSession(sessionId, defaults = {}) {
		if (!sessionId?.trim()) throw new Error("sessionId is required");
		const normalizedPlugins = normalizeClaudePlugins(defaults.plugins === void 0 ? this.plugins : defaults.plugins);
		const resumeConfig = {
			cwd: defaults.cwd ?? this.cwd,
			...defaults,
			...normalizedPlugins === void 0 ? {} : { plugins: normalizedPlugins }
		};
		if (normalizedPlugins === void 0) delete resumeConfig.plugins;
		const resumed = await this.client.resumeSession?.(sessionId, resumeConfig);
		const session = this.upsertSession(resumed ?? {}, {
			id: sessionId,
			...resumeConfig
		});
		if (Array.isArray(resumed?.turns) && resumed.turns.length > 0) session.turns = structuredClone(resumed.turns);
		if (!session.ephemeral) this.selectedSessionId = sessionId;
		this.emitChange();
		return publicSession(session);
	}
	async sendMessage(sessionId, message = {}) {
		const { text, content, model, effort, sandbox, approvalPolicy, cwd } = message;
		const session = this.requireSession(sessionId);
		const hasContent = Array.isArray(content) && content.some((block) => block?.type === "image" || block?.type === "text" && String(block.text ?? "").trim());
		if (!text?.trim() && !hasContent) throw new Error("message content is required");
		if (message.plugins !== void 0) throw new TypeError("Claude plugins must be configured when the Session is created or resumed");
		const next = {
			model: model ?? session.model,
			effort: effort ?? session.effort,
			sandbox: sandbox ?? session.sandbox,
			approvalPolicy: approvalPolicy ?? session.approvalPolicy,
			cwd: cwd ?? session.cwd
		};
		Object.assign(session, next, { updatedAt: nowSeconds() });
		const turn = await this.client.sendMessage(sessionId, {
			...message,
			text,
			content,
			...next
		});
		this.ensureTurn(session, turn);
		this.emitChange();
		return structuredClone(turn);
	}
	async interruptTurn(sessionId, turnId) {
		await this.client.interruptTurn?.(sessionId, turnId);
	}
	async resolveRequest(requestId, response = {}) {
		if (typeof this.client.resolveRequest !== "function") throw new Error("Claude client does not support interactive request resolution");
		this.client.resolveRequest(requestId, response);
	}
	rejectRequest(requestId, error) {
		this.client.rejectRequest?.(requestId, error);
	}
	async releaseSession(sessionId) {
		if (!sessionId) return;
		await this.client.releaseSession?.(sessionId).catch((error) => {
			this.addDiagnostic(`Claude session release failed for ${sessionId}: ${error.message}`);
		});
		this.sessions.delete(sessionId);
		if (this.selectedSessionId === sessionId) this.selectedSessionId = null;
		this.emitChange();
	}
	getSession(sessionId) {
		const session = this.sessions.get(sessionId);
		return session ? publicSession(session) : null;
	}
	snapshot() {
		return {
			connected: !this.closed,
			selectedSessionId: this.selectedSessionId,
			cwd: this.cwd,
			models: structuredClone(this.models),
			sessions: [...this.sessions.values()].sort((left, right) => right.updatedAt - left.updatedAt).map((session) => publicSession(session)),
			diagnostics: this.diagnostics.slice(-20)
		};
	}
	async close() {
		if (this.closed) return;
		this.closed = true;
		await this.client.close?.();
	}
	handleActivity(message) {
		const params = message.params ?? {};
		const sessionId = params.sessionId ?? params.session?.id ?? null;
		const session = sessionId ? this.sessions.get(sessionId) : null;
		if (message.method === "turn/completed" && session) {
			const turn = params.turn;
			if (turn?.id) this.ensureTurn(session, turn);
		}
		this.emit("activity", message);
		this.emitChange();
	}
	upsertSession(input = {}, defaults = {}) {
		const id = input.id ?? defaults.id;
		if (!id) throw new Error("Claude session id is required");
		const existing = this.sessions.get(id) ?? {
			id,
			turns: [],
			createdAt: nowSeconds()
		};
		Object.assign(existing, {
			model: defaults.model ?? input.model ?? existing.model ?? this.models.find((candidate) => candidate.isDefault)?.id ?? "sonnet",
			effort: defaults.effort ?? input.effort ?? existing.effort ?? "medium",
			sandbox: defaults.sandbox ?? input.sandbox ?? existing.sandbox ?? "workspace-write",
			approvalPolicy: defaults.approvalPolicy ?? input.approvalPolicy ?? existing.approvalPolicy ?? "on-request",
			cwd: defaults.cwd ?? input.cwd ?? existing.cwd ?? this.cwd,
			ephemeral: Boolean(defaults.ephemeral ?? input.ephemeral ?? existing.ephemeral),
			plugins: defaults.plugins ?? input.plugins ?? existing.plugins,
			updatedAt: input.updatedAt ?? nowSeconds()
		});
		if (Array.isArray(input.turns) && input.turns.length > 0) existing.turns = structuredClone(input.turns);
		this.sessions.set(id, existing);
		return existing;
	}
	requireSession(sessionId) {
		const session = this.sessions.get(sessionId);
		if (!session) throw new Error(`unknown Claude session ${sessionId}`);
		return session;
	}
	ensureTurn(session, turn) {
		if (!turn?.id) return;
		const existing = session.turns.findIndex((candidate) => candidate.id === turn.id);
		if (existing >= 0) {
			if (session.turns[existing].status !== "inProgress" && turn.status === "inProgress") return;
			session.turns[existing] = structuredClone(turn);
		} else session.turns.push(structuredClone(turn));
		session.updatedAt = nowSeconds();
	}
	addDiagnostic(message) {
		this.diagnostics.push(String(message));
		this.diagnostics.splice(0, Math.max(0, this.diagnostics.length - 50));
	}
	emitChange() {
		this.emit("change", this.snapshot());
	}
};
function publicSession(session) {
	return structuredClone({
		id: session.id,
		model: session.model,
		effort: session.effort,
		sandbox: session.sandbox,
		approvalPolicy: session.approvalPolicy,
		cwd: session.cwd,
		ephemeral: session.ephemeral,
		turns: session.turns ?? []
	});
}
function nowSeconds() {
	return Date.now() / 1e3;
}
function sessionImportUnavailable() {
	return Object.assign(/* @__PURE__ */ new Error("Native Claude Session import requires the Claude Agent SDK backend"), { code: "CLAUDE_SESSION_IMPORT_UNAVAILABLE" });
}
//#endregion
//#region plugin.mjs
const CLAUDE_EXECUTION_CAPABILITY = "relay.execution.claude.v1";
function createClaudeExecutionPlugin(config = {}) {
	return definePlugin({
		manifest: {
			id: "relay.execution.claude",
			version: "1.0.0",
			provides: { [CLAUDE_EXECUTION_CAPABILITY]: "1.0.0" },
			optional: { "relay.logging.v1": "^1.0.0" },
			permissions: ["process:claude", "filesystem:workspace"]
		},
		activate({ capabilities, defer }) {
			const logger = capabilities.optional("relay.logging.v1") ?? console;
			const runtime = new ClaudeSessionRuntime({
				client: config.client ?? createClaudeClient(config),
				cwd: config.cwd ?? process.cwd(),
				plugins: config.plugins
			});
			defer(() => runtime.close());
			const ready = runtime.initialize();
			ready.catch((error) => {
				logger.error?.(`Relay Claude backend failed to initialize: ${error?.stack ?? error}`);
			});
			return { capabilities: { [CLAUDE_EXECUTION_CAPABILITY]: executionCapability(runtime, ready) } };
		}
	});
}
function executionCapability(runtime, ready) {
	return Object.freeze({
		whenReady: () => ready,
		listModels: () => structuredClone(runtime.models),
		supportsSessionImport: () => runtime.supportsSessionImport(),
		listWorkspaceSessions: runtime.listWorkspaceSessions.bind(runtime),
		readSession: runtime.readSession.bind(runtime),
		hasSession: (sessionId) => runtime.sessions.has(sessionId),
		getSession: runtime.getSession.bind(runtime),
		patchSession(sessionId, patch) {
			const session = runtime.sessions.get(sessionId);
			if (session) Object.assign(session, structuredClone(patch));
			return Boolean(session);
		},
		createSession: runtime.createSession.bind(runtime),
		resumeSession: runtime.resumeSession.bind(runtime),
		sendMessage: runtime.sendMessage.bind(runtime),
		interruptTurn: runtime.interruptTurn.bind(runtime),
		releaseSession: runtime.releaseSession.bind(runtime),
		resolveRequest: runtime.resolveRequest.bind(runtime),
		rejectRequest: runtime.rejectRequest.bind(runtime),
		subscribeActivity: (listener) => subscribe(runtime, "activity", listener),
		subscribeRequest: (listener) => subscribe(runtime, "request", listener)
	});
}
function createClaudeClient(config) {
	const backend = config.backend ?? "auto";
	if (backend === "cli") return createClaudeCliClient(config);
	const sdkClient = new ClaudeSdkClient({
		pathToClaudeCodeExecutable: config.codeExecutablePath,
		requestTimeoutMs: positiveInteger(config.requestTimeoutMs, 30 * 6e4)
	});
	if (backend === "sdk") return sdkClient;
	return new FallbackClaudeClient({
		primary: sdkClient,
		fallback: createClaudeCliClient(config)
	});
}
function createClaudeCliClient(config) {
	return new ClaudeCliClient({
		command: config.command ?? "claude",
		args: config.args ?? [],
		requestTimeoutMs: positiveInteger(config.requestTimeoutMs, 30 * 6e4)
	});
}
var FallbackClaudeClient = class extends ClaudeCliClient {
	constructor({ primary, fallback }) {
		super();
		this.primary = primary;
		this.fallback = fallback;
		this.active = primary;
		for (const event of [
			"activity",
			"request",
			"diagnostic",
			"exit"
		]) {
			primary.on(event, (...args) => this.emit(event, ...args));
			fallback.on(event, (...args) => this.emit(event, ...args));
		}
	}
	async start() {
		try {
			await this.primary.start();
			this.active = this.primary;
		} catch (error) {
			this.emit("diagnostic", `Claude Agent SDK unavailable; falling back to CLI: ${error.message}`);
			await this.fallback.start();
			this.active = this.fallback;
		}
	}
	listModels(...args) {
		return this.active.listModels(...args);
	}
	supportsSessionImport(...args) {
		return this.active.supportsSessionImport?.(...args) === true;
	}
	listWorkspaceSessions(...args) {
		return this.active.listWorkspaceSessions?.(...args);
	}
	readSession(...args) {
		return this.active.readSession?.(...args);
	}
	createSession(...args) {
		return this.active.createSession(...args);
	}
	resumeSession(...args) {
		return this.active.resumeSession(...args);
	}
	sendMessage(...args) {
		return this.active.sendMessage(...args);
	}
	interruptTurn(...args) {
		return this.active.interruptTurn(...args);
	}
	releaseSession(...args) {
		return this.active.releaseSession(...args);
	}
	resolveRequest(...args) {
		return this.active.resolveRequest?.(...args);
	}
	rejectRequest(...args) {
		return this.active.rejectRequest?.(...args);
	}
	close(...args) {
		return this.active.close(...args);
	}
};
function subscribe(emitter, event, listener) {
	emitter.on(event, listener);
	let active = true;
	return () => {
		if (!active) return;
		active = false;
		emitter.off(event, listener);
	};
}
function positiveInteger(value, fallback) {
	return Number.isSafeInteger(value) && value > 0 ? value : fallback;
}
//#endregion
//#region claude-image-output.js
const MEDIA_TYPES = /* @__PURE__ */ new Map([
	[".gif", "image/gif"],
	[".jpeg", "image/jpeg"],
	[".jpg", "image/jpeg"],
	[".png", "image/png"],
	[".webp", "image/webp"]
]);
const IMAGE_SUFFIX = String.raw`\.(?:png|jpe?g|webp|gif|bmp|svg|tiff?|avif|heic)`;
const IMAGE_PATH_END = new RegExp(`${IMAGE_SUFFIX}$`, "i");
const BARE_PATH_BOUNDARY = String.raw`[\s(\[{:*=~（【《「『“‘，。；：！？、]`;
const BARE_PATH_END_CHAR = String.raw`[\s)\]}>,;:!?*~，。；：！？、）】》」』”’]`;
const BARE_PATH_END = String.raw`(?:${BARE_PATH_END_CHAR}|\.(?=$|${BARE_PATH_END_CHAR}))`;
const BARE_PATH_CONTENT = String.raw`[^\s<>"'“”‘’「」『』*~()\[\]{}=:,;!?，。；：！？、（）【】《》]+?`;
const MARKDOWN_PATH = new RegExp(String.raw`!?\[[^\]\r\n]*\]\(\s*(?:<([^>]+)>|([^\s)]+))(?:\s+["'][^"']*["'])?\s*\)`, "gi");
const INLINE_CODE_PATH = new RegExp("`([^`\\r\\n]+" + IMAGE_SUFFIX + ")`", "gi");
const QUOTED_PATH = new RegExp("[\"']([^\"'\\r\\n]+" + IMAGE_SUFFIX + ")[\"']", "gi");
const URI_REFERENCE = /(?!(?:[a-z]:[\\/]))(?:[a-z][a-z0-9+.-]*:\/\/|data:|file:|blob:|mailto:|\/\/)[^\s<>"'“”‘’]+/gi;
const SVG_EXTENSION = ".svg";
const SVG_SOURCE_MAX_BYTES = 2 * 1024 * 1024;
const SVG_RASTER_DENSITY = 72;
const SVG_RASTER_TIMEOUT_SECONDS = 3;
const DEFAULT_MAX_IMAGE_PIXELS = 64e6;
const DEFAULT_MAX_IMAGE_DIMENSION = 8192;
function extractFinalAnswerImagePaths(text) {
	const visible = withoutFencedCode(String(text ?? ""));
	const matches = [];
	collectMatches(matches, visible, MARKDOWN_PATH, 1, 2);
	collectMatches(matches, visible, INLINE_CODE_PATH, 1);
	collectMatches(matches, visible, QUOTED_PATH, 1);
	collectMatches(matches, maskMatches(visible, MARKDOWN_PATH, INLINE_CODE_PATH, QUOTED_PATH, URI_REFERENCE), new RegExp(String.raw`(?:^|${BARE_PATH_BOUNDARY})((?:[a-z]:[\\/])?${BARE_PATH_CONTENT}${IMAGE_SUFFIX})(?=$|${BARE_PATH_END})`, "gi"), 1);
	matches.sort((left, right) => left.index - right.index);
	const seen = /* @__PURE__ */ new Set();
	return matches.flatMap(({ path }) => {
		const normalized = normalizeMention(path);
		if (!normalized || !IMAGE_PATH_END.test(normalized) || isRemoteReference(normalized) || seen.has(normalized)) return [];
		seen.add(normalized);
		return [normalized];
	});
}
async function promoteFinalAnswerImages({ text, cwd, attachments, structuredImages = [], structuredImageData = [], signal, svgRasterizer = rasterizeSvgToPng }) {
	const paths = extractFinalAnswerImagePaths(text);
	if (paths.length === 0) {
		const images = [...structuredImages];
		const failures = [];
		for (const [index, image] of deduplicateStructuredImages(structuredImageData).entries()) try {
			images.push(await saveStructuredImage({
				...image,
				id: image.id ?? `structured-${index}`
			}, attachments, signal));
		} catch (error) {
			if (signal?.aborted) throw signal.reason ?? error;
			failures.push(failure(image.name ?? `Claude structured image ${index + 1}`, error.code ?? "CLAUDE_IMAGE_OUTPUT_IMPORT_FAILED", error.message ?? "the structured image could not be imported"));
		}
		const admitted = applyOutputLimits(deduplicateAttachments(images), attachments);
		return {
			paths,
			images: admitted.images,
			failures: [...failures, ...admitted.failures]
		};
	}
	if (typeof attachments?.saveImage !== "function") return {
		paths,
		images: [],
		failures: paths.map((path) => failure(path, "CLAUDE_IMAGE_OUTPUT_ATTACHMENTS_UNAVAILABLE", "the DSH attachment service is unavailable"))
	};
	const images = [];
	const failures = [];
	for (const path of paths) {
		signal?.throwIfAborted();
		try {
			images.push(await snapshotWorkspaceImage(path, cwd, attachments, signal, svgRasterizer));
		} catch (error) {
			if (signal?.aborted) throw signal.reason ?? error;
			failures.push(failure(path, error.code ?? "CLAUDE_IMAGE_OUTPUT_IMPORT_FAILED", outputFailureReason(error)));
		}
	}
	const admitted = applyOutputLimits(deduplicateAttachments(images), attachments);
	return {
		paths,
		images: admitted.images,
		failures: [...failures, ...admitted.failures]
	};
}
async function saveStructuredImage(image, attachments, signal) {
	signal?.throwIfAborted();
	if (typeof attachments?.saveImage !== "function") throw outputImageError("the DSH attachment service is unavailable", "CLAUDE_IMAGE_OUTPUT_ATTACHMENTS_UNAVAILABLE");
	if (!MEDIA_TYPES.has(extensionForMediaType(image?.mediaType)) || typeof image?.data !== "string") throw outputImageError("Claude returned invalid structured image data", "CLAUDE_IMAGE_OUTPUT_INVALID");
	const data = decodeBase64(image.data);
	return attachments.saveImage({
		data,
		mediaType: image.mediaType,
		name: image.name ?? `claude-${image.id ?? "image"}.${extensionForMediaType(image.mediaType).slice(1)}`
	});
}
async function materializeDshToolImages(result, attachments, signal) {
	const content = [];
	const attachmentsFound = [];
	for (const block of result?.content ?? []) {
		if (block?.type !== "image" || !block.attachment) {
			content.push(block);
			continue;
		}
		signal?.throwIfAborted();
		if (typeof attachments?.readImage !== "function") throw outputImageError("the DSH attachment service is unavailable", "CLAUDE_IMAGE_OUTPUT_ATTACHMENTS_UNAVAILABLE");
		const stored = await attachments.readImage(block.attachment, signal);
		if (!(stored?.data instanceof Uint8Array) || !stored?.ref?.mediaType) throw outputImageError("the DSH attachment store returned invalid image data", "CLAUDE_IMAGE_OUTPUT_INVALID");
		attachmentsFound.push(stored.ref);
		content.push({
			type: "image",
			data: Buffer.from(stored.data).toString("base64"),
			mediaType: stored.ref.mediaType
		});
	}
	return {
		result: {
			...result,
			content
		},
		attachments: attachmentsFound
	};
}
async function snapshotWorkspaceImage(path, cwd, attachments, signal, svgRasterizer) {
	const root = await realpath(resolve(cwd ?? process.cwd()));
	const target = await realpath(resolve(root, path));
	const targetRelative = relative(root, target);
	if (targetRelative === ".." || targetRelative.startsWith(`..${sep}`) || isAbsolute(targetRelative)) throw outputImageError("the path is outside the session workspace", "CLAUDE_IMAGE_OUTPUT_OUTSIDE_WORKSPACE");
	const extension = extname(target).toLowerCase();
	const mediaType = MEDIA_TYPES.get(extension);
	const isSvg = extension === SVG_EXTENSION;
	if (!mediaType && !isSvg) throw outputImageError("the image type is unsupported", "CLAUDE_IMAGE_OUTPUT_TYPE_UNSUPPORTED");
	const handle = await open(target, "r");
	let data;
	try {
		const before = await handle.stat();
		if (!before.isFile()) throw outputImageError("the path is not a file", "CLAUDE_IMAGE_OUTPUT_NOT_FILE");
		const configuredMaxBytes = attachments.imageLimits?.maxImageBytes;
		const maxBytes = isSvg ? Math.min(validLimit(configuredMaxBytes, Number.POSITIVE_INFINITY), SVG_SOURCE_MAX_BYTES) : configuredMaxBytes;
		if (Number.isSafeInteger(maxBytes) && before.size > maxBytes) throw outputImageError("the image exceeds the configured size limit", "CLAUDE_IMAGE_OUTPUT_TOO_LARGE");
		signal?.throwIfAborted();
		data = await handle.readFile();
		signal?.throwIfAborted();
		const [after, pathAfter, realPathAfter] = await Promise.all([
			handle.stat(),
			stat(target),
			realpath(target)
		]);
		if (before.size !== after.size || before.mtimeMs !== after.mtimeMs || before.ctimeMs !== after.ctimeMs || before.ino !== after.ino || after.ino !== pathAfter.ino || after.dev !== pathAfter.dev || data.byteLength !== after.size || realPathAfter !== target) throw outputImageError("the image changed while Claude was finishing its answer", "CLAUDE_IMAGE_OUTPUT_CHANGED_DURING_READ");
	} finally {
		await handle.close();
	}
	if (isSvg) {
		const rendered = await svgRasterizer(data, svgRasterLimits(attachments), signal);
		return attachments.saveImage({
			data: rendered,
			mediaType: "image/png",
			name: `${basename(target, extension)}.png`
		});
	}
	return attachments.saveImage({
		data,
		mediaType,
		name: basename(target)
	});
}
async function rasterizeSvgToPng(data, limits = {}, signal) {
	signal?.throwIfAborted();
	const maxPixels = validLimit(limits.maxPixels, DEFAULT_MAX_IMAGE_PIXELS);
	const maxDimension = validLimit(limits.maxDimension, DEFAULT_MAX_IMAGE_DIMENSION);
	const maxBytes = validLimit(limits.maxBytes, Number.POSITIVE_INFINITY);
	try {
		const pipeline = sharp(data, {
			density: SVG_RASTER_DENSITY,
			failOn: "error",
			limitInputPixels: maxPixels,
			sequentialRead: true,
			unlimited: false
		}).timeout({ seconds: SVG_RASTER_TIMEOUT_SECONDS });
		validateSvgMetadata(await pipeline.metadata(), maxPixels, maxDimension);
		signal?.throwIfAborted();
		const { data: png, info } = await pipeline.png({
			adaptiveFiltering: true,
			compressionLevel: 9
		}).toBuffer({ resolveWithObject: true });
		signal?.throwIfAborted();
		validateRasterDimensions(info.width, info.height, maxPixels, maxDimension);
		if (png.byteLength > maxBytes) throw outputImageError("the converted PNG exceeds the configured size limit", "CLAUDE_IMAGE_OUTPUT_TOO_LARGE");
		return png;
	} catch (error) {
		if (signal?.aborted) throw signal.reason ?? error;
		if (error?.code?.startsWith("CLAUDE_IMAGE_OUTPUT_")) throw error;
		if (/timeout/i.test(error?.message ?? "")) throw outputImageError("SVG conversion exceeded the time limit", "CLAUDE_IMAGE_OUTPUT_SVG_TIMEOUT");
		if (/pixel limit|dimensions? exceed|width or height/i.test(error?.message ?? "")) throw outputImageError("the SVG exceeds the configured pixel dimensions", "CLAUDE_IMAGE_OUTPUT_SVG_DIMENSIONS");
		throw outputImageError("the SVG is invalid or cannot be rendered safely", "CLAUDE_IMAGE_OUTPUT_SVG_INVALID");
	}
}
function svgRasterLimits(attachments) {
	return {
		maxBytes: validLimit(attachments?.imageLimits?.maxImageBytes, Number.POSITIVE_INFINITY),
		maxPixels: validLimit(attachments?.imageLimits?.maxImagePixels, DEFAULT_MAX_IMAGE_PIXELS),
		maxDimension: validLimit(attachments?.imageLimits?.maxImageDimension, DEFAULT_MAX_IMAGE_DIMENSION)
	};
}
function validateSvgMetadata(metadata, maxPixels, maxDimension) {
	if (metadata?.format !== "svg") throw outputImageError("the file extension is SVG but its content is not", "CLAUDE_IMAGE_OUTPUT_SVG_INVALID");
	validateRasterDimensions(metadata.width, metadata.height, maxPixels, maxDimension);
}
function validateRasterDimensions(width, height, maxPixels, maxDimension) {
	if (!Number.isSafeInteger(width) || width <= 0 || !Number.isSafeInteger(height) || height <= 0) throw outputImageError("the SVG does not have valid pixel dimensions", "CLAUDE_IMAGE_OUTPUT_SVG_INVALID");
	if (width > maxDimension || height > maxDimension || width * height > maxPixels) throw outputImageError("the SVG exceeds the configured pixel dimensions", "CLAUDE_IMAGE_OUTPUT_SVG_DIMENSIONS");
}
function validLimit(value, fallback) {
	return Number.isSafeInteger(value) && value > 0 ? value : fallback;
}
function collectMatches(matches, text, expression, ...groups) {
	for (const match of text.matchAll(expression)) {
		const group = groups.find((index) => match[index] !== void 0);
		if (group === void 0) continue;
		matches.push({
			index: match.index + match[0].indexOf(match[group]),
			path: match[group]
		});
	}
}
function withoutFencedCode(text) {
	return text.replace(/(^|\n)[ \t]*(```|~~~)[^\n]*\n[\s\S]*?(?:\n[ \t]*\2(?=\n|$)|$)/g, (match) => match.replace(/[^\n]/g, " "));
}
function maskMatches(text, ...expressions) {
	return expressions.reduce((masked, expression) => masked.replace(expression, (match) => match.replace(/[^\n]/g, " ")), text);
}
function normalizeMention(path) {
	return String(path ?? "").trim().replace(/^<|>$/g, "");
}
function isRemoteReference(path) {
	if (/^[a-z]:[\\/]/i.test(path)) return false;
	return /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(path);
}
function deduplicateAttachments(images) {
	const seen = /* @__PURE__ */ new Set();
	return images.flatMap((attachment) => {
		const id = attachment?.attachmentId;
		if (!id || seen.has(String(id))) return [];
		seen.add(String(id));
		return [attachment];
	});
}
function deduplicateStructuredImages(images) {
	const seen = /* @__PURE__ */ new Set();
	return images.flatMap((image) => {
		const key = `${image?.mediaType}:${image?.data}`;
		if (seen.has(key)) return [];
		seen.add(key);
		return [image];
	});
}
function applyOutputLimits(images, attachments) {
	const maxImages = attachments?.imageLimits?.maxImagesPerMessage;
	const maxBytes = attachments?.imageLimits?.maxMessageImageBytes;
	const accepted = [];
	const failures = [];
	let bytes = 0;
	for (const attachment of images) {
		if (Number.isSafeInteger(maxImages) && accepted.length >= maxImages) {
			failures.push(failure(attachment.name ?? String(attachment.attachmentId), "CLAUDE_IMAGE_OUTPUT_COUNT_LIMIT", "the image count exceeds the configured message limit"));
			continue;
		}
		if (Number.isSafeInteger(maxBytes) && bytes + attachment.bytes > maxBytes) {
			failures.push(failure(attachment.name ?? String(attachment.attachmentId), "CLAUDE_IMAGE_OUTPUT_MESSAGE_TOO_LARGE", "the images exceed the configured message byte limit"));
			continue;
		}
		accepted.push(attachment);
		bytes += attachment.bytes;
	}
	return {
		images: accepted,
		failures
	};
}
function decodeBase64(encoded) {
	const compact = encoded.replace(/\s/g, "");
	if (!compact || !/^[A-Za-z0-9+/]+={0,2}$/.test(compact) || compact.length % 4 !== 0) throw outputImageError("Claude returned invalid Base64 image data", "CLAUDE_IMAGE_OUTPUT_INVALID");
	const data = Buffer.from(compact, "base64");
	if (data.length === 0 || data.toString("base64").replace(/=+$/, "") !== compact.replace(/=+$/, "")) throw outputImageError("Claude returned invalid Base64 image data", "CLAUDE_IMAGE_OUTPUT_INVALID");
	return data;
}
function extensionForMediaType(mediaType) {
	if (mediaType === "image/jpeg") return ".jpg";
	if (typeof mediaType !== "string" || !mediaType.startsWith("image/")) return "";
	return `.${mediaType.slice(6)}`;
}
function failure(path, code, reason) {
	return {
		path,
		code,
		reason
	};
}
function outputFailureReason(error) {
	if (error?.code === "ENOENT") return "the file does not exist";
	if (error?.code === "EACCES") return "the file cannot be read";
	return error?.message ?? "the image could not be imported";
}
function outputImageError(message, code) {
	return Object.assign(new Error(message), { code });
}
//#endregion
//#region claude-adapter.js
const CLAUDE_PRESET = "relay-claude";
const CLAUDE_PROVIDER = "relay-claude";
const CLAUDE_ACTIVITY_EVENT = "relay-claude/activity";
const IMPORT_STATES = Object.freeze([
	"reserved",
	"session-created",
	"hydrated",
	"attached",
	"committed"
]);
var ClaudeDshAdapter = class extends LlmAdapter {
	constructor({ runtime, ready, linkStore = null, attachments = null, logger = console }) {
		super();
		this.runtime = runtime;
		this.ready = ready;
		this.logger = logger;
		this.linkStore = linkStore;
		this.attachments = attachments;
		this.links = /* @__PURE__ */ new Map();
		this.settings = /* @__PURE__ */ new Map();
		this.bindingModes = /* @__PURE__ */ new Map();
		this.importStates = /* @__PURE__ */ new Map();
		this.pendingSessions = /* @__PURE__ */ new Map();
		this.agents = /* @__PURE__ */ new Map();
		for (const [sessionId, record] of linkStore?.entries() ?? []) {
			const claudeSessionId = record.claudeSessionId ?? record.sessionId ?? record.threadId;
			if (claudeSessionId) this.links.set(sessionId, claudeSessionId);
			this.settings.set(sessionId, record.config);
			this.bindingModes.set(sessionId, record.bindingMode === "imported" ? "imported" : "native");
			if (record.bindingMode === "imported" && IMPORT_STATES.includes(record.importState)) this.importStates.set(sessionId, record.importState);
		}
	}
	providerInfo() {
		return {
			id: CLAUDE_PROVIDER,
			name: "Claude Code"
		};
	}
	async listModels() {
		await this.ready;
		return runtimeModels(this.runtime).sort((left, right) => Number(Boolean(right.isDefault)) - Number(Boolean(left.isDefault))).map((model) => ({
			provider: CLAUDE_PROVIDER,
			id: model.id,
			name: model.displayName ?? model.id,
			description: model.description,
			inputModalities: model.inputModalities ?? ["text"]
		}));
	}
	async resolveModel(provider, model) {
		await this.ready;
		const info = runtimeModels(this.runtime).find((candidate) => candidate.id === model);
		return {
			provider,
			id: model,
			name: info?.displayName ?? model,
			inputModalities: info?.inputModalities ?? ["text"],
			...Array.isArray(info?.supportedReasoningEfforts) ? { reasoning: {
				efforts: info.supportedReasoningEfforts.map((effort) => ({
					id: effort.reasoningEffort ?? effort.id ?? effort,
					name: reasoningEffortName(effort.reasoningEffort ?? effort.id ?? effort)
				})),
				defaultEffort: info.defaultReasoningEffort
			} } : {}
		};
	}
	attachAgent(agent, requestedPreset = effectivePreset(agent.session)) {
		this.agents.set(String(agent.id), agent);
		if (requestedPreset !== "relay-claude") return false;
		this.configuration(agent.id, agent.session.header.cwd);
		return true;
	}
	servesAgent(agent) {
		return effectivePreset(agent.session) === CLAUDE_PRESET;
	}
	detachAgent(sessionId) {
		this.agents.delete(String(sessionId));
	}
	configuration(sessionId, cwd) {
		const key = String(sessionId);
		const existing = this.settings.get(key);
		if (existing) return existing;
		const models = runtimeModels(this.runtime);
		const model = models.find((candidate) => candidate.isDefault) ?? models[0];
		const config = {
			model: model?.id ?? "sonnet",
			effort: model?.defaultReasoningEffort ?? "medium",
			sandbox: "workspace-write",
			approvalPolicy: "on-request",
			cwd: cwd ?? process.cwd(),
			settingSources: [
				"user",
				"project",
				"local"
			],
			systemPrompt: {
				type: "preset",
				preset: "claude_code"
			}
		};
		this.settings.set(key, config);
		return config;
	}
	configure(sessionId, patch = {}) {
		const key = String(sessionId);
		const next = {
			...this.configuration(key),
			...compact(patch)
		};
		this.settings.set(key, next);
		const claudeSessionId = this.links.get(key);
		if (claudeSessionId) patchRuntimeSession(this.runtime, claudeSessionId, next);
		this.persistLink(key);
		return structuredClone(next);
	}
	async ensureSession(sessionId) {
		const key = String(sessionId);
		const pending = this.pendingSessions.get(key);
		if (pending) return pending;
		const operation = this.createOrResumeSession(key).finally(() => {
			this.pendingSessions.delete(key);
		});
		this.pendingSessions.set(key, operation);
		return operation;
	}
	async createOrResumeSession(sessionId) {
		await this.ready;
		const settings = { ...this.configuration(sessionId) };
		const linked = this.links.get(sessionId);
		if (linked && hasRuntimeSession(this.runtime, linked)) return linked;
		if (linked) try {
			await this.runtime.resumeSession(linked, settings);
			return linked;
		} catch (error) {
			if (this.bindingModes.get(sessionId) === "imported") throw Object.assign(new Error(`Relay could not resume imported Claude Session ${linked}`, { cause: error }), {
				code: "CLAUDE_IMPORTED_SESSION_RESUME_FAILED",
				claudeSessionId: linked
			});
			this.logger.warn(`Relay could not resume Claude session ${linked}; creating a replacement: ${error.message}`);
			this.links.delete(sessionId);
		}
		const created = await this.runtime.createSession(settings);
		this.links.set(sessionId, created.id);
		this.bindingModes.set(sessionId, "native");
		this.persistLink(sessionId);
		return created.id;
	}
	persistLink(sessionId) {
		this.linkStore?.set(sessionId, {
			claudeSessionId: this.links.get(sessionId) ?? null,
			config: this.configuration(sessionId),
			bindingMode: this.bindingModes.get(sessionId) ?? "native",
			...this.importStates.has(sessionId) ? { importState: this.importStates.get(sessionId) } : {}
		});
	}
	sessionFor(sessionId) {
		return this.links.get(String(sessionId)) ?? null;
	}
	dshSessionForClaudeSession(claudeSessionId) {
		for (const [sessionId, candidate] of this.links) if (candidate === claudeSessionId) return sessionId;
		return null;
	}
	bindingForClaudeSession(claudeSessionId) {
		const sessionId = this.dshSessionForClaudeSession(claudeSessionId);
		if (!sessionId) return null;
		return {
			sessionId,
			claudeSessionId,
			config: structuredClone(this.configuration(sessionId)),
			bindingMode: this.bindingModes.get(sessionId) ?? "native",
			importState: this.importStates.get(sessionId) ?? null
		};
	}
	bindImportedSession(sessionId, claudeSessionId, config = {}) {
		const key = String(sessionId).trim();
		const source = String(claudeSessionId).trim();
		if (!key) throw new Error("DSH sessionId is required for an imported Claude binding");
		if (!source) throw new Error("Claude sessionId is required for an imported binding");
		const owner = this.dshSessionForClaudeSession(source);
		if (owner && owner !== key) throw new Error(`Claude Session ${source} is already bound to DSH session ${owner}`);
		const current = this.links.get(key);
		if (current && current !== source) throw new Error(`DSH session ${key} is already bound to Claude Session ${current}`);
		this.links.set(key, source);
		this.settings.set(key, {
			...this.configuration(key, config.cwd),
			...compact(config)
		});
		this.bindingModes.set(key, "imported");
		if (!this.importStates.has(key)) this.importStates.set(key, "reserved");
		this.persistLink(key);
		return this.bindingForClaudeSession(source);
	}
	markImportState(sessionId, state) {
		const key = String(sessionId);
		if (this.bindingModes.get(key) !== "imported") throw new Error(`DSH session ${key} is not an imported Claude binding`);
		const next = IMPORT_STATES.indexOf(state);
		if (next === -1) throw new Error(`unknown Claude import state ${state}`);
		if (next > IMPORT_STATES.indexOf(this.importStates.get(key) ?? "reserved")) {
			this.importStates.set(key, state);
			this.persistLink(key);
		}
		return this.bindingForClaudeSession(this.links.get(key));
	}
	async *stream(options) {
		if (options.purpose) {
			yield* this.streamAuxiliary(options);
			return;
		}
		const sessionId = String(options.sessionId ?? "");
		if (!sessionId) throw new Error("Relay Claude adapter requires a DSH session id");
		const candidate = latestUserContent(options.messages, this.attachments, options.signal);
		const content = Array.isArray(candidate) ? candidate : await candidate;
		if (content.length === 0) throw new Error("Relay Claude adapter received no user content");
		const text = content.filter((block) => block.type === "text").map((block) => block.text).join("\n").trim();
		const agent = this.agents.get(sessionId);
		if (!agent) throw new Error(`Relay Claude adapter has no attached agent for ${sessionId}`);
		const nativePermissions = permissionConfiguration(agent.session.events);
		const config = this.configure(sessionId, {
			...options.provider === "relay-claude" ? { model: options.model } : {},
			...options.provider === "relay-claude" ? { effort: options.reasoningEffort } : {},
			...nativePermissions,
			cwd: agent.session.header.cwd
		});
		const dshTools = structuredClone(options.tools ?? []);
		const availableTools = new Set(dshTools.map((tool) => tool.name));
		const structuredImages = [];
		const structuredCallIds = /* @__PURE__ */ new Set();
		const executeDshTool = async ({ name, arguments: args, callId, signal }) => {
			if (!availableTools.has(name)) throw new Error(`DSH tool ${name} is not available for this DSH turn.`);
			if (!agent.ctx?.tools?.execute) throw new Error("The owning DSH Agent has no tool runtime");
			const materialized = await materializeDshToolImages(await agent.ctx.tools.execute({
				callId,
				name,
				arguments: args,
				agent,
				signal: signal ?? options.signal ?? new AbortController().signal
			}), this.attachments, signal ?? options.signal);
			if (materialized.attachments.length > 0) {
				structuredCallIds.add(String(callId));
				structuredImages.push(...materialized.attachments);
			}
			return materialized.result;
		};
		const claudeSessionId = await this.ensureSession(sessionId);
		const queue = new ActivityQueue(options.signal, "Claude");
		const onActivity = (message) => {
			if ((message.params?.sessionId ?? message.params?.session?.id) === claudeSessionId) queue.push(message);
		};
		const stopActivity = subscribeRuntimeActivity(this.runtime, onActivity);
		let turnId = null;
		try {
			turnId = (await this.runtime.sendMessage(claudeSessionId, {
				text,
				content,
				...config,
				dshTools,
				executeDshTool
			})).id;
			const state = createStreamState({
				structuredImages,
				structuredCallIds
			});
			let completedTurn = null;
			while (!completedTurn) {
				const message = await queue.next();
				const params = message.params ?? {};
				if (params.turnId && params.turnId !== turnId) continue;
				if (message.method === "turn/completed") {
					if (params.turn?.id !== turnId) continue;
					for (const item of params.turn.items ?? []) for (const chunk of await this.completeItem(agent, claudeSessionId, turnId, item, state, options.signal)) yield chunk;
					completedTurn = params.turn;
					break;
				}
				for (const chunk of await this.projectActivity(agent, claudeSessionId, turnId, message, state, options.signal)) yield chunk;
			}
			for (const block of state.blocks.values()) {
				if (block.closed) continue;
				block.closed = true;
				yield {
					type: "block-end",
					index: block.index,
					block: {
						type: block.type,
						text: block.text
					}
				};
			}
			if (completedTurn.status === "failed") yield {
				type: "finish",
				reason: {
					kind: "error",
					failure: {
						message: completedTurn.error?.message ?? "Claude turn failed",
						code: "CLAUDE_TURN_FAILED"
					}
				}
			};
			else {
				const promotion = await promoteFinalAnswerImages({
					text: finalAssistantText(state),
					cwd: agent.session.header.cwd,
					attachments: this.attachments,
					structuredImages: state.structuredImages,
					structuredImageData: state.structuredImageData,
					signal: options.signal
				});
				for (const chunk of imageOutputChunks(state, promotion.images, promotion.failures)) yield chunk;
				yield {
					type: "finish",
					reason: { kind: "stop" },
					replayState: {
						claudeSessionId,
						turnId
					}
				};
			}
		} catch (error) {
			if (options.signal?.aborted) {
				if (turnId) await this.runtime.interruptTurn(claudeSessionId, turnId).catch(() => {});
				yield {
					type: "finish",
					reason: {
						kind: "aborted",
						failure: {
							message: "Claude turn cancelled",
							code: "ABORTED"
						}
					}
				};
				return;
			}
			throw error;
		} finally {
			stopActivity();
			queue.close();
		}
	}
	async *streamAuxiliary(options) {
		await this.ready;
		const text = auxiliaryInput(options.messages);
		if (!text) throw new Error(`Relay Claude adapter received no ${options.purpose} input`);
		const sessionId = String(options.sessionId ?? "");
		const cwd = this.agents.get(sessionId)?.session.header.cwd ?? this.settings.get(sessionId)?.cwd ?? process.cwd();
		const claudeSessionId = (await this.runtime.createSession({
			model: options.model,
			effort: options.reasoningEffort,
			sandbox: "read-only",
			approvalPolicy: "never",
			cwd,
			ephemeral: true,
			settingSources: ["user"],
			systemPrompt: options.system,
			plugins: []
		})).id;
		const queue = new ActivityQueue(options.signal, "Claude");
		const onActivity = (message) => {
			if ((message.params?.sessionId ?? message.params?.session?.id) === claudeSessionId) queue.push(message);
		};
		const stopActivity = subscribeRuntimeActivity(this.runtime, onActivity);
		let turnId = null;
		try {
			turnId = (await this.runtime.sendMessage(claudeSessionId, {
				text,
				model: options.model,
				effort: options.reasoningEffort,
				sandbox: "read-only",
				approvalPolicy: "never"
			})).id;
			const state = createStreamState();
			let completedTurn = null;
			while (!completedTurn) {
				const message = await queue.next();
				const params = message.params ?? {};
				if (params.turnId && params.turnId !== turnId) continue;
				if (message.method === "turn/completed") {
					if (params.turn?.id !== turnId) continue;
					for (const item of params.turn.items ?? []) for (const chunk of completeAuxiliaryItem(state, item)) yield chunk;
					completedTurn = params.turn;
					break;
				}
				for (const chunk of projectAuxiliaryActivity(message, state)) yield chunk;
			}
			for (const block of state.blocks.values()) {
				if (block.closed) continue;
				block.closed = true;
				yield {
					type: "block-end",
					index: block.index,
					block: {
						type: block.type,
						text: block.text
					}
				};
			}
			yield completedTurn.status === "failed" ? {
				type: "finish",
				reason: {
					kind: "error",
					failure: {
						message: completedTurn.error?.message ?? `Claude ${options.purpose} failed`,
						code: "CLAUDE_AUXILIARY_FAILED"
					}
				}
			} : {
				type: "finish",
				reason: { kind: "stop" }
			};
		} finally {
			stopActivity();
			queue.close();
			await this.runtime.releaseSession(claudeSessionId);
		}
	}
	async projectActivity(agent, claudeSessionId, turnId, message, state, signal) {
		const params = message.params ?? {};
		if (message.method === "item/reasoning/summaryTextDelta" || message.method === "item/reasoning/textDelta") return textDelta(state, params.itemId, "reasoning", params.delta ?? "");
		if (message.method === "item/agentMessage/delta") return textDelta(state, params.itemId, "text", params.delta ?? "");
		if (message.method === "item/started") {
			if (isActivityItem(params.item)) this.appendActivity(agent, claudeSessionId, turnId, params.item, "started", state);
			return [];
		}
		if (message.method === "item/completed") return this.completeItem(agent, claudeSessionId, turnId, params.item, state, signal);
		return [];
	}
	async completeItem(agent, claudeSessionId, turnId, item, state, signal) {
		if (!item?.id || state.completed.has(item.id)) return [];
		state.completed.add(item.id);
		if (item.type === "reasoning") return completeTextItem(state, item.id, "reasoning", reasoningText(item));
		if (item.type === "agentMessage") return completeTextItem(state, item.id, "text", item.text ?? "");
		if (isActivityItem(item)) this.appendActivity(agent, claudeSessionId, turnId, item, "completed", state);
		if (Array.isArray(item.images) && !state.structuredCallIds.has(String(item.id))) for (const [index, image] of item.images.entries()) state.structuredImageData.push({
			...image,
			id: `${item.id}-${index}`
		});
		return [];
	}
	appendActivity(agent, claudeSessionId, turnId, item, phase, state) {
		const previous = state.activityItems.get(item.id) ?? {};
		const merged = {
			...previous,
			...item,
			input: item.input ?? previous.input,
			arguments: item.arguments ?? previous.arguments,
			name: item.name ?? previous.name,
			tool: item.tool ?? previous.tool
		};
		state.activityItems.set(item.id, merged);
		if (!state.startedActivities.has(item.id)) {
			state.startedActivities.add(item.id);
			agent.session.append(CLAUDE_ACTIVITY_EVENT, activityPayload(claudeSessionId, turnId, merged, "started"));
		}
		if (phase === "completed" && !state.completedActivities.has(item.id)) {
			state.completedActivities.add(item.id);
			agent.session.append(CLAUDE_ACTIVITY_EVENT, activityPayload(claudeSessionId, turnId, merged, "completed"));
		}
	}
};
var ActivityQueue = class {
	constructor(signal, label) {
		this.signal = signal;
		this.label = label;
		this.values = [];
		this.waiters = [];
		this.closed = false;
	}
	push(value) {
		if (this.closed) return;
		const waiter = this.waiters.shift();
		if (waiter) waiter.resolve(value);
		else this.values.push(value);
	}
	next() {
		if (this.values.length) return Promise.resolve(this.values.shift());
		if (this.closed) return Promise.reject(/* @__PURE__ */ new Error(`${this.label} activity stream closed`));
		if (this.signal?.aborted) return Promise.reject(this.signal.reason ?? /* @__PURE__ */ new Error("aborted"));
		return new Promise((resolve, reject) => {
			const waiter = {
				resolve,
				reject
			};
			this.waiters.push(waiter);
			if (this.signal) {
				const abort = () => {
					const index = this.waiters.indexOf(waiter);
					if (index >= 0) this.waiters.splice(index, 1);
					reject(this.signal.reason ?? /* @__PURE__ */ new Error("aborted"));
				};
				this.signal.addEventListener("abort", abort, { once: true });
				waiter.resolve = (value) => {
					this.signal.removeEventListener("abort", abort);
					resolve(value);
				};
			}
		});
	}
	close() {
		this.closed = true;
		for (const waiter of this.waiters.splice(0)) waiter.reject(/* @__PURE__ */ new Error(`${this.label} activity stream closed`));
	}
};
function createStreamState({ structuredImages = [], structuredCallIds = /* @__PURE__ */ new Set() } = {}) {
	return {
		nextIndex: 0,
		blocks: /* @__PURE__ */ new Map(),
		completed: /* @__PURE__ */ new Set(),
		activityItems: /* @__PURE__ */ new Map(),
		startedActivities: /* @__PURE__ */ new Set(),
		completedActivities: /* @__PURE__ */ new Set(),
		structuredImages,
		structuredImageData: [],
		structuredCallIds
	};
}
function textDelta(state, id, type, delta) {
	if (!id || !delta) return [];
	let block = state.blocks.get(id);
	const chunks = [];
	if (!block) {
		block = {
			index: state.nextIndex++,
			type,
			text: "",
			closed: false
		};
		state.blocks.set(id, block);
		chunks.push({
			type: "block-start",
			index: block.index,
			blockType: type
		});
	}
	if (block.closed) return chunks;
	block.text += delta;
	chunks.push({
		type: type === "reasoning" ? "reasoning-delta" : "text-delta",
		index: block.index,
		text: delta
	});
	return chunks;
}
function completeTextItem(state, id, type, completeText) {
	const chunks = [];
	let block = state.blocks.get(id);
	if (!block) {
		block = {
			index: state.nextIndex++,
			type,
			text: "",
			closed: false
		};
		state.blocks.set(id, block);
		chunks.push({
			type: "block-start",
			index: block.index,
			blockType: type
		});
	}
	if (completeText && completeText.startsWith(block.text) && completeText.length > block.text.length) {
		const delta = completeText.slice(block.text.length);
		block.text = completeText;
		chunks.push({
			type: type === "reasoning" ? "reasoning-delta" : "text-delta",
			index: block.index,
			text: delta
		});
	}
	if (!block.closed) {
		block.closed = true;
		chunks.push({
			type: "block-end",
			index: block.index,
			block: {
				type,
				text: block.text
			}
		});
	}
	return chunks;
}
function finalAssistantText(state) {
	return [...state.blocks.values()].filter((block) => block.type === "text" && block.text.trim()).sort((left, right) => right.index - left.index)[0]?.text ?? "";
}
function imageOutputChunks(state, images, failures) {
	const chunks = [];
	if (failures.length > 0) {
		const text = failures.map(({ path, reason }) => `Image preview unavailable for ${JSON.stringify(path)}: ${reason}.`).join("\n");
		const index = state.nextIndex++;
		chunks.push({
			type: "block-start",
			index,
			blockType: "text"
		}, {
			type: "text-delta",
			index,
			text
		}, {
			type: "block-end",
			index,
			block: {
				type: "text",
				text
			}
		});
	}
	for (const attachment of images) {
		const index = state.nextIndex++;
		chunks.push({
			type: "block-start",
			index,
			blockType: "image"
		}, {
			type: "block-end",
			index,
			block: {
				type: "image",
				attachment
			}
		});
	}
	return chunks;
}
function activityPayload(claudeSessionId, turnId, item, phase) {
	const activity = normalizeActivity(item, phase);
	return {
		version: 1,
		claudeSessionId,
		turnId,
		itemId: String(item.id),
		phase,
		activity
	};
}
function normalizeActivity(item, phase) {
	const type = String(item.type ?? "toolUse");
	return bounded({
		type,
		status: phase === "started" ? "running" : item.status === "failed" ? "error" : "completed",
		title: item.tool ?? item.name ?? humanize(type),
		summary: summarizeValue(item.arguments ?? item.input ?? item.prompt),
		input: item.arguments ?? item.input,
		output: item.output ?? item.result ?? item.error
	});
}
function bounded(value) {
	return Object.fromEntries(Object.entries(value).flatMap(([key, entry]) => {
		if (entry === void 0 || entry === null || entry === "") return [];
		const text = typeof entry === "string" ? entry : JSON.stringify(entry, null, 2);
		return [[key, text.length > 2e4 ? `${text.slice(0, 2e4)}\n...` : text]];
	}));
}
function isActivityItem(item) {
	return item?.id && ![
		"userMessage",
		"agentMessage",
		"reasoning"
	].includes(item.type);
}
function permissionConfiguration(events) {
	let sandbox = "workspace-write";
	let approvalPolicy = "on-request";
	for (const event of events) {
		if (event.type === "sandbox/mode") sandbox = event.data.mode;
		if (event.type === "approval/policy") approvalPolicy = event.data.policy === "never" ? "never" : "on-request";
		if (event.type === "permission/preset") sandbox = event.data.preset;
	}
	return {
		sandbox,
		approvalPolicy
	};
}
function reasoningText(item) {
	return [...item.summary ?? [], ...item.content ?? []].filter(Boolean).join("\n\n");
}
function summarizeValue(value) {
	if (value === void 0 || value === null) return "";
	return firstLine(typeof value === "string" ? value : JSON.stringify(value));
}
function firstLine(value) {
	return String(value ?? "").split("\n")[0].slice(0, 240);
}
function humanize(value) {
	return String(value).replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (letter) => letter.toUpperCase());
}
function reasoningEffortName(value) {
	return String(value) === "xhigh" ? "Extra high" : humanize(value);
}
function latestUserContent(messages, attachments, signal) {
	for (let index = messages.length - 1; index >= 0; index -= 1) {
		const message = messages[index];
		if (message?.role !== "user") continue;
		if (message.source?.kind !== "user" && !isRelayActivation(message.source)) continue;
		const blocks = message.content ?? [];
		const content = blocks.some((block) => block?.type === "image") ? readClaudeContent(blocks, attachments, signal) : textContent(blocks);
		if (Array.isArray(content) && content.length === 0) continue;
		return content;
	}
	return [];
}
function textContent(blocks) {
	const text = blocks.filter((block) => block?.type === "text").map((block) => String(block.text ?? "")).join("\n").trim();
	return text ? [{
		type: "text",
		text
	}] : [];
}
async function readClaudeContent(blocks, attachments, signal) {
	const content = [];
	for (const block of blocks) {
		if (block?.type === "text" && String(block.text ?? "").trim()) content.push({
			type: "text",
			text: String(block.text)
		});
		if (block?.type === "image") content.push(await readClaudeImage(block, attachments, signal));
	}
	return content;
}
async function readClaudeImage(block, attachments, signal) {
	signal?.throwIfAborted();
	const ref = block?.attachment;
	const id = String(ref?.attachmentId ?? "unknown");
	if (!ref || !CLAUDE_IMAGE_MEDIA_TYPES.has(ref.mediaType)) throw claudeImageError(`Claude cannot read image attachment ${id}: media type ${ref?.mediaType ?? "unknown"} is unsupported.`, "CLAUDE_IMAGE_TYPE_UNSUPPORTED");
	if (typeof attachments?.readImage !== "function") throw claudeImageError(`Claude cannot read image attachment ${id}: the DSH attachment service is unavailable.`, "CLAUDE_IMAGE_ATTACHMENTS_UNAVAILABLE");
	let stored;
	try {
		stored = await attachments.readImage(ref, signal);
	} catch (error) {
		if (signal?.aborted) throw signal.reason ?? error;
		throw claudeImageError(`Claude cannot read image attachment ${id}: the attachment is missing or corrupt.`, "CLAUDE_IMAGE_READ_FAILED", error);
	}
	const mediaType = stored?.ref?.mediaType;
	if (!CLAUDE_IMAGE_MEDIA_TYPES.has(mediaType) || !(stored?.data instanceof Uint8Array)) throw claudeImageError(`Claude cannot read image attachment ${id}: the attachment store returned invalid image data.`, "CLAUDE_IMAGE_READ_FAILED");
	return {
		type: "image",
		mediaType,
		data: Buffer.from(stored.data).toString("base64")
	};
}
function claudeImageError(message, code, cause) {
	return Object.assign(new Error(message, cause ? { cause } : void 0), { code });
}
const CLAUDE_IMAGE_MEDIA_TYPES = /* @__PURE__ */ new Set([
	"image/png",
	"image/jpeg",
	"image/gif",
	"image/webp"
]);
function auxiliaryInput(messages) {
	return messages.map((message) => {
		const text = (message?.content ?? []).filter((block) => block.type === "text").map((block) => block.text).join("\n").trim();
		return text ? `${message.role ?? "user"}: ${text}` : "";
	}).filter(Boolean).join("\n\n");
}
function projectAuxiliaryActivity(message, state) {
	const params = message.params ?? {};
	if (message.method === "item/reasoning/summaryTextDelta" || message.method === "item/reasoning/textDelta") return textDelta(state, params.itemId, "reasoning", params.delta ?? "");
	if (message.method === "item/agentMessage/delta") return textDelta(state, params.itemId, "text", params.delta ?? "");
	if (message.method === "item/completed") return completeAuxiliaryItem(state, params.item);
	return [];
}
function completeAuxiliaryItem(state, item) {
	if (!item?.id || state.completed.has(item.id)) return [];
	state.completed.add(item.id);
	if (item.type === "reasoning") return completeTextItem(state, item.id, "reasoning", reasoningText(item));
	if (item.type === "agentMessage") return completeTextItem(state, item.id, "text", item.text ?? "");
	return [];
}
function isRelayActivation(source) {
	return source?.kind === "plugin" && source.plugin === "relay";
}
function compact(value) {
	return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== void 0 && item !== null));
}
function runtimeModels(runtime) {
	return typeof runtime.listModels === "function" ? runtime.listModels() : [...runtime.models];
}
function hasRuntimeSession(runtime, sessionId) {
	return typeof runtime.hasSession === "function" ? runtime.hasSession(sessionId) : runtime.sessions.has(sessionId);
}
function patchRuntimeSession(runtime, sessionId, patch) {
	if (typeof runtime.patchSession === "function") return runtime.patchSession(sessionId, patch);
	const session = runtime.sessions.get(sessionId);
	if (session) Object.assign(session, patch);
	return Boolean(session);
}
function subscribeRuntimeActivity(runtime, listener) {
	if (typeof runtime.subscribeActivity === "function") return runtime.subscribeActivity(listener);
	runtime.on("activity", listener);
	return () => runtime.off("activity", listener);
}
function effectivePreset(session) {
	for (let index = session.events.length - 1; index >= 0; index -= 1) {
		const event = session.events[index];
		if (event.type === "agent-preset/selected") return event.data.agentPreset;
	}
	return session.header.agentPreset;
}
//#endregion
//#region claude-import.mjs
const IMPORT_STATE_ORDER = Object.freeze([
	"reserved",
	"session-created",
	"hydrated",
	"attached",
	"committed"
]);
var ClaudeWorkspaceImporter = class {
	constructor({ runtime, adapter, target, logger = console }) {
		if (!runtime?.listWorkspaceSessions) throw new Error("Claude import requires Workspace Session inventory");
		if (!adapter?.bindImportedSession) throw new Error("Claude import requires a DSH binding adapter");
		if (![
			"prepare",
			"hydrate",
			"attach",
			"finalize"
		].every((method) => typeof target?.[method] === "function")) throw new Error("Claude import requires a complete DSH Session target");
		this.runtime = runtime;
		this.adapter = adapter;
		this.target = target;
		this.logger = logger;
		this.pendingSessions = /* @__PURE__ */ new Map();
	}
	async scanWorkspace(cwd) {
		const canonicalCwd = await canonicalPath(cwd);
		const discovered = await this.runtime.listWorkspaceSessions({ cwd: canonicalCwd });
		const sessions = [];
		for (const session of discovered) {
			if (!session || typeof session.sessionId !== "string" || typeof session.cwd !== "string" || !session.cwd.trim()) continue;
			const sessionCwd = await canonicalPath(session.cwd);
			if (sessionCwd !== canonicalCwd) continue;
			sessions.push({
				...session,
				cwd: sessionCwd
			});
		}
		sessions.sort(compareInventorySessions);
		const entries = sessions.map((session) => {
			const binding = this.adapter.bindingForClaudeSession(session.sessionId);
			if (!binding) return {
				session,
				binding: null,
				status: "ready"
			};
			if (binding.bindingMode === "imported" && binding.importState !== "committed") return {
				session,
				binding,
				status: "recoverable"
			};
			return {
				session,
				binding,
				status: "existing"
			};
		});
		const existing = entries.filter((entry) => entry.status === "existing").length;
		const recoverable = entries.filter((entry) => entry.status === "recoverable").length;
		return {
			cwd: canonicalCwd,
			entries,
			summary: {
				found: entries.length,
				existing,
				recoverable,
				ready: entries.length - existing
			}
		};
	}
	async importWorkspace(cwd, { sessionIds, onProgress } = {}) {
		const inventory = await this.scanWorkspace(cwd);
		const entries = selectedImportEntries(inventory.entries, sessionIds);
		const result = {
			found: sessionIds === void 0 ? inventory.summary.found : entries.length,
			imported: 0,
			existing: 0,
			failed: 0,
			failures: []
		};
		let completed = 0;
		for (const entry of entries) {
			if (entry.status === "existing") result.existing += 1;
			else try {
				await this.importSession(entry.session, cwd, entry.binding);
				result.imported += 1;
			} catch (error) {
				result.failed += 1;
				const session = shortSessionId(entry.session.sessionId);
				const message = publicErrorMessage(error, entry.session.sessionId, session);
				result.failures.push({
					session,
					message
				});
				this.logger.warn?.(`Claude import failed for ${session}: ${message}`);
			}
			completed += 1;
			onProgress?.({
				completed,
				total: entries.length,
				...result
			});
		}
		return result;
	}
	async importSession(session, workspaceCwd, existingBinding = null) {
		const pending = this.pendingSessions.get(session.sessionId);
		if (pending) return pending;
		const operation = this.runImportSession(session, workspaceCwd, existingBinding).finally(() => {
			this.pendingSessions.delete(session.sessionId);
		});
		this.pendingSessions.set(session.sessionId, operation);
		return operation;
	}
	async runImportSession(session, workspaceCwd, existingBinding = null) {
		const source = await this.runtime.readSession(session.sessionId, { cwd: workspaceCwd });
		if (!source || source.sessionId !== session.sessionId) throw new Error(`Claude Session ${shortSessionId(session.sessionId)} is no longer available in this Workspace`);
		if (await canonicalPath(source.cwd) !== await canonicalPath(workspaceCwd)) throw new Error(`Claude Session ${shortSessionId(session.sessionId)} no longer belongs to this Workspace`);
		let binding = existingBinding;
		if (!binding) {
			const sessionId = importedDshSessionId(session.sessionId);
			binding = this.adapter.bindImportedSession(sessionId, session.sessionId, {
				...this.adapter.configuration(sessionId, session.cwd),
				cwd: session.cwd
			});
		}
		if (binding.bindingMode !== "imported") return binding.sessionId;
		if (binding.importState === "committed") return binding.sessionId;
		let transaction = null;
		try {
			transaction = await this.target.prepare({
				session,
				source,
				binding,
				workspaceCwd
			});
			binding = this.adapter.markImportState(binding.sessionId, "session-created");
			if (before(binding.importState, "hydrated")) {
				await this.target.hydrate(transaction);
				binding = this.adapter.markImportState(binding.sessionId, "hydrated");
			}
			if (before(binding.importState, "attached")) {
				await this.target.attach(transaction);
				binding = this.adapter.markImportState(binding.sessionId, "attached");
			}
			if (before(binding.importState, "committed")) {
				await this.target.finalize(transaction);
				binding = this.adapter.markImportState(binding.sessionId, "committed");
			}
			return binding.sessionId;
		} finally {
			if (transaction !== null) await this.target.release?.(transaction);
		}
	}
};
function importedDshSessionId(sessionId) {
	return `claude-import-${createHash("sha256").update(String(sessionId)).digest("hex").slice(0, 24)}`;
}
function before(current, target) {
	return IMPORT_STATE_ORDER.indexOf(current) < IMPORT_STATE_ORDER.indexOf(target);
}
function compareInventorySessions(left, right) {
	const updated = timestampValue(right.lastModified) - timestampValue(left.lastModified);
	return updated === 0 ? String(left.sessionId).localeCompare(String(right.sessionId)) : updated;
}
function timestampValue(value) {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	const parsed = Date.parse(String(value ?? ""));
	return Number.isFinite(parsed) ? parsed : 0;
}
function selectedImportEntries(entries, sessionIds) {
	if (sessionIds === void 0) return entries;
	if (!Array.isArray(sessionIds) || sessionIds.length === 0) throw new Error("At least one Claude Session must be selected");
	const selected = /* @__PURE__ */ new Set();
	for (const rawId of sessionIds) {
		if (typeof rawId !== "string") throw new Error("Selected Claude Session IDs must be non-empty strings");
		const sessionId = rawId.trim();
		if (!sessionId) throw new Error("Selected Claude Session IDs must be non-empty strings");
		if (selected.has(sessionId)) throw new Error(`Claude Session ${shortSessionId(sessionId)} was selected more than once`);
		selected.add(sessionId);
	}
	const inventory = new Map(entries.map((entry) => [entry.session.sessionId, entry]));
	for (const sessionId of selected) {
		const entry = inventory.get(sessionId);
		if (!entry) throw new Error(`Claude Session ${shortSessionId(sessionId)} is not available in this Workspace`);
		if (entry.status === "existing") throw new Error(`Claude Session ${shortSessionId(sessionId)} is already bound to DSH`);
	}
	return entries.filter((entry) => selected.has(entry.session.sessionId));
}
async function canonicalPath(path) {
	const absolute = resolve(path);
	try {
		return await realpath(absolute);
	} catch {
		return absolute;
	}
}
function shortSessionId(sessionId) {
	const value = String(sessionId);
	return value.length > 12 ? `${value.slice(0, 8)}...${value.slice(-4)}` : value;
}
function publicErrorMessage(error, sessionId, shortId) {
	const message = error?.message ?? String(error);
	return String(message).replaceAll(String(sessionId), shortId);
}
//#endregion
//#region claude-import-contract.mjs
const CLAUDE_IMPORT_PATH = "/api/relay/claude/import";
//#endregion
//#region claude-import-route.js
function registerClaudeImportRoute(ctx, options) {
	return ctx.webServer.register({
		kind: "exact",
		path: CLAUDE_IMPORT_PATH,
		handler: createClaudeImportHandler({
			workspaceRegistry: ctx.workspaceRegistry,
			token: process.env.RELAY_CLAUDE_IMPORT_TOKEN,
			...options
		})
	});
}
function createClaudeImportHandler({ importer, workspaceRegistry, token, maxBodyBytes = 16384 }) {
	if (!importer || !workspaceRegistry) throw new Error("Claude import route requires importer and Workspace registry");
	return async (request, response) => {
		if (request.method !== "POST") {
			writeJson(response, 405, { error: "method_not_allowed" }, { allow: "POST" });
			return;
		}
		if (!authorized(request, token)) {
			writeJson(response, 403, { error: "forbidden" });
			return;
		}
		try {
			const body = await readJson(request, maxBodyBytes);
			const action = body?.action;
			const cwd = requiredString$1(body?.cwd, "cwd");
			if (action !== "scan" && action !== "import") throw new ImportRouteError(400, "action must be scan or import");
			const workspace = await workspaceRegistry.resolveByPath(cwd);
			if (!workspace) throw new ImportRouteError(404, "Workspace is not registered in DSH");
			if (action === "scan") {
				const inventory = await importer.scanWorkspace(workspace.path);
				writeJson(response, 200, {
					workspace: {
						title: workspace.title,
						path: workspace.path
					},
					summary: inventory.summary,
					candidates: publicCandidates(inventory.entries)
				});
				return;
			}
			const sessionIds = optionalSessionIds(body?.sessionIds);
			response.writeHead(200, {
				"content-type": "application/x-ndjson; charset=utf-8",
				"cache-control": "no-store",
				"x-content-type-options": "nosniff"
			});
			try {
				writeLine(response, {
					type: "complete",
					result: await importer.importWorkspace(workspace.path, {
						sessionIds,
						onProgress: (progress) => writeLine(response, {
							type: "progress",
							...progress
						})
					})
				});
			} catch (error) {
				writeLine(response, {
					type: "error",
					error: "import_failed",
					message: error?.message ?? String(error)
				});
			}
			response.end();
		} catch (error) {
			const status = error instanceof ImportRouteError ? error.statusCode : 500;
			writeJson(response, status, {
				error: status === 413 ? "payload_too_large" : status === 404 ? "workspace_not_found" : status < 500 ? "invalid_request" : "import_failed",
				message: error?.message ?? String(error)
			});
		}
	};
}
async function readJson(request, maxBodyBytes) {
	if (String(request.headers?.["content-type"] ?? "").split(";", 1)[0].trim() !== "application/json") throw new ImportRouteError(400, "content-type must be application/json");
	const chunks = [];
	let size = 0;
	for await (const chunk of request) {
		const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
		size += buffer.length;
		if (size > maxBodyBytes) throw new ImportRouteError(413, `request exceeds ${maxBodyBytes} bytes`);
		chunks.push(buffer);
	}
	if (size === 0) throw new ImportRouteError(400, "request body is empty");
	try {
		return JSON.parse(Buffer.concat(chunks).toString("utf8"));
	} catch {
		throw new ImportRouteError(400, "request body is not valid JSON");
	}
}
function authorized(request, token) {
	if (isLoopback(request.socket?.remoteAddress)) return true;
	if (!token) return false;
	const authorization = String(request.headers?.authorization ?? "");
	if (!authorization.startsWith("Bearer ")) return false;
	const supplied = Buffer.from(authorization.slice(7));
	const expected = Buffer.from(String(token));
	return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}
function isLoopback(address) {
	return address === "127.0.0.1" || address === "::1" || address === "::ffff:127.0.0.1";
}
function requiredString$1(value, name) {
	if (typeof value !== "string" || !value.trim()) throw new ImportRouteError(400, `${name} is required`);
	return value.trim();
}
function optionalSessionIds(value) {
	if (value === void 0) return void 0;
	if (!Array.isArray(value) || value.length === 0 || value.length > 100) throw new ImportRouteError(400, "sessionIds must contain between 1 and 100 IDs");
	const ids = value.map((sessionId) => requiredString$1(sessionId, "sessionId"));
	if (new Set(ids).size !== ids.length) throw new ImportRouteError(400, "sessionIds must be unique");
	return ids;
}
function publicCandidates(entries = []) {
	return entries.filter((entry) => entry.status === "ready" || entry.status === "recoverable").map(({ session, status }) => ({
		id: session.sessionId,
		title: publicSessionTitle(session),
		cwd: session.cwd,
		updatedAt: session.lastModified ?? session.createdAt ?? null,
		status
	}));
}
function publicSessionTitle(session) {
	for (const value of [
		session.customTitle,
		session.summary,
		session.firstPrompt
	]) {
		if (typeof value !== "string") continue;
		const normalized = value.replace(/\s+/g, " ").trim();
		if (normalized) return normalized.slice(0, 160);
	}
	return String(session.sessionId);
}
function writeLine(response, value) {
	response.write(`${JSON.stringify(value)}\n`);
}
function writeJson(response, status, value, headers = {}) {
	response.writeHead(status, {
		"content-type": "application/json; charset=utf-8",
		"cache-control": "no-store",
		"x-content-type-options": "nosniff",
		...headers
	});
	response.end(`${JSON.stringify(value)}\n`);
}
var ImportRouteError = class extends Error {
	constructor(statusCode, message) {
		super(message);
		this.statusCode = statusCode;
	}
};
//#endregion
//#region claude-link-store.js
var ClaudeLinkStore = class {
	constructor(path) {
		this.path = path;
		this.records = loadRecords(path);
	}
	entries() {
		return [...this.records.entries()].map(([sessionId, record]) => [sessionId, structuredClone(record)]);
	}
	set(sessionId, record) {
		this.records.set(String(sessionId), structuredClone(record));
		this.persist();
	}
	delete(sessionId) {
		if (!this.records.delete(String(sessionId))) return;
		this.persist();
	}
	persist() {
		mkdirSync(dirname(this.path), { recursive: true });
		const temporary = `${this.path}.${process.pid}.tmp`;
		const value = Object.fromEntries([...this.records.entries()].sort(([left], [right]) => left.localeCompare(right)));
		writeFileSync(temporary, `${JSON.stringify({
			version: 1,
			sessions: value
		}, null, 2)}\n`, { mode: 384 });
		renameSync(temporary, this.path);
	}
};
function loadRecords(path) {
	try {
		const parsed = JSON.parse(readFileSync(path, "utf8"));
		if (parsed?.version !== 1 || !isObject(parsed.sessions)) return /* @__PURE__ */ new Map();
		return new Map(Object.entries(parsed.sessions).filter(([, record]) => validRecord(record)));
	} catch (error) {
		if (error?.code === "ENOENT") return /* @__PURE__ */ new Map();
		throw new Error(`Unable to read Claude DSH links from ${path}: ${error.message}`, { cause: error });
	}
}
function validRecord(record) {
	return isObject(record) && (record.claudeSessionId === null || typeof record.claudeSessionId === "string") && isObject(record.config) && (record.bindingMode === void 0 || record.bindingMode === "native" || record.bindingMode === "imported") && (record.importState === void 0 || [
		"reserved",
		"session-created",
		"hydrated",
		"attached",
		"committed"
	].includes(record.importState));
}
function isObject(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
//#endregion
//#region claude-tools.js
async function handleClaudeSdkRequest(ctx, { adapter, runtime, request }) {
	const claudeSessionId = request.params?.sessionId;
	const dshSessionId = claudeSessionId ? adapter.dshSessionForClaudeSession(claudeSessionId) : null;
	const agent = dshSessionId ? ctx.agents.get(dshSessionId) : null;
	if (!agent) {
		runtime.rejectRequest(request.id, /* @__PURE__ */ new Error("Claude request has no owning live DSH Session"));
		return;
	}
	try {
		if (request.method === "tool/requestApproval") {
			const outcome = await ctx.approval.request({
				agent,
				toolName: approvalToolName(request),
				reason: approvalReason(request),
				signal: request.signal
			});
			await runtime.resolveRequest(request.id, {
				action: outcome === "allowed-once" ? "accept" : "decline",
				updatedInput: request.params?.input,
				message: `DSH approval returned ${outcome}.`
			});
			return;
		}
		if (request.method === "tool/requestUserInput") {
			const questions = normalizeQuestions(request.params?.input?.questions ?? []);
			const answer = await ctx.userQuestions.ask({
				agent,
				questions,
				signal: request.signal
			});
			await runtime.resolveRequest(request.id, {
				action: "answer",
				answers: normalizeAnswers(answer, questions)
			});
			return;
		}
		runtime.rejectRequest(request.id, /* @__PURE__ */ new Error(`Unsupported Claude interaction ${request.method}`));
	} catch (error) {
		runtime.rejectRequest(request.id, error);
	}
}
function approvalToolName(request) {
	const display = request.params?.displayName;
	if (typeof display === "string" && display.trim()) return `Claude ${display.trim()}`;
	const tool = request.params?.toolName;
	return tool ? `Claude ${tool}` : "Claude tool";
}
function approvalReason(request) {
	const params = request.params ?? {};
	const input = plainObject(params.input);
	if (typeof params.title === "string" && params.title.trim()) return params.title.trim();
	if (typeof params.description === "string" && params.description.trim()) return params.description.trim();
	if (typeof params.decisionReason === "string" && params.decisionReason.trim()) return params.decisionReason.trim();
	if (typeof input.command === "string" && input.command.trim()) return input.command.trim();
	if (typeof input.file_path === "string" && input.file_path.trim()) return input.file_path.trim();
	return `${params.toolName ?? "Claude"} requires permission to continue.`;
}
function normalizeQuestions(input) {
	return input.slice(0, 3).map((question, index) => ({
		id: `question-${index + 1}`,
		question: requiredString(question.question ?? question.header ?? `Question ${index + 1}`, "question"),
		header: String(question.header ?? "Claude").slice(0, 12),
		options: normalizeOptions(question.options ?? []),
		multiSelect: Boolean(question.multiSelect),
		...typeof question.detail === "string" ? { detail: question.detail } : {}
	}));
}
function normalizeOptions(input) {
	if (!Array.isArray(input) || input.length === 0) return [{ label: "Continue" }, { label: "Cancel" }];
	return input.slice(0, 4).map((option) => ({
		label: requiredString(option.label ?? option, "option label"),
		...typeof option.description === "string" ? { description: option.description } : {}
	}));
}
function normalizeAnswers(answer, questions) {
	const byId = new Map(questions.map((question) => [question.id, question]));
	return Object.fromEntries((answer.answers ?? []).flatMap((entry) => {
		const question = byId.get(entry.id);
		if (!question) return [];
		const selected = [...entry.selected ?? [], ...entry.custom ? [entry.custom] : []].filter(Boolean);
		return [[question.question, question.multiSelect ? selected : selected[0] ?? ""]];
	}));
}
function requiredString(value, label) {
	const text = String(value ?? "").trim();
	if (!text) throw new Error(`Claude ${label} is required`);
	return text;
}
function plainObject(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value) ? value : {};
}
//#endregion
//#region dsh-compat.mjs
function toolCallId(value) {
	const create = Reflect.get(llm, "ToolCallId") ?? Reflect.get(llm, "CallId");
	if (typeof create !== "function") throw new Error("DSH does not provide a tool call ID constructor");
	return create(value);
}
//#endregion
//#region dsh-import-target.js
var DshClaudeImportTarget = class {
	constructor({ ctx, logger = console }) {
		this.ctx = ctx;
		this.logger = logger;
		this.persistedIds = null;
	}
	async prepare(input) {
		const sessionId = SessionId(input.binding.sessionId);
		const projection = claudeHistoryProjection(input.source.messages ?? []);
		const seed = buildClaudeHistorySeed(projection, input.source.lastModified, input.binding.config);
		const resident = this.ctx.agents.get(sessionId);
		if (resident) return {
			...input,
			projection,
			seed,
			agent: resident,
			handle: null
		};
		const persistedIds = await this.loadPersistedIds();
		const agentOptions = {
			provider: CLAUDE_PROVIDER,
			model: input.binding.config.model
		};
		const handle = persistedIds.has(sessionId) ? await this.ctx.agents.resume({
			resumeSessionId: sessionId,
			agentOptions
		}) : await this.ctx.agents.create({
			sessionId,
			seed,
			agentOptions,
			meta: {
				cwd: input.source.cwd,
				createdAt: importedCreatedAt(input.source, seed),
				agentPreset: CLAUDE_PRESET
			}
		});
		return {
			...input,
			projection,
			seed,
			agent: handle.agent,
			handle
		};
	}
	async hydrate(transaction) {
		applySessionTitle(this.ctx, transaction.agent.session, transaction.source);
		await this.ctx.sessions.flush(transaction.agent.session);
		(await this.loadPersistedIds()).add(SessionId(transaction.binding.sessionId));
		const projectionCache = this.ctx.get?.("sessionProjectionCache");
		if (!projectionCache?.write) throw new Error("Claude Session import requires DSH's sessionProjectionCache service");
		await projectionCache.write(transaction.agent.session);
		return projectionSummary(transaction.projection);
	}
	async attach(transaction) {
		const workspace = await this.ctx.workspaceRegistry.resolveByPath(transaction.workspaceCwd);
		if (!workspace) throw new Error(`No registered DSH Workspace matches ${transaction.workspaceCwd}`);
		await workspace.attachSession(SessionId(transaction.binding.sessionId));
	}
	async finalize(transaction) {
		await this.ctx.sessions.flush(transaction.agent.session);
		(await this.loadPersistedIds()).add(SessionId(transaction.binding.sessionId));
	}
	async release(transaction) {
		await transaction.handle?.dispose();
	}
	async loadPersistedIds() {
		if (this.persistedIds === null) this.persistedIds = new Set((await this.ctx.sessionPersistence.list()).map((header) => SessionId(header.id)));
		return this.persistedIds;
	}
};
function buildClaudeHistorySeed(projection, updatedAt, config) {
	const time = timestampMs(updatedAt);
	const events = [];
	const append = (type, data, surfaceOp = null) => {
		events.push({
			type,
			seq: events.length,
			time,
			data,
			...surfaceOp === null ? {} : { surfaceOp }
		});
	};
	append("request/header", {
		header: { config: {
			provider: CLAUDE_PROVIDER,
			model: config.model,
			...config.effort ? { reasoningEffort: config.effort } : {}
		} },
		reason: "initial"
	});
	let turn = 1;
	for (const sourceTurn of projection.turns) {
		if (sourceTurn.timeline.length === 0) continue;
		append("turn/start", { turn });
		let step = 0;
		for (const entry of sourceTurn.timeline) {
			if (entry.kind === "message" && entry.role === "user") {
				append("user/message", freezeMessage({
					id: MessageId(entry.id),
					role: "user",
					content: entry.content,
					source: { kind: "user" }
				}), "append");
				continue;
			}
			step += 1;
			append("step/start", {
				turn,
				step
			});
			if (entry.kind === "message") append("assistant/message", {
				turn,
				step,
				message: freezeMessage({
					id: MessageId(entry.id),
					role: "assistant",
					content: entry.content,
					source: {
						kind: "model",
						provider: CLAUDE_PROVIDER,
						model: "imported"
					}
				})
			}, "append");
			else {
				const callId = toolCallId(entry.callId);
				append("assistant/message", {
					turn,
					step,
					message: freezeMessage({
						id: MessageId(entry.requestId),
						role: "assistant",
						content: [{
							type: "tool-call",
							id: callId,
							name: entry.name,
							arguments: entry.arguments
						}],
						source: {
							kind: "model",
							provider: CLAUDE_PROVIDER,
							model: "imported"
						}
					})
				}, "append");
				append("tool/call", {
					turn,
					step,
					callId,
					name: entry.name,
					arguments: entry.arguments
				});
				append("tool/result", {
					turn,
					step,
					message: freezeMessage({
						id: MessageId(entry.resultId),
						role: "user",
						content: [{
							type: "tool-result",
							toolCallId: callId,
							content: entry.content,
							isError: entry.isError
						}],
						source: {
							kind: "tool",
							callId
						}
					})
				}, "append");
			}
			append("step/end", {
				turn,
				step
			});
		}
		append("turn/end", {
			turn,
			reason: { kind: "stop" }
		});
		turn += 1;
	}
	return events;
}
function claudeHistoryProjection(messages) {
	const turns = [];
	const pendingTools = /* @__PURE__ */ new Map();
	let current = null;
	let skippedBlocks = 0;
	for (const source of messages) {
		const content = sourceContentBlocks(source);
		if (source?.type === "user" && source.parent_tool_use_id == null) {
			const blocks = content.filter((block) => block?.type === "text" && normalizedText(block.text)).map((block) => ({
				type: "text",
				text: normalizedText(block.text)
			}));
			if (blocks.length > 0) {
				skippedBlocks += content.filter((block) => block?.type !== "text").length;
				current = {
					sourceId: source.uuid,
					timeline: []
				};
				current.timeline.push({
					kind: "message",
					role: "user",
					id: projectionId(source, "user"),
					content: blocks
				});
				turns.push(current);
				continue;
			}
		}
		if (!current) {
			skippedBlocks += content.length;
			continue;
		}
		if (source?.type === "assistant") {
			for (const [index, block] of content.entries()) if (block?.type === "thinking" && normalizedText(block.thinking)) current.timeline.push({
				kind: "message",
				role: "assistant",
				id: projectionId(source, `thinking-${index}`),
				content: [{
					type: "reasoning",
					text: normalizedText(block.thinking)
				}]
			});
			else if (block?.type === "text" && normalizedText(block.text)) current.timeline.push({
				kind: "message",
				role: "assistant",
				id: projectionId(source, `text-${index}`),
				content: [{
					type: "text",
					text: normalizedText(block.text)
				}]
			});
			else if (block?.type === "tool_use" && normalizedText(block.id) && normalizedText(block.name)) pendingTools.set(block.id, {
				turn: current,
				source,
				index,
				name: block.name,
				arguments: jsonText(block.input)
			});
			else skippedBlocks += 1;
			continue;
		}
		if (source?.type === "user") {
			for (const block of content) {
				if (block?.type !== "tool_result" || !pendingTools.has(block.tool_use_id)) {
					skippedBlocks += 1;
					continue;
				}
				const tool = pendingTools.get(block.tool_use_id);
				pendingTools.delete(block.tool_use_id);
				const result = toolResultContent(block.content);
				skippedBlocks += result.skipped;
				tool.turn.timeline.push({
					kind: "activity",
					requestId: projectionId(tool.source, `tool-${tool.index}-request`),
					resultId: projectionId(source, `tool-${tool.index}-result`),
					callId: `claude:${block.tool_use_id}`,
					name: tool.name,
					arguments: tool.arguments,
					content: result.content,
					isError: block.is_error === true
				});
			}
			continue;
		}
		skippedBlocks += content.length;
	}
	skippedBlocks += pendingTools.size;
	return {
		turns,
		skippedBlocks
	};
}
function sourceContentBlocks(source) {
	const value = source?.message?.content;
	if (Array.isArray(value)) return value;
	if (source?.type === "user" && normalizedText(value)) return [{
		type: "text",
		text: value
	}];
	return [];
}
function toolResultContent(value) {
	if (typeof value === "string") return {
		content: [{
			type: "text",
			text: value
		}],
		skipped: 0
	};
	if (!Array.isArray(value)) return {
		content: [],
		skipped: value == null ? 0 : 1
	};
	const content = value.filter((block) => block?.type === "text" && typeof block.text === "string").map((block) => ({
		type: "text",
		text: block.text
	}));
	return {
		content,
		skipped: value.length - content.length
	};
}
function projectionSummary(projection) {
	return {
		projectedTurns: projection.turns.length,
		projectedMessages: projection.turns.reduce((count, turn) => count + turn.timeline.length, 0),
		skippedBlocks: projection.skippedBlocks
	};
}
function projectionId(message, suffix) {
	return `claude:${createHash("sha256").update(`${message.session_id ?? "session"}:${message.uuid ?? "message"}:${suffix}`).digest("hex").slice(0, 24)}`;
}
function importedCreatedAt(source, seed) {
	const updated = timestampMs(source.lastModified);
	if (!seed.some((event) => event.type === "user/message")) return updated;
	return Math.min(timestampMs(source.createdAt, updated), updated);
}
function timestampMs(value, fallback = Date.now()) {
	if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return fallback;
	return Math.trunc(value < 0xe8d4a51000 ? value * 1e3 : value);
}
function applySessionTitle(ctx, session, source) {
	const titles = ctx.get?.("sessionTitle");
	if (!titles) throw new Error("Claude Session import requires DSH's sessionTitle service");
	const title = summarizeTitle(source.customTitle) || summarizeTitle(source.summary) || summarizeTitle(source.firstPrompt) || `Claude ${String(source.sessionId).slice(0, 8)}`;
	if (titles.get(session)?.title !== title) titles.rename(session, title);
}
function summarizeTitle(value) {
	const text = normalizedText(value).replace(/\s+/g, " ");
	return text.length > 80 ? `${text.slice(0, 79)}...` : text;
}
function normalizedText(value) {
	return typeof value === "string" ? value.trim() : "";
}
function jsonText(value) {
	try {
		return JSON.stringify(value ?? {}, null, 2);
	} catch {
		return "{}";
	}
}
//#endregion
//#region dsh-plugin.js
function createDshClaudePlugin(ctx, config = {}) {
	return definePlugin({
		manifest: {
			id: "relay.dsh.claude",
			version: "1.0.0",
			provides: { "relay.dsh.claude.v1": "1.0.0" },
			requires: { "relay.execution.claude.v1": "^1.0.0" },
			permissions: [
				"dsh:llm",
				"dsh:agents",
				"dsh:web-server"
			]
		},
		async activate({ capabilities, defer }) {
			installClaudeSessionEventType();
			const runtime = capabilities.require("relay.execution.claude.v1");
			const linkStore = new ClaudeLinkStore(resolveLinkPath(config.claudeLinkPath));
			const adapter = new ClaudeDshAdapter({
				runtime,
				ready: runtime.whenReady(),
				linkStore,
				attachments: ctx.attachments,
				logger: ctx.logger
			});
			const importer = new ClaudeWorkspaceImporter({
				runtime,
				adapter,
				target: new DshClaudeImportTarget({
					ctx,
					logger: ctx.logger
				}),
				logger: ctx.logger
			});
			defer(ctx.llm.registerAdapter([CLAUDE_PROVIDER], adapter));
			defer(registerClaudeImportRoute(ctx, {
				importer,
				token: config.claudeImportToken ?? process.env.RELAY_CLAUDE_IMPORT_TOKEN
			}));
			defer(runtime.subscribeRequest((request) => {
				handleClaudeSdkRequest(ctx, {
					adapter,
					runtime,
					request
				}).catch((error) => ctx.logger.error(`Relay failed to handle a Claude interaction: ${error?.stack ?? error}`));
			}));
			defer(ctx.on("llm/stream", (options, next) => {
				if (options.purpose || !options.sessionId) return next();
				const agent = ctx.agents.get(options.sessionId);
				return agent && adapter.servesAgent(agent) ? adapter.stream(options) : next();
			}, {
				global: true,
				prepend: true
			}));
			defer(ctx.on("agent/created", ({ agent }) => {
				adapter.attachAgent(agent);
			}));
			defer(ctx.on("agent-preset/selected", (sessionId, preset) => {
				const agent = ctx.agents.get(sessionId);
				if (agent) adapter.attachAgent(agent, preset);
			}, { global: true }));
			defer(ctx.on("agent/disposed", ({ agent }) => {
				adapter.detachAgent(agent.id);
			}));
			for (const agent of ctx.agents.list()) adapter.attachAgent(agent);
			return { capabilities: { "relay.dsh.claude.v1": Object.freeze({ provider: CLAUDE_PROVIDER }) } };
		}
	});
}
function installClaudeSessionEventType() {
	if (KNOWN_SESSION_EVENT_TYPES.has("relay-claude/activity")) return;
	if (typeof KNOWN_SESSION_EVENT_TYPES.add !== "function") throw new Error("This DSH build cannot register Relay Claude session events");
	KNOWN_SESSION_EVENT_TYPES.add(CLAUDE_ACTIVITY_EVENT);
}
function resolveLinkPath(value) {
	const configured = value ?? process.env.RELAY_CLAUDE_LINK_PATH;
	return configured ? resolve(configured) : join(homedir(), ".relay", "claude-dsh-links.json");
}
//#endregion
//#region preset.js
async function installManagedPreset(source, id) {
	const home = resolve(process.env.DSH_HOME?.trim() || join(homedir(), ".dsh"));
	const target = join(home, ".agent-presets", id);
	await mkdir(join(home, ".agent-presets"), { recursive: true });
	if (await exists(target)) {
		if (!await exists(join(target, ".relay-managed"))) throw new Error(`Relay preset ${id} already exists and is not Relay-managed`);
	} else await mkdir(target, { recursive: true });
	for (const file of [
		"agent.cordis.yml",
		"preset.yml",
		".relay-managed"
	]) await cp(join(source, file), join(target, file));
	return target;
}
async function exists(path) {
	try {
		await stat(path);
		return true;
	} catch (error) {
		if (error?.code === "ENOENT") return false;
		throw error;
	}
}
//#endregion
//#region host-plugin.js
const name = "relay-dsh-plugin-claude";
const inject = [
	"agents",
	"approval",
	"attachments",
	"llm",
	"sessions",
	"sessionPersistence",
	"tools",
	"typert",
	"userQuestions",
	"webServer",
	"workspaceRegistry",
	"sessionTitle"
];
async function apply(ctx, config = {}) {
	const host = new PluginHost();
	const release = ctx.effect(() => () => host.dispose(), "relay.claude()");
	try {
		await installManagedPreset(fileURLToPath(new URL("../presets/relay-claude", import.meta.url)), "relay-claude");
		await host.activate([createClaudeExecutionPlugin({
			client: config.claude?.client,
			backend: config.claudeBackend,
			command: config.claudeCommand,
			args: config.claudeArgs,
			codeExecutablePath: config.claudeCodeExecutablePath,
			requestTimeoutMs: config.claudeRequestTimeoutMs,
			cwd: config.cwd,
			plugins: config.claudePlugins
		}), createDshClaudePlugin(ctx, config)]);
	} catch (error) {
		await release();
		throw error;
	}
}
//#endregion
export { apply, inject, installClaudeSessionEventType, name };

//# sourceMappingURL=host-plugin.js.map