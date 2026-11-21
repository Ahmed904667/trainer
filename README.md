# PPL Log

A mobile-first, offline-ready personal strength training journal built with Next.js App Router, TypeScript, Prisma and PostgreSQL. It includes a six-template PPL rotation, 47 exercise references, live set tracking, editable plans and sessions, and Recharts analytics.

## Run locally

Use Node 22.12 or newer in the 22.x series.

```sh
npm ci
npm run dev
```

Open the local address printed by Next.js. The device journal works immediately. For offline use, run a production build, visit the app once online and allow the service worker to finish downloading the application shell.

```sh
npm run build
npm start
```

## Connect Neon

1. Open your Neon project and select **Connect**. Copy the pooled PostgreSQL connection string with its TLS parameters. [Neon connection guide](https://neon.com/docs/connect/connect-from-any-app)
2. For local development, copy `.env.example` to `.env` and set `DATABASE_URL`. You can also set `DIRECT_URL` to an unpooled connection for migrations.
3. Run `npm run db:migrate`, restart Next.js, and open **Settings → Account & sync → Create a new account**.

The six templates and built-in exercise catalog are bundled for offline use. A new account imports the current device journal on its first sync. Signing into an existing populated account opens that account’s journal. The separate device profile becomes accessible again after signing out. Workout data and tokens are scoped to the account. Passwords use salted scrypt hashes and the database stores digests of expiring session tokens.

## Deploy on Vercel

Import the GitHub repository as a Next.js project, use Node 22.x and make `main` the production branch. The repository sets `npm run vercel-build` as the build command. It applies committed Prisma migrations when a database connection is configured and builds the offline shell.

In the project’s **Settings → Environment Variables**, set `DATABASE_URL` for **Production**, then redeploy. Set `DIRECT_URL` only when a separate migration connection is desired. For preview environments, use a separate Neon development branch. Keep the connection strings in server-side environment variables. [Vercel environment variables](https://vercel.com/docs/environment-variables/managing-environment-variables)

Until configured, the site runs in device-only mode. Clearing browser data removes that device’s local records. **Settings → Export journal** downloads a JSON copy with all sessions and templates.

## Training

- Monday and Thursday start as rest days. Every completed workout advances the rotation to the template following the one trained. Rest, missed days, and discarded sessions leave the next workout available.
- Open a session to enter weight and reps, then tap the checkmark. Use zero for bodyweight. Tap a set number for warm-up status, RPE, RIR, notes, or deletion. Exercise options support replacement, reordering, and skipping.
- Templates, exercise references, and rep targets are copied into session snapshots. History edits recalculate analytics and keep the current rotation intact.
- Volume is the sum of load times reps across completed working sets. Warm-ups, skipped exercises and incomplete sets are excluded. Log a consistent load convention for each exercise. Unilateral reps are recorded per side, with no automatic doubling.
- Double progression suggests the configured increment after every prescribed working set reaches the rep ceiling at the same load. Previous values remain editable. Estimated 1RM uses the Epley formula on loaded compound sets of 1–10 reps. Consistency uses local calendar dates and stored schedule changes.
- The timestamp-based rest timer supports pause, reset, +30 seconds and skip. Audio and vibration depend on browser support. The countdown also shows when rest is complete.

## Offline and installation

On iPhone, open the production site in Safari and choose **Share → Add to Home Screen**. On Android, use Chrome’s install option. The first online visit downloads the application, reference data, fonts, and lazy-loaded screens.

IndexedDB transactions save the journal and pending changes together. Foreground sync runs after edits, reconnects, and focus. The server checks the account revision and applies each mutation in a PostgreSQL transaction. When two devices make incompatible edits, Settings lets you export the local copy and explicitly load the server journal. A partial unique index enforces a single active session per account.

## Checks

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

Browser integration checks use a disposable PostgreSQL database and a production build. Set `DATABASE_URL` to the test database, apply migrations, then run:

```sh
npm start -- --hostname 127.0.0.1 --port 3219
# In another terminal
npx playwright install chromium
npx playwright test
```

Set `PLAYWRIGHT_CHROME_CHANNEL=chrome` to use installed Google Chrome. Tests create fixture accounts on the local test server. Database tests skip when a connection is absent. Coverage includes offline reload, history snapshots, previous performance, rotation, local-date rest days, private authentication, account isolation, duplicate sync requests, stale revisions and a 320px layout.
