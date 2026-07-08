// server.js
// VoyageAI backend entry point — wires up middleware, DB, and routes.

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const itineraryRoutes = require('./routes/itineraryRoutes');
const destinationRoutes = require('./routes/destinationRoutes');
const hotelRoutes = require('./routes/hotelRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const transportRoutes = require('./routes/transportRoutes');
const packingRoutes = require('./routes/packingRoutes');
const safetyRoutes = require('./routes/safetyRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
].filter(Boolean);

// --- Core middleware ---
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true
}));
app.use(express.json({ limit: '2mb' }));

// --- Rate limiting (protects the OpenRouter + third-party API routes) ---
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api', apiLimiter);

// --- Database ---
connectDB();

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/itinerary', itineraryRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/transport', transportRoutes);
app.use('/api/packing', packingRoutes);
app.use('/api/safety', safetyRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'voyageai-backend', timestamp: new Date().toISOString() });
});

// --- 404 handler ---
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// --- Global error handler ---
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 1412;
app.listen(PORT, () => {
  console.log(`VoyageAI backend running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

module.exports = app;
