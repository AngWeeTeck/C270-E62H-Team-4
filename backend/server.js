const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors());

app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/dashboard', require('./routes/dashboard'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});