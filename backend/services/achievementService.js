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
  },
  {
    id: "community_helper",
    name: "🤝 Community Helper",
    rarity: "EPIC",
    reward: 100,
    description: "Help 10 students.",
    voucherReward: {
      id: "rp-food-5",
      name: "RP Food Discount Voucher",
      description: "Enjoy 5% off at participating RP food stalls.",
      discount: "5%"
    }
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

  if (achievement.voucherReward) {
    player.vouchers = player.vouchers || [];

    const alreadyOwned = player.vouchers.some(
      voucher => voucher.id === achievement.voucherReward.id
    );

    if (!alreadyOwned) {
      player.vouchers.push({
        ...achievement.voucherReward,
        redeemed: false,
        dateUnlocked: new Date().toISOString()
      });
    }
  }

  unlocked.push(newAchievement);
}

function checkAchievements(player) {
  player.ownedItems = player.ownedItems || [];
  player.achievements = player.achievements || [];
  player.vouchers = player.vouchers || [];

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

    if (
      achievement.id === "community_helper" &&
      (player.studentsHelped || 0) >= 10
    ) {
      unlockAchievement(player, achievement, unlocked);
    }
  });

  return unlocked;
}

module.exports = {
  achievementCatalog,
  checkAchievements
};
