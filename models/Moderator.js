const mongoose = require('mongoose');

const moderatorSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  pin_hash: { type: String, required: true },
  assigned_confessions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Confession' }],
  role: { type: String, default: 'moderator' },
});

module.exports = mongoose.model('Moderator', moderatorSchema);

