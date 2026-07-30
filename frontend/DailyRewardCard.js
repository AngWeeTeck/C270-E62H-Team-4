class DailyRewardCard {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  getRewards() {
    return [
      { day: 1, xp: 20, coins: 15, label: "Day 1" },
      { day: 2, xp: 25, coins: 20, label: "Day 2" },
      { day: 3, xp: 30, coins: 25, label: "Day 3" },
      { day: 4, xp: 35, coins: 30, label: "Day 4" },
      { day: 5, xp: 40, coins: 35, label: "Day 5", cosmeticReward: "🌸 Sakura Theme" },
      { day: 6, xp: 50, coins: 40, label: "Day 6" },
      { day: 7, xp: 75, coins: 60, label: "Day 7", cosmeticReward: "👑 Crown Badge" }
    ];
  }

  isClaimedToday(player) {
    const today = new Date().toISOString().split("T")[0];
    return player.lastDailyRewardDate === today;
  }

  render(player) {
  const rewards = this.getRewards();
  const currentStreak = player.dailyStreak || 0;
  const nextRewardDay = (currentStreak % 7) + 1;
  const claimedToday = this.isClaimedToday(player);

  this.container.innerHTML = `
    <div class="card daily-card">
      <h2>🎁 Daily Rewards</h2>

      <p>
        Come back daily to build your streak and unlock special rewards.
      </p>

      <div class="daily-streak">
        <span>🔥 Current Streak</span>
        <strong>Day ${currentStreak}</strong>
      </div>

      <div class="daily-progress">
        <div
          class="daily-progress-fill"
          style="width: ${((currentStreak % 7) / 7) * 100}%"
        ></div>
      </div>

      <div class="daily-calendar">
        ${rewards.map(reward => {
          const completed = currentStreak >= reward.day;
          const isNext =
            reward.day === nextRewardDay && !claimedToday;

          return `
            <div class="
              daily-day
              ${completed ? "completed" : ""}
              ${isNext ? "next" : ""}
              ${reward.day === 5 ? "milestone" : ""}
              ${reward.day === 7 ? "legendary" : ""}
            ">
              <div class="reward-day">
                ${reward.label}
              </div>

              <div class="reward-stat">
                ⭐ ${reward.xp} XP
              </div>

              <div class="reward-stat">
                💰 ${reward.coins} Coins
              </div>

              ${
                reward.cosmeticReward
                  ? `<div class="daily-cosmetic-reward">
                      ${reward.cosmeticReward}
                    </div>`
                  : ""
              }
            </div>
          `;
        }).join("")}
      </div>

      <div class="daily-action">
        <button
          id="claimDailyRewardBtn"
          ${claimedToday ? "disabled" : ""}
        >
          ${claimedToday ? "✅ Claimed Today" : "🎁 Claim Reward"}
        </button>
      </div>

      ${
        claimedToday
          ? `<p class="daily-note">
              Come back tomorrow for your next reward.
            </p>`
          : ""
      }
    </div>
  `;
}
}