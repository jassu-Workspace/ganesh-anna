// routes/safetyRoutes.js
const express = require('express');
const router = express.Router();
const { askClaudeForJSON } = require('../services/claudeService');

// POST /api/safety/briefing  { destination, month }
router.post('/briefing', async (req, res, next) => {
  try {
    const { destination, month } = req.body;
    if (!destination) return res.status(400).json({ error: 'destination is required' });

    const system =
      'You are a cautious travel safety and climate briefing writer for VoyageAI. Respond with ONLY valid JSON: ' +
      '{"weather":"typical climate, 2-3 sentences","best_season":"short phrase","packing_note":"1 sentence","safety":["tip"],"scams":["pattern"]}. ' +
      'Speak in typical/seasonal terms, never as live or guaranteed data. Do not state specific emergency phone numbers as fact — ' +
      'instead advise the traveler to look up the current local emergency number for their destination.';

    const data = await askClaudeForJSON(system, `Give a general travel safety and climate briefing for ${destination}${month ? ' in ' + month : ''}.`, 700);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
