import { describe, it, expect, beforeEach } from 'vitest';
import { loadForumState, saveForumState } from './forumPersistence';

describe('forumPersistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('stores and reloads threads and the selected thread id', () => {
    const threads = [
      { id: 'thread-1', title: 'First thread', reply_count: 0 },
      { id: 'thread-2', title: 'Second thread', reply_count: 2 }
    ];

    saveForumState(threads, 'thread-2');

    const restored = loadForumState();
    expect(restored.threads).toEqual(threads);
    expect(restored.selectedThreadId).toBe('thread-2');
  });
});
