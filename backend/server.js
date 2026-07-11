const express = require("express");
const cors = require("cors");

const app = express();

const moderationRoutes = require("./routes/moderationRoutes");

// Allow frontend applications to communicate with this backend.
// This is required because the frontend and backend are currently
// served separately during development. If the merged application
// serves both from the same origin, this configuration will still
// work correctly.
app.use(cors());

app.use(express.json());

app.use("/api", moderationRoutes);

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});