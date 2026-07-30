const request = require('supertest');
const { createApp } = require('../server');

const app = createApp();

describe('Thread API payload compatibility', () => {
  test('accepts frontend-style author and rich content fields', async () => {
    const response = await request(app)
      .post('/api/threads')
      .send({
        title: 'Payload compatibility test',
        content: '<p>Sharing a test thread</p>',
        username: 'student1',
        rich_content: {
          html: '<p>Sharing a test thread</p>',
          embeds: []
        }
      });

    expect(response.status).toBe(201);
    expect(response.body.author).toBe('student1');
    expect(response.body.reply_count).toBe(0);
  });

  test('creates replies through the frontend reply URL and returns JSON', async () => {
    const threadResponse = await request(app)
      .post('/api/threads')
      .send({
        title: 'Reply route test',
        content: 'Thread content for a reply',
        username: 'route-user'
      });

    const response = await request(app)
      .post(`/api/threads/${threadResponse.body.id}/replies`)
      .send({
        content: '<p>A routed reply</p>',
        username: 'route-user'
      });

    expect(response.status).toBe(201);
    expect(response.headers['content-type']).toMatch(/application\/json/);
    expect(response.body.reply).toMatchObject({
      threadId: threadResponse.body.id,
      author: 'route-user'
    });
  });
});
