const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const { createStore } = require('./dataStore');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/forum_db';
const store = createStore();

const getMemoryThreads = () => store.getThreads();
const getMemoryReplies = () => store.getReplies();

mongoose.set('strictQuery', true);
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => {
    console.warn('MongoDB connection error, falling back to file-backed storage:', error.message);
  });

const getThreadById = (threadId) => getMemoryThreads().find((thread) => thread.id === threadId);
const getRepliesForThread = (threadId) => getMemoryReplies().filter((reply) => reply.threadId === threadId);
const updateThreadReplyCount = (threadId) => {
  const thread = getThreadById(threadId);
  if (thread) {
    thread.replyCount = getRepliesForThread(threadId).length;
    thread.reply_count = thread.replyCount;
  }
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/threads', (req, res, next) => {
  req.app.locals.memoryThreads = getMemoryThreads();
  req.app.locals.memoryReplies = getMemoryReplies();
  req.app.locals.getThreadById = getThreadById;
  req.app.locals.getRepliesForThread = getRepliesForThread;
  req.app.locals.updateThreadReplyCount = updateThreadReplyCount;
  next();
}, require('./routes/threads'));
app.use('/api/threads', (req, res, next) => {
  req.app.locals.memoryThreads = getMemoryThreads();
  req.app.locals.memoryReplies = getMemoryReplies();
  req.app.locals.getThreadById = getThreadById;
  req.app.locals.getRepliesForThread = getRepliesForThread;
  req.app.locals.updateThreadReplyCount = updateThreadReplyCount;
  next();
}, require('./routes/replies'));
app.use('/api', require('./routes/uploads'));

// Root and health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Forum backend is running. Use /api/health or /api/threads.' });
});

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

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
module.exports.app = app;
module.exports.store = store;
