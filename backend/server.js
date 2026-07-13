const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/forum_db';

const memoryThreads = [
  {
    id: 'thread-101',
    title: 'RP students: how should we prep for the capstone pitch?',
    content: 'We are sharing slides and talking through the pitch flow before Friday.',
    author: 'Alicia, RP 2A',
    reply_count: 2,
    replyCount: 2,
    replies: ['reply-101', 'reply-102'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'thread-102',
    title: 'Course 3B discussion: best ways to explain AI ethics in class',
    content: 'The group wants clearer examples for a 10-minute presentation this week.',
    author: 'Ben, RP 3B',
    reply_count: 1,
    replyCount: 1,
    replies: ['reply-103'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
const memoryReplies = [
  {
    id: 'reply-101',
    threadId: 'thread-101',
    content: 'I can help with a simple structure for the pitch slides.',
    author: 'Mina, RP 2A',
    richContent: { html: '<p>I can help with a simple structure for the pitch slides.</p>' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'reply-102',
    threadId: 'thread-101',
    content: 'We should keep the opening to one clear problem statement.',
    author: 'Jared, RP 2B',
    richContent: { html: '<p>We should keep the opening to one clear problem statement.</p>' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'reply-103',
    threadId: 'thread-102',
    content: 'A short story-based example usually lands well with classmates.',
    author: 'Ravi, RP 3B',
    richContent: { html: '<p>A short story-based example usually lands well with classmates.</p>' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

mongoose.set('strictQuery', true);
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => {
    console.warn('MongoDB connection error, falling back to in-memory storage:', error.message);
  });

const getThreadById = (threadId) => memoryThreads.find((thread) => thread.id === threadId);
const getRepliesForThread = (threadId) => memoryReplies.filter((reply) => reply.threadId === threadId);
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
  if (mongoose.connection.readyState !== 1) {
    req.app.locals.memoryThreads = memoryThreads;
    req.app.locals.memoryReplies = memoryReplies;
    req.app.locals.getThreadById = getThreadById;
    req.app.locals.getRepliesForThread = getRepliesForThread;
    req.app.locals.updateThreadReplyCount = updateThreadReplyCount;
  }
  next();
}, require('./routes/threads'));
app.use('/api/threads', (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    req.app.locals.memoryThreads = memoryThreads;
    req.app.locals.memoryReplies = memoryReplies;
    req.app.locals.getThreadById = getThreadById;
    req.app.locals.getRepliesForThread = getRepliesForThread;
    req.app.locals.updateThreadReplyCount = updateThreadReplyCount;
  }
  next();
}, require('./routes/replies'));
app.use('/api', require('./routes/uploads'));

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

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
