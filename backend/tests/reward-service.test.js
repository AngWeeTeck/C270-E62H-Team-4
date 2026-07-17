jest.mock('../models/PlayerStats', () => {
  const players = new Map();
  return {
    getPlayer: jest.fn(author => {
      if (!players.has(author)) {
        players.set(author, {
          author,
          xp: 0,
          coins: 0,
          level: 1,
          totalXpEarned: 0,
          totalCoinsEarned: 0,
          studyQuestsCompleted: 0,
          studentsHelped: 0,
          ownedItems: [],
          achievements: [],
          vouchers: []
        });
      }
      return players.get(author);
    }),
    savePlayer: jest.fn(player => player),
    __reset: () => players.clear()
  };
});

const PlayerStats = require('../models/PlayerStats');
const { rewardUser } = require('../services/rewardService');

describe('forum rewards', () => {
  beforeEach(() => {
    PlayerStats.__reset();
    jest.clearAllMocks();
  });

  test('a new thread gives the configured reward and unlocks First Steps once', () => {
    const first = rewardUser('account', 'thread');
    expect(first.stats).toMatchObject({ xp: 50, coins: 45, studyQuestsCompleted: 1 });
    expect(first.unlockedAchievements.map(item => item.id)).toEqual(['first_steps']);

    const second = rewardUser('account', 'thread');
    expect(second.stats).toMatchObject({ xp: 100, coins: 65, studyQuestsCompleted: 2 });
    expect(second.unlockedAchievements).toEqual([]);
  });

  test('replies give 25 XP and 10 base coins, unlocking Community Helper at ten', () => {
    let result;
    for (let count = 1; count <= 10; count += 1) result = rewardUser('helper', 'reply');

    expect(result.stats).toMatchObject({ xp: 250, studentsHelped: 10 });
    expect(result.unlockedAchievements.map(item => item.id)).toContain('community_helper');

    const next = rewardUser('helper', 'reply');
    expect(next.unlockedAchievements.map(item => item.id)).not.toContain('community_helper');
  });

  test('invalid actions do not create or save a player', () => {
    expect(() => rewardUser('account', 'invalid')).toThrow('Invalid reward action');
    expect(PlayerStats.getPlayer).not.toHaveBeenCalled();
    expect(PlayerStats.savePlayer).not.toHaveBeenCalled();
  });
});
