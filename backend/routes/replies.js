const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { createStore } = require('../dataStore');
const Reply = require('../models/Reply');
const Thread = require('../models/Thread');

const isDbConnected = () => mongoose.connection.readyState === 1;

const resolveAuthor = (body = {}) => body.author || body.username || 'anonymous';
const resolveRichContent = (body = {}) => {
  if (body.richContent) return body.richContent;
  if (body.rich_content) return body.rich_content;
  return defaultRichContentTemplate(body.content || '');
};

const getMemoryStore = (req) => {
  if (req.app.locals.dataStore) {
    return req.app.locals.dataStore;
  }

  const store = createStore();
  req.app.locals.dataStore = store;
  return store;
};

const defaultRichContentTemplate = (text = '') => ({
  text,
  formatting: {
    bold: [],
    italic: [],
    codeBlocks: []
  },
  embeds: []
});

const serializeReply = (reply) => {
  const replyObject = reply.toObject ? reply.toObject() : reply;
  const richContent = replyObject.richContent || replyObject.rich_content || defaultRichContentTemplate(replyObject.content || '');

  return {
    ...replyObject,
    author: replyObject.author || replyObject.username || 'anonymous',
    richContent,
    rich_content: richContent,
    created_at: replyObject.created_at || replyObject.createdAt,
    createdAt: replyObject.createdAt || replyObject.created_at
  };
};

// Create reply to a thread
router.post('/:threadId/replies', async (req, res) => {
  try {
    const { threadId } = req.params;
    const { content } = req.body;
    const author = resolveAuthor(req.body);
    const richContent = resolveRichContent(req.body);

    // Validation
    if (!content || !author) {
      return res.status(400).json({
        error: 'Content and author are required'
      });
    }

    if (!isDbConnected()) {
      const thread = (req.app.locals.memoryThreads || []).find((candidate) => candidate.id === threadId);
      if (!thread) {
        return res.status(404).json({ error: 'Thread not found' });
      }

      const reply = {
        id: uuidv4(),
        threadId,
        content,
        author,
        richContent,
        rich_content: richContent,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      getMemoryStore(req).addReply(reply);
      req.app.locals.memoryReplies.push(reply);
      thread.replies = Array.isArray(thread.replies) ? thread.replies : [];
      thread.replies.push(reply.id);
      thread.reply_count = (thread.reply_count || 0) + 1;
      thread.replyCount = thread.reply_count;
      return res.status(201).json(serializeReply(reply));
    }

    // Check if thread exists
    const thread = await Thread.findOne({ id: threadId });
    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    const reply = new Reply({
      id: uuidv4(),
      threadId,
      content,
      author,
      richContent
    });

    const savedReply = await reply.save();

    // Update thread's reply count and replies array
    thread.replies.push(savedReply._id);
    thread.replyCount = await Reply.countDocuments({ threadId });
    await thread.save();

    res.status(201).json(serializeReply(savedReply));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all replies for a thread
router.get('/:threadId/replies', async (req, res) => {
  try {
    const { threadId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    if (!isDbConnected()) {
      const thread = (req.app.locals.memoryThreads || []).find((candidate) => candidate.id === threadId);
      if (!thread) {
        return res.status(404).json({ error: 'Thread not found' });
      }

      const replies = (req.app.locals.memoryReplies || [])
        .filter((candidate) => candidate.threadId === threadId)
        .slice()
        .sort((left, right) => new Date(left.createdAt) - new Date(right.createdAt));

      return res.json({
        replies: replies.slice(skip, skip + limit).map(serializeReply),
        pagination: {
          page,
          limit,
          total: replies.length,
          pages: Math.ceil(replies.length / limit)
        }
      });
    }

    // Check if thread exists
    const thread = await Thread.findOne({ id: threadId });
    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    const replies = await Reply.find({ threadId })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Reply.countDocuments({ threadId });

    res.json({
      replies: replies.map(serializeReply),
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

// Get single reply
router.get('/reply/:replyId', async (req, res) => {
  try {
    const reply = await Reply.findOne({ id: req.params.replyId });

    if (!reply) {
      return res.status(404).json({ error: 'Reply not found' });
    }

    res.json(reply);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update reply
router.put('/reply/:replyId', async (req, res) => {
  try {
    const { content, richContent } = req.body;
    const existingReply = await Reply.findOne({ id: req.params.replyId });

    if (!existingReply) {
      return res.status(404).json({ error: 'Reply not found' });
    }

    const reply = await Reply.findOneAndUpdate(
      { id: req.params.replyId },
      {
        content: content !== undefined ? content : existingReply.content,
        richContent: richContent !== undefined ? richContent : existingReply.richContent,
        updatedAt: new Date()
      },
      { new: true }
    );

    res.json(reply);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete reply
router.delete('/reply/:replyId', async (req, res) => {
  try {
    const reply = await Reply.findOneAndDelete({ id: req.params.replyId });

    if (!reply) {
      return res.status(404).json({ error: 'Reply not found' });
    }

    if (!isDbConnected()) {
      const thread = (req.app.locals.memoryThreads || []).find((candidate) => candidate.id === reply.threadId);
      if (thread) {
        getMemoryStore(req).deleteReply(req.params.replyId);
        req.app.locals.memoryReplies = (req.app.locals.memoryReplies || []).filter((candidate) => candidate.id !== req.params.replyId);
        thread.replies = (thread.replies || []).filter((candidate) => candidate !== req.params.replyId);
        thread.reply_count = thread.replies.length;
        thread.replyCount = thread.reply_count;
      }
      return res.json({ message: 'Reply deleted successfully' });
    }

    // Update thread's reply count
    const thread = await Thread.findOne({ id: reply.threadId });
    if (thread) {
      thread.replies = thread.replies.filter(r => r.toString() !== reply._id.toString());
      thread.replyCount = await Reply.countDocuments({ threadId: reply.threadId });
      await thread.save();
    }

    res.json({ message: 'Reply deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
