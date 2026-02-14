import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  type: {
    type: String,
    enum: ['text', 'system', 'correction'],
    default: 'text'
  },
  correction: {
    original: String,
    corrected: String,
    explanation: String,
    correctedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: Date
  }]
}, {
  timestamps: true
});

const Message = mongoose.model('Message', messageSchema);
export default Message;