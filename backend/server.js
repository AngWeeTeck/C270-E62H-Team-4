require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const moderationRoutes = require("./routes/moderationRoutes");
const authRoutes = require("./routes/auth");
const threadsRoutes = require("./routes/threads");
const leaderboardRoutes = require("./routes/leaderboard");
const dashboardRoutes = require("./routes/dashboard");
const { router: votesRoutes } = require("./routes/votes");
const { resetModerationData } = require("./controllers/moderationController");

function createApp() {
    const app = express();

    app.use(cors());
    app.use(express.json());

    app.get('/', (req, res) => {
        res.json({ status: 'ok', message: 'Forum backend is running. Use /api/auth or /api.' });
    });

    app.use("/api/auth", authRoutes);
    app.use("/api/threads", threadsRoutes);
    app.use("/api/leaderboard", leaderboardRoutes);
    app.use("/api/dashboard", dashboardRoutes);
    app.use("/api/votes", votesRoutes);
    app.use("/api", moderationRoutes);

    return app;
}

async function startServer() {
    const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/forum_db";
    try {
        await mongoose.connect(MONGODB_URI);
        console.log(`Connected to MongoDB at ${MONGODB_URI}`);
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }

    const app = createApp();
    const PORT = process.env.PORT || 5000;
    return app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

if (require.main === module) {
    startServer();
}

module.exports = {
    createApp,
    startServer,
    resetModerationData
};