# How to Get a Live URL (Assignment Requirement)

Your app is a **static site** (React + Vite). After `npm run build`, the output is in the `dist/` folder. Deploy that folder to any static host to get a **live URL**.

---

## Option 1: Vercel (easiest, free)

1. **Push your project to GitHub**  
   - Create a repo, then:
   ```bash
   git init
   git add .
   git commit -m "initial"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in (GitHub is fine).
   - Click **Add New** → **Project**.
   - Import your GitHub repo.
   - Set:
     - **Build Command:** `npm run build`
     - **Output Directory:** `dist`
     - **Install Command:** `npm install` (default)
   - Click **Deploy**.

3. **Your live URL**  
   You’ll get something like `https://your-project-xxx.vercel.app`. Use that as your assignment live URL.

---

## Option 2: Netlify (free)

1. Push the project to GitHub (same as above).

2. Go to [netlify.com](https://netlify.com) → **Add new site** → **Import an existing project** → **GitHub** → choose your repo.

3. Set:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`

4. Deploy. Your live URL will be like `https://something.netlify.app`.

---

## Option 3: Railway

1. Push to GitHub.

2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub** → select your repo.

3. Add a **Static Site** (or use Nixpacks). Configure:
   - **Build command:** `npm run build`
   - **Output directory:** `dist` (or `dist` as the root to serve).

4. Railway will give you a `*.railway.app` URL.

---

## Quick test before deploying

```bash
npm run build
npm run preview
```

Open `http://localhost:4173` to confirm the built app works. The same `dist/` folder is what you deploy.

---

## Checklist for your assignment

- [ ] App has **real functionality** (Pomodoro, calendar, events, etc.) — you’re good.
- [ ] App is **hosted** and you have a **live URL** (e.g. `https://xxx.vercel.app`) — use any option above.
