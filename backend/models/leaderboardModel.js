const PlayerStats = require('./PlayerStats');
const { calculateLevel, getTitle, getRank } = require('../services/rewardService');

const getLeaderboard = (limit) => {
  const players = PlayerStats.getAllPlayers();

  const sorted = [...players].sort((a, b) => {
    if (b.xp !== a.xp) return b.xp - a.xp;
    return (b.coins || 0) - (a.coins || 0);
  });

  const ranked = sorted.map((player, index) => {
    const level = player.level || calculateLevel(player.xp || 0);
    return {
      position: index + 1,
      author: player.author,
      xp: player.xp || 0,
      coins: player.coins || 0,
      level,
      title: player.title || getTitle(level),
      rank: player.rank || getRank(level),
      achievementsCount: (player.achievements || []).length,
      highestDailyStreak: player.highestDailyStreak || 0,
      studentsHelped: player.studentsHelped || 0
    };
  });

  return limit ? ranked.slice(0, Number(limit)) : ranked;
};

const getPlayerPosition = (author) => {
  const board = getLeaderboard();
  return board.find(p => p.author === author) || null;
};

module.exports = { getLeaderboard, getPlayerPosition };