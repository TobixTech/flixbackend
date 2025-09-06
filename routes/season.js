const router = require('express').Router();
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const Session = require('../models/Session');

// POST /session/create
router.post('/create', async (req, res) => {
  const { nickname, pin } = req.body;

  if (!nickname || !pin) {
    return res.status(400).json({ message: 'Nickname and PIN are required.' });
  }

  try {
    const session_code = uuidv4().split('-')[0]; // Simple, unique code
    const pin_hash = await bcrypt.hash(pin, 10);
    const newSession = new Session({ nickname, pin_hash, session_code });
    await newSession.save();
    res.status(201).json({ session_code });
  } catch (err) {
    res.status(500).json({ message: 'Could not create session.', error: err.message });
  }
});

// POST /session/login
router.post('/login', async (req, res) => {
  const { session_code, pin } = req.body;

  if (!session_code || !pin) {
    return res.status(400).json({ message: 'Session code and PIN are required.' });
  }

  try {
    const session = await Session.findOne({ session_code });
    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }

    const isMatch = await bcrypt.compare(pin, session.pin_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid PIN.' });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
      
