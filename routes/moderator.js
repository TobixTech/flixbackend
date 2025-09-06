const router = require('express').Router();
const { auth, checkRole } = require('../middleware/auth');
const Confession = require('../models/Confession');
const Moderator = require('../models/Moderator');
const Reply = require('../models/Reply');

router.use(auth, checkRole('moderator'));

// GET /moderator/confessions
router.get('/confessions', async (req, res) => {
  try {
    const moderator = await Moderator.findById(req.user._id).populate({
      path: 'assigned_confessions',
      populate: { path: 'replies' }
    });
    if (!moderator) {
      return res.status(404).json({ message: 'Moderator not found.' });
    }
    res.json(moderator.assigned_confessions);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching assigned confessions.', error: err.message });
  }
});

// POST /confession/:id/reply (moderator)
router.post('/confession/:id/reply', async (req, res) => {
  const { text } = req.body;
  const { id } = req.params;

  if (!text) return res.status(400).json({ message: 'Reply text is required.' });

  try {
    const confession = await Confession.findById(id);
    if (!confession) return res.status(404).json({ message: 'Confession not found.' });
    
    // Check if the confession is assigned to this moderator
    if (confession.assigned_to && confession.assigned_to.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Access denied. Confession not assigned to you.' });
    }

    const newReply = new Reply({ confession_id: id, sender: 'moderator', text });
    await newReply.save();
    
    confession.replies.push(newReply._id);
    await confession.save();

    res.status(201).json(newReply);
  } catch (err) {
    res.status(500).json({ message: 'Could not add reply.', error: err.message });
  }
});

module.exports = router;

