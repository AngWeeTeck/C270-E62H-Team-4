const achievementCatalog = [
  {
    id: 'first_steps',
    name: '🌱 First Steps',
    rarity: 'COMMON',
    reward: 25,
    description: 'Earn your first XP.',
    cosmeticReward: null
  },
  {
    id: 'rising_star',
    name: '⭐ Rising Star',
    rarity: 'RARE',
    reward: 50,
    description: 'Reach Level 3.',
    cosmeticReward: '🌌 Galaxy Theme'
  },
  {
    id: 'wealth_collector',
    name: '💰 Wealth Collector',
    rarity: 'EPIC',
    reward: 75,
    description: 'Own at least 100 coins.',
    cosmeticReward: '💎 Diamond Badge'
  },
  {
    id: 'collector',
    name: '🎨 Collector',
    rarity: 'LEGENDARY',
    reward: 100,
    description: 'Own all 3 shop cosmetics.',
    cosmeticReward: '🔥 Phoenix Frame'
  }
];

const SHOP_COSMETICS = [
  'Blue Profile Theme',
  'Gold Avatar Frame',
  'Special Title Badge'
];

function unlockAchievement(player, achievement, unlocked) {
  const alreadyUnlocked = player.achievements.some(
    item => item.id === achievement.id
  );

  if (alreadyUnlocked) {
    return;
  }

  const newAchievement = {
    ...achievement,
    dateUnlocked: new Date().toISOString()
  };

  player.achievements.push(newAchievement);
  player.coins += achievement.reward;

  if (
    achievement.cosmeticReward &&
    !player.ownedItems.includes(achievement.cosmeticReward)
  ) {
    player.ownedItems.push(achievement.cosmeticReward);
  }

  unlocked.push(newAchievement);
}

function checkAchievements(player) {
  const unlocked = [];
  const ownsAllShopCosmetics = SHOP_COSMETICS.every(item =>
    player.ownedItems.includes(item)
  );

  achievementCatalog.forEach(achievement => {
    if (achievement.id === 'first_steps' && player.xp > 0) {
      unlockAchievement(player, achievement, unlocked);
    }

    if (achievement.id === 'rising_star' && player.level >= 3) {
      unlockAchievement(player, achievement, unlocked);
    }

    if (achievement.id === 'wealth_collector' && player.coins >= 100) {
      unlockAchievement(player, achievement, unlocked);
    }

    if (achievement.id === 'collector' && ownsAllShopCosmetics) {
      unlockAchievement(player, achievement, unlocked);
    }
  });

  return unlocked;
}

module.exports = {
  achievementCatalog,
  checkAchievements
};
