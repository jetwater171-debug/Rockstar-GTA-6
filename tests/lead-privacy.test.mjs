import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const require = createRequire(import.meta.url);
const { describeLeadDevice, sanitizeLeadPayload } = require('../backend/shared-core/lib/lead-privacy.js');
const { __test: leadStoreTest } = require('../backend/shared-core/lib/lead-store.js');

test('lead payload discards individual quiz responses and preserves aggregate metrics', () => {
  const sanitized = sanitizeLeadPayload({
    sessionId: 'lead-1',
    answers: [{ answer: 'top-level' }],
    quizAnswers: [{ answer: 'legacy' }],
    quiz: {
      score: 12,
      total: 18,
      status: 'pre_selected',
      completedAt: '2026-08-14T12:00:00.000Z',
      answers: [{ question: 'Plataforma', answer: 'PlayStation', points: 2 }],
      internalQuestionMap: { secret: true },
    },
  });

  assert.equal('answers' in sanitized, false);
  assert.equal('quizAnswers' in sanitized, false);
  assert.deepEqual(sanitized.quiz, {
    score: 12,
    total: 18,
    status: 'pre_selected',
    completedAt: '2026-08-14T12:00:00.000Z',
  });
});

test('device description identifies an Android model without inventing Apple models', () => {
  const android = describeLeadDevice(
    'Mozilla/5.0 (Linux; Android 14; SM-S928B Build/UP1A.231005.007) AppleWebKit/537.36 Chrome/126.0.0.0 Mobile Safari/537.36',
    { screen: { width: 360, height: 780 }, timezone: 'America/Sao_Paulo' },
  );
  const iphone = describeLeadDevice(
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Version/17.5 Mobile/15E148 Safari/604.1',
    {},
  );

  assert.equal(android.model, 'SM-S928B');
  assert.equal(android.type, 'Celular');
  assert.match(android.os, /^Android 14/);
  assert.equal(iphone.model, 'iPhone');
  assert.equal(iphone.type, 'Celular');
});

test('lead merge removes legacy responses and appends a deduplicated operational timeline', () => {
  const merged = leadStoreTest.mergeTrackingPayload(
    { sessionId: 'lead-1', stage: 'dados', event: 'personal_submitted', device: { type: 'Celular' } },
    { quiz: { score: 10, total: 18, answers: [{ answer: 'legacy' }] } },
  );
  const first = leadStoreTest.appendOperationalEvent(merged, {
    eventId: 'evt-personal-1',
    event: 'personal_submitted',
    stage: 'dados',
    sourceUrl: 'https://example.test/dados',
  });
  const repeated = leadStoreTest.appendOperationalEvent(first, {
    eventId: 'evt-personal-1',
    event: 'personal_submitted',
    stage: 'dados',
    sourceUrl: 'https://example.test/dados',
  });

  assert.equal('answers' in repeated.quiz, false);
  assert.equal(repeated.leadEvents.length, 1);
  assert.equal(repeated.leadEvents[0].event, 'personal_submitted');
});

test('client and SQL migration contain no path that persists quiz answers', async () => {
  const [mainSource, sqlSource] = await Promise.all([
    readFile(new URL('../src/main.js', import.meta.url), 'utf8'),
    readFile(new URL('../supabase/admin-backend.sql', import.meta.url), 'utf8'),
  ]);

  assert.doesNotMatch(mainSource, /answers\s*:\s*quizAnswers/);
  assert.match(mainSource, /Respostas individuais não são armazenadas/);
  assert.match(sqlSource, /payload\s*->\s*'quiz'/);
  assert.match(sqlSource, /-\s*'answers'/);
  assert.match(sqlSource, /create trigger leads_sanitize_quiz_payload/);
});
