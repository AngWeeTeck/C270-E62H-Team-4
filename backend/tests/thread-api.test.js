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
});
