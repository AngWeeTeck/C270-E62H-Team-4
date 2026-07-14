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
      return { threads: [], replies: [], votes: [] };
    }

    try {
      const content = fs.readFileSync(resolvedPath, 'utf8');
      const parsed = JSON.parse(content);
      return {
        threads: Array.isArray(parsed.threads) ? parsed.threads : [],
        replies: Array.isArray(parsed.replies) ? parsed.replies : [],
        votes: Array.isArray(parsed.votes) ? parsed.votes : []
      };
    } catch (error) {
      return { threads: [], replies: [], votes: [] };
    }
  };

  const writeState = (state) => {
    fs.writeFileSync(resolvedPath, JSON.stringify(state, null, 2));
  };

  const state = readState();

  const persist = () => {
    writeState({ threads: state.threads, replies: state.replies, votes: state.votes });
  };

  const getThreads = () => state.threads;
  const getReplies = () => state.replies;
  const getVotes = () => state.votes;

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

  const setVote = (vote) => {
    const existingVoteIndex = state.votes.findIndex((candidate) =>
      candidate.voterId === vote.voterId &&
      candidate.targetType === vote.targetType &&
      candidate.targetId === vote.targetId
    );

    if (existingVoteIndex !== -1) {
      if (vote.value === 0) {
        state.votes.splice(existingVoteIndex, 1);
      } else {
        state.votes[existingVoteIndex] = {
          ...state.votes[existingVoteIndex],
          value: vote.value,
          updatedAt: vote.updatedAt || new Date().toISOString()
        };
      }
    } else if (vote.value !== 0) {
      state.votes.push({
        ...vote,
        createdAt: vote.createdAt || new Date().toISOString(),
        updatedAt: vote.updatedAt || new Date().toISOString()
      });
    }

    persist();
    return vote;
  };

  const deleteVote = (voterId, targetType, targetId) => {
    const voteIndex = state.votes.findIndex((candidate) =>
      candidate.voterId === voterId &&
      candidate.targetType === targetType &&
      candidate.targetId === targetId
    );

    if (voteIndex === -1) {
      return false;
    }

    state.votes.splice(voteIndex, 1);
    persist();
    return true;
  };

  const clearVotes = () => {
    state.votes = [];
    persist();
    return true;
  };

  const deleteThread = (threadId) => {
    const threadIndex = state.threads.findIndex((thread) => thread.id === threadId);
    if (threadIndex === -1) {
      return false;
    }

    state.threads.splice(threadIndex, 1);
    state.replies = state.replies.filter((reply) => reply.threadId !== threadId);
    state.votes = state.votes.filter((vote) => vote.targetType !== 'thread' || vote.targetId !== threadId);
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
    state.votes = state.votes.filter((vote) => vote.targetType !== 'reply' || vote.targetId !== replyId);
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
    state.votes = [];
    persist();
    return true;
  };

  const clearReplies = () => {
    state.replies = [];
    state.votes = state.votes.filter((vote) => vote.targetType !== 'reply');
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
    getVotes,
    addThread,
    addReply,
    setVote,
    deleteVote,
    clearThreads,
    clearReplies,
    clearVotes
  };
}

module.exports = { createStore };