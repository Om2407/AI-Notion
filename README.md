# Peblo Notes — AI-Powered Collaborative Notes Workspace

A full-stack, AI-powered notes application built for the Peblo Full Stack Developer Challenge. Users can create and manage notes, organise them with tags and categories, generate AI insights using Gemini, share notes publicly, and track productivity via a dashboard.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS |
| Backend | Node.js + Express (ESM) |
| Database | MongoDB + Mongoose |
| AI | Google Gemini 1.5 Flash |
| Auth | JWT (7-day tokens) |

---

## Features

- **Authentication** — Signup / Login with JWT, persistent sessions
- **Notes Workspace** — Create, edit, auto-save (1s debounce), archive, delete
- **Tags & Categories** — Organise notes; filter by tag in sidebar
- **AI Insights (Gemini)** — Generate summary, action items, suggested title per note
- **Search & Filter** — Keyword search, tag filter, sorted by last updated
- **Public Sharing** — Generate a public share link; revoke anytime
- **Productivity Dashboard** — Total notes, archived count, weekly bar chart, top tags, AI usage stats, recent notes

---

## Project Structure

```
peblo-notes/
├── server/                  # Express backend
│   ├── models/
│   │   ├── User.js          # User schema (bcrypt hashing)
│   │   └── Note.js          # Note schema with AI fields + shareId
│   ├── routes/
│   │   ├── auth.js          # POST /auth/signup, /auth/login, GET /auth/me
│   │   ├── notes.js         # Full CRUD + AI + share endpoints
│   │   ├── shared.js        # GET /shared/:shareId (public, no auth)
│   │   └── insights.js      # GET /insights (dashboard data)
│   ├── controllers/
│   │   └── gemini.js        # Gemini API integration
│   ├── middleware/
│   │   └── auth.js          # JWT verify middleware
│   └── index.js             # Express app entry
│
└── client/                  # React frontend
    └── src/
        ├── pages/
        │   ├── LoginPage.tsx
        │   ├── SignupPage.tsx
        │   ├── NotesPage.tsx       # Main workspace
        │   ├── DashboardPage.tsx   # Productivity insights
        │   └── SharedNotePage.tsx  # Public note view
        ├── components/
        │   ├── shared/Sidebar.tsx
        │   ├── notes/NoteCard.tsx
        │   └── notes/NoteEditor.tsx  # Editor with AI panel
        ├── hooks/useAuth.tsx         # Auth context
        ├── lib/api.ts                # Axios instance
        └── types/index.ts
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Google Gemini API key ([get one here](https://aistudio.google.com/app/apikey))

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd peblo-notes
```

### 2. Configure the backend

```bash
cd server
cp .env.example .env
```

Fill in your `.env`:

```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/peblo-notes
JWT_SECRET=choose_a_long_random_secret
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:5173
```

### 3. Install dependencies

```bash
# From root
npm run install:all

# Or manually:
cd server && npm install
cd ../client && npm install
```

### 4. Run the application

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
# Server starts at http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
# App opens at http://localhost:5173
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /auth/signup | ❌ | Create account |
| POST | /auth/login | ❌ | Login |
| GET | /auth/me | ✅ | Get current user |
| GET | /notes | ✅ | List notes (search/filter/archive) |
| POST | /notes | ✅ | Create note |
| PATCH | /notes/:id | ✅ | Update note |
| DELETE | /notes/:id | ✅ | Delete note |
| POST | /notes/:id/generate-summary | ✅ | AI insights via Gemini |
| POST | /notes/:id/share | ✅ | Generate public share link |
| DELETE | /notes/:id/share | ✅ | Revoke share link |
| GET | /shared/:shareId | ❌ | Public note view |
| GET | /insights | ✅ | Dashboard analytics |

---

## Sample API Responses

### POST /auth/login
```json
{
  "user": { "_id": "...", "name": "John Doe", "email": "john@example.com" },
  "token": "eyJhbGci..."
}
```

### POST /notes/:id/generate-summary
```json
{
  "summary": "Weekly sprint planning covering UI tasks and API review.",
  "action_items": ["Prepare UI mockups", "Review API structure", "Schedule team sync"],
  "suggested_title": "Sprint 12 Planning Notes",
  "generated_at": "2026-05-17T10:30:00Z"
}
```

### GET /insights
```json
{
  "totalNotes": 24,
  "archivedCount": 3,
  "recentNotes": [...],
  "topTags": [{ "tag": "work", "count": 8 }, { "tag": "ideas", "count": 5 }],
  "aiStats": { "notesWithAI": 12, "totalActionItems": 34 },
  "weeklyActivity": [{ "date": "2026-05-11", "count": 3 }, ...]
}
```

---

## Database Schema

### User
```js
{ name, email, password (bcrypt hashed), timestamps }
```

### Note
```js
{
  note_id,        // "NOTE_XXXX" readable ID
  user,           // ref to User
  title, content,
  tags[],         // array of strings
  category,
  isArchived,     // boolean
  isPublic,       // boolean
  shareId,        // uuid for public sharing
  aiSummary,      // Gemini generated
  aiActionItems[],
  aiSuggestedTitle,
  aiGeneratedAt,
  timestamps
}
```

---

## Environment Variables

```bash
# server/.env.example
PORT=
MONGODB_URI=
JWT_SECRET=
GEMINI_API_KEY=
CLIENT_URL=
```

---

## Deployment

| Service | Platform |
|---------|----------|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |

Deploy backend to Render as a Node.js web service. Set all env vars in the dashboard.
Deploy frontend to Vercel — update `vite.config.ts` proxy or set `VITE_API_URL` to your Render URL.

---

Built by Om Gupta for the Peblo Full Stack Developer Challenge.
