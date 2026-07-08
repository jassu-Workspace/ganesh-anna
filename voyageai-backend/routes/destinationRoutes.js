// routes/destinationRoutes.js
const express = require('express');
const router = express.Router();
const { askClaudeForJSON } = require('../services/claudeService');

// POST /api/destinations/recommend
// { budget, weatherPreference, interests: ["Adventure","Beach",...] }
router.post('/recommend', async (req, res, next) => {
  try {
    const { budget, weatherPreference, interests = [] } = req.body;

    const system =
      'You recommend tourist destinations for VoyageAI. Respond with ONLY valid JSON: ' +
      '{"recommendations":[{"place":"name","country":"name","matchReason":"1 sentence","idealFor":["tag"]}]}. ' +
      'Return 5 recommendations.';

    const userText = `Suggest destinations for a traveler with budget "${budget || 'flexible'}", weather preference "${weatherPreference || 'any'}", and interests: ${interests.join(', ') || 'general sightseeing'}.`;

    const data = await askClaudeForJSON(system, userText, 900);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
