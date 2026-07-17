const PlayerStats = require('../models/PlayerStats');
const { checkAchievements } = require('./achievementService');
const { calculateLevel, getTitle, getRank } = require('./rewardService');

function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

function daysBetween(left, right) {
  return Math.round((Date.parse(right) - Date.parse(left)) / 86400000);
}

function getDailyReward(streak) {
  const rewardDay = ((streak - 1) % 7) + 1;

  const rewards = {
    1: { day: 1, xp: 20, coins: 15, label: 'Day 1 Reward' },
    2: { day: 2, xp: 25, coins: 20, label: 'Day 2 Reward' },
    3: { day: 3, xp: 30, coins: 25, label: 'Day 3 Reward' },
    4: { day: 4, xp: 35, coins: 30, label: 'Day 4 Reward' },
    5: { day: 5, xp: 40, coins: 35, label: 'Day 5 Mystery Reward', cosmeticReward: '🌸 Sakura Theme' },
    6: { day: 6, xp: 50, coins: 40, label: 'Day 6 Reward' },
    7: { day: 7, xp: 75, coins: 60, label: 'Day 7 Legendary Reward', cosmeticReward: '👑 Crown Badge' }
  };

  return rewards[rewardDay];
}

function claimDailyReward(author) {
  const player = PlayerStats.getPlayer(author);
  const today = getTodayDate();

  if (player.lastDailyRewardDate === today) {
    throw new Error('Daily reward already claimed today.');
  }

  const gap = player.lastDailyRewardDate ? daysBetween(player.lastDailyRewardDate, today) : 1;
  player.dailyStreak = gap === 1 ? (player.dailyStreak || 0) + 1 : 1;

  player.highestDailyStreak = Math.max(
    player.highestDailyStreak || 0,
    player.dailyStreak
  );

  const reward = getDailyReward(player.dailyStreak);

  player.xp += reward.xp;
  player.coins += reward.coins;

  player.totalXpEarned =
  (player.totalXpEarned || 0) + reward.xp;

  player.totalCoinsEarned =
    (player.totalCoinsEarned || 0) + reward.coins;

  if (reward.cosmeticReward && !player.ownedItems.includes(reward.cosmeticReward)) {
    player.ownedItems.push(reward.cosmeticReward);
  }

  player.level = calculateLevel(player.xp);
  player.title = getTitle(player.level);
  player.rank = getRank(player.level);

  player.lastDailyRewardDate = today;
  player.dailyRewardsClaimed = (player.dailyRewardsClaimed || 0) + 1;

  const unlockedAchievements = checkAchievements(player);
  player.lastUnlockedAchievements = unlockedAchievements;

  PlayerStats.savePlayer(player);

  return {
    player,
    reward
  };
}

module.exports = {
  claimDailyReward,
  getDailyReward
};
