const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/players.json');

function getDefaultPlayer(author) {
  return {
    author,
    xp: 0,
    level: 1,
    title: 'New Adventurer',
    rank: "🌱 Freshman",
    coins: 0,

    totalXpEarned: 0,
    totalCoinsEarned: 0,
    totalCoinsSpent: 0,
    highestDailyStreak: 0,
    studyQuestsCompleted: 0,
    studentsHelped: 0,

    ownedItems: [],
    achievements: [],

    appliedTheme: 'default',
    appliedFrame: 'default',
    appliedBadge: 'default',
    
    dailyStreak: 0,
    lastDailyRewardDate: null,
    dailyRewardsClaimed: 0,
  };
}

class PlayerStats {
  static readData() {
    const data = fs.readFileSync(dataPath, 'utf-8');
    return JSON.parse(data);
  }

  static writeData(data) {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  }

  static getAllPlayers() {
    const data = this.readData();
    return Object.values(data.players);
  }

  static getPlayer(author) {
    const data = this.readData();

    if (!data.players[author]) {
      data.players[author] = getDefaultPlayer(author);
      this.writeData(data);
    }

    return data.players[author];
  }

  static savePlayer(player) {
    const data = this.readData();
    data.players[player.author] = player;
    this.writeData(data);
    return player;
  }
}

module.exports = PlayerStats;