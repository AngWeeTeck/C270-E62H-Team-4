const API_BASE = 'https://musical-space-adventure-qvpp757xr96cg7q-5000.app.github.dev/api/leaderboard';

async function loadLeaderboard() {
  const board = document.getElementById('board');

  try {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error('Failed to fetch leaderboard');

    const data = await res.json();
    renderPodium(data.leaderboard.slice(0, 3));
    renderBoard(data.leaderboard);
  } catch (err) {
    board.innerHTML = `<p class="error">Could not load leaderboard. Is the server running?</p>`;
    console.error(err);
  }
}

function renderPodium(top3) {
  const podium = document.getElementById('podium');
  const medals = ['🥇', '🥈', '🥉'];
  const order = [1, 0, 2]; // 2nd, 1st, 3rd for visual staging

  podium.innerHTML = order
    .filter(i => top3[i])
    .map(i => {
      const p = top3[i];
      return `
        <div class="podium-slot place-${p.position}">
          <div class="medal">${medals[p.position - 1]}</div>
          <div class="podium-name">${p.author}</div>
          <div class="podium-title">${p.title}</div>
          <div class="podium-xp">${p.xp.toLocaleString()} XP</div>
        </div>
      `;
    }).join('');
}

function renderBoard(players) {
  const board = document.getElementById('board');

  board.innerHTML = `
    <div class="row header-row">
      <span>#</span>
      <span>Player</span>
      <span>Level</span>
      <span>XP</span>
      <span>Coins</span>
    </div>
    ${players.map(p => `
      <div class="row ${p.position <= 3 ? 'top-three' : ''}">
        <span class="pos">${p.position}</span>
        <span class="player">
          <strong>${p.author}</strong>
          <small>${p.rank}</small>
        </span>
        <span class="level">Lv ${p.level}<small>${p.title}</small></span>
        <span class="xp">${p.xp.toLocaleString()}</span>
        <span class="coins">🪙 ${p.coins}</span>
      </div>
    `).join('')}
  `;
}

loadLeaderboard();