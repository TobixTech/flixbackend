const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  confession_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Confession', required: true },
  sender: { type: String, enum: ['admin', 'moderator', 'ai', 'peer'], required: true },
  text: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Reply', replySchema);
  
