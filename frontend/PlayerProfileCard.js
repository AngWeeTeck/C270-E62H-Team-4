class PlayerProfileCard {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  getNextLevelXP(level) {
    if (level === 1) return 100;
    if (level === 2) return 300;
    if (level === 3) return 600;
    if (level === 4) return 1000;
    return 1000;
  }

  render(player) {
    const nextLevelXP = this.getNextLevelXP(player.level);
    const progress = Math.min((player.xp / nextLevelXP) * 100, 100);

    const themeClass =
      player.appliedTheme === "blue" ? "blue-theme" :
      player.appliedTheme === "galaxy" ? "galaxy-theme" :
      player.appliedTheme === "sakura" ? "sakura-theme" :
      "";

    const frameClass =
      player.appliedFrame === "gold" ? "gold-frame" :
      player.appliedFrame === "phoenix" ? "phoenix-frame" :
      "";

    const badge =
      player.appliedBadge === "special" ? " ✨" :
      player.appliedBadge === "diamond" ? " 💎" :
      player.appliedBadge === "crown" ? " 👑" :
      "";

    const exclusiveItems = [
      "🌌 Galaxy Theme",
      "🔥 Phoenix Frame",
      "💎 Diamond Badge",
      "🌸 Sakura Theme",
      "👑 Crown Badge"
    ];

      const themes = [];
      const frames = [];
      const badges = [];

      player.ownedItems.forEach(item => {
        if (item.includes("Theme")) {
          themes.push(item);
        } else if (item.includes("Frame")) {
          frames.push(item);
        } else if (item.includes("Badge")) {
          badges.push(item);
        }
      });

      function renderInventoryCategory(title, items, type) {
        if (!items.length) {
          return "";
        }

        return `
          <div class="inventory-category ${type}">
            <h4>${title}</h4>

            ${items.map(item => {
              const isExclusive = exclusiveItems.includes(item);

              return `
                <div class="inventory-item">
                  <span>
                    ${item}
                    ${isExclusive ? `<span class="exclusive-star">⭐</span>` : ""}
                  </span>

                  <button class="apply-btn" data-item="${item}">
                    Apply
                  </button>
                </div>
              `;
            }).join("")}
          </div>
        `;
      }

const inventory =
  player.ownedItems.length
    ? `
      ${renderInventoryCategory("🎨 Themes", themes, "theme-category")}
      ${renderInventoryCategory("🖼 Frames", frames, "frame-category")}
      ${renderInventoryCategory("🏅 Badges", badges, "badge-category")}
    `
    : `<p>No items owned yet.</p>`;
    
    const achievementCatalog = [
  {
    id: "first_steps",
    name: "🌱 First Steps",
    rarity: "COMMON",
    reward: 25,
    description: "Earn your first XP.",
    progressText: player.xp > 0 ? "Completed" : "0 / 1 XP",
    progressPercent: player.xp > 0 ? 100 : 0
  },
  {
    id: "rising_star",
    name: "⭐ Rising Star",
    rarity: "RARE",
    reward: 50,
    description: "Reach Level 3.",
    progressText: `Level ${player.level} / 3`,
    progressPercent: Math.min((player.level / 3) * 100, 100)
  },
  {
    id: "wealth_collector",
    name: "💰 Wealth Collector",
    rarity: "EPIC",
    reward: 75,
    description: "Own at least 100 coins.",
    progressText: `${player.coins} / 100 Coins`,
    progressPercent: Math.min((player.coins / 100) * 100, 100)
  },
  {
    id: "collector",
    name: "🎨 Collector",
    rarity: "LEGENDARY",
    reward: 100,
    description: "Own all 3 shop cosmetics.",
    progressText: `${["Blue Profile Theme", "Gold Avatar Frame", "Special Title Badge"].filter(item => player.ownedItems.includes(item)).length} / 3 Items`,
    progressPercent: Math.min((["Blue Profile Theme", "Gold Avatar Frame", "Special Title Badge"].filter(item => player.ownedItems.includes(item)).length / 3) * 100, 100)
  }
];

const unlockedCount = player.achievements.length;
const totalAchievements = achievementCatalog.length;
const achievementProgress = Math.min((unlockedCount / totalAchievements) * 100, 100);

function formatUnlockDate(dateString) {
  if (!dateString) return "";

  return new Date(dateString).toLocaleDateString("en-SG", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

const achievements = achievementCatalog.map(achievement => {
  const unlockedAchievement = player.achievements.find(
    item => item.id === achievement.id
  );

  const unlocked = Boolean(unlockedAchievement);

  return `
    <div class="achievement-item ${unlocked ? "unlocked" : "locked"}">
      <div class="achievement-main">
        <div class="rarity ${achievement.rarity.toLowerCase()}">
          ${achievement.rarity}
        </div>

        <strong class="achievement-name">${achievement.name}</strong>
        <p class="achievement-description">${achievement.description}</p>

        <div class="achievement-divider"></div>

        <p class="achievement-reward-line">
          Reward: 💰 ${achievement.reward} Coins
        </p>

        <div class="achievement-progress-row">
          <span>${unlocked ? "✔ Completed" : achievement.progressText}</span>
          <span>${unlocked ? "Unlocked" : "Locked"}</span>
        </div>

        <div class="achievement-progress-bg">
          <div 
            class="achievement-progress-fill"
            style="width: ${unlocked ? 100 : achievement.progressPercent}%"
          ></div>
        </div>

        ${
          unlocked
            ? `<p class="achievement-date">Unlocked: ${formatUnlockDate(unlockedAchievement.dateUnlocked)}</p>`
            : ""
        }
      </div>
    </div>
  `;
}).join("");

    this.container.innerHTML = `
      <div class="card ${themeClass} ${frameClass}">
        <div class="player-top">
          <div class="avatar">🧙</div>
          <div>
            <h2>${player.author}</h2>
            <p class="player-title">${player.title}${badge}</p>
            <p class="student-rank">👑 Rank: ${player.rank || "🌱 Freshman"}</p>
          </div>
        </div>

        <div class="level-row">
          <span>🏆 Level ${player.level}</span>
          <span>${player.xp}/${nextLevelXP} XP</span>
        </div>

        <div class="xp-bar-bg">
          <div class="xp-bar" style="width: ${progress}%"></div>
        </div>

        <div class="coin-box">
          <span>💰 Coins</span>
          <strong>${player.coins}</strong>
        </div>

        <div class="inventory">
        
          <h3>🎒 Inventory</h3>
          ${inventory}
        </div>

        <div class="achievements">
          <h3>🏅 Achievements (${unlockedCount} / ${totalAchievements})</h3>

          <div class="achievement-overall-bg">
            <div class="achievement-overall-fill" style="width: ${achievementProgress}%"></div>
          </div>

          ${achievements}
        </div>
      </div>
    `;
  }
}