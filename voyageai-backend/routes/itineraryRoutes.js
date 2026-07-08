// routes/itineraryRoutes.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { askClaudeForJSON } = require('../services/claudeService');
const { optionalAuth } = require('../middleware/authMiddleware');
const Trip = require('../models/Trip');
const User = require('../models/User');

// POST /api/itinerary/generate
// { from, destination, days, budget, travelers, travelType }
router.post(
  '/generate',
  optionalAuth,
  [
    body('destination').notEmpty(),
    body('days').isInt({ min: 1, max: 30 }),
    body('budget').isNumeric()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { from = 'the traveler\'s city', destination, days, budget, travelers = 1, travelType = 'solo' } = req.body;

      const system =
        'You are a travel itinerary generator for the VoyageAI app. Respond with ONLY valid JSON matching: ' +
        '{"summary":"short paragraph","days":[{"day":1,"title":"short theme","morning":"plan","afternoon":"plan","evening":"plan","night":"plan"}]}. ' +
        'Keep fields concise. Generate exactly the requested number of days.';

      const userText = `Plan a ${days}-day ${travelType} trip from ${from} to ${destination} for ${travelers} traveler(s) with a total budget of ${budget}.`;

      const data = await askClaudeForJSON(system, userText, 1500);

      let tripId = null;
      if (req.user) {
        const user = await User.findOne({ firebaseUid: req.user.uid });
        if (user) {
          const trip = await Trip.create({
            user: user._id,
            from,
            destination,
            days,
            budget,
            travelers,
            travelType,
            summary: data.summary,
            itinerary: data.days
          });
          tripId = trip._id;
        }
      }

      res.json({ tripId, ...data });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/itinerary/:id — fetch a saved trip
router.get('/:id', async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    res.json(trip);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
