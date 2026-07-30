import test from 'node:test';
import assert from 'node:assert/strict';
import { sampleRepliesByThreadId, sampleThreads } from '../data/sampleThreads.js';
import { getThreadReplySnapshot } from '../utils/replyCount.js';

test('preview and detail reply counts stay in sync for a thread with known replies', () => {
  const thread = sampleThreads.find((candidate) => candidate.id === 101);
  const replies = sampleRepliesByThreadId[101] || [];
  const snapshot = getThreadReplySnapshot({ thread, replies });

  assert.equal(snapshot.previewCount, 2);
  assert.equal(snapshot.detailCount, 2);
  assert.equal(snapshot.matches, true);
});
