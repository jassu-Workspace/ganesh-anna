// routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const { askClaude } = require('../services/claudeService');
const { requireAuth } = require('../middleware/authMiddleware');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

// POST /api/chat  { message }
// Stateless quick-ask (no auth required) — used for the public landing chatbot demo.
router.post('/', async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'message is required' });

    const system =
      'You are an experienced, warm, practical travel consultant for the VoyageAI app. ' +
      'Give concise, organized advice on destinations, hotels, restaurants, itineraries, budgets, ' +
      'transport, packing, and safety. Never invent live prices or availability as fact.';

    const reply = await askClaude(system, message, 1000);
    res.json({ reply });
  } catch (err) {
    next(err);
  }
});

// POST /api/chat/authenticated { message } — persists conversation + uses stored preferences as memory
router.post('/authenticated', requireAuth, async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'message is required' });

    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) return res.status(404).json({ error: 'User profile not found' });

    let conversation = await Conversation.findOne({ user: user._id });
    if (!conversation) conversation = new Conversation({ user: user._id, messages: [] });

    const memoryNote = `Known traveler profile: ${JSON.stringify(user.preferences)}`;
    const system =
      'You are an experienced travel consultant for the VoyageAI app. ' +
      'Use the traveler profile naturally without dumping it back verbatim. ' + memoryNote;

    const reply = await askClaude(system, message, 1000);

    conversation.messages.push({ role: 'user', content: message });
    conversation.messages.push({ role: 'assistant', content: reply });
    // keep last 60 messages to bound document size
    conversation.messages = conversation.messages.slice(-60);
    await conversation.save();

    user.lastActiveAt = new Date();
    await user.save();

    res.json({ reply });
  } catch (err) {
    next(err);
  }
});

// GET /api/chat/history — fetch stored conversation for the logged-in user
router.get('/history', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) return res.status(404).json({ error: 'User profile not found' });
    const conversation = await Conversation.findOne({ user: user._id });
    res.json({ messages: conversation ? conversation.messages : [] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
