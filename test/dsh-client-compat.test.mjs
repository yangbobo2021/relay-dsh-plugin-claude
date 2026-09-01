import assert from 'node:assert/strict';
import test from 'node:test';
import { sessionPreset } from '../dsh-client-compat.mjs';

test('current cleared preset wins over stale legacy state', () => {
  assert.equal(sessionPreset({ agentPreset: 'relay-codex', projectionValues: { agentPreset: null } }), null);
  assert.equal(sessionPreset({ agentPreset: 'relay-claude' }), 'relay-claude');
  assert.equal(sessionPreset(undefined), undefined);
});
