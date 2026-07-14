const STORAGE_KEY = 'studyquest-forum-state';

export function loadForumState() {
  if (typeof window === 'undefined') {
    return { threads: [], selectedThreadId: null };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { threads: [], selectedThreadId: null };
    }

    const parsed = JSON.parse(raw);
    return {
      threads: Array.isArray(parsed.threads) ? parsed.threads : [],
      selectedThreadId: parsed.selectedThreadId ?? null
    };
  } catch (error) {
    console.warn('Failed to load forum state from localStorage:', error);
    return { threads: [], selectedThreadId: null };
  }
}

export function saveForumState(threads, selectedThreadId = null) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ threads, selectedThreadId })
  );
}
