const mongoose = require('mongoose');
const { Schema } = mongoose;

const followSchema = new Schema({
  id: {
    type: String,
    unique: true,
    required: true
  },
  follower: {
    type: String, // The username/ID of the person who clicked "Follow" (e.g., "Faris")
    required: true,
    index: true
  },
  following: {
    type: String, // The username/ID of the person being followed (e.g., "Janelle")
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Prevent duplicate follows (a user shouldn't be able to follow the same person twice)
followSchema.index({ follower: 1, following: 1 }, { unique: true });

module.exports = mongoose.model('Follow', followSchema);