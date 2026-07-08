// routes/hotelRoutes.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const { askClaude } = require('../services/claudeService');

// GET /api/hotels?location=Goa&budget=mid
router.get('/', async (req, res, next) => {
  try {
    const { location, budget = 'mid' } = req.query;
    if (!location) return res.status(400).json({ error: 'location query param is required' });

    // Real Google Places lookup (requires GOOGLE_PLACES_API_KEY)
    const placesRes = await axios.get(
      'https://maps.googleapis.com/maps/api/place/textsearch/json',
      {
        params: {
          query: `${budget} hotels in ${location}`,
          key: process.env.GOOGLE_PLACES_API_KEY
        }
      }
    );

    const hotels = (placesRes.data.results || []).slice(0, 8).map((p) => ({
      name: p.name,
      address: p.formatted_address,
      rating: p.rating,
      priceLevel: p.price_level,
      placeId: p.place_id,
      location: p.geometry && p.geometry.location
    }));

    res.json({ hotels });
  } catch (err) {
    next(err);
  }
});

// POST /api/hotels/advise  { location, budget, amenities: [] }
// Uses OpenRouter to give qualitative guidance when live Places data isn't needed.
router.post('/advise', async (req, res, next) => {
  try {
    const { location, budget = 'mid', amenities = [] } = req.body;
    const system =
      'You give general hotel-shopping guidance for VoyageAI, without inventing specific real hotel names or live prices as fact.';
    const userText = `What should a traveler look for in ${budget}-range hotels in ${location}, prioritizing: ${amenities.join(', ') || 'general comfort'}?`;
    const reply = await askClaude(system, userText, 500);
    res.json({ advice: reply });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
