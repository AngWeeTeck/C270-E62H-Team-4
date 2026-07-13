import { useEffect, useState } from 'react';
import { AiOutlineComment } from 'react-icons/ai';
import ThreadCard from './components/ThreadCard';
import ThreadDetail from './components/ThreadDetail';
import ThreadForm from './components/ThreadForm';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';

function App() {
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [alert, setAlert] = useState('');

  const loadThreads = async () => {
    try {
      const response = await fetch(`${API_BASE}/threads`);
      const data = await response.json();
      setThreads(data.threads || []);
    } catch (error) {
      setAlert('Unable to load threads.');
    }
  };

  useEffect(() => {
    loadThreads();
  }, []);

  return (
    <div className="app-shell">
      <header className="hero-header">
        <div>
          <p className="eyebrow">🎓 StudyQuest Community</p>
          <h1>Discuss questions, share knowledge, and learn together.</h1>
        </div>
        <button className="pill-button">🎁 Claim Reward</button>
      </header>

      <section className="section-grid">
        <div className="card card-feature">
          <div className="card-header">
            <h2>Start a new thread</h2>
            <p>Ask a question and invite classmates to reply.</p>
          </div>
          <ThreadForm onCreate={loadThreads} setSelectedThread={setSelectedThread} />
        </div>

        <div className="card card-feed">
          <div className="card-header">
            <div>
              <h2>Latest discussion threads</h2>
              <p>Browse the classroom feed and jump into conversations.</p>
            </div>
            <button className="icon-pill"><AiOutlineComment size={18} /> Feed</button>
          </div>

          {alert && <div className="alert-card">{alert}</div>}

          <div className="thread-grid">
            {threads.map((thread) => (
              <ThreadCard
                key={thread.id}
                thread={thread}
                onClick={() => setSelectedThread(thread)}
              />
            ))}
          </div>
        </div>
      </section>

      {selectedThread && (
        <div className="card card-detail">
          <ThreadDetail thread={selectedThread} onClose={() => setSelectedThread(null)} />
        </div>
      )}
    </div>
  );
}

export default App;
