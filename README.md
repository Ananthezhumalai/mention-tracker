# MentionTracker

A MERN stack web app to track brand mentions across social media platforms — built as a full-stack take-home assignment.

---

## About This Project

My primary background is **Front-End development (3 years)** with React, JavaScript, and TypeScript. The UI — including component architecture, routing, state management, styling, and the Chart.js dashboard — reflects my main area of expertise.

The backend is **intentionally kept simple and foundational** (~1 year experience), covering only what is needed: RESTful API routes, Mongoose models with basic indexing, file upload handling, and a seed script. No advanced backend patterns (queues, caching layers, microservices, etc.) were used — this is a deliberately minimal, correct backend, not a complex one.

---

## Tech Stack

| Layer     | Technology                                       |
|-----------|--------------------------------------------------|
| Frontend  | React 19, Vite, React Router v7, Chart.js, CSS Variables |
| Backend   | Node.js, Express 5, Mongoose 9                   |
| Database  | MongoDB (local) — auto-falls back to `mongodb-memory-server` |
| Utilities | multer (file upload), papaparse (CSV), date-fns  |

---

## Features

- **Brands** — Create, edit, delete brands with keywords. Each brand shows a live mention count.
- **Dashboard** — Per-brand charts: total mentions, sentiment breakdown (doughnut), source breakdown (bar), mentions per day last 30 days (line), top tags.
- **Mentions List** — Paginated table with filters: source, sentiment, tag, free-text search.
- **Bulk Import** — Upload a `.csv` or `.json` file. Returns a summary of added / skipped duplicates / failed rows.
- **De-duplication** — MongoDB compound unique indexes on `(brandId, url)` and `(brandId, source, externalId)` prevent re-ingestion of the same mention.
- **Saved Views** — Save a filter combination with a name; click to re-apply instantly; delete when no longer needed.
- **Export CSV** — Download the current filtered list as a `.csv` file directly from the browser.
- **Auto Seed** — On first start, ~3,800 realistic fake mentions are inserted across 3 brands so all filters and charts are immediately meaningful.

---

## Project Structure

```
mention-tracker/
├── backend/
│   ├── models/
│   │   ├── Brand.js          # Mongoose schema for brands
│   │   ├── Mention.js        # Mongoose schema + dedup indexes
│   │   └── SavedView.js      # Mongoose schema for saved filters
│   ├── routes/
│   │   ├── brands.js         # GET / POST / PUT / DELETE brands
│   │   ├── mentions.js       # GET list, GET dashboard, POST, bulk POST, DELETE
│   │   └── views.js          # GET / POST / DELETE saved views
│   ├── server.js             # Express app entry point
│   └── seed.js               # Fake data generator (runs automatically)
│
└── frontend/
    └── src/
        ├── api.js            # All fetch() calls to the backend
        ├── App.jsx           # React Router setup
        ├── index.css         # Global design system (CSS variables, components)
        ├── components/
        │   └── Sidebar.jsx
        └── pages/
            ├── Brands.jsx    # Brand list + create/delete
            ├── Dashboard.jsx # Charts and stats per brand
            └── Mentions.jsx  # Mentions table, filters, import, export, saved views
```

---

## Prerequisites

Make sure the following are installed on your machine before starting:

| Tool       | Version (minimum) | Check with         |
|------------|-------------------|--------------------|
| Node.js    | 18+               | `node -v`          |
| npm        | 9+                | `npm -v`           |
| Git        | any               | `git --version`    |
| MongoDB    | Optional*         | `mongod --version` |

> **\* MongoDB is optional.** If MongoDB is not running locally, the backend automatically starts an in-memory database (`mongodb-memory-server`) and seeds it. No MongoDB installation is required to run the project.

---

## Setup & Run — Step by Step

### Step 1 — Clone the Repository

```bash
git clone https://github.com/Ananthezhumalai/mention-tracker.git
cd mention-tracker
```

---

### Step 2 — Set Up the Backend

Navigate into the backend folder:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

> This installs Express, Mongoose, multer, papaparse, date-fns, cors, dotenv, and mongodb-memory-server.

**(Optional) Configure environment variables:**

If you have a MongoDB instance running locally, create a `.env` file inside `backend/`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/mentiontracker
```

If you skip this step, the server will default to `PORT=5000` and auto-use an in-memory database.

Start the backend server:

```bash
npm start
```

**Expected output:**

```
Failed to connect to primary MongoDB, falling back to Memory Server...
MongoDB Memory Server connected: mongodb://127.0.0.1:XXXXX/
Seeding memory database...
Clearing existing data...
Brands added: Acme Corp, Globex, Initech
Added XXXX mentions.
Memory DB seeded
Server listening on port 5000
```

> If you have MongoDB running locally, you will instead see: `MongoDB connected` then `Server listening on port 5000`.

---

### Step 3 — Set Up the Frontend

Open a **new terminal window** (keep the backend running), then:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

> This installs React, React Router, Chart.js, react-chartjs-2, lucide-react, and date-fns.

Start the development server:

```bash
npm run dev
```

**Expected output:**

```
  VITE v8.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

### Step 4 — Open the App

Open your browser and go to:

```
http://localhost:5173
```

You will land on the **Brands page** showing 3 pre-seeded brands (Acme Corp, Globex, Initech) each with ~1,000–1,500 mentions loaded.

---

## User Flow

1. **Brands page (`/`)** — See all brands with mention counts. Use **"New Brand"** to add your own.
2. **Click a brand card** → lands on its **Dashboard** with live charts.
3. **Sidebar → Mentions** → paginated mention list with filters. Use:
   - Source / Sentiment dropdowns + Tag text field + Search to filter
   - **"Save View"** to name and save the current filter combination
   - **"Export CSV"** to download the current filtered result
   - **"Bulk Import"** to upload a `.csv` or `.json` file
   - **"+ New Mention"** to manually add a mention
4. **Saved Views** appear as clickable chips below the filter bar — click to instantly re-apply, click `×` to delete.

---

## Bulk Import Format

### CSV

The CSV must have a header row. Supported columns:

```
source,author,body,url,sentiment,tags,postedAt,externalId
twitter,john_doe,"Great product!",https://example.com/1,positive,"praise,general",2024-01-15,ext_001
```

- `tags` — comma-separated within the cell (quoted if needed)
- `postedAt` — any valid date string; defaults to now if omitted
- `externalId` — optional; used for deduplication alongside `source`

### JSON

An array of mention objects:

```json
[
  {
    "source": "reddit",
    "author": "jane_smith",
    "body": "Not happy with pricing.",
    "url": "https://reddit.com/r/example/post/abc",
    "sentiment": "negative",
    "tags": ["pricing", "support"],
    "postedAt": "2024-02-10"
  }
]
```

### Direct API (documented endpoint)

```
POST http://localhost:5000/api/mentions/bulk
Content-Type: application/json

{
  "brandId": "<brand _id>",
  "mentions": [ { ...mention objects } ]
}
```

Response:

```json
{ "added": 10, "skipped": 2, "failed": 0 }
```

---

## API Reference (Quick Summary)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/brands` | List all brands with mention counts |
| POST | `/api/brands` | Create a brand |
| PUT | `/api/brands/:id` | Update a brand |
| DELETE | `/api/brands/:id` | Delete brand + its mentions |
| GET | `/api/mentions?brandId=&page=&limit=&source=&sentiment=&tag=&search=` | Paginated mention list |
| GET | `/api/mentions/dashboard?brandId=` | Dashboard stats & chart data |
| POST | `/api/mentions` | Create a single mention |
| POST | `/api/mentions/bulk` | Bulk ingest (JSON body or file upload) |
| DELETE | `/api/mentions/:id` | Delete a mention |
| GET | `/api/views?brandId=` | List saved views for a brand |
| POST | `/api/views` | Save a new view |
| DELETE | `/api/views/:id` | Delete a saved view |

---

## Seeding Manually

If you need to reset and re-seed the database:

```bash
cd backend
npm run seed
```

> Note: This resets all existing data (brands, mentions, saved views) and re-inserts fresh fake data.

---

## Common Issues

| Problem | Solution |
|---------|----------|
| `Cannot GET /api/...` | Make sure the backend is running on port 5000 (`npm start` inside `/backend`) |
| Charts not showing | Backend must be running before you open the browser |
| Brand IDs in URL look wrong after restart | In-memory DB generates new IDs on each restart — always navigate from the home page (`/`), don't use hardcoded URLs |
| `npm install` fails on `mongodb-memory-server` | Ensure Node.js ≥ 18; this package downloads a MongoDB binary on first install |
| Port 5173 already in use | Vite will pick the next available port automatically (e.g. 5174), check the terminal output |

---

## Notes on Backend Design

The backend is intentionally kept at a **foundational level**, appropriate to my ~1 year of backend exposure:

- **Express routes** are split by resource (`brands`, `mentions`, `views`) — basic RESTful structure.
- **Mongoose models** use compound unique indexes for deduplication — chosen because it's the simplest correct solution at the database level, requiring no extra application logic.
- **No advanced patterns** — no auth middleware, no caching, no job queues, no service layers. Those would be the next steps if this were a production system.
- **mongodb-memory-server** is used as a zero-config fallback so reviewers can run the project without any database setup — a practical convenience choice.

---

## Running Both Servers (Summary)

```bash
# Terminal 1 — Backend
cd mention-tracker/backend
npm install
npm start

# Terminal 2 — Frontend
cd mention-tracker/frontend
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser.
