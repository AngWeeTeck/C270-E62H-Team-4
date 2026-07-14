const fs = require('fs');
const path = require('path');

function createStore({ filePath = path.join(__dirname, 'data', 'store.json') } = {}) {
  const resolvedPath = path.resolve(filePath);
  const dir = path.dirname(resolvedPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const readState = () => {
    if (!fs.existsSync(resolvedPath)) {
      return { threads: [], replies: [] };
    }

    try {
      const content = fs.readFileSync(resolvedPath, 'utf8');
      const parsed = JSON.parse(content);
      return {
        threads: Array.isArray(parsed.threads) ? parsed.threads : [],
        replies: Array.isArray(parsed.replies) ? parsed.replies : []
      };
    } catch (error) {
      return { threads: [], replies: [] };
    }
  };

  const writeState = (state) => {
    fs.writeFileSync(resolvedPath, JSON.stringify(state, null, 2));
  };

  const state = readState();

  const persist = () => {
    writeState({ threads: state.threads, replies: state.replies });
  };

  const getThreads = () => state.threads;
  const getReplies = () => state.replies;

  const addThread = (thread) => {
    state.threads.push(thread);
    persist();
    return thread;
  };

  const addReply = (reply) => {
    state.replies.push(reply);
    const thread = state.threads.find((candidate) => candidate.id === reply.threadId);
    if (thread) {
      thread.replies = Array.isArray(thread.replies) ? thread.replies : [];
      thread.replies.push(reply.id);
      thread.replyCount = (thread.replyCount || 0) + 1;
      thread.reply_count = thread.replyCount;
    }
    persist();
    return reply;
  };

  const deleteThread = (threadId) => {
    const threadIndex = state.threads.findIndex((thread) => thread.id === threadId);
    if (threadIndex === -1) {
      return false;
    }

    state.threads.splice(threadIndex, 1);
    state.replies = state.replies.filter((reply) => reply.threadId !== threadId);
    persist();
    return true;
  };

  const deleteReply = (replyId) => {
    const replyIndex = state.replies.findIndex((reply) => reply.id === replyId);
    if (replyIndex === -1) {
      return false;
    }

    const reply = state.replies[replyIndex];
    state.replies.splice(replyIndex, 1);
    const thread = state.threads.find((candidate) => candidate.id === reply.threadId);
    if (thread) {
      thread.replies = (thread.replies || []).filter((candidate) => candidate !== replyId);
      thread.replyCount = thread.replies.length;
      thread.reply_count = thread.replyCount;
    }
    persist();
    return true;
  };

  const clearThreads = () => {
    state.threads = [];
    state.replies = [];
    state.threads.forEach((thread) => {
      thread.replies = [];
      thread.replyCount = 0;
      thread.reply_count = 0;
    });
    persist();
    return true;
  };

  const clearReplies = () => {
    state.replies = [];
    state.threads.forEach((thread) => {
      thread.replies = [];
      thread.replyCount = 0;
      thread.reply_count = 0;
    });
    persist();
    return true;
  };

  return {
    getThreads,
    getReplies,
    addThread,
    addReply,
    deleteThread,
    deleteReply,
    clearThreads,
    clearReplies
  };
}

module.exports = { createStore };
