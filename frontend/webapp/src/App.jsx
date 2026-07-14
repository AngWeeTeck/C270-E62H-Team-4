import { useEffect, useState } from 'react';
import ThreadCard from './components/ThreadCard';
import ThreadDetail from './components/ThreadDetail';
import ThreadForm from './components/ThreadForm';
import NotificationDisplay from './components/NotificationDisplay';
import SocialFeatures from './components/SocialFeatures';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

function App() {
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [activeTab, setActiveTab] = useState('feed'); // 'feed', 'notifications', 'social'
  const [activeUserName, setActiveUserName] = useState('User 3');
  const [activeUserId, setActiveUserId] = useState('3');

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
        <button className="pill-button">🎁 Claim Reward</button>
      </header>

      {/* Navigation Tabs and User Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginTop: '1.5rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button 
            onClick={() => setActiveTab('feed')} 
            style={{ 
              padding: '10px 20px', 
              borderRadius: '999px', 
              border: 'none', 
              background: activeTab === 'feed' ? 'linear-gradient(135deg, #5b4fe4 0%, #3b82f6 100%)' : '#fff',
              color: activeTab === 'feed' ? '#fff' : '#1f2937',
              fontWeight: 'bold', 
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              transition: 'all 0.2s ease'
            }}
          >
            💬 Forum Feed
          </button>
          <button 
            onClick={() => setActiveTab('notifications')} 
            style={{ 
              padding: '10px 20px', 
              borderRadius: '999px', 
              border: 'none', 
              background: activeTab === 'notifications' ? 'linear-gradient(135deg, #5b4fe4 0%, #3b82f6 100%)' : '#fff',
              color: activeTab === 'notifications' ? '#fff' : '#1f2937',
              fontWeight: 'bold', 
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              transition: 'all 0.2s ease'
            }}
          >
            🔔 Notifications
          </button>
          <button 
            onClick={() => setActiveTab('social')} 
            style={{ 
              padding: '10px 20px', 
              borderRadius: '999px', 
              border: 'none', 
              background: activeTab === 'social' ? 'linear-gradient(135deg, #5b4fe4 0%, #3b82f6 100%)' : '#fff',
              color: activeTab === 'social' ? '#fff' : '#1f2937',
              fontWeight: 'bold', 
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              transition: 'all 0.2s ease'
            }}
          >
            👥 Community Socials
          </button>
        </div>

        {/* User Switcher Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', padding: '5px 15px', borderRadius: '999px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#666' }}>Logged in as:</span>
          <select 
            value={activeUserId}
            onChange={(e) => {
              const id = e.target.value;
              setActiveUserId(id);
              if (id === '1') setActiveUserName('User 1');
              else if (id === '2') setActiveUserName('User 2');
              else setActiveUserName('User 3');
            }}
            style={{ 
              border: 'none', 
              outline: 'none', 
              background: 'transparent', 
              fontWeight: 'bold', 
              color: '#3b82f6', 
              cursor: 'pointer' 
            }}
          >
            <option value="3">User 3</option>
            <option value="1">User 1</option>
            <option value="2">User 2</option>
          </select>
        </div>
      </div>

      {activeTab === 'feed' && (
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
              <button className="icon-pill">Feed</button>
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
      )}

      {activeTab === 'notifications' && (
        <div className="card" style={{ marginTop: '1.5rem', background: '#fff' }}>
          <NotificationDisplay currentUser={activeUserName} />
        </div>
      )}

      {activeTab === 'social' && (
        <div className="card" style={{ marginTop: '1.5rem', background: '#fff' }}>
          <SocialFeatures currentUserId={activeUserId} />
        </div>
      )}

      {selectedThread && activeTab === 'feed' && (
        <div className="card card-detail">
          <ThreadDetail
            thread={selectedThread}
            onClose={() => setSelectedThread(null)}
            onThreadUpdated={handleThreadUpdated}
          />
        </div>
      )}
    </div>
  );
}

export default App;

