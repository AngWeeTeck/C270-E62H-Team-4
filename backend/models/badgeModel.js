
const badges = [
  { id: 1, name: 'First Post',          description: 'Create your very first thread',   icon: '🌱', rarity: 'common',    hidden: false },
  { id: 2, name: 'Helpful Contributor', description: 'Earn 10 accepted answers',        icon: '🏅', rarity: 'rare',      hidden: false },
  { id: 3, name: '7-Day Streak',        description: 'Log in 7 days in a row',          icon: '🔥', rarity: 'uncommon',  hidden: false },
  { id: 4, name: 'Conversation Starter',description: 'Start 5 discussions',             icon: '💬', rarity: 'common',    hidden: false },
  { id: 5, name: 'Night Owl',           description: 'Post between 2am and 4am',        icon: '🦉', rarity: 'legendary', hidden: true  }
];

// Which badges each user has earned
const userBadges = [
  { userId: 1, badgeId: 1, earnedAt: '2026-07-01' },
  { userId: 1, badgeId: 3, earnedAt: '2026-07-08' },
  { userId: 2, badgeId: 1, earnedAt: '2026-07-02' }
];

const getAllBadges = () => badges.filter(b => !b.hidden);

const getBadgesByUser = (userId) => {
  const earned = userBadges.filter(ub => ub.userId === Number(userId));
  return earned.map(ub => {
    const badge = badges.find(b => b.id === ub.badgeId);
    return { ...badge, earnedAt: ub.earnedAt };
  });
};

const awardBadge = (userId, badgeId) => {
  const already = userBadges.find(
    ub => ub.userId === Number(userId) && ub.badgeId === Number(badgeId)
  );
  if (already) return null;

  const newEntry = {
    userId: Number(userId),
    badgeId: Number(badgeId),
    earnedAt: new Date().toISOString().split('T')[0]
  };
  userBadges.push(newEntry);
  return newEntry;
};

module.exports = { getAllBadges, getBadgesByUser, awardBadge, badges };