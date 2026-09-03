import * as llm from '@deepseek-ai/dsh-llm';

// Keep namespace access: a named import fails before this adapter can run on
// the other official DSH generation. Both constructors have the same contract.
export function toolCallId(value) {
  const create = Reflect.get(llm, 'ToolCallId') ?? Reflect.get(llm, 'CallId');
  if (typeof create !== 'function') throw new Error('DSH does not provide a tool call ID constructor');
  return create(value);
}

export function sessionEvents(session, from = 0) {
  if (!Number.isSafeInteger(from) || from < 0) throw new RangeError('session event offset must be a non-negative integer');
  const snapshot = Reflect.get(session, 'snapshotEvents');
  if (typeof snapshot === 'function') {
    return from === 0 ? Reflect.apply(snapshot, session, []) : Reflect.apply(snapshot, session, [from]);
  }
  const events = Reflect.get(session, 'events');
  if (!Array.isArray(events)) throw new TypeError('DSH Session exposes neither snapshotEvents() nor events');
  return from === 0 ? events : events.slice(from);
}
