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
    const currentLevelXP = (player.xp || 0) % 100;
    const progress = currentLevelXP;

    const themeClass =
      (player.equippedTheme || player.appliedTheme) === "blue" ? "blue-theme" :
      (player.equippedTheme || player.appliedTheme) === "galaxy" ? "galaxy-theme" :
      (player.equippedTheme || player.appliedTheme) === "sakura" ? "sakura-theme" :
      "";

    const frameClass =
      (player.equippedFrame || player.appliedFrame) === "gold" ? "gold-frame" :
      (player.equippedFrame || player.appliedFrame) === "phoenix" ? "phoenix-frame" :
      "";

    const badge =
      (player.equippedBadge || player.appliedBadge) === "special" ? " ✨" :
      (player.equippedBadge || player.appliedBadge) === "diamond" ? " 💎" :
      (player.equippedBadge || player.appliedBadge) === "crown" ? " 👑" :
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

      (player.ownedItems || []).forEach(item => {
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

              const isApplied =
                item.includes("Theme")
                  ? (
                      (item === "Blue Profile Theme" && player.appliedTheme === "blue") ||
                      (item === "🌌 Galaxy Theme" && player.appliedTheme === "galaxy") ||
                      (item === "🌸 Sakura Theme" && player.appliedTheme === "sakura")
                    )
                  : item.includes("Frame")
                  ? (
                      (item === "Gold Avatar Frame" && player.appliedFrame === "gold") ||
                      (item === "🔥 Phoenix Frame" && player.appliedFrame === "phoenix")
                    )
                  : item.includes("Badge")
                  ? (
                      (item === "Special Title Badge" && player.appliedBadge === "special") ||
                      (item === "💎 Diamond Badge" && player.appliedBadge === "diamond") ||
                      (item === "👑 Crown Badge" && player.appliedBadge === "crown")
                    )
                  : false;

              return `
                <div class="inventory-item">
                  <span>
                    ${item}
                    ${isExclusive ? `<span class="exclusive-star">⭐</span>` : ""}
                  </span>

                  <button class="apply-btn ${isApplied ? "remove-btn" : ""}"data-item="${item}">
                    ${isApplied ? "Remove" : "Apply"}
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

const vouchers = player.vouchers?.length
  ? player.vouchers.map(voucher => `
      <div class="voucher-item ${voucher.redeemed ? "redeemed" : ""}">
        <div>
          <strong>🎟 ${voucher.name}</strong>
          <p>${voucher.description}</p>
          <small>Discount: ${voucher.discount}</small>
        </div>

        <button
          class="redeem-voucher-btn"
          data-voucher-id="${voucher.id}"
          ${voucher.redeemed ? "disabled" : ""}
        >
          ${voucher.redeemed ? "Redeemed" : "Redeem"}
        </button>
      </div>
    `).join("")
  : `<p>No vouchers unlocked yet.</p>`;
    
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
  },
  {
    id: "community_helper",
    name: "🤝 Community Helper",
    rarity: "EPIC",

    rewardType: "voucher",

    voucherReward: {
      name: "5% RP Food Voucher",
      description: "Enjoy 5% off at participating RP food stalls.",
      discount: "5%"
    },

    description: "Help 10 students.",
    progressText: `${player.studentsHelped || 0} / 10 Students`,
    progressPercent: Math.min(
      ((player.studentsHelped || 0) / 10) * 100,
      100
    )
  }
];

const unlockedCount = (player.achievements || []).length;
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

        ${achievement.rewardType === "voucher"?`Reward: 🎟 ${achievement.voucherReward.name}`:`Reward: 💰 ${achievement.reward} Coins`}

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
          <span>${currentLevelXP}/100 XP</span>
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

        <div class="vouchers">
          <h3>🎟 Reward Vouchers</h3>
          ${vouchers}
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
