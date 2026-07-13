const path = require("path");
const express = require("express");
const cors = require("cors");

const playerStatsRoutes = require("./routes/playerStats");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    res.set({
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0"
    });
    next();
});

app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/gamification.html"));
});

app.use("/api/player-stats", playerStatsRoutes);

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok"
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});