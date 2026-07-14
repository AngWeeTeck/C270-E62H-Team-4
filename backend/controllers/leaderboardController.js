const leaderboardModel = require('../models/leaderboardModel');

const getLeaderboard = (req, res) => {
  try {
    const { limit } = req.query;
    const board = leaderboardModel.getLeaderboard(limit);
    res.json({ count: board.length, leaderboard: board });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load leaderboard' });
  }
};

const getPodium = (req, res) => {
  try {
    res.json({ podium: leaderboardModel.getLeaderboard(3) });
  } catch (err) {
    res.status(500).json({ error: 'Could not load podium' });
  }
};

const getPlayerPosition = (req, res) => {
  try {
    const player = leaderboardModel.getPlayerPosition(req.params.author);
    if (!player) return res.status(404).json({ error: 'Player not found' });
    res.json(player);
  } catch (err) {
    res.status(500).json({ error: 'Could not load player position' });
  }
};

module.exports = { getLeaderboard, getPodium, getPlayerPosition };