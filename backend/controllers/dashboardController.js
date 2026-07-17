const dashboardModel = require('../models/dashboardModel');

// GET /api/dashboard/:author
const getDashboard = (req, res) => {
  try {
    const data = dashboardModel.getDashboard(req.params.author);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load dashboard' });
  }
};

module.exports = { getDashboard };