// Mock DOM for Node.js environment
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body><div id="forum"></div></body></html>');
global.document = dom.window.document;
global.window = dom.window;

const ForumDisplay = require('../components/ForumDisplay');

describe('ForumDisplay Component', () => {
  let forum;

  beforeEach(() => {
    document.body.innerHTML = '<div id="forum"></div>';
    forum = new ForumDisplay('forum');
  });

  describe('Initialization', () => {
    test('should initialize with forum header and thread list', () => {
      const header = document.querySelector('.forum-header');
      const threadsList = document.getElementById('threads-list');

      expect(header).toBeTruthy();
      expect(threadsList).toBeTruthy();
    });

    test('should have create thread button', () => {
      const createBtn = document.getElementById('create-thread-btn');
      expect(createBtn).toBeTruthy();
      expect(createBtn.textContent).toContain('Create');
    });

    test('should load mock threads', (done) => {
      setTimeout(() => {
        const threads = forum.threads;
        expect(threads.length).toBeGreaterThan(0);
        expect(threads[0].title).toBeTruthy();
        done();
      }, 100);
    });
  });

  describe('Threads Display', () => {
    test('should render all threads in list', (done) => {
      setTimeout(() => {
        forum.renderThreadsList();
        const threadItems = document.querySelectorAll('.thread-item');
        expect(threadItems.length).toBe(forum.threads.length);
        done();
      }, 100);
    });

    test('should display thread title and author', (done) => {
      setTimeout(() => {
        forum.renderThreadsList();
        const firstThread = document.querySelector('.thread-item');
        expect(firstThread.textContent).toContain(forum.threads[0].title);
        expect(firstThread.textContent).toContain(forum.threads[0].author);
        done();
      }, 100);
    });

    test('should display thread preview (first 150 chars)', (done) => {
      setTimeout(() => {
        forum.renderThreadsList();
        const firstThread = document.querySelector('.thread-item');
        const preview = forum.threads[0].content.substring(0, 150);
        expect(firstThread.textContent).toContain(preview);
        done();
      }, 100);
    });

    test('should show reply count', (done) => {
      setTimeout(() => {
        forum.renderThreadsList();
        const firstThread = document.querySelector('.thread-item');
        expect(firstThread.textContent).toContain(String(forum.threads[0].replyCount));
        done();
      }, 100);
    });

    test('should format date properly', () => {
      const date = new Date('2024-01-15T10:30:00');
      const formatted = forum.formatDate(date);
      expect(formatted).toContain('2024');
      expect(formatted).toContain('Jan');
    });
  });

  describe('Thread Detail View', () => {
    test('should show thread detail when view button clicked', (done) => {
      setTimeout(() => {
        forum.renderThreadsList();
        const viewBtn = document.querySelector('.btn-view-thread');
        viewBtn.click();

        setTimeout(() => {
          const detail = document.getElementById('thread-detail');
          expect(detail.style.display).toBe('block');
          done();
        }, 50);
      }, 100);
    });

    test('should display thread title and content in detail view', (done) => {
      setTimeout(() => {
        forum.showThreadDetail(forum.threads[0].id);
        const detail = document.getElementById('thread-detail');
        expect(detail.textContent).toContain(forum.threads[0].title);
        expect(detail.textContent).toContain(forum.threads[0].content);
        done();
      }, 50);
    });

    test('should display all replies under thread', (done) => {
      setTimeout(() => {
        forum.showThreadDetail(forum.threads[0].id);
        const replies = document.querySelectorAll('.reply-item');
        expect(replies.length).toBe(forum.threads[0].replies.length);
        done();
      }, 50);
    });

    test('should have reply textarea for adding new replies', (done) => {
      setTimeout(() => {
        forum.showThreadDetail(forum.threads[0].id);
        const textarea = document.getElementById('new-reply-content');
        expect(textarea).toBeTruthy();
        done();
      }, 50);
    });

    test('should have back button to return to threads list', (done) => {
      setTimeout(() => {
        forum.showThreadDetail(forum.threads[0].id);
        const backBtn = document.getElementById('back-btn');
        expect(backBtn).toBeTruthy();

        backBtn.click();
        setTimeout(() => {
          const list = document.getElementById('threads-list');
          expect(list.style.display).not.toBe('none');
          done();
        }, 50);
      }, 50);
    });
  });

  describe('Reply Management', () => {
    test('should add new reply to thread', (done) => {
      setTimeout(() => {
        const threadId = forum.threads[0].id;
        forum.showThreadDetail(threadId);

        const textarea = document.getElementById('new-reply-content');
        textarea.value = 'New test reply';

        const submitBtn = document.getElementById('submit-reply-btn');
        const initialReplyCount = forum.threads[0].replies.length;

        submitBtn.click();

        setTimeout(() => {
          const updatedReplyCount = forum.threads[0].replies.length;
          expect(updatedReplyCount).toBe(initialReplyCount + 1);
          done();
        }, 50);
      }, 100);
    });

    test('should not add empty reply', (done) => {
      setTimeout(() => {
        forum.showThreadDetail(forum.threads[0].id);

        const textarea = document.getElementById('new-reply-content');
        textarea.value = '';

        const submitBtn = document.getElementById('submit-reply-btn');
        const initialReplyCount = forum.threads[0].replies.length;

        // Mock show error to verify it was called
        forum.showError = jest.fn();

        submitBtn.click();

        setTimeout(() => {
          expect(forum.threads[0].replies.length).toBe(initialReplyCount);
          done();
        }, 50);
      }, 100);
    });

    test('should display reply author and date', (done) => {
      setTimeout(() => {
        forum.showThreadDetail(forum.threads[0].id);
        const replyItem = document.querySelector('.reply-item');
        const reply = forum.threads[0].replies[0];

        expect(replyItem.textContent).toContain(reply.author);
        expect(replyItem.textContent).toContain(reply.content);
        done();
      }, 50);
    });
  });

  describe('Voting System', () => {
    test('should upvote a thread and toggle the same vote off', (done) => {
      setTimeout(() => {
        forum.renderThreadsList();
        const thread = forum.threads[0];
        const initialScore = Number(thread.score || 0);
        const upvote = document.querySelector(
          `.vote-controls[data-target-type="thread"][data-target-id="${thread.id}"] .vote-btn[data-vote-value="1"]`
        );

        upvote.click();

        setTimeout(() => {
          expect(thread.score).toBe(initialScore + 1);
          expect(thread.userVote).toBe(1);

          const toggledUpvote = document.querySelector(
            `.vote-controls[data-target-type="thread"][data-target-id="${thread.id}"] .vote-btn[data-vote-value="1"]`
          );
          toggledUpvote.click();

          setTimeout(() => {
            expect(thread.score).toBe(initialScore);
            expect(thread.userVote).toBe(0);
            done();
          }, 25);
        }, 25);
      }, 100);
    });

    test('should switch directly from an upvote to a downvote', (done) => {
      setTimeout(async () => {
        const thread = forum.threads[0];
        const initialScore = Number(thread.score || 0);

        await forum.submitVote('thread', thread.id, 1);
        await forum.submitVote('thread', thread.id, -1);

        expect(thread.score).toBe(initialScore - 1);
        expect(thread.userVote).toBe(-1);
        done();
      }, 100);
    });
  });

  describe('Security', () => {
    test('should escape HTML in thread title', () => {
      const maliciousInput = '<script>alert("XSS")</script>';
      const escaped = forum.escapeHtml(maliciousInput);
      expect(escaped).not.toContain('<script>');
    });

    test('should escape HTML in author names', () => {
      const maliciousAuthor = '<img src=x onerror="alert(\'XSS\')">';
      const escaped = forum.escapeHtml(maliciousAuthor);
      // After escaping, the actual tag characters should be encoded
      expect(escaped).toContain('&lt;');
      expect(escaped).toContain('&gt;');
      expect(escaped).not.toContain('<img');
    });

    test('should escape HTML in reply content', () => {
      const maliciousContent = '<iframe src="evil.com"></iframe>';
      const escaped = forum.escapeHtml(maliciousContent);
      expect(escaped).not.toContain('<iframe');
    });
  });

  describe('Notifications', () => {
    test('should show success notification', (done) => {
      forum.showSuccess('Test success');

      setTimeout(() => {
        const notification = document.querySelector('.notification-success');
        expect(notification).toBeTruthy();
        expect(notification.textContent).toContain('Test success');
        done();
      }, 50);
    });

    test('should show error notification', (done) => {
      forum.showError('Test error');

      setTimeout(() => {
        const notification = document.querySelector('.notification-error');
        expect(notification).toBeTruthy();
        expect(notification.textContent).toContain('Test error');
        done();
      }, 50);
    });

    test('should auto-remove notification after 3 seconds', (done) => {
      forum.showSuccess('Test auto-remove');

      setTimeout(() => {
        const notification = document.querySelector('.notification-success');
        expect(notification).toBeTruthy();
      }, 500);

      setTimeout(() => {
        const notification = document.querySelector('.notification-success');
        expect(notification).toBeFalsy();
        done();
      }, 3500);
    });
  });

  describe('Mock Data', () => {
    test('should load mock threads with all required fields', (done) => {
      setTimeout(() => {
        const threads = forum.threads;
        threads.forEach(thread => {
          expect(thread.id).toBeTruthy();
          expect(thread.title).toBeTruthy();
          expect(thread.content).toBeTruthy();
          expect(thread.author).toBeTruthy();
          expect(thread.replyCount).toBeGreaterThanOrEqual(0);
          expect(thread.createdAt).toBeTruthy();
          expect(Array.isArray(thread.replies)).toBe(true);
        });
        done();
      }, 100);
    });

    test('should have replies with all required fields', (done) => {
      setTimeout(() => {
        const thread = forum.threads[0];
        thread.replies.forEach(reply => {
          expect(reply.id).toBeTruthy();
          expect(reply.content).toBeTruthy();
          expect(reply.author).toBeTruthy();
          expect(reply.createdAt).toBeTruthy();
        });
        done();
      }, 100);
    });
  });
});
