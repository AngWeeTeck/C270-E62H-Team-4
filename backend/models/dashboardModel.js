const PlayerStats = require('./PlayerStats');
const { calculateLevel, getTitle, getRank } = require('../services/rewardService');
const { achievementCatalog } = require('../services/achievementService');
const { getLeaderboard } = require('./leaderboardModel');

// Matches rewardService thresholds: 0 / 100 / 300 / 600 / 1000
const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000];

// Work out XP progress within the current level
const getXpProgress = (xp) => {
  const level = calculateLevel(xp);

  if (level >= 5) {
    return { current: xp, needed: xp, isMax: true };
  }

  const floor = LEVEL_THRESHOLDS[level - 1];
  const ceiling = LEVEL_THRESHOLDS[level];

  return {
    current: xp - floor,
    needed: ceiling - floor,
    isMax: false
  };
};

const getDashboard = (author) => {
  const player = PlayerStats.getPlayer(author);
  const level = player.level || calculateLevel(player.xp || 0);
  const progress = getXpProgress(player.xp || 0);

  // Where they sit on the leaderboard
  const board = getLeaderboard();
  const me = board.find(p => p.author === author);
  const position = me ? me.position : null;

  // Rank movement — needs rankHistory in players.json
  const history = player.rankHistory || [];
  const lastWeek = history.length ? history[history.length - 1] : null;
  const rankChange = (lastWeek !== null && position !== null)
    ? lastWeek - position       // positive = moved UP
    : 0;

  // Achievements progress
  const earned = player.achievements || [];
  const earnedIds = earned.map(a => a.id);
  const nextAchievement = achievementCatalog.find(a => !earnedIds.includes(a.id));

  return {
    author: player.author,
    level,
    title: player.title || getTitle(level),
    rank: player.rank || getRank(level),
    xp: player.xp || 0,
    xpProgress: progress,
    coins: player.coins || 0,
    coinsToday: player.coinsToday || 0,
    achievements: {
      earned: earned.length,
      total: achievementCatalog.length,
      next: nextAchievement ? nextAchievement.name : null
    },
    leaderboard: {
      position,
      change: rankChange
    },
    dailyStreak: player.dailyStreak || 0,
    studentsHelped: player.studentsHelped || 0
  };
};

module.exports = { getDashboard, getXpProgress };