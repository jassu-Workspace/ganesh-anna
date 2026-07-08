// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    name: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    avatarUrl: { type: String },

    // Conversation memory / preferences (feature 13)
    preferences: {
      favoriteDestinations: [{ type: String }],
      budgetPreference: { type: String, enum: ['budget', 'mid', 'luxury'], default: 'mid' },
      travelStyle: { type: String, enum: ['solo', 'family', 'friends', 'couple', 'business'], default: 'solo' },
      visitedPlaces: [{ type: String }]
    },

    createdAt: { type: Date, default: Date.now },
    lastActiveAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
