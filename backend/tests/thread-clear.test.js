const request = require('supertest');
const { createApp } = require('../server');
const { store } = require('../dataStore');

const app = createApp();

describe('thread clearing', () => {
  beforeEach(async () => {
    await request(app).delete('/api/threads');
  });

  it('clears all threads from the server state after DELETE /api/threads', async () => {
    const createResponse = await request(app)
      .post('/api/threads')
      .send({
        title: 'Test thread',
        content: 'This thread should be cleared.',
        author: 'tester'
      });

    expect(createResponse.status).toBe(201);

    const beforeClear = await request(app).get('/api/threads');
    expect(beforeClear.body.threads).toHaveLength(1);

    const clearResponse = await request(app).delete('/api/threads');
    expect(clearResponse.status).toBe(200);

    const afterClear = await request(app).get('/api/threads');
    expect(afterClear.body.threads).toHaveLength(0);
  });

  it('keeps the shared server store in sync with thread creation and clearing', async () => {
    const createResponse = await request(app)
      .post('/api/threads')
      .send({
        title: 'Shared store thread',
        content: 'This should be visible in the shared store.',
        author: 'tester'
      });

    expect(createResponse.status).toBe(201);
    expect(store.getThreads()).toHaveLength(1);
    expect(store.getThreads()[0].id).toBe(createResponse.body.id);

    const clearResponse = await request(app).delete('/api/threads');
    expect(clearResponse.status).toBe(200);
    expect(store.getThreads()).toHaveLength(0);
  });
});
