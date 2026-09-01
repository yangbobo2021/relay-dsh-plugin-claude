import * as llm from '@deepseek-ai/dsh-llm';

// Keep namespace access: a named import fails before this adapter can run on
// the other official DSH generation. Both constructors have the same contract.
export function toolCallId(value) {
  const create = Reflect.get(llm, 'ToolCallId') ?? Reflect.get(llm, 'CallId');
  if (typeof create !== 'function') throw new Error('DSH does not provide a tool call ID constructor');
  return create(value);
}
