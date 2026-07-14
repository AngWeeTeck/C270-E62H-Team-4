const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp, resetModerationData } = require('./server');

function createServerForTests() {
    const app = createApp();
    return new Promise((resolve) => {
        const server = app.listen(0, () => {
            const address = server.address();
            resolve({
                server,
                baseUrl: `http://127.0.0.1:${address.port}`
            });
        });
    });
}

test('report submission persists a report and blocks duplicate submissions', async () => {
    resetModerationData();
    const { server, baseUrl } = await createServerForTests();

    try {
        const firstResponse = await fetch(`${baseUrl}/api/reports`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                reporterId: 'user-1',
                reportedUserId: 'user-2',
                contentType: 'post',
                contentId: 101,
                reason: 'spam',
                description: 'Test report'
            })
        });

        const firstBody = await firstResponse.json();
        assert.equal(firstResponse.status, 201);
        assert.equal(firstBody.reason, 'spam');

        const duplicateResponse = await fetch(`${baseUrl}/api/reports`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                reporterId: 'user-1',
                reportedUserId: 'user-2',
                contentType: 'post',
                contentId: 101,
                reason: 'spam',
                description: 'Duplicate'
            })
        });

        assert.equal(duplicateResponse.status, 409);
    } finally {
        server.close();
    }
});

test('moderator role is required for report listing and content deletion', async () => {
    resetModerationData();
    const { server, baseUrl } = await createServerForTests();

    try {
        const unauthorizedReports = await fetch(`${baseUrl}/api/reports`);
        assert.equal(unauthorizedReports.status, 403);

        const authorizedReports = await fetch(`${baseUrl}/api/reports`, {
            headers: { 'x-user-role': 'moderator' }
        });
        assert.equal(authorizedReports.status, 200);

        const deleteResponse = await fetch(`${baseUrl}/api/posts/1`, {
            method: 'DELETE',
            headers: { 'x-user-role': 'moderator' }
        });
        assert.equal(deleteResponse.status, 200);

        const postsResponse = await fetch(`${baseUrl}/api/posts`);
        const posts = await postsResponse.json();
        assert.equal(posts.length, 0);
    } finally {
        server.close();
    }
});
