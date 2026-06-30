/**
 * Forum Thread & Reply Display Component
 * Features:
 * - Display forum threads
 * - Show replies under each thread
 * - Create new threads and replies
 * - Display in main feed
 */

class ForumDisplay {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = options;
    this.threads = [];
    this.selectedThreadId = null;
    this.apiUrl = options.apiUrl || '/api';
    
    this.initializeDisplay();
  }

  initializeDisplay() {
    this.container.innerHTML = `
      <div class="forum-container">
        <div class="forum-header">
          <h1>Forum Discussions</h1>
          <button id="create-thread-btn" class="btn btn-primary">Create New Thread</button>
        </div>
        <div id="threads-list" class="threads-list"></div>
        <div id="thread-detail" class="thread-detail" style="display:none;"></div>
      </div>
    `;

    this.setupEventListeners();
    this.loadThreads();
  }

  setupEventListeners() {
    const createBtn = document.getElementById('create-thread-btn');
    if (createBtn) {
      createBtn.addEventListener('click', () => this.showCreateThreadModal());
    }
  }

  async loadThreads() {
    try {
      // Mock data for demonstration (replace with actual API call)
      this.threads = this.getMockThreads();
      this.renderThreadsList();
    } catch (error) {
      console.error('Error loading threads:', error);
      this.showError('Failed to load threads');
    }
  }

  getMockThreads() {
    return [
      {
        id: '1',
        title: 'Welcome to the Forum',
        content: 'This is the first thread. Feel free to introduce yourself and ask questions!',
        author: 'Admin',
        replyCount: 3,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        replies: [
          { id: '1-1', content: 'Great place to discuss ideas!', author: 'User1', createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000) },
          { id: '1-2', content: 'Looking forward to participating', author: 'User2', createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000) },
          { id: '1-3', content: 'Thanks for setting this up!', author: 'User3', createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000) }
        ]
      },
      {
        id: '2',
        title: 'How to use the Rich Text Editor',
        content: 'The rich text editor supports formatting, code blocks, and media embeds.',
        author: 'Moderator',
        replyCount: 1,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        replies: [
          { id: '2-1', content: 'This is super helpful, thanks!', author: 'User4', createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000) }
        ]
      }
    ];
  }

  renderThreadsList() {
    const threadsList = document.getElementById('threads-list');
    if (!threadsList) return;

    threadsList.innerHTML = this.threads.map(thread => `
      <div class="thread-item" data-thread-id="${thread.id}">
        <div class="thread-header">
          <h3 class="thread-title">${this.escapeHtml(thread.title)}</h3>
          <span class="thread-author">by ${this.escapeHtml(thread.author)}</span>
        </div>
        <p class="thread-preview">${this.escapeHtml(thread.content.substring(0, 150))}...</p>
        <div class="thread-meta">
          <span class="reply-count">💬 ${thread.replyCount} replies</span>
          <span class="thread-date">${this.formatDate(thread.createdAt)}</span>
          <button class="btn-view-thread" data-thread-id="${thread.id}">View Thread</button>
        </div>
      </div>
    `).join('');

    // Add event listeners
    threadsList.querySelectorAll('.btn-view-thread').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const threadId = btn.dataset.threadId;
        this.showThreadDetail(threadId);
      });
    });
  }

  showThreadDetail(threadId) {
    const thread = this.threads.find(t => t.id === threadId);
    if (!thread) return;

    const threadDetail = document.getElementById('thread-detail');
    const threadsList = document.getElementById('threads-list');
    
    threadDetail.innerHTML = `
      <div class="thread-detail-container">
        <button id="back-btn" class="btn btn-secondary">← Back to Threads</button>
        <div class="thread-detail-header">
          <h2>${this.escapeHtml(thread.title)}</h2>
          <p class="detail-author">Posted by ${this.escapeHtml(thread.author)} on ${this.formatDate(thread.createdAt)}</p>
        </div>
        <div class="thread-detail-content">
          ${this.escapeHtml(thread.content)}
        </div>
        <div class="replies-section">
          <h3>Replies (${thread.replyCount})</h3>
          <div id="replies-list" class="replies-list">
            ${thread.replies.map(reply => `
              <div class="reply-item">
                <div class="reply-header">
                  <span class="reply-author">${this.escapeHtml(reply.author)}</span>
                  <span class="reply-date">${this.formatDate(reply.createdAt)}</span>
                </div>
                <div class="reply-content">${this.escapeHtml(reply.content)}</div>
              </div>
            `).join('')}
          </div>
          <div class="add-reply-section">
            <textarea id="new-reply-content" class="reply-textarea" placeholder="Write your reply..."></textarea>
            <button id="submit-reply-btn" class="btn btn-primary">Post Reply</button>
          </div>
        </div>
      </div>
    `;

    threadsList.style.display = 'none';
    threadDetail.style.display = 'block';

    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        threadDetail.style.display = 'none';
        threadsList.style.display = 'block';
      });
    }

    const submitReplyBtn = document.getElementById('submit-reply-btn');
    if (submitReplyBtn) {
      submitReplyBtn.addEventListener('click', () => this.submitReply(threadId));
    }
  }

  submitReply(threadId) {
    const replyContent = document.getElementById('new-reply-content');
    if (!replyContent || !replyContent.value.trim()) {
      this.showError('Reply content cannot be empty');
      return;
    }

    const thread = this.threads.find(t => t.id === threadId);
    if (thread) {
      const newReply = {
        id: `${threadId}-${thread.replies.length + 1}`,
        content: replyContent.value,
        author: 'You',
        createdAt: new Date()
      };

      thread.replies.push(newReply);
      thread.replyCount = thread.replies.length;
      
      replyContent.value = '';
      this.showThreadDetail(threadId);
      this.showSuccess('Reply posted successfully!');
    }
  }

  showCreateThreadModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <h2>Create New Thread</h2>
        <form id="create-thread-form">
          <input type="text" id="thread-title" placeholder="Thread Title" required>
          <textarea id="thread-content" placeholder="Thread Content" required></textarea>
          <div class="modal-buttons">
            <button type="submit" class="btn btn-primary">Create Thread</button>
            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    const form = document.getElementById('create-thread-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('thread-title').value;
        const content = document.getElementById('content').value;

        if (title && content) {
          const newThread = {
            id: String(this.threads.length + 1),
            title,
            content,
            author: 'You',
            replyCount: 0,
            createdAt: new Date(),
            replies: []
          };

          this.threads.unshift(newThread);
          this.renderThreadsList();
          modal.remove();
          this.showSuccess('Thread created successfully!');
        }
      });
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      background: ${type === 'error' ? '#ef4444' : '#10b981'};
      color: white;
      border-radius: 5px;
      z-index: 1000;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}

// Export for use in Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ForumDisplay;
}
