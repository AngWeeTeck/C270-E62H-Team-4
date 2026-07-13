const express = require('express');
const router = express.Router();
const { checkAchievements, achievementCatalog } = require('../services/achievementService');

const PlayerStats = require('../models/PlayerStats');
const { rewardUser, calculateLevel, getTitle, getRank } = require('../services/rewardService');
const { claimDailyReward } = require('../services/dailyRewardService');

// Get all players
router.get('/', (req, res) => {
  try {
    const players = PlayerStats.getAllPlayers();
    res.json(players);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get one player
router.get('/:author', (req, res) => {
  try {
    const player = PlayerStats.getPlayer(req.params.author);
    res.json(player);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Give rewards
router.post('/:author/reward', (req, res) => {
  try {
    const { action } = req.body;

    const player = rewardUser(req.params.author, action);

    res.json({
      message: `${action} reward added`,
      stats: player
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Spend coins
router.post('/:author/spend', (req, res) => {
  try {

    const { item, amount } = req.body;

    const player = PlayerStats.getPlayer(req.params.author);

    if (player.coins < amount) {
      return res.status(400).json({
        error: "Not enough coins"
      });
    }

    player.coins -= amount;

    player.totalCoinsSpent =
      (player.totalCoinsSpent || 0) + Number(amount);

    if (item.includes("Voucher")) {

      player.vouchers = player.vouchers || [];

      player.vouchers.push({
          id: Date.now().toString(),

          name: item,

          description: "Enjoy 10% off at participating RP food stalls.",

          discount: "10%",

          redeemed: false
      });

    } else {

      if (!player.ownedItems.includes(item)) {
          player.ownedItems.push(item);
      }

}

    const unlockedAchievements = checkAchievements(player);
    player.lastUnlockedAchievements = unlockedAchievements;

    PlayerStats.savePlayer(player);

    res.json({
      message: `${item} purchased`,
      stats: player
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Apply cosmetic
router.post('/:author/apply', (req, res) => {

  try {

    const { item } = req.body;

    const player = PlayerStats.getPlayer(req.params.author);

    if (!player.ownedItems.includes(item)) {
      return res.status(400).json({
        error: "You do not own this item."
      });
    }

    let removed = false;

    switch (item) {

      case "Blue Profile Theme":
        if (player.appliedTheme === "blue") {
          player.appliedTheme = "default";
          removed = true;
        } else {
          player.appliedTheme = "blue";
        }
        break;

      case "🌌 Galaxy Theme":
        if (player.appliedTheme === "galaxy") {
          player.appliedTheme = "default";
          removed = true;
        } else {
          player.appliedTheme = "galaxy";
        }
        break;

      case "🌸 Sakura Theme":
        if (player.appliedTheme === "sakura") {
          player.appliedTheme = "default";
          removed = true;
        } else {
          player.appliedTheme = "sakura";
        }
        break;

      case "Gold Avatar Frame":
        if (player.appliedFrame === "gold") {
          player.appliedFrame = "default";
          removed = true;
        } else {
          player.appliedFrame = "gold";
        }
        break;

      case "🔥 Phoenix Frame":
        if (player.appliedFrame === "phoenix") {
          player.appliedFrame = "default";
          removed = true;
        } else {
          player.appliedFrame = "phoenix";
        }
        break;

      case "Special Title Badge":
        if (player.appliedBadge === "special") {
          player.appliedBadge = "default";
          removed = true;
        } else {
          player.appliedBadge = "special";
        }
        break;

      case "💎 Diamond Badge":
        if (player.appliedBadge === "diamond") {
          player.appliedBadge = "default";
          removed = true;
        } else {
          player.appliedBadge = "diamond";
        }
        break;

      case "👑 Crown Badge":
        if (player.appliedBadge === "crown") {
          player.appliedBadge = "default";
          removed = true;
        } else {
          player.appliedBadge = "crown";
        }
        break;
    }

    PlayerStats.savePlayer(player);

    res.json({
      message: removed
        ? `${item} removed`
        : `${item} applied`,
      action: removed ? "removed" : "applied",
      stats: player
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }

});

//reset button
router.post('/:author/reset', (req, res) => {
  try {
    const author = req.params.author;

    const resetPlayer = {
      author,
      xp: 0,
      level: 1,
      title: 'New Adventurer',
      rank: "🌱 Freshman",
      coins: 0,
      totalXpEarned: 0,
      totalCoinsEarned: 0,
      totalCoinsSpent: 0,
      highestDailyStreak: 0,
      studyQuestsCompleted: 0,
      studentsHelped: 0,
      ownedItems: [],
      achievements: [],
      appliedTheme: 'default',
      appliedFrame: 'default',
      appliedBadge: 'default',
      dailyStreak: 0,
      lastDailyRewardDate: null,
      dailyRewardsClaimed: 0,
    };

    PlayerStats.savePlayer(resetPlayer);

    res.json({
      message: 'Player progress reset',
      stats: resetPlayer
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Claim Daily Reward
router.post('/:author/daily-reward', (req, res) => {
  try {

    const result = claimDailyReward(req.params.author);

    res.json({
      message: "Daily reward claimed!",
      reward: result.reward,
      stats: result.player
    });

  } catch (err) {

    res.status(400).json({
      error: err.message
    });

  }
});

router.post('/:author/dev/:action', (req, res) => {
  try {
    const author = req.params.author;
    const action = req.params.action;
    const player = PlayerStats.getPlayer(author);

    const shopCosmetics = [
      'Blue Profile Theme',
      'Gold Avatar Frame',
      'Special Title Badge'
    ];

    const exclusiveCosmetics = [
      '🌌 Galaxy Theme',
      '🔥 Phoenix Frame',
      '💎 Diamond Badge',
      '🌸 Sakura Theme',
      '👑 Crown Badge'
    ];

    if (action === 'skip-day') {
      if (player.lastDailyRewardDate) {
        const previousDate = new Date(player.lastDailyRewardDate);
        previousDate.setUTCDate(previousDate.getUTCDate() - 1);

        player.lastDailyRewardDate = previousDate
          .toISOString()
          .split('T')[0];
      } else {
        const yesterday = new Date();
        yesterday.setUTCDate(yesterday.getUTCDate() - 1);

        player.lastDailyRewardDate = yesterday
          .toISOString()
          .split('T')[0];
      }
    }

    if (action === 'skip-week') {
      if (player.lastDailyRewardDate) {
        const previousDate = new Date(player.lastDailyRewardDate);
        previousDate.setUTCDate(previousDate.getUTCDate() - 7);

        player.lastDailyRewardDate = previousDate
          .toISOString()
          .split('T')[0];
      } else {
        const previousWeek = new Date();
        previousWeek.setUTCDate(previousWeek.getUTCDate() - 7);

        player.lastDailyRewardDate = previousWeek
          .toISOString()
          .split('T')[0];
      }
    }

    if (action === 'add-xp') {
      player.xp += 100;
    }

    if (action === 'add-coins') {
      player.coins += 500;
    }

    if (action === 'max-level') {
      player.xp = 1000;
    }

    if (action === 'unlock-cosmetics') {
      [...shopCosmetics, ...exclusiveCosmetics].forEach(item => {
        if (!player.ownedItems.includes(item)) {
          player.ownedItems.push(item);
        }
      });
    }

    if (action === 'unlock-achievements') {
      achievementCatalog.forEach(achievement => {
      const alreadyUnlocked = player.achievements.some(
      item => item.id === achievement.id
    );

    if (!alreadyUnlocked) {
      const unlockedAchievement = {
        ...achievement,
        dateUnlocked: new Date().toISOString()
      };

      player.achievements.push(unlockedAchievement);
      player.coins += achievement.reward;

      if (
        achievement.cosmeticReward &&
        !player.ownedItems.includes(achievement.cosmeticReward)
      ) {
        player.ownedItems.push(achievement.cosmeticReward);
      }
    }
  });
}

    player.level = calculateLevel(player.xp);
    player.title = getTitle(player.level);
    player.rank = getRank(player.level);

    const unlockedAchievements = checkAchievements(player);
    player.lastUnlockedAchievements = unlockedAchievements;

    PlayerStats.savePlayer(player);

    res.json({
      message: `Developer action completed: ${action}`,
      stats: player
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Redeem voucher
router.post("/:author/vouchers/:voucherId/redeem", (req, res) => {
  try {
    const player = PlayerStats.getPlayer(req.params.author);

    player.vouchers = player.vouchers || [];

    const voucher = player.vouchers.find(
      item => item.id === req.params.voucherId
    );

    if (!voucher) {
      return res.status(404).json({
        error: "Voucher not found."
      });
    }

    if (voucher.redeemed) {
      return res.status(400).json({
        error: "Voucher has already been redeemed."
      });
    }

    voucher.redeemed = true;
    voucher.dateRedeemed = new Date().toISOString();

    PlayerStats.savePlayer(player);

    res.json({
      message: `${voucher.name} redeemed`,
      voucher,
      stats: player
    });
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

module.exports = router;