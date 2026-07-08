// routes/weatherRoutes.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const { askClaude } = require('../services/claudeService');

// GET /api/weather?city=Goa — live current weather + forecast via OpenWeather
router.get('/', async (req, res, next) => {
  try {
    const { city } = req.query;
    if (!city) return res.status(400).json({ error: 'city query param is required' });

    const [currentRes, forecastRes] = await Promise.all([
      axios.get('https://api.openweathermap.org/data/2.5/weather', {
        params: { q: city, appid: process.env.OPENWEATHER_API_KEY, units: 'metric' }
      }),
      axios.get('https://api.openweathermap.org/data/2.5/forecast', {
        params: { q: city, appid: process.env.OPENWEATHER_API_KEY, units: 'metric' }
      })
    ]);

    res.json({
      current: {
        temp: currentRes.data.main.temp,
        feelsLike: currentRes.data.main.feels_like,
        condition: currentRes.data.weather[0].description,
        humidity: currentRes.data.main.humidity,
        windSpeed: currentRes.data.wind.speed
      },
      forecast: forecastRes.data.list.slice(0, 8).map((f) => ({
        time: f.dt_txt,
        temp: f.main.temp,
        condition: f.weather[0].description
      }))
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/weather/seasonal?city=Goa&month=December — general AI seasonal guidance (no live key needed)
router.get('/seasonal', async (req, res, next) => {
  try {
    const { city, month } = req.query;
    if (!city) return res.status(400).json({ error: 'city query param is required' });

    const system =
      'You describe typical seasonal weather patterns for travel planning. Speak in general/typical terms, never as live data.';
    const reply = await askClaude(
      system,
      `Describe typical weather in ${city}${month ? ' during ' + month : ' year-round'}, the best season to visit, and one packing tip.`,
      400
    );
    res.json({ seasonalGuidance: reply });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
