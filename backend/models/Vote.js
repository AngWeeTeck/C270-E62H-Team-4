const mongoose = require('mongoose');
const { Schema } = mongoose;

const voteSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetType: {
    type: String,
    enum: ['thread', 'reply'],
    required: true
  },
  targetId: {
    type: String,
    required: true
  },
  voteValue: {
    type: Number,
    enum: [1, -1],
    required: true
  }
}, { timestamps: true });

voteSchema.index({ userId: 1, targetType: 1, targetId: 1 }, { unique: true });
voteSchema.index({ targetType: 1, targetId: 1 });

module.exports = mongoose.model('Vote', voteSchema);
