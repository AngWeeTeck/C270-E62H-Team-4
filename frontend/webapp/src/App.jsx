import { useEffect, useState } from 'react';
import { AiOutlineComment } from 'react-icons/ai';
import ThreadCard from './components/ThreadCard';
import ThreadDetail from './components/ThreadDetail';
import ThreadForm from './components/ThreadForm';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';

const fallbackThreads = [
  {
    id: 101,
    title: 'RP students: how should we prep for the capstone pitch?',
    author: 'Alicia, RP 2A',
    reply_count: 7,
    content: 'We are sharing slides and talking through the pitch flow before Friday.',
    rich_content: {
      html: '<p>We are sharing slides and talking through the pitch flow before Friday.</p>'
    }
  },
  {
    id: 102,
    title: 'Course 3B discussion: best ways to explain AI ethics in class',
    author: 'Ben, RP 3B',
    reply_count: 5,
    content: 'The group wants clearer examples for a 10-minute presentation this week.',
    rich_content: {
      html: '<p>The group wants clearer examples for a 10-minute presentation this week.</p>'
    }
  },
  {
    id: 103,
    title: 'Anyone else struggling with the new UI assignment brief?',
    author: 'Chloe, RP 1C',
    reply_count: 9,
    content: 'A few of us are comparing notes and mock screens before the review session.',
    rich_content: {
      html: '<p>A few of us are comparing notes and mock screens before the review session.</p>'
    }
  }
];

function App() {
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [alert, setAlert] = useState('');

  const loadThreads = async () => {
    try {
      const response = await fetch(`${API_BASE}/threads`);
      const data = await response.json();
      const loadedThreads = data.threads?.length ? data.threads : fallbackThreads;
      setThreads(loadedThreads);
      setAlert(data.threads?.length ? '' : 'Showing sample discussions while the server is unavailable.');
    } catch (error) {
      setThreads(fallbackThreads);
      setAlert('Showing sample discussions while the server is unavailable.');
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
    setAlert('');
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
          <ThreadDetail
            thread={selectedThread}
            onClose={() => setSelectedThread(null)}
            onThreadUpdated={setSelectedThread}
          />
        </div>
      )}
    </div>
  );
}

export default App;
