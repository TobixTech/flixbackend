const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  session_code: { type: String, required: true, unique: true },
  nickname: { type: String, required: true },
  pin_hash: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Session', sessionSchema);

