const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Reply = require('../models/Reply');
const Thread = require('../models/Thread');

// Create reply to a thread
router.post('/:threadId/replies', async (req, res) => {
  try {
    const { threadId } = req.params;
    const { content, author, richContent } = req.body;

    // Validation
    if (!content || !author) {
      return res.status(400).json({
        error: 'Content and author are required'
      });
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
      richContent: richContent || null
    });

    const savedReply = await reply.save();

    // Update thread's reply count and replies array
    thread.replies.push(savedReply._id);
    thread.replyCount = thread.replies.length;
    await thread.save();

    res.status(201).json(savedReply);
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
      replies,
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

    const reply = await Reply.findOneAndUpdate(
      { id: req.params.replyId },
      { content, richContent, updatedAt: new Date() },
      { new: true }
    );

    if (!reply) {
      return res.status(404).json({ error: 'Reply not found' });
    }

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

    // Update thread's reply count
    const thread = await Thread.findOne({ id: reply.threadId });
    if (thread) {
      thread.replies = thread.replies.filter(r => r.toString() !== reply._id.toString());
      thread.replyCount = thread.replies.length;
      await thread.save();
    }

    res.json({ message: 'Reply deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
