// routes/transportRoutes.js
const express = require('express');
const router = express.Router();
const { askClaude } = require('../services/claudeService');

// POST /api/transport/recommend  { from, to, budget }
router.post('/recommend', async (req, res, next) => {
  try {
    const { from, to, budget = 'flexible' } = req.body;
    if (!from || !to) return res.status(400).json({ error: 'from and to are required' });

    const system =
      'You recommend transportation options (flight, train, bus, cab, rental bike, metro, walking) for VoyageAI. ' +
      'Give practical general guidance, not live schedules or prices as fact.';
    const reply = await askClaude(system, `Recommend the best transport options from ${from} to ${to} with a ${budget} budget, including rough relative cost and travel time comparisons.`, 600);
    res.json({ advice: reply });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
