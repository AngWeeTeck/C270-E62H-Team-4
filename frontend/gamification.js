const API_URL = `${window.location.origin}/api/player-stats`;
const AUTHOR = "You";

const profileCard = new PlayerProfileCard("profile-card");
const shopPage = new ShopPage("shop-card");
const developerPanel = new DeveloperPanel("developer-panel");
const dailyRewardCard = new DailyRewardCard("daily-reward-card");
const statisticsDashboard = new StatisticsDashboard("statistics-dashboard");

let currentPlayer = null;

async function loadPlayer() {
  try {
    const response = await fetch(`${API_URL}/${AUTHOR}`);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Unable to load player.");
    }

    currentPlayer = result;
    currentPlayer.ownedItems = currentPlayer.ownedItems || [];
    currentPlayer.achievements = currentPlayer.achievements || [];
    renderAll();
  } catch (error) {
    showToast(error.message || "Unable to connect to backend.", "error");
  }
}

function renderAll() {
  profileCard.render(currentPlayer);
  shopPage.render(currentPlayer);
  developerPanel.render(currentPlayer);
  dailyRewardCard.render(currentPlayer);
  statisticsDashboard.render(currentPlayer);

  setupButtons();
}

function setupButtons() {

    document.querySelectorAll(".buy-btn").forEach(button => {
        button.onclick = () => {
            buyItem(button.dataset.item, Number(button.dataset.cost));
        };
    });

    document.querySelectorAll(".apply-btn").forEach(button => {
        button.onclick = () => {
            applyItem(button.dataset.item);
        };
    });

    const claimButton = document.getElementById("claimDailyRewardBtn");

    if (claimButton) {
        claimButton.onclick = claimDailyReward;
    }
}

async function resetProgress() {
  const response = await fetch(`${API_URL}/${AUTHOR}/reset`, {
    method: "POST"
  });

  const result = await response.json();

  currentPlayer = result.stats;
  renderAll();
  showToast("Progress reset.");
}

async function rewardPlayer(action, message) {
  try {
    const response = await fetch(`${API_URL}/${AUTHOR}/reward`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ action })
    });

    const result = await response.json();

    if (!response.ok) {
      showToast(result.error || "Reward failed", "error");
      return;
    }

    currentPlayer = result.stats;
    renderAll();
    showToast(message);
    showAchievementPopups(currentPlayer.lastUnlockedAchievements || []);
  } catch (error) {
    showToast("Unable to connect to backend.", "error");
  }
}

async function buyItem(item, amount) {
  try {
    const response = await fetch(`${API_URL}/${AUTHOR}/spend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ item, amount })
    });

    const result = await response.json();

    if (!response.ok) {
      showToast(result.error || "Purchase failed", "error");
      return;
    }

    currentPlayer = result.stats;
    renderAll();
    showToast(`${item} purchased!`);

    showAchievementPopups(currentPlayer.lastUnlockedAchievements || []);

  } catch (error) {
    showToast("Unable to buy item.", "error");
  }
}

async function applyItem(item) {
  try {
    const response = await fetch(`${API_URL}/${AUTHOR}/apply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ item })
    });

    const result = await response.json();

    if (!response.ok) {
      showToast(result.error || "Apply failed", "error");
      return;
    }

    currentPlayer = result.stats;
    renderAll();
    showToast(`${item} applied!`);
  } catch (error) {
    showToast("Unable to apply item.", "error");
  }
}

async function equipRewardCosmetic(item) {
  await applyItem(item);

  document.querySelectorAll(".achievement-popup, .daily-popup").forEach(popup => {
    popup.remove();
  });
}

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2500);
}

function showAchievementPopups(achievements) {
  achievements.forEach(achievement => {
    const popup = document.createElement("div");
    popup.className = `achievement-popup ${achievement.rarity.toLowerCase()}`;

    popup.innerHTML = `
      <div class="achievement-popup-content">
        <p class="popup-label">🏅 ACHIEVEMENT UNLOCKED</p>

        <div class="rarity ${achievement.rarity.toLowerCase()}">
          ${achievement.rarity}
        </div>

        <h2>${achievement.name}</h2>
        <p>${achievement.description}</p>

        <div class="achievement-reward">
          <span>Bonus Reward</span>
          <strong>💰 +${achievement.reward} Coins</strong>

          ${
            achievement.cosmeticReward
              ? `<p class="cosmetic-reward">
                  🎨 New Cosmetic Unlocked!<br>
                  <strong>${achievement.cosmeticReward}</strong>
                </p>`
              : ""
          }
        </div>

        ${
          achievement.cosmeticReward
            ? `<button onclick="equipRewardCosmetic('${achievement.cosmeticReward}')">
                ✨ Equip Now
              </button>`
            : ""
        }

        <button onclick="this.closest('.achievement-popup').remove()">
          Continue
        </button>
      </div>
    `;

    document.body.appendChild(popup);
    showConfetti();
  });
}

function showConfetti() {
  for (let i = 0; i < 25; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.textContent = ["✨", "⭐", "🎉", "💫"][Math.floor(Math.random() * 4)];
    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.animationDelay = Math.random() * 0.5 + "s";

    document.body.appendChild(confetti);

    setTimeout(() => {
      confetti.remove();
    }, 2000);
  }
}

function runDeveloperAction(action) {

  switch (action) {

    case "study":
      rewardPlayer(
          "thread",
          "🎯 Study quest completed! +50 XP ⭐ +20 Coins 💰"
      );
      break;

    case "help":
        rewardPlayer(
            "reply",
            "🤝 Student helped! +25 XP ⭐ +10 Coins 💰"
        );
        break;

    case "add-xp":
      runDevApiAction("add-xp", "Developer Action: +100 XP");
      break;

    case "add-coins":
      runDevApiAction("add-coins", "Developer Action: +500 Coins");
      break;

    case "max-level":
      runDevApiAction("max-level", "Developer Action: Max Level");
      break;

    case "unlock-achievements":
      runDevApiAction("unlock-achievements", "Developer Action: Unlock All Achievements");
      break;

    case "unlock-cosmetics":
      runDevApiAction("unlock-cosmetics", "Developer Action: Unlock All Cosmetics");
      break;

    case "skip-day":
      runDevApiAction(
        "skip-day",
        "Developer Action: Skipped 1 day"
      );
      break;

    case "reset":
      resetProgress();
      break;

  }
}

async function runDevApiAction(action, message) {
  try {
    const response = await fetch(`${API_URL}/${AUTHOR}/dev/${action}`, {
      method: "POST"
    });

    const result = await response.json();

    if (!response.ok) {
      showToast(result.error || "Developer action failed", "error");
      return;
    }

    currentPlayer = result.stats;
    renderAll();
    showToast(message);
    showAchievementPopups(currentPlayer.lastUnlockedAchievements || []);
  } catch (error) {
    showToast("Unable to run developer action.", "error");
  }
}

async function claimDailyReward() {
  try {
    const response = await fetch(`${API_URL}/${AUTHOR}/daily-reward`, {
      method: "POST"
    });

    const result = await response.json();

    if (!response.ok) {
      showToast(result.error || "Daily reward failed", "error");
      return;
    }

    currentPlayer = result.stats;
    renderAll();
    showDailyRewardPopup(result.reward);

    showAchievementPopups(currentPlayer.lastUnlockedAchievements || []);
  } catch (error) {
    showToast("Unable to claim daily reward.", "error");
  }
}

function showDailyRewardPopup(reward) {
  const popup = document.createElement("div");
  popup.className = "daily-popup";

  popup.innerHTML = `
    <div class="daily-popup-content opening">
      <div class="daily-chest-icon">🎁</div>

      <p class="daily-popup-label">
        OPENING DAILY REWARD...
      </p>

      <div class="daily-opening-sparkles">
        ✨ ⭐ ✨
      </div>
    </div>
  `;

  document.body.appendChild(popup);

  setTimeout(() => {
    const content = popup.querySelector(".daily-popup-content");

    content.classList.remove("opening");
    content.classList.add("revealed");

    content.innerHTML = `
      <div class="daily-chest-icon opened">🎉</div>

      <p class="daily-popup-label">
        DAILY LOGIN REWARD
      </p>

      <h2>${reward.label}</h2>

      <div class="daily-reward-earned">
        <div class="daily-earned-item">
          <span class="daily-earned-icon">⭐</span>

          <div>
            <small>Experience</small>
            <strong>+${reward.xp} XP</strong>
          </div>
        </div>

        <div class="daily-earned-item">
          <span class="daily-earned-icon">💰</span>

          <div>
            <small>Coins</small>
            <strong>+${reward.coins}</strong>
          </div>
        </div>
      </div>

      ${
        reward.cosmeticReward
          ? `
            <div class="daily-cosmetic-unlock">
              <span>✨ BONUS COSMETIC ✨</span>
              <strong>${reward.cosmeticReward}</strong>
            </div>
          `
          : ""
      }

      <div class="daily-popup-actions">
        ${
          reward.cosmeticReward
            ? `
              <button
                class="daily-equip-btn"
                onclick="equipRewardCosmetic('${reward.cosmeticReward}')"
              >
                ✨ Equip Now
              </button>
            `
            : ""
        }

        <button
          class="daily-continue-btn"
          onclick="this.closest('.daily-popup').remove()"
        >
          Continue
        </button>
      </div>
    `;

    showConfetti();
  }, 900);
}

loadPlayer();