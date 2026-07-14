const express = require('express');
const router = express.Router();
const c = require('../controllers/leaderboardController');

router.get('/', c.getLeaderboard);
router.get('/top3', c.getPodium);
router.get('/player/:author', c.getPlayerPosition);

module.exports = router;