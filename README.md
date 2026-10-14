# Airbnb Listing Clone - static version (no backend)

Same UI as the full-stack project, but everything runs in the browser, so it can be hosted on Vercel for free.

- Listing data and images are bundled with the app (`src/app/core/listing-data.ts`, `public/assets/`).
- Price quote, bookings, wishlist, coupon and messages work locally and are saved in the browser (`localStorage`).
- The chat assistant answers from the listing facts with a built-in keyword search (no AI key, no Qdrant).

## Run locally
```bash
npm install
npm start          # http://localhost:4200
```

## Deploy to Vercel
1. Push this folder to a GitHub repository (this folder as the repo root).
2. On vercel.com: Add New > Project > import the repo.
3. Settings are read from `vercel.json` (build: `npm run build`, output: `dist/frontend/browser`). Click Deploy.
