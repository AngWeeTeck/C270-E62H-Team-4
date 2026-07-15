const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { createStore } = require('../dataStore');
const Thread = require('../models/Thread');
const Reply = require('../models/Reply');
const Vote = require('../models/Vote');
const { getVoteSummary } = require('./votes');

const isDbConnected = () => mongoose.connection.readyState === 1;

const getVoterId = (req) => {
  const headers = req?.headers || {};
  const body = req?.body || {};
  return headers['x-voter-id'] || body.voterId || null;
};

const resolveAuthor = (body = {}) => body.author || body.username || 'anonymous';
const resolveRichContent = (body = {}) => {
  if (body.richContent) return body.richContent;
  if (body.rich_content) return body.rich_content;
  return {
    html: body.content || '',
    embeds: []
  };
};

const getMemoryStore = (req) => {
  const existingStore = req.app.locals.dataStore || req.app.locals.store;
  if (existingStore) {
    return existingStore;
  }

  const store = createStore();
  req.app.locals.dataStore = store;
  req.app.locals.store = store;
  return store;
};

const serializeThread = async (thread) => {
  const threadObject = thread.toObject ? thread.toObject() : thread;
  const richContent = threadObject.richContent || threadObject.rich_content || resolveRichContent(threadObject);
  const replyCount = isDbConnected()
    ? await Reply.countDocuments({ threadId: threadObject.id })
    : (threadObject.reply_count ?? threadObject.replyCount ?? 0);

  return {
    ...threadObject,
    author: threadObject.author || threadObject.username || 'anonymous',
    richContent,
    rich_content: richContent,
    reply_count: replyCount,
    replyCount: replyCount,
    score: threadObject.score ?? 0,
    userVote: threadObject.userVote ?? 0,
    created_at: threadObject.created_at || threadObject.createdAt,
    createdAt: threadObject.createdAt || threadObject.created_at
  };
};

// Create a new thread
router.post('/', async (req, res) => {
  try {
    const { title, content } = req.body;
    const author = resolveAuthor(req.body);
    const richContent = resolveRichContent(req.body);

    // Validation
    if (!title || !content || !author) {
      return res.status(400).json({
        error: 'Title, content, and author are required'
      });
    }

    if (!isDbConnected()) {
      const thread = {
        id: uuidv4(),
        title,
        content,
        author,
        richContent,
        rich_content: richContent,
        reply_count: 0,
        replyCount: 0,
        score: 0,
        userVote: 0,
        replies: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const store = getMemoryStore(req);
      store.addThread(thread);
      req.app.locals.memoryThreads = store.getThreads();
      req.app.locals.memoryReplies = store.getReplies();
      return res.status(201).json(await serializeThread(thread));
    }

    const thread = new Thread({
      id: uuidv4(),
      title,
      content,
      author
    });

    const savedThread = await thread.save();
    res.status(201).json(await serializeThread(savedThread));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all threads (with pagination)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!isDbConnected()) {
      const voterId = getVoterId(req);
      const allThreads = (getMemoryStore(req).getThreads() || [])
        .slice()
        .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
      const pagedThreads = allThreads.slice(skip, skip + limit);
      const threadsWithVotes = await Promise.all(
        pagedThreads.map(async (thread) => ({
          ...(await serializeThread(thread)),
          ...(await getVoteSummary('thread', thread.id, voterId, req))
        }))
      );

      return res.json({
        threads: threadsWithVotes,
        pagination: {
          page,
          limit,
          total: allThreads.length,
          pages: Math.ceil(allThreads.length / limit)
        }
      });
    }

    const voterId = getVoterId(req);
    const threads = await Thread.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-replies');

    const threadsWithVotes = await Promise.all(
      threads.map(async (thread) => ({
        ...(await serializeThread(thread)),
        ...(await getVoteSummary('thread', thread.id, voterId, req))
      }))
    );

    const total = await Thread.countDocuments();

    res.json({
      threads: threadsWithVotes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single thread with replies
router.get('/:threadId', async (req, res) => {
  try {
    if (!isDbConnected()) {
      const voterId = getVoterId(req);
      const thread = (getMemoryStore(req).getThreads() || []).find((candidate) => candidate.id === req.params.threadId);
      if (!thread) {
        return res.status(404).json({ error: 'Thread not found' });
      }

      return res.json({
        ...thread,
        reply_count: thread.reply_count ?? thread.replyCount ?? 0,
        replyCount: thread.reply_count ?? thread.replyCount ?? 0,
        ...(await getVoteSummary('thread', thread.id, voterId, req))
      });
    }

    const thread = await Thread.findOne({ id: req.params.threadId }).populate({
      path: 'replies',
      select: '-__v'
    });

    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    const voterId = getVoterId(req);
    const serializedThread = await serializeThread(thread);
    res.json({
      ...serializedThread,
      ...(await getVoteSummary('thread', thread.id, voterId, req))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update thread
router.put('/:threadId', async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!isDbConnected()) {
      const thread = (getMemoryStore(req).getThreads() || []).find((candidate) => candidate.id === req.params.threadId);
      if (!thread) {
        return res.status(404).json({ error: 'Thread not found' });
      }
      thread.title = title;
      thread.content = content;
      thread.updatedAt = new Date().toISOString();
      return res.json({
        ...thread,
        reply_count: thread.reply_count ?? thread.replyCount ?? 0,
        replyCount: thread.reply_count ?? thread.replyCount ?? 0
      });
    }

    const thread = await Thread.findOneAndUpdate(
      { id: req.params.threadId },
      { title, content, updatedAt: new Date() },
      { new: true }
    );

    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    res.json(thread);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete thread
router.delete('/:threadId', async (req, res) => {
  try {
    if (!isDbConnected()) {
      const store = getMemoryStore(req);
      const threadIndex = (store.getThreads() || []).findIndex((candidate) => candidate.id === req.params.threadId);
      if (threadIndex === -1) {
        return res.status(404).json({ error: 'Thread not found' });
      }
      store.deleteThread(req.params.threadId);
      req.app.locals.memoryThreads = store.getThreads();
      req.app.locals.memoryReplies = store.getReplies();
      return res.json({ message: 'Thread deleted successfully' });
    }

    const thread = await Thread.findOne({ id: req.params.threadId });

    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    const replies = await Reply.find({ threadId: req.params.threadId }).select('id');
    const replyIds = replies.map((reply) => reply.id);

    await Thread.findOneAndDelete({ id: req.params.threadId });
    await Reply.deleteMany({ threadId: req.params.threadId });
    await Vote.deleteMany({
      $or: [
        { targetType: 'thread', targetId: req.params.threadId },
        { targetType: 'reply', targetId: { $in: replyIds } }
      ]
    });

    res.json({ message: 'Thread deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear all threads
router.delete('/', async (req, res) => {
  try {
    if (!isDbConnected()) {
      const store = getMemoryStore(req);
      store.clearThreads();
      req.app.locals.memoryThreads = store.getThreads();
      req.app.locals.memoryReplies = store.getReplies();
      return res.json({ message: 'All threads cleared successfully' });
    }

    await Thread.deleteMany({});
    const Reply = require('../models/Reply');
    await Reply.deleteMany({});
    await Vote.deleteMany({});

    res.json({ message: 'All threads cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
