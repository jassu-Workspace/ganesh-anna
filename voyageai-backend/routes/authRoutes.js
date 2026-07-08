// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const User = require('../models/User');

// POST /api/auth/sync — called once after Firebase login on the frontend.
// Creates the MongoDB user profile the first time, otherwise just touches lastActiveAt.
router.post('/sync', requireAuth, async (req, res, next) => {
  try {
    const { uid, email, name } = req.user;

    let user = await User.findOne({ firebaseUid: uid });
    if (!user) {
      user = await User.create({
        firebaseUid: uid,
        email: email || `${uid}@unknown.local`,
        name: name || '',
        preferences: {}
      });
    } else {
      user.lastActiveAt = new Date();
      await user.save();
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
