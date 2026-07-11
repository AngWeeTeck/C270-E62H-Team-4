const badgeModel = require('../models/badgeModel');

// GET /api/badges
const getAllBadges = (req, res) => {
  const badges = badgeModel.getAllBadges();
  res.json(badges);
};

// GET /api/badges/user/:userId
const getUserBadges = (req, res) => {
  const { userId } = req.params;
  const earned = badgeModel.getBadgesByUser(userId);
  const all = badgeModel.getAllBadges();

  const result = all.map(badge => {
    const match = earned.find(e => e.id === badge.id);
    return {
      ...badge,
      earned: !!match,
      earnedAt: match ? match.earnedAt : null
    };
  });

  res.json({ userId: Number(userId), badges: result });
};

// POST /api/badges/award
const awardBadge = (req, res) => {
  const { userId, badgeId } = req.body;

  if (!userId || !badgeId) {
    return res.status(400).json({ error: 'userId and badgeId are required' });
  }

  const awarded = badgeModel.awardBadge(userId, badgeId);
  if (!awarded) {
    return res.status(409).json({ error: 'User already has this badge' });
  }

  res.status(201).json({ message: 'Badge awarded', data: awarded });
};

module.exports = { getAllBadges, getUserBadges, awardBadge };