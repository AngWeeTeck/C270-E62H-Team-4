const express = require('express');
const router = express.Router();
const Vote = require('../models/Vote');
const { createStore } = require('../dataStore');

const getVoterId = (req) => {
  return req.headers['x-voter-id'] || req.body.voterId || 'anonymous';
};

const isDbConnected = () => require('mongoose').connection.readyState === 1;

const getMemoryStore = (req) => {
  if (req.app.locals.dataStore) {
    return req.app.locals.dataStore;
  }

  const store = createStore();
  req.app.locals.dataStore = store;
  return store;
};

const getVotesForTarget = async (targetType, targetId, voterId, req) => {
  if (!isDbConnected()) {
    const store = getMemoryStore(req);
    const votes = store.getVotes().filter((vote) => vote.targetType === targetType && vote.targetId === targetId);
    const score = votes.reduce((sum, vote) => sum + (vote.value || 0), 0);
    const userVote = votes.find((vote) => vote.voterId === voterId)?.value || 0;
    return { score, userVote };
  }

  const votes = await Vote.find({ targetType, targetId });
  const score = votes.reduce((sum, vote) => sum + (vote.value || 0), 0);
  const userVote = votes.find((vote) => vote.voterId === voterId)?.value || 0;

  return { score, userVote };
};

const getVoteSummary = async (targetType, targetId, voterId, req = null) => {
  if (!targetType || !targetId) {
    return { score: 0, userVote: 0 };
  }

  return getVotesForTarget(targetType, targetId, voterId || 'anonymous', req);
};

const getVoteFromStore = (store, voterId, targetType, targetId) => {
  return store.getVotes().find((vote) =>
    vote.voterId === voterId &&
    vote.targetType === targetType &&
    vote.targetId === targetId
  );
};

const setVoteInStore = (store, voterId, targetType, targetId, value) => {
  return store.setVote({ voterId, targetType, targetId, value });
};

router.post('/:targetType/:targetId/vote', async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const { voteValue } = req.body;
    const voterId = getVoterId(req);
    const value = Number(voteValue);

    if (!['thread', 'reply'].includes(targetType)) {
      return res.status(400).json({ error: 'Invalid target type' });
    }

    if (![ -1, 0, 1 ].includes(value)) {
      return res.status(400).json({ error: 'Invalid vote value' });
    }

    if (!isDbConnected()) {
      const store = getMemoryStore(req);
      setVoteInStore(store, voterId, targetType, targetId, value);
      const summary = await getVoteSummary(targetType, targetId, voterId, req);
      return res.json(summary);
    }

    const existingVote = await Vote.findOne({ voterId, targetType, targetId });
    if (existingVote) {
      if (value === 0) {
        await existingVote.deleteOne();
      } else {
        existingVote.value = value;
        existingVote.updatedAt = new Date();
        await existingVote.save();
      }
    } else if (value !== 0) {
      await Vote.create({ voterId, targetType, targetId, value });
    }

    const summary = await getVoteSummary(targetType, targetId, voterId, req);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = {
  router,
  getVoteSummary
};
