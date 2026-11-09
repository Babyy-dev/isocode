# Company A Showroom — Deployment and Run Guide

- **GitHub:** https://github.com/Babyy-dev/isocode
- **Live app:** `TODO: add the Vercel URL after deploying`

## Demo logins for the reviewer

All demo accounts use the password **`DemoShowroom@2026`**. The names, emails and leads are synthetic.

| Email                            | Role                                         | What to try                                                                                                                                                                 |
| -------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `buyer@demo.companya.test`       | Buyer (Aarav Mehrotra)                       | Browse cars, open the EMI calculator, book a test drive (optionally with a trade-in), then see **My bookings**: the WhatsApp acknowledgement, cancel, opt out of follow-up. |
| `consultant1@demo.companya.test` | Sales consultant, Showroom 1 (Consultant 1A) | **Lead inbox**: 4 leads, including one overdue in red. Record first contact, change status, write a reply (discount wording is blocked), generate an AI summary and draft.  |
| `consultant2@demo.companya.test` | Sales consultant, Showroom 2 (Consultant 2A) | 3 leads, including one where the buyer opted out (replies disabled).                                                                                                        |
| `consultant3@demo.companya.test` | Sales consultant, Showroom 1 (Consultant 1B) | Usually receives new Showroom 1 bookings (least-busy assignment).                                                                                                           |
| `consultant4@demo.companya.test` | Sales consultant, Showroom 2 (Consultant 2B) | Usually receives new Showroom 2 bookings.                                                                                                                                   |
| `admin@demo.companya.test`       | Admin                                        | Edit cars, inspection checklists and city price tables; see **all** leads; download the **daily DMS CSV** at the bottom of `/admin`.                                        |

Tips:

- A booking made as the buyer reaches the least-busy consultant at that showroom. Sign in as `consultant3`/`consultant4` (or `admin`) to see it. Showroom 3 has no consultant login, so only the admin sees its leads.
- Use **हिन्दी / English** in the header to switch language; the choice is remembered.
- `npm run db:seed-demo` resets the 8 demo leads (fresh response timers) without touching anything else.

## Run it locally

Requirements: **Node.js 22** and npm, a **MongoDB Atlas** cluster (the free M0 tier works), and optionally a **Groq API key** ([console.groq.com/keys](https://console.groq.com/keys)).

1. **Clone and install**

   ```sh
   git clone https://github.com/Babyy-dev/isocode.git
   cd isocode
   npm install
   ```

2. **Configure the environment.** Copy the example file and fill in the values (see the table below).

   ```sh
   cp .env.example .env
   openssl rand -base64 32   # paste the output as BETTER_AUTH_SECRET
   ```

   For local use set `BETTER_AUTH_URL=http://localhost:3000`. In Atlas → _Network Access_, allow your IP address.

3. **Create collections, validators and indexes**, then **seed data** (all commands are safe to re-run and never delete your records):

   ```sh
   npm run db:setup      # collections, JSON-schema validators, indexes, data migrations
   npm run auth:setup    # sign-in indexes (users, sessions)
   npm run db:seed       # the 3 supplied stock cars, synthetic details, Lucknow/Kanpur price tables
   npm run db:seed-demo  # the 6 demo logins above and 8 demo leads
   ```

4. **Start the app** and open http://localhost:3000.

   ```sh
   npm run dev
   ```

   Restart `npm run dev` after editing `.env`. The dev server can get stuck reloading pages if `.env` changes while it is running.

5. **Optional checks**

   ```sh
   npm test             # 58 unit tests (pricing, booking rules, assignment, timers, EMI, CSV, AI parsing…)
   npm run lint
   npm run typecheck    # run `npm run dev` or `npm run build` once first so Next.js generates its types
   npm run build && npm start   # production build
   npm run auth:check   # live sign-up / sign-in / role-escalation check (creates and removes a test user)
   npm run ai:check     # three live Groq requests (needs GROQ_API_KEY)
   npm run bookings:check  # booking concurrency test in a temporary database (see note below)
   ```

   `bookings:check` creates and then drops its own temporary database, so the Atlas database user needs the **"Read and write to any database"** role. With a user limited to one database it fails with `AtlasError`.

## Environment variables

Names only. Never commit values; `.env` is git-ignored.

| Name                 | Required | Purpose                                                                                                                                         |
| -------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `MONGODB_URI`        | Yes      | Atlas connection string.                                                                                                                        |
| `MONGODB_DB_NAME`    | Yes      | Database name used by the app.                                                                                                                  |
| `BETTER_AUTH_SECRET` | Yes      | Random secret of 32+ characters for signing sessions.                                                                                           |
| `BETTER_AUTH_URL`    | Yes      | Exact public origin, e.g. `http://localhost:3000` or the HTTPS Vercel URL.                                                                      |
| `GROQ_API_KEY` | For AI | Groq API key for the buyer summary and first-reply draft. Without it the AI panel says it is unavailable and manual replies still work. |
| `GROQ_MODEL` | For AI | Groq model id, e.g. `llama-3.3-70b-versatile`. |
| `SITE_URL`           | No       | Public origin for canonical URLs, sitemap and social previews. Defaults to `BETTER_AUTH_URL`.                                                   |

## How it is deployed (Vercel + MongoDB Atlas)

The app is a single Next.js project. Vercel runs the pages and server actions as Node.js functions; MongoDB Atlas holds all data.

1. **Atlas**
   - _Network Access_: add `0.0.0.0/0`. Vercel functions have no fixed IP addresses; access stays protected by the database user's password.
   - Note the cluster's region (e.g. Mumbai `ap-south-1`).
2. **Vercel**
   - _Add New → Project_, import `Babyy-dev/isocode`. The framework is detected as Next.js; keep the default build command `next build`.
   - _Settings → Environment Variables_: add every variable from the table above for the **Production** environment. Set `BETTER_AUTH_URL` (and `SITE_URL`) to the production URL, e.g. `https://<project>.vercel.app`.
   - _Settings → Functions → Region_: choose the region closest to the Atlas cluster (e.g. `bom1` Mumbai for `ap-south-1`). This keeps the database round trip, and so page load time, low.
   - Deploy.
3. **Prepare the database**, from your machine with `.env` pointing at the same database: `npm run db:setup`, `npm run auth:setup`, `npm run db:seed`, `npm run db:seed-demo`.
4. **Smoke test**: open the live URL, sign in as each demo user, make one booking, and check `/robots.txt` and `/sitemap.xml`.

Notes:

- Sign-in is rate-limited to 5 attempts per minute **per client IP**. Better Auth reads the client IP from `x-forwarded-for`, which Vercel sets, so no extra configuration is needed.
- Vercel _preview_ deployments have a different URL from `BETTER_AUTH_URL`, so sign-in is rejected there. Use the production URL for review.
- Sessions, bookings and prices are never cached publicly. Car and price pages render per request from the database.

## Staff accounts and roles (operators)

New sign-ups are always **buyers**; a role can't be chosen in the app. To promote a real staff member:

```sh
npm run auth:role -- someone@example.com consultant      # or admin
npm run auth:link-consultant -- someone@example.com "Consultant 1B"
```

A consultant sees only the leads assigned to their linked profile. An unlinked consultant sees none.

## Troubleshooting

| Symptom                                           | Cause and fix                                                                                                                                           |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AI panel: "rate limit or quota reached" | The Groq key hit its per-minute or daily limit. Wait, or raise the limit in the Groq console. |
| AI panel: "AI is not configured" | `GROQ_API_KEY` / `GROQ_MODEL` missing. Set them and restart the server. |
| "Too many attempts" at sign-in                    | 5 sign-ins per minute per IP. Wait a minute.                                                                                                            |
| `bookings:check` fails with `AtlasError`          | The database user can't create a temporary database. Grant "Read and write to any database".                                                            |
| Pages keep reloading in `npm run dev`             | Restart the dev server (seen after `.env` edits). Production builds are not affected.                                                                   |
| Typecheck can't find image types on a fresh clone | Run `npm run dev` or `npm run build` once to generate `next-env.d.ts`.                                                                                  |
