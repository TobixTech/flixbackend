const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Moderator = require('../models/Moderator');

// POST /login
router.post('/login', async (req, res) => {
  const { username, pin } = req.body;

  try {
    // Check for admin
    const admin = await Admin.findOne({ username });
    if (admin && await bcrypt.compare(pin, admin.password_hash)) {
      const token = jwt.sign({ _id: admin._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
      return res.json({ role: 'admin', token });
    }

    // Check for moderator
    const moderator = await Moderator.findOne({ username });
    if (moderator && await bcrypt.compare(pin, moderator.pin_hash)) {
      const token = jwt.sign({ _id: moderator._id, role: 'moderator' }, process.env.JWT_SECRET, { expiresIn: '1h' });
      return res.json({ role: 'moderator', token });
    }

    res.status(401).json({ message: 'Invalid username or PIN.' });

  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;

