# Company A — Brand X

Next.js App Router, TypeScript, Tailwind CSS, Zustand and MongoDB with the official Node.js driver. Backend code stays within the Next.js project. Better Auth authentication is configured; deployment is not configured yet.

## Run locally

Use Node.js 22 LTS or a compatible newer LTS release.

```sh
npm ci
npm run dev
```

If the environment blocks Turbopack's CSS worker, use `npm run dev -- --webpack`. Open the URL printed by Next.js.

## MongoDB Atlas setup

1. Create an Atlas cluster and a database user scoped to this project's database.
2. Allow your development machine's IP in Atlas Network Access. Avoid unrestricted network access.
3. Copy `.env.example` to `.env` and set `MONGODB_URI` to the Atlas driver connection string with your database user's credentials. Set `MONGODB_DB_NAME` to your chosen database name.
4. Keep `.env` untracked; never paste the connection string into chat. URI-encode special characters in the password when constructing a URI.
5. Run:

```sh
npm run db:check
npm run db:setup
npm run db:seed
```

`db:check` pings MongoDB. `db:setup` creates or updates validators and indexes for `cars`, `cities` and `cityPrices`; it does not delete records. Use a dedicated project database. Existing duplicate records can cause unique-index creation to fail; resolve those deliberately rather than resetting the database.

`db:seed` inserts the three supplied cars and Lucknow using `$setOnInsert`. Existing records and edits are preserved. The seed is rerunnable but is not one multi-document transaction: an interrupted run may partially complete and can be retried. Approved synthetic charges currently remain in the frontend preview; publishing them to the database is a later integration step.

Use Atlas or a replica-set deployment for future transactional booking/lead writes. No remote database or account is created by these scripts. MongoDB does not enforce foreign keys; future write services must validate references and protect multi-document operations.

## Code structure

```text
src/
  app/                  # Thin routes and layouts
  components/layout/    # Shared header/footer
  features/             # Cars, pricing, bookings, admin, leads and demo rules
  lib/
    database.ts         # Server-only database access
    mongodb/            # Connection lifecycle and document types
  stores/               # Temporary shared frontend state
scripts/                # Explicit database check/setup/seed commands
public/images/cars/     # Illustrative photography and source credits
```

Keep functions focused, UI separate from business logic, and queries in feature repositories. Create files only when needed. Use local React state for local behavior, Zustand for shared UI state, and MongoDB for persistent business records. Ask before new technology or product decisions. Never store secrets or actual buyer data in the repo.

## Current functionality and limits

- `/`: catalogue, search, new/used, fuel and availability filters, sorting and empty state.
- `/cars/model-h-zx-automatic`, `/cars/model-c-vx-2022`, `/cars/model-s-lx-2021`: server-rendered sample details with page metadata and illustrative pricing.
- `/admin`, `/book`, `/bookings`, `/leads`: approved synthetic workflow previews.
- Demo prices, bookings, assignment, replies and opt-out use memory-only Zustand state. Navigate with internal links; refreshing clears the session.
- Preview routes now require a database session, with admin/consultant role checks on staff pages. No real messages are sent, and there is no cross-user booking protection or persistent record ownership yet.
- MongoDB repositories exist but the UI is not connected to them yet. A valid URI alone does not enable persistent bookings.
- Missing inspection, owners and registration details are not fabricated. Photos are illustrative; see [credits](./public/images/cars/credits.md).
- Catalogue/detail browsing supports Hindi. Full Hindi coverage and browser QA are deferred by the user.
- AI is explicitly unavailable until provider setup is agreed.

## Checks

```sh
npm run lint
npm run typecheck
npm test
npm run build -- --webpack
```

No generated database client or SQL migrations are required. Money in database records uses integer paise. Price versions have unique car/city/version keys; repositories select the latest effective version and pure calculation rules handle expiry. Collection validators check nonnegative integer amounts and valid date ordering.

Live MongoDB validation awaits user configuration. Browser visual QA and mobile/4G measurement remain pending. The existing dependency audit reports eight moderate development-tooling findings; no forced upgrade was applied.

## Project documents

- [Brief and status](./info.md)
- [Milestones](./milestone.md)


## Authentication — Better Auth

- `/sign-up`: create a buyer account (12–128 character password).
- `/sign-in`: email/password login, then return to the requested allowed local route.
- `/account`: inspect the current identity/role and sign out.
- `/admin`: admin only; `/leads`: consultant or admin; `/book` and `/bookings`: signed-in users.
- Role fields are not accepted through public signup or profile edits. Each protected page validates the database session on the server. Future business API writes must call the same session/role guards and check record ownership.

Set `BETTER_AUTH_SECRET` (random, at least 32 characters) and `BETTER_AUTH_URL` (exact app origin) in `.env`. A local random secret and `http://localhost:3000` were added when absent; existing values were preserved. Use the configured hostname consistently. For deployment, provision a separate secret and set the HTTPS origin. Never prefix secrets with `NEXT_PUBLIC_`.

```sh
npm run auth:setup
```

This creates unique identity/session/account indexes plus expiry and lookup indexes. It has already succeeded on the configured database. It does not create users or assign roles. Atlas transactions are enabled for authentication operations.

After registering a staff account, an authorised local operator can assign its role:

```sh
npm run auth:role -- staff@example.invalid consultant
npm run auth:role -- staff@example.invalid admin
```

Replace the example with the registered account email. No actual staff identity has been promoted by the assistant. Use `buyer` to remove staff access; uncached session lookups read the current role.

```sh
npm run auth:check
```

This integration check writes a uniquely named synthetic account, verifies signup/session/sign-in/sign-out and blocked role escalation, then removes that account and its linked sessions/accounts. It requires network access and valid auth environment configuration. It passed on the configured database. Unit tests alone do not verify live authentication.

Database-backed rate limiting is enabled. Configure trusted client-IP forwarding for the chosen deployment; without a resolvable IP, the library uses a shared fallback bucket. Do not blindly trust user-controlled forwarded headers. Email verification and password-reset delivery need an email service and are not exposed as working features yet. Sign-in/out use a full navigation to clear temporary demo state between identities.


## Rate limits, caching and skeletons

Approved auth limits live in `features/auth/server.ts`: 5 sign-in requests/minute, 3 signups/10 minutes, and the existing 30 requests/minute default for other auth paths. Better Auth stores counters in MongoDB. Limits depend on resolved client identity; clients without an identifiable IP share the fallback bucket. Deployment proxy trust remains to be configured. Revised thresholds have not yet been live burst-tested.

HTTP 429 gets a distinct retry message; the auth route preserves Better Auth's retry header and also exposes standard `Retry-After`. All auth responses use `Cache-Control: private, no-store`. Cookie session caching remains disabled so role changes are checked against the database.

Route `loading.tsx` boundaries render shared skeleton primitives matching catalogue, detail, account and workspace layouts. Skeletons announce loading to assistive technology and pulse only when reduced motion is not requested. Fast cached navigations need not display a skeleton; no artificial delays are used.

Static image imports provide hashed asset URLs and blur placeholders with Next.js image optimization. There is no additional database-data cache yet: the current UI reads bundled sample data and temporary Zustand state. Do not cache live availability, personal records or sessions across users. Public database caching will require explicit expiry and admin invalidation when those workflows are connected.


## Persistent catalogue, pricing and admin

The public catalogue/detail and admin price/stock screens now use MongoDB. Start with `npm run db:setup`, then `npm run db:seed`. The seed preserves existing records and adds approved synthetic city prices only when a car/city has no price history. Prices are illustrative, valid through 31 March 2027 unless changed by an admin. The local MongoDB connection currently fails with a network/server-selection error; the updated seed has not yet run against the live database.

Admin mutations require a current admin session in the server action, not just on the page. Each price save appends a version and records the author. A stale expected version or duplicate concurrent insert is rejected. Valid-through dates include the full calendar day in Asia/Kolkata; stored expiry is exclusive. Historical prices are retained. Money is stored in integer paise and rendered without rounding away paise.

Public reads are dynamic and are not stored in a shared application cache. Admin writes invalidate Next.js route output. Existing skeletons cover database waits; database failures reach the error boundary rather than returning invented prices. The booking and lead screens still use temporary demo data, including their independent price tables; they are the next persistence slice. Do not treat them as real bookings.

Before submission, verify live admin persistence, direct unauthorized action attempts, cross-session reads and concurrent price edits. These are not established by the passing unit tests or production build. Full car/content CRUD is still pending.


## Persistent bookings and lead inbox (latest)

The earlier preview descriptions are superseded: booking, cancellation, consent/opt-out, auto-assignment and staff lead updates now use MongoDB. The UI no longer reads a demo booking store. Zustand holds only lead search/selection. Cars/prices remain synthetic assessment data; acknowledgements and reviewed replies are persisted mock messages, never actual WhatsApp/SMS delivery. AI stays explicitly unavailable until a provider is configured.

Run `npm run db:setup` and `npm run db:seed` once the MongoDB connection works. Setup adds booking validators, a unique index on confirmed car/showroom/date/time, lookup indexes and rate-counter TTL cleanup. Transactions require Atlas/a replica set. Reservations lock the showroom workload and check car availability, a future listed slot and current price version; bookings preserve the server price snapshot. A retry ID prevents the same successful request creating duplicate bookings. Buyer reads/mutations filter by the signed-in user ID.

Register synthetic staff accounts, assign the consultant role, then link each to a showroom profile:

```sh
npm run auth:role -- consultant@example.invalid consultant
npm run auth:link-consultant -- consultant@example.invalid "Consultant 1A"
```

Available profile names are defined in `src/features/demo/data.ts`: Consultant 1A/1B through 3A/3B and Lead desk 1 through 3. Each profile can link to one account. Unlinked consultants receive no buyer data; admins can view all leads. Every staff mutation applies the assignment filter again. First-contact recording preserves its initial timestamp. Opt-out is checked atomically at reply insertion. A lead assigned to an unlinked profile remains visible to admins but cannot be claimed by an unrelated consultant.

Booking creation has the approved limit of 5 attempts per signed-in account per 10-minute fixed window, stored atomically in MongoDB. Invalid requests count. A rejection includes a retry delay in the form message. Fixed windows can allow adjacent-window bursts; live enforcement remains unverified. Existing auth burst/IP checks remain deferred.

```sh
npm run bookings:check
```

This integration check creates `showroom_checks_<random-id>` using the configured MongoDB connection, applies the production schema, seeds synthetic fixtures, tests competing reservations/idempotency, buyer ownership, consultant scope, opt-out, snapshots, cancellation and concurrent rate limits, then removes only that test database in `finally`. It never uses/drops the configured app database. The database user needs create/drop access for the temporary database. If interrupted externally, a temporary check database may need manual cleanup. The command has not run successfully because MongoDB remains unreachable; unit tests/build are not a substitute.

Pending: browser-level auth/action checks, full Hindi, live deployment IP/rate tests, full admin car CMS and live AI. Reviewer accounts must be registered and linked before submission; none were automatically created by these changes.


## Admin car editing (latest)

Admins can add, edit, archive and restore cars; edit descriptions, colours/specifications, masked registration, owners, inspection text and up to eight HTTPS photo URLs. Archive retains historical records and hides the listing from public queries/booking. Stock IDs/type remain fixed on edit. Stored slugs keep existing links stable. Changes use a content revision to reject stale editors. Base/listed prices and city on-road tables are separate; publish city charges before accepting bookings for a new car.

Photo URLs load directly in the browser with no referrer; the server does not proxy arbitrary hosts. Use compressed, licensed HTTPS images. Unknown/broken images show a placeholder. Image-host availability and performance are not guaranteed by the app. The seed adds labelled synthetic detail fields only if missing, preserving admin edits. Used-car owner counts, masked registrations and inspection text added by the seed are assumptions for the assessment, not client-supplied facts or real certifications.

## Gemini (AI) setup and review

Create a key in [Google AI Studio](https://aistudio.google.com/apikey) and add `GEMINI_API_KEY` and `GEMINI_MODEL` (starting model: `gemini-2.5-flash`) to the ignored root `.env`. Never prefix the key with `NEXT_PUBLIC_`, commit it, or paste it into chat. Restart the app after changing environment variables.

```sh
npm run ai:check
```

This makes three real requests using synthetic normal, empty and adversarial needs, and fails if any draft contains price or discount language.

The app calls the Gemini `generateContent` REST endpoint with a JSON response schema. Generation is protected by lead assignment checks, optional buyer AI consent, active booking/follow-up permission, and a separate 5-attempt/10-minute fixed-window limit per staff account. Provider calls have a 20-second timeout, bounded output, and no automatic retries. Note: on Google AI Studio's free tier, Google may use prompts to improve its products; a paid (billing-enabled) key is needed before real buyer data is sent.

Only stated needs, car model and language are sent. Name/email/price-table fields are omitted; common email/Indian phone patterns in free text are redacted, but other identifying text can remain. The prompt treats buyer content as untrusted data. Parsed output must match the expected summary/draft/uncertainties shape. Refusals, incomplete output, malformed data, timeout, credentials and quota errors keep manual replies available. Recognised commercial-price/discount phrases are blocked, but semantic accuracy still requires review.

Buyer flow: optionally grant AI permission during booking or in My bookings; withdraw it there at any time. Existing bookings default to no AI consent. Staff flow: generate → review/edit summary → save reviewed summary → copy draft into reply editor → edit and explicitly review → save simulated reply. Consent/scope are checked again before generated output is saved; a request already in flight cannot be recalled from the provider. Replies never send actual WhatsApp/SMS messages. The used-car valuation suggestion remains optional/unimplemented.

## MongoDB connection checklist

Latest permitted-network diagnostic: TLS handshake failed with `ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR`. The error does not identify a single root cause. No URI, hostname, username or password was printed.

1. In Atlas, confirm the correct project/cluster is available and running.
2. In Network Access, add the current public IP of the machine running Next.js. If your network/VPN changes, check the address again. Production hosting needs its own allowed outbound address or private connection.
3. In Database Access, verify a **database user**, not just an Atlas dashboard account, can access this app database. App operations need read/write access; schema setup additionally needs collection/index creation and validator modification permissions. The isolated integration test needs permissions for its temporary test database.
4. Use the connection string from Connect → Drivers → Node.js. Put it in root `.env` as `MONGODB_URI`, with the actual database username/password substituted. Percent-encode reserved characters in the password. Set `MONGODB_DB_NAME` to the intended app database name. Keep all credentials local.
5. From the project directory, run `npm run db:diagnose`. If TLS errors remain after the Atlas checks, try a trusted alternate network (for example your mobile hotspot), and check whether a VPN, firewall or TLS-inspecting proxy is blocking the connection. Use an up-to-date supported Node installation. Do not disable TLS certificate validation.
6. After a successful ping, run these commands separately:

```sh
npm run db:setup
npm run db:seed
npm run auth:setup
npm run bookings:check
npm run dev
```

Restart an already-running dev server after `.env` changes. `bookings:check` uses only its uniquely named temporary database and removes it afterward; it needs matching Atlas permissions. A successful ping verifies connectivity, not all app workflows.

Official references: [Atlas connection troubleshooting](https://www.mongodb.com/docs/atlas/troubleshoot-connection/) and [connecting to an Atlas cluster](https://www.mongodb.com/docs/atlas/connect-to-database-deployment/).
