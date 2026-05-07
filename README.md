# Carthabot Dashboard

Centralized tournament-management web app for the **Carthabot** national robotics competition. Five challenges (all-terrain senior/junior, soccer cup senior/junior, line follower) — registration, draw, and live match running, with a public read-only competitor view.

Theme: **Galactic Arena**.

## Stack

- Next.js 15 (App Router) + TypeScript
- TailwindCSS + Framer Motion
- Supabase Postgres (server-side only)
- Single-password admin auth (`jose` JWT cookie)
- Deploys to Vercel

## Local development

```bash
npm install
cp .env.local.example .env.local      # fill in Supabase + admin password
npm run dev
```

Open http://localhost:3000.

### Database setup

1. Create a free Supabase project at https://supabase.com.
2. Open the SQL editor and run `supabase/migrations/0001_init.sql`.
3. Copy the project URL, anon key, and service role key into `.env.local`.

### Run tests

```bash
npm test
```

## Project layout

```
src/
  app/                    routes (App Router)
    api/                  route handlers (public + admin)
    admin/                admin pages (cookie-gated)
    bracket/[challenge]/  public bracket view
  components/             UI components (StarField, MatchCard, ...)
  lib/
    draw.ts               pure draw algorithm (club-separation)
    auth.ts               JWT cookie helpers
    challenges.ts         challenge metadata
    repos/                Supabase data access (one per table)
    supabase/             client + types
supabase/migrations/      SQL schema
scripts/seed.ts           dev seed
```

## Tournament rules

- **Soccer (senior + junior)** — 1v1 single elimination.
- **Line follower** — 1v1 single elimination.
- **All-terrain senior** — 4 robots per round; admin picks how many advance each round.
- **All-terrain junior** — 3 robots per round; admin picks how many advance each round.
- **Club separation** — for tours 1 & 2 only, robots from the same club are kept apart in their groups. Exception: when a single club has more robots than there are groups in the tour, clubmates are allowed to share a group.
- **Byes** — when robot count doesn't divide evenly into the group size, the surplus robots receive auto-byes (drawn from the largest clubs first).

## Deploy

1. Push this repo to GitHub.
2. Import in Vercel → set the same env vars from `.env.local.example`.
3. Vercel auto-builds on every push to `main`.

## License

Internal — Carthabot event.
