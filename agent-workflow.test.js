import test from 'node:test';
import assert from 'node:assert/strict';
import { runHealthcareAgent } from './agent-workflow.js';

const sessionId = 'test-session';

test('asks one focused follow-up for an incomplete symptom description', () => {
  const result = runHealthcareAgent(sessionId, 'I have a headache', { language: 'en' });
  assert.equal(result.status, 'needs_clarification');
  assert.equal(result.follow_up_question, 'When did this start, and how severe is it?');
  assert.equal(result.model_info.connected, false);
  assert.equal(result.model_info.prediction, null);
});

test('hands off safely after the single follow-up when the model is unavailable', () => {
  const result = runHealthcareAgent(sessionId, 'It started this morning', { language: 'en', awaiting_follow_up: true });
  assert.equal(result.status, 'safe_handoff');
  assert.equal(result.follow_up_question, null);
  assert.ok(result.safety_flags.includes('model_unavailable'));
  assert.match(result.response, /qualified healthcare professional/i);
});

test('keeps the completed session from restarting clarification', () => {
  const result = runHealthcareAgent(sessionId, 'Can you give me a diagnosis now?', { language: 'en', completed: true });
  assert.equal(result.status, 'safe_handoff');
  assert.equal(result.follow_up_question, null);
});

test('bypasses clarification for urgent English input', () => {
  const result = runHealthcareAgent(sessionId, "I'm having chest pain", { language: 'en' });
  assert.equal(result.status, 'urgent_escalation');
  assert.equal(result.follow_up_question, null);
  assert.ok(result.safety_flags.includes('model_bypassed'));
  assert.match(result.response, /emergency number now/i);
});

test('detects urgent Hindi input before asking follow-up questions', () => {
  const result = runHealthcareAgent(sessionId, 'सीने में दर्द और सांस लेने में दिक्कत', { language: 'hi' });
  assert.equal(result.status, 'urgent_escalation');
  assert.match(result.response, /आपातकालीन नंबर/);
});

test('returns a bounded unsupported-language response for an unhandled script', () => {
  const result = runHealthcareAgent(sessionId, '頭が痛い', { language: 'en' });
  assert.equal(result.status, 'unsupported_language');
  assert.equal(result.follow_up_question, null);
  assert.match(result.response, /English, Hindi, or Hinglish/);
});

test('supports a Hinglish clarification response without a model prediction', () => {
  const result = runHealthcareAgent(sessionId, 'Mujhe headache hai', { language: 'hinglish' });
  assert.equal(result.status, 'needs_clarification');
  assert.match(result.response, /kab shuru hua/);
  assert.equal(result.model_info.prediction, null);
});
