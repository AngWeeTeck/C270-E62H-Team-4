const API_BASE = '/api/dashboard';
const AUTHOR = 'alex_92';   // later: comes from login

async function loadDashboard() {
  const root = document.getElementById('dashboard');

  try {
    const res = await fetch(`${API_BASE}/${AUTHOR}`);
    if (!res.ok) throw new Error('Failed to fetch dashboard');

    const d = await res.json();
    render(d);
  } catch (err) {
    root.innerHTML = `<p class="error">Could not load dashboard. Is the server running?</p>`;
    console.error(err);
  }
}

function render(d) {
  const root = document.getElementById('dashboard');

  const pct = d.xpProgress.isMax
    ? 100
    : (d.xpProgress.current / d.xpProgress.needed) * 100;

  const xpLabel = d.xpProgress.isMax
    ? 'Max level reached'
    : `${d.xpProgress.current} / ${d.xpProgress.needed} XP`;

  const change = d.leaderboard.change;
  const changeHtml = change > 0
    ? `<span class="trend up">↑ ${change} this week</span>`
    : change < 0
      ? `<span class="trend down">↓ ${Math.abs(change)} this week</span>`
      : `<span class="trend flat">No change</span>`;

  root.innerHTML = `
    <header class="greeting">
      <h1>Hi, ${d.author} 👋</h1>
      <p class="sub">${d.rank} · ${d.title}</p>
    </header>

    <section class="cards">
      <div class="card">
        <div class="card-label">⭐ Level</div>
        <div class="card-value">${d.level}</div>
        <div class="bar-track">
          <div class="bar-fill" style="width:${pct}%"></div>
        </div>
        <div class="card-note">${xpLabel}</div>
      </div>

      <div class="card">
        <div class="card-label">🪙 Coins</div>
        <div class="card-value">${d.coins}</div>
        <div class="card-note green">+${d.coinsToday} today</div>
      </div>

      <div class="card">
        <div class="card-label">🏆 Achievements</div>
        <div class="card-value">${d.achievements.earned}/${d.achievements.total}</div>
        <div class="card-note">
          ${d.achievements.next ? `Next: ${d.achievements.next}` : 'All unlocked!'}
        </div>
      </div>

      <div class="card">
        <div class="card-label">📊 Rank</div>
        <div class="card-value">#${d.leaderboard.position ?? '-'}</div>
        <div class="card-note">${changeHtml}</div>
      </div>
    </section>

    <section class="extras">
      <div class="pill">🔥 ${d.dailyStreak} day streak</div>
      <div class="pill">🤝 ${d.studentsHelped} students helped</div>
    </section>

    <nav class="actions">
      <a class="btn" href="leaderboard.html">View leaderboard</a>
    </nav>
  `;
}

loadDashboard();