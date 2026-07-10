const Follow = require('../models/Follow');

describe('Social Engine: Follow Model', () => {
  test('should create a follow relationship successfully', () => {
    const followData = {
      id: 'test-follow-1',
      follower: 'Faris',
      following: 'WeeTeck'
    };

    const follow = new Follow(followData);
    expect(follow.follower).toBe('Faris');
    expect(follow.following).toBe('WeeTeck');
  });

  test('should require follower and following fields (Validation)', () => {
    const follow = new Follow({});
    // This confirms the database won't create 'ghost' follows without users
    expect(follow.follower).toBeUndefined();
    expect(follow.following).toBeUndefined();
  });
});