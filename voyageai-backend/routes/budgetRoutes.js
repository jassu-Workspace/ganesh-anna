// routes/budgetRoutes.js
const express = require('express');
const router = express.Router();
const { askClaudeForJSON } = require('../services/claudeService');

// POST /api/budget/split  { totalBudget, style }  style: budget | mid | luxury
router.post('/split', async (req, res, next) => {
  try {
    const { totalBudget, style = 'mid' } = req.body;
    if (!totalBudget) return res.status(400).json({ error: 'totalBudget is required' });

    const system =
      'You allocate travel budgets for VoyageAI. Respond with ONLY valid JSON: ' +
      '{"hotel":n,"food":n,"transport":n,"tickets":n,"shopping":n,"emergency":n} ' +
      'where values are percentages that sum to 100, appropriate for the given travel style.';

    const data = await askClaudeForJSON(system, `Suggest a percentage split for a ${style} style trip with a total budget of ${totalBudget}.`, 400);

    const breakdown = Object.fromEntries(
      Object.entries(data).map(([k, pct]) => [k, Math.round((pct / 100) * totalBudget)])
    );

    res.json({ percentages: data, amounts: breakdown, totalBudget });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
