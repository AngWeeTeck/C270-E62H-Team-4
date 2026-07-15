import { useEffect, useState } from 'react';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('threadquest_auth_user');
      if (stored) {
        const user = JSON.parse(stored);
        setUsername(user.username || 'Member');
      }
    } catch (error) {
      console.warn('Navbar failed to read stored user:', error);
    }
  }, []);

  return (
    <nav className="app-nav">
      <div className="nav-inner">
        <a className="nav-brand" href="./index.html">StudyQuest</a>

        <button className="nav-toggle" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          <span className="sr-only">Toggle navigation</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
        </button>

        <div className={`nav-links ${open ? 'open' : ''}`}>
          <a href="./index.html" className="nav-link">Home</a>
          <a href="./threads.html" className="nav-link">Threads</a>
          <a href="./profile.html" className="nav-link">Profile</a>
          <a href="./leaderboard.html" className="nav-link">Leaderboard</a>
          <a href="./dashboard.html" className="nav-link">Dashboard</a>
          <a href="./moderator.html" className="nav-link">Moderator</a>
          {username && <span className="nav-badge">{`Hi, ${username}`}</span>}
        </div>
      </div>
    </nav>
  );
}
