import { useEffect, useState } from 'react';
import { AiOutlineComment } from 'react-icons/ai';
import ThreadCard from './components/ThreadCard';
import ThreadDetail from './components/ThreadDetail';
import ThreadForm from './components/ThreadForm';
import { loadForumState, saveForumState } from './utils/forumPersistence';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

function App() {
  const initialForumState = loadForumState();
  const [threads, setThreads] = useState(initialForumState.threads);
  const [selectedThread, setSelectedThread] = useState(() => {
    const restored = loadForumState();
    return restored.threads.find((thread) => thread.id === restored.selectedThreadId) || null;
  });

  useEffect(() => {
    saveForumState(threads, selectedThread?.id ?? null);
  }, [threads, selectedThread]);

  const clearAllThreads = async () => {
    try {
      const response = await fetch('/api/threads', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      let data = {};
      try {
        data = await response.json();
      } catch (err) {
        console.warn('Clear response was not valid JSON:', err);
      }

      if (!response.ok) {
        throw new Error(data.error || data.detail || 'Failed to clear threads');
      }

      console.log('✅ Threads cleared:', data.message || 'ok');
      setThreads([]);
      setSelectedThread(null);

      try {
        saveForumState([], null);
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('studyquest-forum-state', JSON.stringify({ threads: [], selectedThreadId: null }));
        }
      } catch (err) {
        console.warn('Failed to clear persisted forum state', err);
      }

      return data;
    } catch (error) {
      console.error('❌ Failed to clear threads:', error);
      throw error;
    }
  };

  const loadThreads = async () => {
    try {
      const response = await fetch(`${API_BASE}/threads`);
      if (!response.ok) {
        throw new Error(`Threads request failed: ${response.status}`);
      }

      const data = await response.json();
      const loadedThreads = Array.isArray(data.threads) ? data.threads : [];
      setThreads(loadedThreads);
      // persist authoritative server state so localStorage won't rehydrate deleted threads
      try {
        saveForumState(loadedThreads, null);
      } catch (err) {
        console.warn('Failed to save forum state after loading from server', err);
      }
    } catch (error) {
      console.error('Failed to load discussion threads:', error);
      // If server is unreachable, fall back to stored state in localStorage (do not overwrite it)
      const restored = loadForumState();
      setThreads(restored.threads || []);
      const restoredSelection = restored.threads.find((t) => t.id === restored.selectedThreadId) || null;
      setSelectedThread(restoredSelection);
    }
  };

  // Expose developer tools to window object
  useEffect(() => {
    window.devTools = {
      clearThreads: clearAllThreads,
      loadThreads,
      threads: () => threads,
      help: () => {
        console.log(`
🛠️  Developer Tools Available:
  • window.devTools.clearThreads()  - Delete all discussion threads
  • window.devTools.loadThreads()   - Reload threads from backend
  • window.devTools.threads()       - View current threads in memory
  • window.devTools.help()          - Show this help message
        `);
      }
    };
    window.devTools.help();
  }, [threads]);

  useEffect(() => {
    // Always try to fetch authoritative state from the server on startup.
    // If the server responds, its state overrides localStorage (so deletes are permanent).
    // If the server is unreachable, fall back to the saved local state.
    loadThreads();
  }, []);

  const handleCreateThread = async (newThread) => {
    if (!newThread) {
      await loadThreads();
      return;
    }

    setThreads((current) => [newThread, ...current]);
    setSelectedThread(newThread);
  };

  const handleThreadUpdated = (updater) => {
    setThreads((currentThreads) => currentThreads.map((thread) => {
      if (thread.id !== selectedThread?.id) {
        return thread;
      }

      return updater(thread);
    }));
    setSelectedThread((currentThread) => updater(currentThread));
  };

  return (
    <div className="app-shell">
      <header className="hero-header">
        <div>
          <p className="eyebrow">🎓 StudyQuest Community</p>
          <h1>Discuss questions, share knowledge, and learn together.</h1>
        </div>
      </header>

      <section className="section-grid">
        <div className="card card-feature">
          <div className="card-header">
            <h2>Start a new thread</h2>
            <p>Ask a question and invite classmates to reply.</p>
          </div>
          <ThreadForm onCreate={handleCreateThread} setSelectedThread={setSelectedThread} />
        </div>

        <div className="card card-feed">
          <div className="card-header">
            <div>
              <h2>Latest discussion threads</h2>
              <p>Browse the classroom feed and jump into conversations.</p>
            </div>
            <button className="icon-pill"><AiOutlineComment size={18} /> Feed</button>
          </div>

          {threads.length === 0 ? (
            <p className="empty-state">No discussions available right now.</p>
          ) : (
            <div className="thread-grid">
              {threads.map((thread) => (
                <ThreadCard
                  key={thread.id}
                  thread={thread}
                  onClick={() => setSelectedThread(thread)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {selectedThread && (
        <div className="card card-detail">
          <ThreadDetail
            thread={selectedThread}
            onClose={() => setSelectedThread(null)}
            onThreadUpdated={handleThreadUpdated}
          />
        </div>
      )}

      <footer style={{ padding: '20px', textAlign: 'center', borderTop: '1px solid #e0e0e0', marginTop: '40px' }}>
        <button 
          onClick={clearAllThreads} 
          title="Developer tool: Delete all discussion threads"
          style={{
            padding: '8px 16px',
            backgroundColor: '#ff6b6b',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#ff5252'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#ff6b6b'}
        >
          🗑️ Clear Threads (Dev Tool)
        </button>
      </footer>
    </div>
  );
}

export default App;
