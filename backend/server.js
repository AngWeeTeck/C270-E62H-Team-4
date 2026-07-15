const express = require("express");
const cors = require("cors");

const moderationRoutes = require("./routes/moderationRoutes");
const { resetModerationData } = require("./controllers/moderationController");

function createApp() {
    const app = express();

    app.use(cors());
    app.use(express.json());
    app.use("/api", moderationRoutes);

    return app;
}

function startServer() {
    const app = createApp();
    const PORT = process.env.PORT || 3000;
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