const fs = require('fs');
const os = require('os');
const path = require('path');
const { createStore } = require('../dataStore');

describe('file-backed persistence', () => {
  let tempDir;
  let store;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'forum-store-'));
    store = createStore({ filePath: path.join(tempDir, 'state.json') });
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test('persists threads and replies across store reloads', () => {
    const thread = store.addThread({
      id: 'thread-200',
      title: 'Persisted thread',
      content: 'This should survive a restart',
      author: 'tester',
      richContent: { html: '<p>hi</p>', embeds: [] },
      replyCount: 0,
      replies: []
    });

    store.addReply({
      id: 'reply-200',
      threadId: thread.id,
      content: 'Persisted reply',
      author: 'tester',
      richContent: { html: '<p>reply</p>', embeds: [] }
    });

    const reloadedStore = createStore({ filePath: path.join(tempDir, 'state.json') });

    expect(reloadedStore.getThreads()).toHaveLength(1);
    expect(reloadedStore.getReplies()).toHaveLength(1);
    expect(reloadedStore.getThreads()[0].title).toBe('Persisted thread');
    expect(reloadedStore.getReplies()[0].content).toBe('Persisted reply');
  });
});
