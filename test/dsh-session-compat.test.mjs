import assert from 'node:assert/strict';
import test from 'node:test';

import { sessionEvents } from '../dsh-compat.mjs';

const EVENTS = Object.freeze([
  Object.freeze({ type: 'agent-preset/selected', seq: 0, data: { agentPreset: 'relay-claude' } }),
]);

test('Session compatibility reads alpha.3 and rc.1 event APIs', () => {
  assert.equal(sessionEvents({ events: EVENTS }), EVENTS);
  assert.deepEqual(sessionEvents({ snapshotEvents: (from = 0) => EVENTS.slice(from) }), EVENTS);
  assert.deepEqual(sessionEvents({ snapshotEvents: (from = 0) => EVENTS.slice(from) }, 1), []);
});

test('Session compatibility rejects unknown shapes and invalid offsets', () => {
  assert.throws(() => sessionEvents({}), /neither snapshotEvents/);
  assert.throws(() => sessionEvents({ events: EVENTS }, 0.5), /non-negative integer/);
});
