# AI-Powered City Guider

Welcome to the AI-Powered City Guider, a final-year engineering project that demonstrates intelligent travel recommendations using rule-based AI techniques.

## 🤖 AI Features

This project implements several AI-powered features:

### 1. AI-Based Recommendation Engine
Our system uses a rule-based weighted scoring algorithm to recommend attractions based on:
- **Ratings**: Higher-rated attractions receive higher scores
- **Popularity**: Estimated from rating counts
- **Category Relevance**: Based on user preferences (family, solo, couple, adventure)

### 2. Personalized Recommendations
Users can select their travel style, and our AI adapts recommendations accordingly:
- **Family**: Prioritizes parks, museums, and educational attractions
- **Solo**: Emphasizes historical and cultural sites
- **Couple**: Highlights romantic and scenic locations
- **Adventure**: Focuses on nature and outdoor experiences

### 3. Smart Filtering
Dynamic filtering by:
- Rating (highest to lowest)
- Category (historical, nature, entertainment, religious, etc.)
- Alphabetical ordering

### 4. Intelligent Search
Smart city search with:
- Partial matching ("Mum" finds "Mumbai")
- Case-insensitive matching
- State-based search

## 🏗️ System Architecture

```
Frontend (React + TypeScript + Tailwind CSS)
    ↓
API Layer (Hono.js Worker)
    ↓
Business Logic (Recommendation Service)
    ↓
Data Layer (Static Data Files)
```

## 🧠 Why This Is Considered AI

Our system implements classic AI techniques:
1. **Rule-Based Expert System**: Uses predefined rules to make intelligent decisions
2. **Weighted Scoring Algorithm**: Applies machine learning fundamentals to rank attractions
3. **Adaptive Behavior**: Changes output based on user inputs
4. **Pattern Recognition**: Identifies and responds to data patterns

## 🚀 Getting Started

To run the development server:

```
npm install
npm run dev
```

### Environment keys (AI)

- AI itinerary backend uses `NVIDIA_API_KEY` (NVIDIA API Catalog / Gemma). Keep this key server-side (do not expose as a `VITE_` variable).
  - Local dev: put it in `.dev.vars` (already gitignored) or set it in your shell environment.
  - Production: run `wrangler secret put NVIDIA_API_KEY`.

## 📁 Project Structure

```
src/
├── react-app/          # Frontend components and pages
├── worker/             # API endpoints and business logic
│   ├── data/           # Static data files
│   └── services/       # Business logic services
└── shared/             # Shared types and utilities
```

## 🎯 Academic Viva Points

1. **Simple but Effective AI**: Uses rule-based systems rather than complex ML for practicality
2. **Scalable Architecture**: Separates concerns between UI, API, and business logic
3. **Real-time Processing**: Dynamic filtering and sorting without page reloads
4. **Industry-Relevant Tech Stack**: React, TypeScript, Tailwind CSS, Hono.js
5. **Explainable AI**: Clear weighting and scoring logic that can be defended in examination

## 🛠️ Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Hono.js (Cloudflare Workers compatible)
- **AI Techniques**: Rule-based expert systems, weighted scoring algorithms
- **Map Integration**: Leaflet, React-Leaflet
- **UI Components**: Lucide React icons, Framer Motion animations

This project demonstrates how intelligent behavior can be achieved without heavy machine learning models, making it perfect for academic projects and real-world applications.
