const mongoose = require('mongoose');

const flagSchema = new mongoose.Schema({
  confession_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Confession', required: true },
  reason: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  resolved: { type: Boolean, default: false },
});

module.exports = mongoose.model('Flag', flagSchema);
