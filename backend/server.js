const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Connects to the local Docker MongoDB we are about to start
mongoose.connect('mongodb://127.0.0.1:27017/test_forum')
  .then(() => console.log('🚀 Real MongoDB Connected Successfully!'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
<<<<<<< HEAD
// Routes
//app.use('/api/threads', require('./routes/threads'));
//app.use('/api', require('./routes/replies'));
app.use('/api/notifications', require('./routes/notification'));
app.use('/api/users', require('./routes/user'));
=======
app.use('/api/threads', (req, res, next) => {
  req.app.locals.memoryThreads = memoryThreads;
  req.app.locals.memoryReplies = memoryReplies;
  req.app.locals.getThreadById = getThreadById;
  req.app.locals.getRepliesForThread = getRepliesForThread;
  req.app.locals.updateThreadReplyCount = updateThreadReplyCount;
  next();
}, require('./routes/threads'));
app.use('/api/threads', (req, res, next) => {
  req.app.locals.memoryThreads = memoryThreads;
  req.app.locals.memoryReplies = memoryReplies;
  req.app.locals.getThreadById = getThreadById;
  req.app.locals.getRepliesForThread = getRepliesForThread;
  req.app.locals.updateThreadReplyCount = updateThreadReplyCount;
  next();
}, require('./routes/replies'));
app.use('/api', require('./routes/uploads'));
app.use('/api/notifications', require('./routes/notification'));
app.use('/api/users', require('./routes/user'));

>>>>>>> 61fc4fa (Transfer Faris demo notification/social changes to Faris-Clean)
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