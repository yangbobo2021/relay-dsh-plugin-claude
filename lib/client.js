window.__ModuleLoader__.load({
	id: "relay-dsh-plugin-claude",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region model-selection.mjs
		function installModelSelection(ctx, preset, provider, otherProvider) {
			const connection = ctx.get("connection");
			const selecting = /* @__PURE__ */ new Set();
			const pending = /* @__PURE__ */ new Set();
			const sync = () => {
				const list = ctx.sessions.list.getSnapshot();
				const id = list.current;
				if (id === void 0 || list.byId[id]?.blank !== true) return;
				if (selecting.has(id)) {
					pending.add(id);
					return;
				}
				const selectedPreset = list.byId[id]?.agentPreset;
				if (selectedPreset !== preset && selectedPreset === otherProvider) return;
				selecting.add(id);
				connection.api.sessions.models({ sessionId: id }).then(async (response) => {
					const { result } = response;
					if (!result.ok) return;
					const latest = ctx.sessions.list.getSnapshot().byId[id];
					if (latest?.blank !== true || latest.agentPreset !== selectedPreset) {
						pending.add(id);
						return;
					}
					const target = selectedPreset === preset ? result.value.groups.find((group) => group.id === provider) : result.value.current.provider === provider ? result.value.groups.find((group) => group.id !== provider && group.id !== otherProvider) : void 0;
					const model = target?.models[0];
					if (!target || !model) return;
					await connection.api.sessions.selectModel({
						sessionId: id,
						provider: target.id,
						model: model.id,
						...model.reasoning?.defaultEffort ? { reasoningEffort: model.reasoning.defaultEffort } : {}
					});
				}).catch(() => {}).finally(() => {
					selecting.delete(id);
					if (pending.delete(id)) sync();
				});
			};
			const off = ctx.sessions.list.subscribe(sync);
			sync();
			return off;
		}
		//#endregion
		//#region claude-import-contract.mjs
		const CLAUDE_IMPORT_PATH = "/api/relay/claude/import";
		//#endregion
		//#region src/client/claude-session-import-client.mjs
		function resolveImportWorkspace(workspaces, sessions) {
			const current = sessions?.current;
			if (current !== void 0) {
				const owner = workspaces?.items?.find((workspace) => workspace.sessionIds?.includes(current));
				if (owner) return owner;
			}
			const recent = workspaces?.recentWorkspaceId;
			return workspaces?.items?.find((workspace) => workspace.workspaceId === recent) ?? null;
		}
		async function scanClaudeWorkspace(cwd, fetchImpl = fetch) {
			const response = await fetchImpl(CLAUDE_IMPORT_PATH, requestInit("scan", cwd));
			const body = await readJsonResponse(response);
			if (!response.ok) throw new Error(body?.message ?? `Claude import scan failed with HTTP ${response.status}`);
			return body;
		}
		async function importClaudeWorkspace(cwd, { sessionIds, onProgress } = {}, fetchImpl = fetch) {
			const response = await fetchImpl(CLAUDE_IMPORT_PATH, requestInit("import", cwd, sessionIds));
			if (!response.ok) {
				const body = await readJsonResponse(response);
				throw new Error(body?.message ?? `Claude import failed with HTTP ${response.status}`);
			}
			let completed = null;
			for await (const frame of ndjsonFrames(response.body)) {
				if (frame?.type === "progress") onProgress?.(frame);
				if (frame?.type === "complete") completed = frame.result;
				if (frame?.type === "error") throw new Error(frame.message ?? "Claude import failed");
			}
			if (completed === null) throw new Error("Claude import response ended before completion");
			return completed;
		}
		async function refreshImportedWorkspace(sessions, workspaces) {
			await sessions.refresh();
			await workspaces.refresh();
		}
		async function* ndjsonFrames(body) {
			if (!body || typeof body.getReader !== "function") throw new Error("Claude import response has no readable body");
			const reader = body.getReader();
			const decoder = new TextDecoder();
			let buffer = "";
			try {
				while (true) {
					const { done, value } = await reader.read();
					buffer += decoder.decode(value, { stream: !done });
					let newline = buffer.indexOf("\n");
					while (newline !== -1) {
						const line = buffer.slice(0, newline).trim();
						buffer = buffer.slice(newline + 1);
						if (line) yield parseFrame(line);
						newline = buffer.indexOf("\n");
					}
					if (done) break;
				}
				const finalLine = buffer.trim();
				if (finalLine) yield parseFrame(finalLine);
			} finally {
				reader.releaseLock();
			}
		}
		function requestInit(action, cwd, sessionIds) {
			return {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					action,
					cwd,
					...sessionIds === void 0 ? {} : { sessionIds }
				})
			};
		}
		async function readJsonResponse(response) {
			try {
				return await response.json();
			} catch {
				return null;
			}
		}
		function parseFrame(line) {
			try {
				return JSON.parse(line);
			} catch {
				throw new Error("Claude import returned malformed progress data");
			}
		}
		//#endregion
		//#region src/client/claude-session-import-ui-policy.mjs
		function claudeSessionImportUiPolicy(phase, selected = 0, failed = 0) {
			if (phase === "importing") return Object.freeze({
				canClose: false,
				primary: "importing",
				primaryDisabled: true
			});
			if (phase === "summary") return Object.freeze({
				canClose: true,
				secondary: "cancel",
				primary: "import-selected",
				primaryDisabled: selected === 0
			});
			if (phase === "error") return Object.freeze({
				canClose: true,
				secondary: "cancel",
				primary: "retry",
				primaryDisabled: false
			});
			if (phase === "complete" && failed > 0) return Object.freeze({
				canClose: true,
				secondary: "close",
				primary: "retry",
				primaryDisabled: false
			});
			return Object.freeze({
				canClose: true,
				primary: "close",
				primaryDisabled: false
			});
		}
		function claudeSessionImportUpdatedAtDate(value) {
			if (value === null || value === void 0) return null;
			const milliseconds = typeof value === "number" && Number.isFinite(value) && Math.abs(value) < 0xe8d4a51000 ? value * 1e3 : value;
			const date = new Date(milliseconds);
			return Number.isNaN(date.getTime()) ? null : date;
		}
		//#endregion
		//#region \0relay-css-module:./src/client/ClaudeSessionImportAction.module.css.mjs
		const css$1 = "._8iKb1W_trigger{width:100%;min-width:0;height:34px;color:var(--dsw-alias-label-secondary);cursor:pointer;font:inherit;letter-spacing:0;background:0 0;border:0;border-radius:6px;justify-content:flex-start;align-items:center;gap:10px;padding:0 12px;font-size:13px;display:flex}._8iKb1W_trigger:hover{background:var(--dsw-alias-fill-l2);color:var(--dsw-alias-label-primary)}._8iKb1W_trigger:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:-2px}._8iKb1W_trigger span{text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}._8iKb1W_dialog{width:min(700px,100vw - 32px)}._8iKb1W_body{flex-direction:column;gap:18px;min-height:128px;display:flex}._8iKb1W_workspace{border-bottom:1px solid var(--dsw-alias-border-l2);flex-direction:column;gap:3px;min-width:0;padding-bottom:12px;display:flex}._8iKb1W_workspace strong{overflow-wrap:anywhere;color:var(--dsw-alias-label-primary);letter-spacing:0;font-size:14px;font-weight:500;line-height:20px}._8iKb1W_workspace span{color:var(--dsw-alias-label-tertiary);letter-spacing:0;overflow-wrap:anywhere;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;line-height:17px;overflow:hidden}._8iKb1W_message,._8iKb1W_error,._8iKb1W_success,._8iKb1W_partial{letter-spacing:0;margin:0;font-size:13px;line-height:20px}._8iKb1W_message{color:var(--dsw-alias-label-secondary)}._8iKb1W_error,._8iKb1W_dangerValue{color:var(--dsw-alias-state-error-primary)}._8iKb1W_success,._8iKb1W_accentValue{color:var(--dsw-alias-state-success-primary)}._8iKb1W_partial{color:var(--dsw-alias-state-error-secondary)}._8iKb1W_metrics{border-top:1px solid var(--dsw-alias-border-l2);border-left:1px solid var(--dsw-alias-border-l2);grid-template-columns:repeat(2,minmax(0,1fr));margin:0;display:grid}._8iKb1W_summary{flex-direction:column;gap:14px;min-width:0;display:flex}._8iKb1W_selectionToolbar{min-height:28px;color:var(--dsw-alias-label-secondary);letter-spacing:0;justify-content:space-between;align-items:center;gap:12px;font-size:12px;line-height:18px;display:flex}._8iKb1W_selectionToolbar>div{gap:4px;display:flex}._8iKb1W_selectionToolbar button{min-height:28px;color:var(--dsw-alias-state-business-primary);cursor:pointer;font:inherit;letter-spacing:0;background:0 0;border:0;border-radius:4px;padding:0 8px}._8iKb1W_selectionToolbar button:hover{background:var(--dsw-alias-fill-l2)}._8iKb1W_selectionToolbar button:focus-visible,._8iKb1W_candidates input:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:1px}._8iKb1W_candidates{border-top:1px solid var(--dsw-alias-border-l2);flex-direction:column;max-height:min(390px,48vh);margin:0;padding:0;list-style:none;display:flex;overflow-y:auto}._8iKb1W_candidates li{border-bottom:1px solid var(--dsw-alias-border-l2);min-width:0}._8iKb1W_candidates label{cursor:pointer;grid-template-columns:18px minmax(0,1fr);gap:10px;min-width:0;padding:11px 4px;display:grid}._8iKb1W_candidates input{width:16px;height:16px;accent-color:var(--dsw-alias-state-business-primary);margin:2px 0 0}._8iKb1W_candidateBody{flex-direction:column;gap:2px;min-width:0;display:flex}._8iKb1W_candidateHeading{justify-content:space-between;align-items:flex-start;gap:12px;min-width:0;display:flex}._8iKb1W_candidateHeading strong{overflow-wrap:anywhere;min-width:0;color:var(--dsw-alias-label-primary);letter-spacing:0;font-size:13px;font-weight:500;line-height:19px}._8iKb1W_candidateHeading>span{color:var(--dsw-alias-state-success-primary);letter-spacing:0;flex:none;font-size:11px;line-height:18px}._8iKb1W_candidateBody code,._8iKb1W_candidateBody>span,._8iKb1W_candidateBody time{overflow-wrap:anywhere;min-width:0;color:var(--dsw-alias-label-tertiary);letter-spacing:0;font-size:11px;line-height:17px}._8iKb1W_candidateBody code{color:var(--dsw-alias-label-secondary);font-family:ui-monospace,SFMono-Regular,Menlo,monospace}._8iKb1W_metric{border-right:1px solid var(--dsw-alias-border-l2);border-bottom:1px solid var(--dsw-alias-border-l2);min-width:0;padding:10px 12px}._8iKb1W_metric dt{color:var(--dsw-alias-label-tertiary);letter-spacing:0;font-size:11px;line-height:16px}._8iKb1W_metric dd{color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums;letter-spacing:0;margin:2px 0 0;font-size:18px;font-weight:500;line-height:24px}._8iKb1W_progress{flex-direction:column;gap:10px;display:flex}._8iKb1W_progressCopy{color:var(--dsw-alias-label-secondary);letter-spacing:0;justify-content:space-between;align-items:center;gap:16px;font-size:13px;line-height:20px;display:flex}._8iKb1W_progressCopy strong{color:var(--dsw-alias-label-primary);font-weight:500}._8iKb1W_progress progress{width:100%;height:6px;accent-color:var(--dsw-alias-state-business-primary)}._8iKb1W_failures{flex-direction:column;gap:8px;margin:14px 0 0;padding:0;list-style:none;display:flex}._8iKb1W_failures li{min-width:0;color:var(--dsw-alias-label-secondary);letter-spacing:0;grid-template-columns:minmax(88px,auto) minmax(0,1fr);gap:10px;font-size:12px;line-height:18px;display:grid}._8iKb1W_failures code,._8iKb1W_failures span{overflow-wrap:anywhere}._8iKb1W_failures code{color:var(--dsw-alias-state-error-primary)}@media (width<=520px){._8iKb1W_dialog{width:calc(100vw - 20px)}._8iKb1W_metrics{grid-template-columns:minmax(0,1fr)}._8iKb1W_selectionToolbar,._8iKb1W_candidateHeading{flex-direction:column;align-items:flex-start}._8iKb1W_candidateHeading{gap:2px}}";
		const tagId$1 = "relay-dsh-plugin-claude/ClaudeSessionImportAction.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "relay-dsh-plugin-claude";
			tag.dataset.pluginCss = tagId$1;
			tag.textContent = css$1;
			document.head.appendChild(tag);
		}
		var ClaudeSessionImportAction_module_css_default = {
			"accentValue": "_8iKb1W_accentValue",
			"body": "_8iKb1W_body",
			"candidateBody": "_8iKb1W_candidateBody",
			"candidateHeading": "_8iKb1W_candidateHeading",
			"candidates": "_8iKb1W_candidates",
			"dangerValue": "_8iKb1W_dangerValue",
			"dialog": "_8iKb1W_dialog",
			"error": "_8iKb1W_error",
			"failures": "_8iKb1W_failures",
			"message": "_8iKb1W_message",
			"metric": "_8iKb1W_metric",
			"metrics": "_8iKb1W_metrics",
			"partial": "_8iKb1W_partial",
			"progress": "_8iKb1W_progress",
			"progressCopy": "_8iKb1W_progressCopy",
			"selectionToolbar": "_8iKb1W_selectionToolbar",
			"success": "_8iKb1W_success",
			"summary": "_8iKb1W_summary",
			"trigger": "_8iKb1W_trigger",
			"workspace": "_8iKb1W_workspace"
		};
		//#endregion
		//#region src/client/ClaudeSessionImportAction.tsx
		function ClaudeSessionImportAction({ wide, useClaudeSessionImportWorkspaces, useClaudeSessionImportSessions, scanWorkspace, importWorkspace, refreshWorkspaceState, t }) {
			const availableTarget = resolveImportWorkspace(useClaudeSessionImportWorkspaces((value) => value), useClaudeSessionImportSessions((value) => value));
			const [open, setOpen] = (0, react.useState)(false);
			const [target, setTarget] = (0, react.useState)(null);
			const [phase, setPhase] = (0, react.useState)("idle");
			const [summary, setSummary] = (0, react.useState)(null);
			const [candidates, setCandidates] = (0, react.useState)([]);
			const [selectedIds, setSelectedIds] = (0, react.useState)(/* @__PURE__ */ new Set());
			const [progress, setProgress] = (0, react.useState)(null);
			const [result, setResult] = (0, react.useState)(null);
			const [error, setError] = (0, react.useState)("");
			const request = (0, react.useRef)(0);
			const close = () => {
				if (!claudeSessionImportUiPolicy(phase, selectedIds.size, result?.failed).canClose) return;
				request.current += 1;
				setOpen(false);
			};
			const scan = (workspace) => {
				const generation = ++request.current;
				setPhase("scanning");
				setSummary(null);
				setCandidates([]);
				setSelectedIds(/* @__PURE__ */ new Set());
				setProgress(null);
				setResult(null);
				setError("");
				scanWorkspace(workspace.path).then((response) => {
					if (request.current !== generation) return;
					setSummary(response.summary);
					setCandidates(response.candidates);
					setSelectedIds(new Set(response.candidates.map((candidate) => candidate.id)));
					setPhase("summary");
				}, (reason) => {
					if (request.current !== generation) return;
					setError(messageOf(reason));
					setPhase("error");
				});
			};
			const begin = () => {
				const selected = availableTarget;
				setTarget(selected);
				setOpen(true);
				if (selected === null) {
					setPhase("no-workspace");
					return;
				}
				scan(selected);
			};
			const importSelected = () => {
				const sessionIds = candidates.filter((candidate) => selectedIds.has(candidate.id)).map((candidate) => candidate.id);
				if (target === null || summary === null || sessionIds.length === 0 || phase === "importing") return;
				const generation = ++request.current;
				setPhase("importing");
				setProgress({
					completed: 0,
					total: sessionIds.length,
					found: sessionIds.length,
					imported: 0,
					existing: 0,
					failed: 0,
					failures: []
				});
				setError("");
				(async () => {
					try {
						const completed = await importWorkspace(target.path, sessionIds, (update) => {
							if (request.current === generation) setProgress(update);
						});
						await refreshWorkspaceState();
						if (request.current !== generation) return;
						setResult(completed);
						setPhase("complete");
					} catch (reason) {
						if (request.current !== generation) return;
						setError(messageOf(reason));
						setPhase("error");
					}
				})();
			};
			const retry = () => {
				if (target !== null) scan(target);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
				label: t("importAction"),
				delayMs: 500,
				disabled: wide,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: ClaudeSessionImportAction_module_css_default.trigger,
					"aria-label": t("importAction"),
					onClick: begin,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconDownloadOutline16, { size: wide ? 16 : 18 }), wide && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("importAction") })]
				})
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
				open,
				onClose: close,
				title: t("importTitle"),
				closeLabel: t("close"),
				description: t("importDescription"),
				className: ClaudeSessionImportAction_module_css_default.dialog,
				footer: modalFooter({
					phase,
					selectedCount: selectedIds.size,
					result,
					close,
					retry,
					importSelected,
					t
				}),
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: ClaudeSessionImportAction_module_css_default.body,
					"aria-live": "polite",
					children: [
						target !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: ClaudeSessionImportAction_module_css_default.workspace,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: target.title }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								title: target.path,
								children: target.path
							})]
						}),
						phase === "no-workspace" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: ClaudeSessionImportAction_module_css_default.message,
							children: t("importNoWorkspace")
						}),
						phase === "scanning" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: ClaudeSessionImportAction_module_css_default.message,
							children: t("importScanning")
						}),
						phase === "summary" && summary !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SummaryView, {
							summary,
							candidates,
							selectedIds,
							onSelectionChange: setSelectedIds,
							t
						}),
						phase === "importing" && progress !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ProgressView, {
							progress,
							t
						}),
						phase === "complete" && result !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ResultView, {
							result,
							t
						}),
						phase === "error" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: ClaudeSessionImportAction_module_css_default.error,
							role: "alert",
							children: error || t("importFailed")
						})
					]
				})
			})] });
		}
		function SummaryView({ summary, candidates, selectedIds, onSelectionChange, t }) {
			const select = (id, checked) => {
				const next = new Set(selectedIds);
				if (checked) next.add(id);
				else next.delete(id);
				onSelectionChange(next);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: ClaudeSessionImportAction_module_css_default.summary,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dl", {
					className: ClaudeSessionImportAction_module_css_default.metrics,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Metric, {
							label: t("importFound"),
							value: summary.found
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Metric, {
							label: t("importExisting"),
							value: summary.existing
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Metric, {
							label: t("importRecoverable"),
							value: summary.recoverable
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Metric, {
							label: t("importReady"),
							value: summary.ready,
							accent: true
						})
					]
				}), candidates.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: ClaudeSessionImportAction_module_css_default.message,
					children: t("importEmpty")
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: ClaudeSessionImportAction_module_css_default.selectionToolbar,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
						t("importSelected"),
						": ",
						selectedIds.size,
						" / ",
						candidates.length
					] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => onSelectionChange(new Set(candidates.map((candidate) => candidate.id))),
						children: t("importSelectAll")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => onSelectionChange(/* @__PURE__ */ new Set()),
						children: t("importClearSelection")
					})] })]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
					className: ClaudeSessionImportAction_module_css_default.candidates,
					"aria-label": t("importCandidates"),
					children: candidates.map((candidate) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: selectedIds.has(candidate.id),
						onChange: (event) => select(candidate.id, event.currentTarget.checked)
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: ClaudeSessionImportAction_module_css_default.candidateBody,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: ClaudeSessionImportAction_module_css_default.candidateHeading,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: candidate.title }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: candidate.status === "recoverable" ? t("importStatusRecoverable") : t("importStatusReady") })]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: candidate.id }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								title: candidate.cwd,
								children: candidate.cwd
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("time", {
								dateTime: dateTimeValue(candidate.updatedAt),
								children: formatUpdatedAt(candidate.updatedAt)
							})
						]
					})] }) }, candidate.id))
				})] })]
			});
		}
		function ProgressView({ progress, t }) {
			const maximum = Math.max(1, progress.total);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: ClaudeSessionImportAction_module_css_default.progress,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: ClaudeSessionImportAction_module_css_default.progressCopy,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: t("importImporting") }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
						progress.completed,
						" / ",
						progress.total
					] })]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("progress", {
					value: progress.completed,
					max: maximum,
					"aria-label": t("importImporting")
				})]
			});
		}
		function ResultView({ result, t }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: result.failed > 0 ? ClaudeSessionImportAction_module_css_default.partial : ClaudeSessionImportAction_module_css_default.success,
					children: result.failed > 0 ? t("importPartial") : t("importComplete")
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dl", {
					className: ClaudeSessionImportAction_module_css_default.metrics,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Metric, {
							label: t("importImported"),
							value: result.imported,
							accent: true
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Metric, {
							label: t("importExisting"),
							value: result.existing
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Metric, {
							label: t("importFailures"),
							value: result.failed,
							danger: result.failed > 0
						})
					]
				}),
				result.failures.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
					className: ClaudeSessionImportAction_module_css_default.failures,
					"aria-label": t("importFailures"),
					children: result.failures.map((failure) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: failure.session }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: failure.message })] }, failure.session))
				})
			] });
		}
		function Metric({ label, value, accent = false, danger = false }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: ClaudeSessionImportAction_module_css_default.metric,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: label }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", {
					className: danger ? ClaudeSessionImportAction_module_css_default.dangerValue : accent ? ClaudeSessionImportAction_module_css_default.accentValue : void 0,
					children: value
				})]
			});
		}
		function modalFooter({ phase, selectedCount, result, close, retry, importSelected, t }) {
			const policy = claudeSessionImportUiPolicy(phase, selectedCount, result?.failed);
			const actions = {
				cancel: close,
				close,
				"import-selected": importSelected,
				importing: void 0,
				retry
			};
			const labels = {
				cancel: t("cancel"),
				close: t("close"),
				"import-selected": t("importSelectedAction"),
				importing: t("importImporting"),
				retry: t("retry")
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [policy.secondary !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
				variant: "outline",
				onClick: actions[policy.secondary],
				children: labels[policy.secondary]
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
				variant: policy.primary === "close" ? "outline" : void 0,
				disabled: policy.primaryDisabled,
				onClick: actions[policy.primary],
				children: labels[policy.primary]
			})] });
		}
		function dateTimeValue(value) {
			return claudeSessionImportUpdatedAtDate(value)?.toISOString();
		}
		function formatUpdatedAt(value) {
			const date = claudeSessionImportUpdatedAtDate(value);
			return date === null ? "-" : new Intl.DateTimeFormat(void 0, {
				dateStyle: "medium",
				timeStyle: "short"
			}).format(date);
		}
		function messageOf(reason) {
			return reason instanceof Error ? reason.message : String(reason);
		}
		//#endregion
		//#region \0relay-css-module:./src/client/ClaudeActivityView.module.css.mjs
		const css = ".ts8jCW_activity{width:min(100%,960px);color:var(--dsw-alias-label-secondary)}.ts8jCW_summary{min-width:0;color:var(--dsw-alias-label-tertiary);flex:1;align-items:center;gap:8px;font-size:13px;display:flex}.ts8jCW_summary :first-child{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.ts8jCW_detail{border-left:1px solid var(--dsw-alias-border-l2);margin:4px 0 8px 28px;padding-left:12px;overflow:hidden}.ts8jCW_detail pre{max-height:320px;color:var(--dsw-alias-label-secondary);font:var(--dsw-font-markdown-code-block-small);white-space:pre-wrap;word-break:break-word;margin:0 0 8px;overflow:auto}.ts8jCW_provenance{color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;margin-bottom:8px;font-size:12px;line-height:18px;overflow:hidden}";
		const tagId = "relay-dsh-plugin-claude/ClaudeActivityView.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "relay-dsh-plugin-claude";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var ClaudeActivityView_module_css_default = {
			"activity": "ts8jCW_activity",
			"detail": "ts8jCW_detail",
			"provenance": "ts8jCW_provenance",
			"summary": "ts8jCW_summary"
		};
		//#endregion
		//#region src/client/ClaudeActivityView.tsx
		function dotState(status) {
			if (status === "running") return "ongoing";
			if (status === "error") return "error";
			return "done";
		}
		const ClaudeActivityView = (0, react.memo)(function ClaudeActivityView({ node }) {
			const activity = node.data;
			const [open, setOpen] = (0, react.useState)(false);
			const expandable = activity.input !== void 0 || activity.output !== void 0 || activity.provenance !== void 0;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: ClaudeActivityView_module_css_default.activity,
				"data-claude-activity": activity.type,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.DisclosureRow, {
					icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCodeOutline16, {}),
					title: activity.title,
					open,
					expandable,
					onToggle: () => {
						setOpen((value) => !value);
					},
					expandOnRowClick: true,
					collapsedContent: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: ClaudeActivityView_module_css_default.summary,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: activity.summary }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, {
							state: dotState(activity.status),
							size: 8
						})]
					}),
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: ClaudeActivityView_module_css_default.detail,
						children: [
							activity.provenance !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: ClaudeActivityView_module_css_default.provenance,
								title: `Claude Code · Session ${activity.provenance.claudeSessionId} · Turn ${activity.provenance.turnId}`,
								children: [
									"Claude Code · Session ",
									shortId(activity.provenance.claudeSessionId),
									" · Turn ",
									shortId(activity.provenance.turnId)
								]
							}) : null,
							activity.input !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", { children: activity.input }) : null,
							activity.output !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", { children: activity.output }) : null
						]
					})
				})
			});
		});
		function shortId(value) {
			return value.length > 15 ? `${value.slice(0, 8)}...${value.slice(-4)}` : value;
		}
		//#endregion
		//#region src/client/claude-activity.ts
		const claudeActivityDefinition = {
			kind: "relay-claude-activity",
			target: "chat",
			match: (event) => event.type === "relay-claude/activity" ? {
				id: event.data.itemId,
				role: event.data.phase === "started" ? "start" : "update"
			} : null,
			start: (_context, match) => {
				if (match.event.type !== "relay-claude/activity") throw new Error("Claude activity start requires relay-claude/activity");
				return {
					...match.event.data.activity,
					provenance: {
						claudeSessionId: match.event.data.claudeSessionId,
						turnId: match.event.data.turnId
					}
				};
			},
			update: (context, match) => match.event.type === "relay-claude/activity" ? {
				...match.event.data.activity,
				provenance: {
					claudeSessionId: match.event.data.claudeSessionId,
					turnId: match.event.data.turnId
				}
			} : context.state,
			buildViewNode: (context) => {
				if (context.start === void 0 || context.state === void 0) return null;
				return {
					key: context.key,
					kind: "relay-claude-activity",
					id: context.id,
					target: "chat",
					anchorSeq: context.start.event.seq,
					location: context.start.location,
					visibility: "visible",
					data: context.state
				};
			}
		};
		//#endregion
		//#region src/client/locales.ts
		const en = {
			importAction: "Import Claude Sessions",
			importTitle: "Import Claude Sessions",
			importDescription: "Select existing Claude terminal Sessions from this Workspace to continue in DSH.",
			importNoWorkspace: "Open or select a Workspace before importing Sessions.",
			importScanning: "Scanning native Claude Sessions...",
			importFound: "Found",
			importExisting: "Already linked",
			importRecoverable: "Recoverable",
			importReady: "Available",
			importEmpty: "No unlinked Claude Sessions are available in this Workspace.",
			importSelected: "Selected",
			importSelectAll: "Select all",
			importClearSelection: "Clear",
			importCandidates: "Claude Session candidates",
			importStatusReady: "Ready",
			importStatusRecoverable: "Retry import",
			importSelectedAction: "Import selected",
			importImporting: "Importing Sessions...",
			importComplete: "Import completed.",
			importPartial: "Some Sessions could not be imported.",
			importImported: "Imported",
			importFailures: "Failed",
			importFailed: "Claude Session import failed.",
			cancel: "Cancel",
			close: "Close",
			retry: "Retry"
		};
		const zh = {
			importAction: "导入 Claude 会话",
			importTitle: "导入 Claude 会话",
			importDescription: "选择当前工作区中已有的 Claude 终端会话，并在 DSH 中继续。",
			importNoWorkspace: "请先打开或选择一个工作区。",
			importScanning: "正在扫描原生 Claude 会话...",
			importFound: "发现",
			importExisting: "已绑定",
			importRecoverable: "可恢复",
			importReady: "可导入",
			importEmpty: "当前工作区没有未绑定的 Claude 会话。",
			importSelected: "已选择",
			importSelectAll: "全选",
			importClearSelection: "清空",
			importCandidates: "Claude 会话候选列表",
			importStatusReady: "可导入",
			importStatusRecoverable: "重试导入",
			importSelectedAction: "导入所选会话",
			importImporting: "正在导入会话...",
			importComplete: "导入完成。",
			importPartial: "部分会话未能导入。",
			importImported: "已导入",
			importFailures: "失败",
			importFailed: "Claude 会话导入失败。",
			cancel: "取消",
			close: "关闭",
			retry: "重试"
		};
		//#endregion
		//#region src/client/index.ts
		const inject = [
			"slots",
			"theme",
			"locale",
			"remote",
			"sessions",
			"workspaces",
			"connection",
			"conversationEvents"
		];
		async function apply(ctx) {
			ctx.effect(() => ctx.locale.register("relay.claude", {
				zh,
				en
			}), "relay-claude: dictionaries");
			ctx.conversationEvents.register(claudeActivityDefinition);
			ctx.slots.inject("conversation.chat.node", () => ctx.slots.register({
				name: "conversation.chat.node",
				key: "relay-claude-activity"
			}, ClaudeActivityView));
			applySessionImport(ctx);
			const unsubscribe = installModelSelection(ctx, "relay-claude", "relay-claude", "relay-codex");
			return async () => {
				unsubscribe();
			};
		}
		function applySessionImport(ctx) {
			const injected = () => ({
				hooks: {
					claudeSessionImportWorkspaces: ctx.workspaces.list,
					claudeSessionImportSessions: ctx.sessions.list
				},
				scanWorkspace: (cwd) => scanClaudeWorkspace(cwd),
				importWorkspace: (cwd, sessionIds, onProgress) => importClaudeWorkspace(cwd, {
					sessionIds,
					onProgress
				}),
				refreshWorkspaceState: () => refreshImportedWorkspace(ctx.sessions, ctx.workspaces)
			});
			ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
				name: "sidebar.footer.action",
				id: "relay-claude-session-import",
				order: -9,
				inject: injected,
				locale: "relay.claude"
			}, ClaudeSessionImportAction));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map