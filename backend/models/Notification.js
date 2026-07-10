const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new Schema({
  id: {
    type: String,
    unique: true,
    required: true
  },
  recipient: { 
    type: String, 
    required: true,
    index: true
  },
  sender: { 
    type: String, // The person who triggered it (e.g., 'Janelle' or 'Wee Teck')
    required: true
  },
  type: { 
    type: String, // 'Reply', 'Follow', 'Badge', 'XP'
    required: true
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false // Brand new notifications start out unread!
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true }); 

// Index for efficiently querying a specific user's notifications sorted by newest first
notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);