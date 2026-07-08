const express = require('express');
const router = express.Router();

// Pure mock data—matching Wee Teck's testing strategy!
const mockNotifications = [
  { id: '1', message: 'Janelle replied to your thread!', type: 'Reply' },
  { id: '2', message: 'Earned "First Post" Badge!', type: 'Badge' },
  { id: '3', message: '+50 XP for daily login.', type: 'XP' }
];

// GET: http://127.0.0.1:5000/api/notifications
router.get('/', (req, res) => {
  res.status(200).json(mockNotifications);
});

module.exports = router;

