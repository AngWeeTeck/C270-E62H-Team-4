const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Thread = require('../models/Thread');
const { optionalAuth, requireAuth } = require('../middleware/auth');
const { getVoteSummary } = require('./votes');

// Create a new thread
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, content } = req.body;

    // Validation
    if (!title || !content) {
      return res.status(400).json({
        error: 'Title and content are required'
      });
    }

    const thread = new Thread({
      id: uuidv4(),
      title: title.trim(),
      content: content.trim(),
      author: req.user.username
    });

    const savedThread = await thread.save();
    res.status(201).json({
      ...savedThread.toObject(),
      score: 0,
      userVote: 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all threads (with pagination)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const userId = req.user?._id;
    const threads = await Thread.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-replies');
    const threadsWithVotes = await Promise.all(
      threads.map(async (thread) => ({
        ...thread.toObject(),
        ...(await getVoteSummary('thread', thread.id, userId))
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
router.get('/:threadId', optionalAuth, async (req, res) => {
  try {
    const thread = await Thread.findOne({ id: req.params.threadId });

    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    res.json({
      ...thread.toObject(),
      ...(await getVoteSummary('thread', thread.id, req.user?._id))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update thread
router.put('/:threadId', requireAuth, async (req, res) => {
  try {
    const { title, content } = req.body;

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
router.delete('/:threadId', requireAuth, async (req, res) => {
  try {
    const thread = await Thread.findOneAndDelete({ id: req.params.threadId });

    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    // Also delete all replies for this thread
    const Reply = require('../models/Reply');
    await Reply.deleteMany({ threadId: req.params.threadId });

    res.json({ message: 'Thread deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
