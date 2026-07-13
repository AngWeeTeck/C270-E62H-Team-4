const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Thread = require('../models/Thread');

// Create a new thread
router.post('/', async (req, res) => {
  try {
    const { title, content, author } = req.body;

    // Validation
    if (!title || !content || !author) {
      return res.status(400).json({
        error: 'Title, content, and author are required'
      });
    }

    const thread = new Thread({
      id: uuidv4(),
      title,
      content,
      author
    });

    const savedThread = await thread.save();
    res.status(201).json(savedThread);
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

    const threads = await Thread.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-replies');

    const total = await Thread.countDocuments();

    res.json({
      threads,
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
    const thread = await Thread.findOne({ id: req.params.threadId }).populate({
      path: 'replies',
      select: '-__v'
    });

    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    res.json(thread);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update thread
router.put('/:threadId', async (req, res) => {
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
router.delete('/:threadId', async (req, res) => {
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
