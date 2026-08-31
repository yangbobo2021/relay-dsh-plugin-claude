export async function handleClaudeSdkRequest(ctx, { adapter, runtime, request }) {
  const claudeSessionId = request.params?.sessionId;
  const dshSessionId = claudeSessionId ? adapter.dshSessionForClaudeSession(claudeSessionId) : null;
  const agent = dshSessionId ? ctx.agents.get(dshSessionId) : null;
  if (!agent) {
    runtime.rejectRequest(request.id, new Error("Claude request has no owning live DSH Session"));
    return;
  }

  try {
    if (request.method === "tool/requestApproval") {
      const outcome = await ctx.approval.request({
        agent,
        toolName: approvalToolName(request),
        reason: approvalReason(request),
        signal: request.signal,
      });
      await runtime.resolveRequest(request.id, {
        action: outcome === "allowed-once" ? "accept" : "decline",
        updatedInput: request.params?.input,
        message: `DSH approval returned ${outcome}.`,
      });
      return;
    }
    if (request.method === "tool/requestUserInput") {
      const questions = normalizeQuestions(request.params?.input?.questions ?? []);
      const answer = await ctx.userQuestions.ask({ agent, questions, signal: request.signal });
      await runtime.resolveRequest(request.id, {
        action: "answer",
        answers: normalizeAnswers(answer, questions),
      });
      return;
    }
    runtime.rejectRequest(request.id, new Error(`Unsupported Claude interaction ${request.method}`));
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
    ...(typeof question.detail === "string" ? { detail: question.detail } : {}),
  }));
}

function normalizeOptions(input) {
  if (!Array.isArray(input) || input.length === 0) {
    return [{ label: "Continue" }, { label: "Cancel" }];
  }
  return input.slice(0, 4).map(option => ({
    label: requiredString(option.label ?? option, "option label"),
    ...(typeof option.description === "string" ? { description: option.description } : {}),
  }));
}

function normalizeAnswers(answer, questions) {
  const byId = new Map(questions.map(question => [question.id, question]));
  return Object.fromEntries((answer.answers ?? []).flatMap((entry) => {
    const question = byId.get(entry.id);
    if (!question) return [];
    const selected = [...(entry.selected ?? []), ...(entry.custom ? [entry.custom] : [])].filter(Boolean);
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
