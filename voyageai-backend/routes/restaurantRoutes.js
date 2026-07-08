// routes/restaurantRoutes.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

// GET /api/restaurants?location=Goa&cuisine=vegetarian
router.get('/', async (req, res, next) => {
  try {
    const { location, cuisine = '' } = req.query;
    if (!location) return res.status(400).json({ error: 'location query param is required' });

    const placesRes = await axios.get(
      'https://maps.googleapis.com/maps/api/place/textsearch/json',
      {
        params: {
          query: `${cuisine} restaurants in ${location}`.trim(),
          key: process.env.GOOGLE_PLACES_API_KEY
        }
      }
    );

    const restaurants = (placesRes.data.results || []).slice(0, 8).map((p) => ({
      name: p.name,
      address: p.formatted_address,
      rating: p.rating,
      priceLevel: p.price_level,
      placeId: p.place_id
    }));

    res.json({ restaurants });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
