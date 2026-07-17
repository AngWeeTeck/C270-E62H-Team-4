const express = require('express');
const router = express.Router();
const c = require('../controllers/dashboardController');

router.get('/:author', c.getDashboard);

module.exports = router;