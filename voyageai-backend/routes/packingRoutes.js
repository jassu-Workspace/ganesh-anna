// routes/packingRoutes.js
const express = require('express');
const router = express.Router();
const { askClaudeForJSON } = require('../services/claudeService');

// POST /api/packing/generate  { destination, month, days }
router.post('/generate', async (req, res, next) => {
  try {
    const { destination, month, days = 5 } = req.body;
    if (!destination) return res.status(400).json({ error: 'destination is required' });

    const system =
      'You build travel packing checklists for VoyageAI. Respond with ONLY valid JSON: ' +
      '{"groups":[{"name":"Documents","items":["Passport","Visa copy"]}]}. ' +
      'Include groups like Documents, Clothing, Health & toiletries, Electronics, Trip-specific gear.';

    const data = await askClaudeForJSON(system, `Build a packing checklist for a ${days}-day trip to ${destination}${month ? ' in ' + month : ''}.`, 900);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
