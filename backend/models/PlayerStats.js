const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/players.json');

function normalizeUsername(username) {
  return String(username || '').trim().toLowerCase();
}

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
    vouchers: [],
    achievements: [],

    equippedTheme: 'default',
    equippedFrame: 'default',
    equippedBadge: 'default',
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
    const normalizedPlayers = new Map();
    Object.values(data.players).forEach(player => {
      const author = normalizeUsername(player.author);
      if (author) normalizedPlayers.set(author, { ...player, author });
    });
    return [...normalizedPlayers.values()];
  }

  static getPlayer(author) {
    author = normalizeUsername(author);
    if (!author) throw new Error('Authenticated username is required.');
    const data = this.readData();

    if (!data.players[author]) {
      const existingKey = Object.keys(data.players).find(key => normalizeUsername(key) === author);
      data.players[author] = existingKey
        ? { ...data.players[existingKey], author }
        : getDefaultPlayer(author);
      if (existingKey && existingKey !== author) delete data.players[existingKey];
      this.writeData(data);
    }

    return data.players[author];
  }

  static savePlayer(player) {
    player.author = normalizeUsername(player.author);
    if (!player.author) throw new Error('Authenticated username is required.');
    const data = this.readData();
    Object.keys(data.players).forEach(key => {
      if (key !== player.author && normalizeUsername(key) === player.author) delete data.players[key];
    });
    data.players[player.author] = player;
    this.writeData(data);
    return player;
  }
}

PlayerStats.normalizeUsername = normalizeUsername;
module.exports = PlayerStats;
