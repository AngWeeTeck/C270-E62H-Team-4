const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors());

// Serve the frontend
app.use(express.static(path.join(__dirname, '../frontend')));


// API routes
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/dashboard', require('./routes/dashboard'));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});