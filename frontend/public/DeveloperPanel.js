class DeveloperPanel {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.visible = false;
  }

  render(player) {
    const unlockedAchievements = player.achievements ? player.achievements.length : 0;
    const ownedItems = player.ownedItems ? player.ownedItems.length : 0;

    this.container.innerHTML = `
      <div class="dev-toggle">
        <button id="devToggleBtn">
          🛠 ${this.visible ? "Hide Developer Mode" : "Show Developer Mode"}
        </button>
      </div>

      ${
        this.visible
          ? `
            <div class="developer-panel">
              <h2>🛠 Developer Tools</h2>
              <p>Testing and demonstration tools</p>

              <div class="dev-stats">
                <span>Level: ${player.level}</span>
                <span>XP: ${player.xp}</span>
                <span>Coins: ${player.coins}</span>
                <span>Achievements: ${unlockedAchievements}</span>
                <span>Items: ${ownedItems}</span>
              </div>

              <div class="dev-section">
                  <h3>📚 Simulate User Activity</h3>

                  <button class="dev-btn" data-action="study">
                      Complete Study Quest
                  </button>

                  <button class="dev-btn" data-action="help">
                      Help Another Student
                  </button>
              </div>

              <div class="dev-section">
                  <h3>⭐ Progression</h3>

                  <button class="dev-btn" data-action="add-xp">
                      +100 XP
                  </button>

                  <button class="dev-btn" data-action="add-coins">
                      +500 Coins
                  </button>

                  <button class="dev-btn" data-action="max-level">
                      Max Level
                  </button>
              </div>

              <div class="dev-section">
                <h3>🎁 Daily Reward Testing</h3>

                <button class="dev-btn" data-action="skip-day">
                  ⏩ Advance 1 Day
                </button>
              </div>

              <div class="dev-section">
                <h3>🏅 Achievements</h3>
                <button class="dev-btn" data-action="unlock-achievements">Unlock All Achievements</button>
              </div>

              <div class="dev-section">
                <h3>🎨 Cosmetics</h3>
                <button class="dev-btn" data-action="unlock-cosmetics">Unlock All Cosmetics</button>
              </div>

              <div class="dev-section danger">
                <h3>Reset</h3>
                <button class="dev-btn danger-btn" data-action="reset">Reset Everything</button>
              </div>
            </div>
          `
          : ""
      }
    `;

    document.getElementById("devToggleBtn").onclick = () => {
      this.visible = !this.visible;
      renderAll();
    };

    this.container.querySelectorAll(".dev-btn").forEach(button => {
      button.onclick = () => {
        runDeveloperAction(button.dataset.action);
      };
    });
  }
}
