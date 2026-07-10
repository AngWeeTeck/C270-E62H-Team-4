const express = require('express');
const cors = require('cors');

const playerStatsRoutes = require('./routes/playerStats');

const app = express();

const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use('/api/player-stats', playerStatsRoutes);

app.get('/api/health', (req, res) => {

    res.json({
        status: "ok"
    });

});

app.listen(PORT, () => {

    console.log(`Server running on port ${PORT}`);

});