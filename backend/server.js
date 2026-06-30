const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const notificationRoutes = require('./routes/notifications');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.use('/api/threads', require('./routes/threads'));
app.use('/api', require('./routes/replies'));
app.use('/api/notifications', notificationRoutes);
// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Note: In a production environment, connect to MongoDB here
// For testing purposes, we use mock data

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
