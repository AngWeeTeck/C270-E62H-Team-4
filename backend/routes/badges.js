const express = require('express');
const router = express.Router();
const badgeController = require('../controllers/badgeController');

router.get('/', badgeController.getAllBadges);
router.get('/user/:userId', badgeController.getUserBadges);
router.post('/award', badgeController.awardBadge);

module.exports = router;