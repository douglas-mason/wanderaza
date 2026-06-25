# Wanderaza

A travel platform that lets users search for events, restaurants, and attractions in a destination city — filtered by their travel dates — and build a shareable trip itinerary. The hero feature is surfacing real events (concerts, sports, festivals) happening during a user's specific travel window.

## Live URLs

| Environment | URL |
|---|---|
| Web (Vercel) | https://wanderaza-web.vercel.app |
| API (Railway) | https://wanderaza-production.up.railway.app |
| API health check | https://wanderaza-production.up.railway.app/health |
| Shared trip view | `https://wanderaza-web.vercel.app/trip/{share_slug}` |

## Tech stack

- **Monorepo**: pnpm workspaces
  - `apps/web` — Next.js (App Router, TypeScript, Tailwind, shadcn/ui)
  - `apps/api` — Fastify (TypeScript)
  - `packages/db` — Drizzle ORM + schema
  - `packages/types` — shared TypeScript types
- **Database**: PostgreSQL via Drizzle ORM
- **Auth**: Clerk (webhook-synced `users` table for FK relationships)
- **Cache**: Redis (2-hour TTL for API responses), Postgres (7-day TTL for Places/Events cache tables)
- **Hosting**: Vercel (web), Railway (API + Postgres + Redis)
- **Maps**: Mapbox / react-map-gl

## External data sources

| Source | Used for |
|---|---|
| Ticketmaster Discovery API | Events (music, sports, arts) — primary |
| Eventbrite API | Events (festivals, food, misc) — secondary |
| Google Places API | Restaurants, bars, cafes, attractions |
| Booking.com affiliate | Hotels (pass-through only in MVP) |

## Local development

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker (for local Postgres) or a Postgres connection string

### Setup

```bash
# Install dependencies
pnpm install

# Start local Postgres (via docker-compose)
docker compose up -d

# Configure environment variables (see below)
cp .env.example apps/api/.env        # then add Clerk/Ticketmaster keys
cp .env.example packages/db/.env     # DATABASE_URL only
# create apps/web/.env.local with NEXT_PUBLIC_API_URL + Clerk publishable key

# Run database migrations
pnpm db:migrate

# Start web (port 3000) + api (port 3001) together
pnpm dev
```

- Web: http://localhost:3000
- API: http://localhost:3001

## Environment variables

### `apps/api/.env`

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | yes | Postgres connection string |
| `CLERK_SECRET_KEY` | yes | Clerk backend secret (`sk_test_…` / `sk_live_…`) — verifies session tokens |
| `CLERK_WEBHOOK_SECRET` | yes | Svix signing secret for the `POST /webhooks/clerk` endpoint that syncs users |
| `WEB_URL` | yes | Allowed CORS origin(s). Comma-separated; no trailing slash |
| `TICKETMASTER_API_KEY` | yes | Ticketmaster Discovery API key |
| `REDIS_URL` | no | Redis connection string for response caching |
| `PORT` | no | API port (defaults to 3001) |

> **CORS gotcha:** `WEB_URL` is matched exactly against the request `Origin`. A trailing slash or stray whitespace silently drops CORS headers (request still returns 200, browser blocks reading the response). The API trims and strips trailing slashes defensively, but keep the value clean.

### `apps/web/.env.local`

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | yes | Base URL of the API. **Must include the `https://` scheme** and no trailing slash |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | yes | Clerk publishable key (`pk_test_…` / `pk_live_…`) |
| `CLERK_SECRET_KEY` | yes | Clerk secret key (used by `@clerk/nextjs` server middleware) |

### `packages/db/.env`

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | yes | Postgres connection string (used by drizzle-kit for migrations/studio) |

## Useful scripts

Run from the repo root:

| Command | Description |
|---|---|
| `pnpm dev` | Run web + api in parallel (watch mode) |
| `pnpm build` | Build all workspaces |
| `pnpm type-check` | Type-check all workspaces |
| `pnpm db:generate` | Generate a Drizzle migration from `schema.ts` |
| `pnpm db:migrate` | Apply pending migrations |
| `pnpm db:studio` | Open Drizzle Studio |

## API endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | — | Health check |
| `GET` | `/events/search` | — | Search events by `city`, `startDate`, `endDate` (+ optional `category`) |
| `GET` | `/trips` | required | List the authenticated user's trips |
| `POST` | `/trips` | required | Create a trip |
| `GET` | `/trips/:id` | required | Get an owned trip with its items (used to resume editing) |
| `POST` | `/trips/:id/items` | required | Add an item to a trip |
| `GET` | `/trips/shared/:shareSlug` | — | Public read-only view of a shared trip |
| `POST` | `/webhooks/clerk` | svix | Clerk user sync webhook (`user.created` / `updated` / `deleted`) |

Authenticated endpoints expect a Clerk session token: `Authorization: Bearer <token>`.

## Database schema

Five tables (source of truth: `packages/db/src/schema.ts`, docs: `docs/schema.md`):

```
users
  └── trips           (user owns many trips)
        └── trip_items  (trip contains many items)
              ├── → places  (when item_type = 'place')
              └── → events  (when item_type = 'event')
```

- `trip_items` is the central join table; it resolves to `places`/`events` via `external_id + source`.
- Display fields (`title`, `venue`, `start_time`) are denormalized onto `trip_items` to avoid joins on render.
- `places` and `events` are cache tables — re-fetch from source APIs when `cached_at` is older than 7 days.
- All UI filters use `category_internal` (normalized via `normalizeCategory()`); `category_raw` is kept as an audit trail.

## Deployment

- **Web** is deployed to Vercel. Set `NEXT_PUBLIC_API_URL` (with `https://` scheme) and the Clerk keys in the Vercel project.
- **API** is deployed to Railway via `Dockerfile` (see `railway.toml`). Railway runs `node dist/migrate.js` as a pre-deploy step so migrations apply automatically on each deploy. Railway also provisions Postgres and Redis.
- The Clerk webhook must point at `https://wanderaza-production.up.railway.app/webhooks/clerk` with `CLERK_WEBHOOK_SECRET` matching the Svix signing secret.

## Project docs

- `CLAUDE.md` — codebase conventions and architectural decisions
- `docs/build_plan.html` — week-by-week MVP build plan
- `docs/ui_mockup.html` — interactive mockup of the itinerary builder UI
- `docs/schema.md` — database schema reference
