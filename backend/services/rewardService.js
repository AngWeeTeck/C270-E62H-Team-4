const PlayerStats = require('../models/PlayerStats');
const { checkAchievements } = require('./achievementService');

function calculateLevel(xp) {
  return Math.floor(Math.max(0, Number(xp) || 0) / 100) + 1;
}

function getTitle(level) {
  if (level >= 5) return 'Code Master';
  if (level >= 4) return 'Quest Champion';
  if (level >= 3) return 'Helpful Contributor';
  if (level >= 2) return 'Freshman Explorer';
  return 'New Adventurer';
}

function getRank(level) {
  if (level >= 5) return "👑 Campus Legend";
  if (level >= 4) return "🎓 Mentor";
  if (level >= 3) return "⭐ Academic Knight";
  if (level >= 2) return "📚 Scholar";
  return "🌱 Freshman";
}

function rewardUser(author, action) {
  const rewards = {
    thread: { xp: 50, coins: 20 },
    reply: { xp: 25, coins: 10 },
    upvote: { xp: 10, coins: 5 }
  };

  const reward = rewards[action];

  if (!reward) {
    throw new Error('Invalid reward action');
  }

  const player = PlayerStats.getPlayer(author);

  player.xp = (player.xp || 0) + reward.xp;
  player.coins += reward.coins;

  player.totalXpEarned = (player.totalXpEarned || 0) + reward.xp;
  player.totalCoinsEarned = (player.totalCoinsEarned || 0) + reward.coins;

  if (action === "thread") {
    player.studyQuestsCompleted =
      (player.studyQuestsCompleted || 0) + 1;
  }

  if (action === "reply") {
    player.studentsHelped =
      (player.studentsHelped || 0) + 1;
  }
  
  player.level = calculateLevel(player.xp);
  player.title = getTitle(player.level);
  player.rank = getRank(player.level);

  const unlockedAchievements = checkAchievements(player);
  player.lastUnlockedAchievements = unlockedAchievements;

  PlayerStats.savePlayer(player);
  return {
    stats: player,
    unlockedAchievements
  };
}

module.exports = {
  rewardUser,
  calculateLevel,
  getTitle,
  getRank
};
