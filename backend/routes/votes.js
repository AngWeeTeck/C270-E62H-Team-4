const express = require('express');
const Reply = require('../models/Reply');
const Thread = require('../models/Thread');
const Vote = require('../models/Vote');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

async function targetExists(targetType, targetId) {
  if (targetType === 'thread') {
    return Boolean(await Thread.exists({ id: targetId }));
  }

  if (targetType === 'reply') {
    return Boolean(await Reply.exists({ id: targetId }));
  }

  return false;
}

async function getVoteSummary(targetType, targetId, userId) {
  const totals = await Vote.aggregate([
    { $match: { targetType, targetId } },
    { $group: { _id: null, score: { $sum: '$voteValue' } } }
  ]);
  const userVote = userId
    ? await Vote.findOne({ targetType, targetId, userId })
    : null;

  return {
    score: totals[0]?.score || 0,
    userVote: userVote?.voteValue || 0
  };
}

router.put('/:targetType/:targetId/vote', requireAuth, async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const voteValue = Number(req.body.voteValue);

    if (!['thread', 'reply'].includes(targetType)) {
      return res.status(400).json({ error: 'Invalid vote target.' });
    }

    if (![1, -1].includes(voteValue)) {
      return res.status(400).json({ error: 'Vote value must be 1 or -1.' });
    }

    if (!(await targetExists(targetType, targetId))) {
      return res.status(404).json({ error: 'Vote target not found.' });
    }

    const existingVote = await Vote.findOne({
      userId: req.user._id,
      targetType,
      targetId
    });

    if (existingVote && existingVote.voteValue === voteValue) {
      await existingVote.deleteOne();
    } else if (existingVote) {
      existingVote.voteValue = voteValue;
      await existingVote.save();
    } else {
      await Vote.create({
        userId: req.user._id,
        targetType,
        targetId,
        voteValue
      });
    }

    const summary = await getVoteSummary(targetType, targetId, req.user._id);
    res.json({ success: true, ...summary });
  } catch (error) {
    if (error.code === 11000) {
      const summary = await getVoteSummary(req.params.targetType, req.params.targetId, req.user._id);
      return res.json({ success: true, ...summary });
    }

    res.status(500).json({ error: 'Unable to save vote.' });
  }
});

router.delete('/:targetType/:targetId/vote', requireAuth, async (req, res) => {
  try {
    const { targetType, targetId } = req.params;

    if (!['thread', 'reply'].includes(targetType)) {
      return res.status(400).json({ error: 'Invalid vote target.' });
    }

    if (!(await targetExists(targetType, targetId))) {
      return res.status(404).json({ error: 'Vote target not found.' });
    }

    await Vote.deleteOne({ userId: req.user._id, targetType, targetId });
    const summary = await getVoteSummary(targetType, targetId, req.user._id);
    res.json({ success: true, ...summary });
  } catch (error) {
    res.status(500).json({ error: 'Unable to remove vote.' });
  }
});

module.exports = {
  getVoteSummary,
  router
};
