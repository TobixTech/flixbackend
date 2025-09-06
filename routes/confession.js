const router = require('express').Router();
const Confession = require('../models/Confession');
const Reply = require('../models/Reply');
const Flag = require('../models/Flag');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const harmfulKeywords = ['self-harm', 'suicide', 'threat'];

// POST /confession
router.post('/', async (req, res) => {
  const { session_code, text, mood, is_public } = req.body;

  if (!session_code || !text || !mood) {
    return res.status(400).json({ message: 'Required fields are missing.' });
  }

  try {
    const newConfession = new Confession({ session_code, text, mood, is_public });
    await newConfession.save();

    const isHarmful = harmfulKeywords.some(keyword => text.toLowerCase().includes(keyword));
    if (isHarmful) {
      const newFlag = new Flag({ confession_id: newConfession._id, reason: 'Contains harmful keywords.' });
      await newFlag.save();
    }

    res.status(201).json(newConfession);
  } catch (err) {
    res.status(500).json({ message: 'Could not save confession.', error: err.message });
  }
});

// GET /confession/:session_code
router.get('/:session_code', async (req, res) => {
  try {
    const confessions = await Confession.find({ session_code: req.params.session_code })
      .populate('replies');
    res.json(confessions);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching confessions.', error: err.message });
  }
});

// GET /feed
router.get('/feed', async (req, res) => {
  try {
    const publicConfessions = await Confession.find({ is_public: true })
      .populate('replies');
    res.json(publicConfessions);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching public feed.', error: err.message });
  }
});

// POST /feed/:id/reply
router.post('/feed/:id/reply', async (req, res) => {
  const { text } = req.body;
  const { id } = req.params;

  if (!text) {
    return res.status(400).json({ message: 'Reply text is required.' });
  }

  try {
    const confession = await Confession.findById(id);
    if (!confession) {
      return res.status(404).json({ message: 'Confession not found.' });
    }

    const newReply = new Reply({ confession_id: id, sender: 'peer', text });
    await newReply.save();

    confession.replies.push(newReply._id);
    await confession.save();

    res.status(201).json(newReply);
  } catch (err) {
    res.status(500).json({ message: 'Could not add reply.', error: err.message });
  }
});

// POST /frixai/reply
router.post('/frixai/reply', async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ message: 'Text is required for AI reply.' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const result = await model.generateContent(text);
    const response = await result.response;
    const aiReply = response.text();

    res.json({ reply: aiReply });
    
  } catch (err) {
    console.error('Gemini API Error:', err);
    res.status(500).json({ message: 'Error with AI reply.', error: err.message });
  }
});

module.exports = router;
