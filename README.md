# BandBase

BandBase is a web app for managing a band's day-to-day operations: scheduling
events, organizing setlists and songs, and keeping the band in sync.

## Features

- **Authentication** – Registration, login, logout and cookie-based sessions.
- **Bands & roles** – New users join `Band_01` automatically. The first user
  becomes owner, later users become members. Roles are managed per band.
- **Dashboard** – Overview of the next event, open tasks and latest messages
  (partially placeholder content).
- **Calendar** – Monthly calendar grid with event categories (Rehearsal, Gig,
  Other), an upcoming-events list, and a modal to create, edit and delete
  events.
- **Event chat** – Every event has its own channel. Band members can read and
  send messages; owner, admin and moderator can manage events.
- **Setlists & song library** – Create setlists, manage a song archive, add
  songs, notes and pauses, reorder items and edit song details.
- **Messenger** – Placeholder page for future non-event channels.
- **Members & permissions** – Overview of all band members and their roles.
  Owners can transfer ownership and assign any role; admins can assign moderator
  and member roles.
- **Dark mode** – Automatic theme switching via `prefers-color-scheme`.

## Tech stack

**Frontend:**
- React 19 with React Router
- Vite for development and builds
- Tailwind CSS 4 with a custom theme
- lucide-react icons
- ESLint for linting

**Backend:**
- Node.js & Express
- SQLite via `sqlite3`
- SQL migrations in `backend/migrations`
- Session auth with httpOnly cookies
- `node:test` and `supertest`

## Getting started

Requirements: Node.js 20+ and npm.

### 1. Install dependencies

Since the project contains both frontend and backend, install dependencies for
both parts:

```bash
# Frontend dependencies (root directory)
npm install

# Backend dependencies
cd backend
npm install
cd ..
```

### 2. Configure environment

Create the environment files from the examples:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

Frontend variables:

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3000/api` | Base URL of the backend API |

Backend variables:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Backend port |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed frontend origin |
| `COOKIE_SECURE` | `false` | Set to `true` behind HTTPS |
| `DB_FILE` | `backend/bandbase.db` | SQLite database file |
| `SESSION_TTL_DAYS` | `7` | Session lifetime in days |

### 3. Run the application

Start backend and frontend in separate terminals:

**Backend (Port 3000)**
```bash
cd backend
node server.js
```

**Frontend (Port 5173)**
```bash
# In the root directory
npm run dev
```

The frontend runs at `http://localhost:5173` and communicates with the backend
at `http://localhost:3000/api`.

The database is created automatically on backend startup. Migrations run
before the server starts listening. `Band_01` is seeded automatically.

## Scripts

**Frontend**

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

**Backend**

| Command | Description |
|---|---|
| `npm start` | Start the backend |
| `npm run dev` | Start the backend with file watching |
| `npm test` | Run backend integration tests |

## Project structure

```text
backend/
├── app.js              Express app
├── server.js           Bootstrap: DB init + listen
├── config.js           Environment configuration
├── db/                 Database connection, migrations, seed
├── migrations/         SQL migrations
├── middleware/         Auth, band/channel access, errors
├── routes/             Auth, bands, songs, setlists, events, channels
├── utils/              Cookies, tokens, validation, errors
└── test/               Integration tests

src/
├── components/         Shared UI (Header, Sidebar, tiles, buttons, …)
├── config/             Navigation configuration
├── context/            Auth, Band, Channel and Event providers
├── features/
│   ├── calendar/       Calendar grid, event list, event modal
│   ├── setlist/        Setlist selection and detail views
│   └── songs/          Song library and song items
├── pages/              Home, Calendar, Setlist, Messenger, Members, Login, Register
├── services/           API client and domain services
├── utils/              Date, duration and event helpers
└── main.jsx            App entry point
```
