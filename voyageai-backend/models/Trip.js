// models/Trip.js
const mongoose = require('mongoose');

const DayPlanSchema = new mongoose.Schema(
  {
    day: { type: Number, required: true },
    title: { type: String },
    morning: { type: String },
    afternoon: { type: String },
    evening: { type: String },
    night: { type: String }
  },
  { _id: false }
);

const TripSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    from: { type: String, required: true },
    destination: { type: String, required: true },
    days: { type: Number, required: true, min: 1 },
    budget: { type: Number, required: true },
    travelers: { type: Number, default: 1 },
    travelType: {
      type: String,
      enum: ['solo', 'family', 'friends', 'couple', 'business'],
      default: 'solo'
    },
    summary: { type: String },
    itinerary: [DayPlanSchema],
    budgetBreakdown: {
      hotel: Number,
      food: Number,
      transport: Number,
      tickets: Number,
      shopping: Number,
      emergency: Number
    },
    packingList: [
      {
        group: String,
        items: [String]
      }
    ],
    status: { type: String, enum: ['draft', 'confirmed', 'completed'], default: 'draft' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Trip', TripSchema);
