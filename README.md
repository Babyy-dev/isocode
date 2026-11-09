# Company A — Brand X showroom

Website, lead desk and admin for Company A, an authorised Brand X car dealer in Lucknow. Buyers browse new and certified used cars with the on-road price by city, then book a test drive online. Each booking becomes a lead that is assigned to a named consultant immediately and acknowledged automatically.

- **Live app:** _add the Vercel URL_
- **Run, deploy and demo logins:** [deployment.md](./deployment.md)

## Features

- **Car pages**: new and used cars, each with its own URL; photos, specs, colours and a used-car inspection checklist.
- **On-road price by city**: ex-showroom (or listed) price + road tax + insurance + accessories, from admin price tables, with a validity date.
- **EMI calculator** on every car page.
- **Test-drive booking**: real 30-minute slots per showroom and car, with optional trade-in details and DPDP consent.
- **Lead inbox**: auto-assignment to the least-busy consultant, a live 5-minute response timer, status and reassignment.
- **Messages**: an automatic WhatsApp acknowledgement (simulated) in English or Hindi.
- **AI (Groq)**: buyer summary and first-reply draft. A consultant reviews every draft, and drafts that quote prices or discounts are blocked.
- **Admin**: cars, inspection, versioned city prices, and a daily DMS CSV export.
- **Roles**: buyer, consultant and admin, checked on the server.
- **Languages**: English and Hindi.
- **SEO**: sitemap and structured data.

All cars, prices and people in the demo are synthetic.

## Tech stack

Next.js 16 (App Router, TypeScript) · Tailwind CSS · MongoDB Atlas (official driver) · Better Auth · Groq API · Zustand · Vercel

## Quick start

```sh
npm ci
cp .env.example .env          # fill in the values; see deployment.md
npm run db:setup && npm run auth:setup && npm run db:seed && npm run db:seed-demo
npm run dev                   # http://localhost:3000
```

## Project structure

```text
src/
  app/                 Routes only: pages, auth API, DMS export, sitemap, robots
  components/          Shared layout: header, footer, language toggle, skeletons
  features/
    cars/              Catalogue, car pages, SEO
    pricing/           On-road price maths and versioned price tables
    bookings/          Booking rules, slot reservation transaction, My bookings
    leads/             Assignment, lead inbox, response timer
    messaging/         Acknowledgement templates and message timeline
    ai/                Groq client, prompt and output guardrails
    admin/             Car and price editing
    inspection/        Used-car inspection checklist
    finance/           EMI calculator
    trade-in/          Trade-in form and validation
    dms-export/        Daily CSV export
    auth/              Sessions, roles, sign-in forms
    demo/              Showrooms, slots, consultant profiles; workspace page shell
  lib/                 Database client, i18n, dates, ids, rate limiting
  stores/              Zustand store for lead inbox search and selection
scripts/               Database setup, migrations, seeds and live checks
```

Each feature keeps validation (pure, unit-tested), database access (`server-only`), server actions and UI components separate. English and Hindi text lives in each feature's `copy.ts`.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` / `build` / `start` | Develop, build and run the app |
| `npm test` | Unit tests for pricing, booking rules, assignment, timers, AI guardrails, EMI and CSV |
| `npm run lint` / `typecheck` | Code checks |
| `npm run db:setup` | Collections, validators, indexes and data migrations (safe to re-run) |
| `npm run auth:setup` | Sign-in indexes |
| `npm run db:seed` | Sample cars and city price tables |
| `npm run db:seed-demo` | Demo logins and 8 demo leads (re-running resets the leads) |
| `npm run auth:role` / `auth:link-consultant` | Promote a staff account and link it to a consultant profile |
| `npm run auth:check` / `bookings:check` / `ai:check` | Live checks against the real database or AI provider |
| `npm run db:check` / `db:diagnose` | Test the MongoDB connection |

## Security notes

Secrets live only in an untracked `.env`; `.env.example` lists the names. Every page, action and download checks the user's role on the server, and consultants see only their own leads. Inputs are validated in the app and by MongoDB schema validators. Sign-in, booking and AI requests are rate-limited.
