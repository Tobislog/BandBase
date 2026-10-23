# BandBase

BandBase is a web app for managing a band's day-to-day operations: scheduling
events, organizing setlists and songs, and keeping the band in sync.

## Features

- **Authentication** – Login and registration against a Node.js backend, with
  protected routes and session handling.
- **Dashboard** – Overview of upcoming events, open tasks, and latest messages
  (partially placeholder content).
- **Calendar** – Monthly calendar grid with event categories (Rehearsal, Gig,
  Other), an upcoming-events list, and a modal to create, edit, and delete
  events.
- **Setlists & song library** – Create setlists, manage a song archive, assign
  songs to setlists, and edit song details.
- **Messenger** – Placeholder page for future band chat.
- **Dark mode** – Automatic theme switching via `prefers-color-scheme`.

## Tech stack

- [React 19](https://react.dev/) with React Router
- [Vite](https://vite.dev/) for development and builds
- [Tailwind CSS 4](https://tailwindcss.com/) with a custom theme
- [lucide-react](https://lucide.dev/) icons
- ESLint for linting

## Getting started

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

Authentication expects a backend at `http://localhost:3000/api` providing
`/login`, `/logout`, `/me`, and `/register`. Calendar events, setlists, and
songs are currently persisted in `localStorage`.

## Scripts

| Command           | Description                  |
| ----------------- | ---------------------------- |
| `npm run dev`     | Start the Vite dev server    |
| `npm run build`   | Build for production         |
| `npm run preview` | Preview the production build |
| `npm run lint`    | Run ESLint                   |

## Project structure

```
src/
├── components/     Shared UI (Header, Sidebar, tiles, buttons, …)
├── config/         Navigation configuration
├── context/        AuthProvider and EventProvider
├── features/
│   ├── calendar/   Calendar grid, event list, event modal
│   ├── setlist/    Setlist selection and detail views
│   └── songs/      Song library and song items
├── pages/          Home, Calendar, Setlist, Messenger, Login, Register
├── services/       Auth API and localStorage persistence
└── main.jsx        App entry point
```

## Notes

- Dates are stored canonically as `YYYY-MM-DD` strings.
- `docs/` contains internal notes on the events context and planned date
  utilities (not part of the build).
