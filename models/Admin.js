const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  role: { type: String, default: 'admin' },
});

module.exports = mongoose.model('Admin', adminSchema);
  
