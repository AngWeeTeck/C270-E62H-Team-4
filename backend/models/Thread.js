const mongoose = require('mongoose');
const { Schema } = mongoose;

const threadSchema = new Schema({
  id: {
    type: String,
    unique: true,
    required: true
  },
  title: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    minlength: 5
  },
  author: {
    type: String,
    required: true
  },
  replies: [{
    type: Schema.Types.ObjectId,
    ref: 'Reply'
  }],
  replyCount: {
    type: Number,
    default: 0
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

// Index for efficient querying
threadSchema.index({ createdAt: -1 });
threadSchema.index({ author: 1 });

module.exports = mongoose.model('Thread', threadSchema);
