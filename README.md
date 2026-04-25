# Mention Tracker

A MERN stack web app to track mentions of a brand on social media. Built as a full-stack engineering take-home assignment.

## Tech Stack
* **Backend:** Node.js, Express, MongoDB (Mongoose) + `mongodb-memory-server` as a fallback
* **Frontend:** React, Vite, React Router, Chart.js, Vanilla CSS

## Features Implemented
* **Brands Management:** Create, delete, list, and view brands
* **Dashboard:** Visualize mentions distribution by source, sentiment, tags, and mentions over the last 30 days. Uses Chart.js for visualizations.
* **Mentions List:** Filter by source, sentiment, tag, and search query. Built-in pagination.
* **De-duplication:** Ensures unique mentions via composite indexing (`brandId` + `url` OR `brandId` + `source` + `externalId`)
* **Bulk Ingest:** Upload CSV/JSON. Includes an error tracking mechanism for skip/fail deduplication counts.
* **Saved Views:** Presets for fast filtering.
* **Export CSV:** Automatically generated CSV exports from filtered mentions.
* **Automated Data Seeding:** Fake data injected via backend `seed.js` into MongoDB.

## Getting Started

### Backend
1. `cd backend`
2. `npm install`
3. `npm start` (Runs Node server on port 5000)
> *Note:* If MongoDB is not running locally on `mongodb://127.0.0.1:27017/mentiontracker`, the server seamlessly falls back to `mongodb-memory-server`, instantly running locally without requiring MongoDB installation!

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`
4. Open the displayed local server link (e.g. `http://localhost:5173`) in your browser to view the app!

## Design Aesthetics
Features a custom dark-mode minimal interface built purely on Vanilla CSS with focus on glass-morphism panels, harmonious spacing, smooth hover transitions and custom color token properties for scalable maintenance. No Tailwind overhead needed.

Thank you for reviewing!
