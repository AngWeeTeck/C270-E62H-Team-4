const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const { createStore } = require('./dataStore');

const moderationRoutes = require('./routes/moderationRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/forum_db';

const store = createStore();

app.locals.dataStore = store;
app.locals.store = store;

const getMemoryThreads = () => store.getThreads();
const getMemoryReplies = () => store.getReplies();

mongoose.set('strictQuery', true);

if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => {
      console.warn(
        'MongoDB connection error, falling back to file-backed storage:',
        error.message
      );
    });
}

const getThreadById = (threadId) =>
  getMemoryThreads().find((thread) => thread.id === threadId);

const getRepliesForThread = (threadId) =>
  getMemoryReplies().filter((reply) => reply.threadId === threadId);

const updateThreadReplyCount = (threadId) => {
  const thread = getThreadById(threadId);

  if (thread) {
    thread.replyCount = getRepliesForThread(threadId).length;
    thread.reply_count = thread.replyCount;
  }
};


// =====================
// Middleware
// =====================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.set('json spaces', 2);


// =====================
// Moderation Routes
// =====================

app.use('/api', moderationRoutes);


// =====================
// Thread Routes
// =====================

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


app.use('/api/votes', require('./routes/votes').router);

app.use('/api', require('./routes/uploads'));

app.use('/api/auth', require('./routes/auth'));


// =====================
// Leaderboard & Dashboard
// =====================

app.use('/api/leaderboard', require('./routes/leaderboard'));

app.use('/api/dashboard', require('./routes/dashboard'));


// =====================
// Frontend
// =====================

app.use(express.static(path.join(__dirname, '..')));

app.use(express.static(path.join(__dirname, '../frontend')));


// =====================
// Health Check
// =====================

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Forum backend is running. Use /api/health or /api/threads.'
  });
});


app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok'
  });
});


// =====================
// Frontend fallback
// =====================

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});


// =====================
// Error Handling
// =====================

app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    error: 'Internal server error'
  });
});


// =====================
// Start Server
// =====================

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}


// =====================
// Export
// =====================

module.exports = app;
module.exports.app = app;
module.exports.store = store;