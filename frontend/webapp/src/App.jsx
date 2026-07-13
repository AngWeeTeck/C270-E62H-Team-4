import { useEffect, useState } from 'react';
import { AiOutlineComment } from 'react-icons/ai';
import ThreadCard from './components/ThreadCard';
import ThreadDetail from './components/ThreadDetail';
import ThreadForm from './components/ThreadForm';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

function App() {
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);

  const clearAllThreads = async () => {
    try {
      const response = await fetch(`${API_BASE}/threads`, {
        method: 'DELETE'
      });
      const data = await response.json();
      console.log('✅ Threads cleared:', data.message);
      setThreads([]);
      setSelectedThread(null);
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
    } catch (error) {
      console.error('Failed to load discussion threads:', error);
      setThreads([]);
      setSelectedThread(null);
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
