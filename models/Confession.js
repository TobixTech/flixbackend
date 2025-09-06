const mongoose = require('mongoose');

const confessionSchema = new mongoose.Schema({
  session_code: { type: String, required: true },
  text: { type: String, required: true },
  mood: { type: String, required: true },
  is_public: { type: Boolean, default: false },
  replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reply' }],
  assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: 'Moderator' },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Confession', confessionSchema);
  
