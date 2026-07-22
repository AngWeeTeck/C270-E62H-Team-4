export function showAchievementToasts(achievements = []) {
  achievements.forEach((achievement, index) => {
    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    toast.innerHTML = `
      <strong>Achievement Unlocked</strong>
      <span class="achievement-toast-title">${achievement.name || achievement.title || achievement.id}</span>
      <span>${achievement.description || ''}</span>
      <span>Reward: ${achievement.reward || 0} coins</span>
    `;
    toast.style.bottom = `${24 + index * 132}px`;
    document.body.appendChild(toast);
    window.setTimeout(() => toast.remove(), 5000);
  });
}
