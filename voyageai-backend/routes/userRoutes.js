// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const User = require('../models/User');

// GET /api/users/me
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) return res.status(404).json({ error: 'User profile not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/users/me/preferences
// { favoriteDestinations, budgetPreference, travelStyle, visitedPlaces }
router.patch('/me/preferences', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) return res.status(404).json({ error: 'User profile not found' });

    const { favoriteDestinations, budgetPreference, travelStyle, visitedPlaces } = req.body;
    if (favoriteDestinations) user.preferences.favoriteDestinations = favoriteDestinations;
    if (budgetPreference) user.preferences.budgetPreference = budgetPreference;
    if (travelStyle) user.preferences.travelStyle = travelStyle;
    if (visitedPlaces) user.preferences.visitedPlaces = visitedPlaces;

    await user.save();
    res.json(user);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
