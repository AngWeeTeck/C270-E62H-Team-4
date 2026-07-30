const VOTER_ID_STORAGE_KEY = 'studyquest-forum-voter-id';

export function formatVoteScore(score) {
  return Number(score || 0);
}

export function resolveUserVote(item) {
  return Number(item.userVote || 0);
}

export function getVoterId() {
  if (typeof window === 'undefined') {
    return 'anonymous';
  }

  try {
    let voterId = window.localStorage.getItem(VOTER_ID_STORAGE_KEY);
    if (!voterId) {
      voterId = window.crypto?.randomUUID?.() || `voter-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      window.localStorage.setItem(VOTER_ID_STORAGE_KEY, voterId);
    }
    return voterId;
  } catch (error) {
    return 'anonymous';
  }
}
