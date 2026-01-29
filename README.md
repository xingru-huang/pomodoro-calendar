# Pomodoro Calendar

A single-page app that combines a Pomodoro timer with a calendar: focus sessions, breaks, and per-event success/fail tracking. Events support time ranges; same-day conflicts are prevented. Data is stored in `localStorage`.

---

## Features

- **Pomodoro:** 25 min focus → 5 min break. Start/Pause only; no Reset. Pause over 1 minute = fail and auto-reset to 25:00. Finish 25 min → break; Skip or wait 5 min = success, then back to 25 min.
- **Calendar:** Month view, change month, click a date to view or add events. Add events with a time range (From–To). Same-day events cannot overlap.
- **Events:** Click an event to open it, see successful vs failed Pomodoros, Start Pomodoro, or Delete. Events can be deleted.
- **Persistence:** Events and stats are saved in `localStorage`; they survive refresh.

---

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Build and preview

```bash
npm run build
npm run preview
```

---

## Deploy and get a live URL

The build output is in `dist/`. Deploy that folder to any static host to get a **live URL**. See **[DEPLOY.md](./DEPLOY.md)** for detailed steps.

### Railway

1. At [railway.app](https://railway.app), create a new project and deploy from GitHub.
2. Configure a static site: build `npm run build`, serve the `dist` directory.
3. Use the `*.railway.app` URL as your live URL.

---

## Tech stack

- React 19 + Vite 7
- No login or payments; data is local only.
