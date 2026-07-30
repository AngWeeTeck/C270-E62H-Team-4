class StatisticsDashboard {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  render(player) {
    const achievementsUnlocked = player.achievements?.length || 0;
    const cosmeticsOwned = player.ownedItems?.length || 0;

    this.container.innerHTML = `
      <div class="card statistics-card">
        <div class="statistics-header">
          <div>
            <h2>📊 Player Statistics</h2>
            <p>Your StudyQuest progress at a glance.</p>
          </div>

          <div class="statistics-rank">
            ${player.rank || "🌱 Freshman"}
          </div>
        </div>

        <div class="statistics-grid">
          <div class="statistic-item">
            <span class="statistic-icon">⭐</span>
            <small>Total XP Earned</small>
            <strong>${player.totalXpEarned || 0}</strong>
          </div>

          <div class="statistic-item">
            <span class="statistic-icon">💰</span>
            <small>Total Coins Earned</small>
            <strong>${player.totalCoinsEarned || 0}</strong>
          </div>

          <div class="statistic-item">
            <span class="statistic-icon">🛒</span>
            <small>Total Coins Spent</small>
            <strong>${player.totalCoinsSpent || 0}</strong>
          </div>

          <div class="statistic-item">
            <span class="statistic-icon">🏅</span>
            <small>Achievements</small>
            <strong>${achievementsUnlocked} / 4</strong>
          </div>

          <div class="statistic-item">
            <span class="statistic-icon">🎨</span>
            <small>Cosmetics Owned</small>
            <strong>${cosmeticsOwned}</strong>
          </div>

          <div class="statistic-item">
            <span class="statistic-icon">🎁</span>
            <small>Daily Rewards Claimed</small>
            <strong>${player.dailyRewardsClaimed || 0}</strong>
          </div>

          <div class="statistic-item">
            <span class="statistic-icon">🔥</span>
            <small>Highest Daily Streak</small>
            <strong>${player.highestDailyStreak || 0}</strong>
          </div>

          <div class="statistic-item">
            <span class="statistic-icon">📚</span>
            <small>Study Quests Completed</small>
            <strong>${player.studyQuestsCompleted || 0}</strong>
          </div>

          <div class="statistic-item">
            <span class="statistic-icon">🤝</span>
            <small>Students Helped</small>
            <strong>${player.studentsHelped || 0}</strong>
          </div>
        </div>
      </div>
    `;
  }
}