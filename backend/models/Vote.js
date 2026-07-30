const mongoose = require('mongoose');
const { Schema } = mongoose;

const voteSchema = new Schema({
  voterId: {
    type: String,
    required: true,
    index: true
  },
  targetType: {
    type: String,
    enum: ['thread', 'reply'],
    required: true,
    index: true
  },
  targetId: {
    type: String,
    required: true,
    index: true
  },
  value: {
    type: Number,
    enum: [-1, 0, 1],
    required: true
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

voteSchema.index({ voterId: 1, targetType: 1, targetId: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);
