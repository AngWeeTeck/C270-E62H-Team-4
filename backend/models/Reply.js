const mongoose = require('mongoose');
const { Schema } = mongoose;

const replySchema = new Schema({
  id: {
    type: String,
    unique: true,
    required: true
  },
  threadId: {
    type: String,
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true,
    minlength: 2
  },
  author: {
    type: String,
    required: true
  },
  requestId: {
    type: String,
    unique: true,
    sparse: true
  },
  richContent: {
    text: String,
    formatting: {
      bold: [{ start: Number, end: Number }],
      italic: [{ start: Number, end: Number }],
      codeBlocks: [{ start: Number, end: Number, language: String }]
    },
    embeds: [{
      type: {
        type: String,
        enum: ['youtube', 'pdf', 'image']
      },
      url: String,
      title: String
    }]
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

// Index for efficient querying by thread
replySchema.index({ threadId: 1, createdAt: -1 });

module.exports = mongoose.model('Reply', replySchema);
