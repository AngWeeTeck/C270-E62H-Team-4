import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveReplyCount } from './replyCount.js';

test('prefers the API pagination total when it is available', () => {
  const count = resolveReplyCount({
    replies: [{ id: 1 }, { id: 2 }],
    pagination: { total: 7 },
    fallbackCount: 2,
  });

  assert.equal(count, 7);
});

test('uses the number of loaded replies when no pagination total is present', () => {
  const count = resolveReplyCount({
    replies: [{ id: 1 }, { id: 2 }],
    fallbackCount: 7,
  });

  assert.equal(count, 2);
});

test('falls back to the available sample count when no reply payload exists', () => {
  const count = resolveReplyCount({
    replies: [],
    fallbackCount: 2,
  });

  assert.equal(count, 2);
});
