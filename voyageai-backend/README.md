# VoyageAI — Smart Travel & Tourism Assistant

A full-stack, AI-powered trip planning assistant. This package contains the **production backend scaffold**
(Express + MongoDB + Firebase Auth + OpenRouter API + Google Maps/Places + OpenWeather), meant to sit behind the
`voyageai.html` frontend demo (or a full React/Tailwind rebuild of it) that was delivered alongside this folder.

## 1. Architecture overview

```
┌────────────────┐      HTTPS       ┌─────────────────────┐
│  React Frontend │ ───────────────▶ │   Express API        │
│  (Tailwind,     │ ◀─────────────── │   (this backend)      │
│  Framer Motion) │                  └─────────┬───────────┘
└────────────────┘                            │
        │  Firebase Auth (ID tokens)            │
        ▼                                       ▼
┌────────────────┐                  ┌─────────────────────┐
│ Firebase Auth   │                  │  MongoDB (Mongoose)  │
└────────────────┘                  │  Users / Trips /      │
                                     │  Conversations        │
                                     └─────────┬───────────┘
                                               │
                     ┌─────────────────────────┼─────────────────────────┐
                     ▼                         ▼                         ▼
             ┌───────────────┐        ┌───────────────┐         ┌───────────────┐
             │ OpenRouter API │        │ Google Maps /  │         │ OpenWeather /  │
             │ (itineraries,  │        │ Places API     │         │ Unsplash APIs  │
             │ chat, budget,  │        │ (hotels, nearby│         │ (weather,      │
             │ packing, safety)│       │ attractions)   │         │ images)        │
             └───────────────┘        └───────────────┘         └───────────────┘
```

**Request flow example — "Plan a 5-day Goa trip":**
1. Frontend sends the trip form to `POST /api/itinerary/generate`.
2. Express validates input, builds a system prompt, and calls OpenRouter via `services/claudeService.js`.
3. OpenRouter returns strict JSON (day-by-day plan); the route parses and, if the user is authenticated, saves it as a `Trip` document in MongoDB.
4. The frontend renders the itinerary as boarding-pass-style day cards.

## 2. Folder structure

```
voyageai-backend/
├── server.js                 # Express app entry point
├── package.json
├── .env.example               # copy to .env and fill in real keys
├── config/
│   ├── db.js                  # MongoDB connection
│   └── firebase.js            # Firebase Admin SDK init
├── middleware/
│   └── authMiddleware.js      # requireAuth / optionalAuth (verifies Firebase ID tokens)
├── models/
│   ├── User.js                # profile + preferences (conversation memory)
│   ├── Trip.js                # itinerary, budget breakdown, packing list
│   └── Conversation.js        # chat history per user
├── services/
│   └── claudeService.js       # OpenRouter askClaude() / askClaudeForJSON() wrappers
└── routes/
    ├── authRoutes.js           # POST /api/auth/sync
    ├── userRoutes.js           # GET/PATCH /api/users/me
    ├── chatRoutes.js           # POST /api/chat, /api/chat/authenticated
    ├── itineraryRoutes.js      # POST /api/itinerary/generate
    ├── destinationRoutes.js    # POST /api/destinations/recommend
    ├── hotelRoutes.js          # GET /api/hotels, POST /api/hotels/advise
    ├── restaurantRoutes.js     # GET /api/restaurants
    ├── budgetRoutes.js         # POST /api/budget/split
    ├── weatherRoutes.js        # GET /api/weather, /api/weather/seasonal
    ├── transportRoutes.js      # POST /api/transport/recommend
    ├── packingRoutes.js        # POST /api/packing/generate
    └── safetyRoutes.js         # POST /api/safety/briefing
```

A matching frontend React project would look like:

```
voyageai-frontend/
├── src/
│   ├── components/ (Sidebar, ChatWindow, ItineraryCard, BudgetDonut, PackingChecklist...)
│   ├── pages/ (Landing, Chat, Planner, Budget, Packing, Safety)
│   ├── context/ (AuthContext, ThemeContext)
│   ├── services/ (api.js — axios wrapper with Firebase token attached)
│   └── App.jsx
├── tailwind.config.js
└── package.json
```

## 3. Environment setup

```bash
cd voyageai-backend
cp .env.example .env
# fill in MONGODB_URI, OPENROUTER_API_KEY, GOOGLE_PLACES_API_KEY,
# OPENWEATHER_API_KEY, Firebase service account path, etc.
npm install
npm run dev   # nodemon, http://localhost:5000
```

Get a Firebase service account key from **Firebase Console → Project Settings → Service Accounts →
Generate new private key**, save it as `config/firebase-service-account.json` (or update the path in `.env`).

## 4. API summary

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/auth/sync` | Create/refresh a MongoDB profile after Firebase login |
| POST | `/api/chat` | Public, stateless chatbot reply |
| POST | `/api/chat/authenticated` | Chatbot reply with saved memory/preferences |
| POST | `/api/itinerary/generate` | Full day-by-day itinerary |
| POST | `/api/destinations/recommend` | Destination suggestions by budget/weather/interests |
| GET | `/api/hotels` | Live hotel search (Google Places) |
| GET | `/api/restaurants` | Live restaurant search (Google Places) |
| POST | `/api/budget/split` | AI-suggested budget percentage split |
| GET | `/api/weather` | Live current weather + forecast (OpenWeather) |
| GET | `/api/weather/seasonal` | General seasonal guidance (no API key needed) |
| POST | `/api/transport/recommend` | Transport option guidance |
| POST | `/api/packing/generate` | Packing checklist JSON |
| POST | `/api/safety/briefing` | Safety + climate briefing |
| GET/PATCH | `/api/users/me` | Read/update stored preferences |

## 5. Deployment instructions

**Backend (Render / Railway / Fly.io / EC2):**
1. Push this folder to its own git repository.
2. Create a new Node web service, set the start command to `npm start`.
3. Add all `.env` variables in the platform's dashboard (never commit `.env`).
4. Whitelist your frontend's domain in `CLIENT_URL` for CORS.
5. Use MongoDB Atlas for a managed database — whitelist the backend host's IP (or `0.0.0.0/0` while testing).

**Frontend (Vercel / Netlify):**
1. Build the React app (`npm run build`), point `VITE_API_URL` / `REACT_APP_API_URL` at the deployed backend.
2. Add Firebase config keys as environment variables.
3. Deploy; enable HTTPS (default on both platforms).

**Database:**
- MongoDB Atlas free tier is enough for prototyping. Enable daily backups before going to production.

**Secrets:**
- Rotate the OpenRouter, Google, and OpenWeather API keys if this repository is ever made public.
- Store the Firebase service account JSON as a secret file/environment variable in your host, not in git.

## 6. Notes and next steps

- This scaffold intentionally keeps each AI-touching route thin and centralized in `services/claudeService.js`,
  so swapping models or adding streaming later only touches one file.
- Rate limiting is applied globally in `server.js`; consider per-route limits on `/api/chat` if usage grows.
- The **Future Features** list from the original brief (flight/hotel booking, AI expense tracker, voice
  assistant, landmark recognition, currency converter, translator, offline guide, AR navigation) are not
  scaffolded here — each is its own integration (a booking provider API, a speech-to-text service, a
  vision model call, etc.) and is best tackled one at a time once the core assistant is live.
