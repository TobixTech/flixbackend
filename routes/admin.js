const router = require('express').Router();
const { auth, checkRole } = require('../middleware/auth');
const Confession = require('../models/Confession');
const Moderator = require('../models/Moderator');
const Reply = require('../models/Reply');
const Admin = require('../models/Admin'); // For creating admin initially if needed
const Flag = require('../models/Flag');
const bcrypt = require('bcrypt');

router.use(auth, checkRole('admin'));

// GET /admin/confessions
router.get('/confessions', async (req, res) => {
  try {
    const confessions = await Confession.find().populate('replies assigned_to');
    res.json(confessions);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching confessions.', error: err.message });
  }
});

// POST /confession/:id/reply (admin)
router.post('/confession/:id/reply', async (req, res) => {
  const { text } = req.body;
  const { id } = req.params;

  if (!text) return res.status(400).json({ message: 'Reply text is required.' });

  try {
    const confession = await Confession.findById(id);
    if (!confession) return res.status(404).json({ message: 'Confession not found.' });

    const newReply = new Reply({ confession_id: id, sender: 'admin', text });
    await newReply.save();
    
    confession.replies.push(newReply._id);
    await confession.save();

    res.status(201).json(newReply);
  } catch (err) {
    res.status(500).json({ message: 'Could not add reply.', error: err.message });
  }
});

// DELETE /confession/:id/reply/:reply_id
router.delete('/confession/:id/reply/:reply_id', async (req, res) => {
  try {
    await Reply.findByIdAndDelete(req.params.reply_id);
    await Confession.findByIdAndUpdate(req.params.id, { $pull: { replies: req.params.reply_id } });
    res.json({ message: 'Reply deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Could not delete reply.', error: err.message });
  }
});

// GET /moderators
router.get('/moderators', async (req, res) => {
  try {
    const moderators = await Moderator.find();
    res.json(moderators);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching moderators.', error: err.message });
  }
});

// POST /moderator/create
router.post('/moderator/create', async (req, res) => {
  const { username, pin } = req.body;
  if (!username || !pin) {
    return res.status(400).json({ message: 'Username and PIN are required.' });
  }

  try {
    const pin_hash = await bcrypt.hash(pin, 10);
    const newModerator = new Moderator({ username, pin_hash });
    await newModerator.save();
    res.status(201).json({ message: 'Moderator created successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Could not create moderator.', error: err.message });
  }
});

// DELETE /moderator/:id
router.delete('/moderator/:id', async (req, res) => {
  try {
    await Moderator.findByIdAndDelete(req.params.id);
    res.json({ message: 'Moderator deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Could not delete moderator.', error: err.message });
  }
});

// PUT /moderator/:id/assign
router.put('/moderator/:id/assign', async (req, res) => {
  const { confession_id } = req.body;
  try {
    const moderator = await Moderator.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { assigned_confessions: confession_id } },
      { new: true }
    );
    if (!moderator) return res.status(404).json({ message: 'Moderator not found.' });

    await Confession.findByIdAndUpdate(confession_id, { assigned_to: req.params.id });

    res.json(moderator);
  } catch (err) {
    res.status(500).json({ message: 'Could not assign confession.', error: err.message });
  }
});

// GET /analytics
router.get('/analytics', async (req, res) => {
  try {
    const totalConfessions = await Confession.countDocuments();
    const moodDistribution = await Confession.aggregate([
      { $group: { _id: '$mood', count: { $sum: 1 } } }
    ]);

    res.json({
      totalConfessions,
      moodDistribution,
      // You'll need to implement logic for confessions per day/week and FrixMe vs FrixAI ratio
      // This is a placeholder for that logic
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching analytics.', error: err.message });
  }
});

// GET /admin/flags
router.get('/flags', async (req, res) => {
  try {
    const flags = await Flag.find().populate('confession_id');
    res.json(flags);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching flags.', error: err.message });
  }
});

module.exports = router;
      
