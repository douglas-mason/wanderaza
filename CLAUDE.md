# Wanderaza — Claude Code context

## What this project is

A bootstrapped travel platform that lets users search for events, restaurants, and attractions in a destination city filtered by their travel dates, then build a shareable trip itinerary. The hero feature is surfacing real events (concerts, sports, festivals) happening during a user's specific travel window — something no major travel planning tool does well.

## Tech stack

- **Monorepo**: pnpm workspaces
  - `apps/web` — Next.js (App Router, TypeScript, Tailwind, shadcn/ui)
  - `apps/api` — Fastify (TypeScript)
  - `packages/db` — Drizzle ORM + schema (see `schema.ts`)
  - `packages/types` — shared TypeScript types
- **Database**: PostgreSQL via Drizzle ORM
- **Auth**: Clerk (thin wrapper — auth state lives in Clerk, users table exists for FK relationships)
- **Hosting**: Vercel (web), Railway (API + Postgres + Redis)
- **Maps**: Mapbox / react-map-gl
- **Cache**: Redis (2-hour TTL for API responses), Postgres (7-day TTL for Places/Events cache tables)

## External data sources

| Source | Used for | Notes |
|---|---|---|
| Ticketmaster Discovery API | Events (music, sports, arts) | Primary event source |
| Eventbrite API | Events (festivals, food, misc) | Secondary event source |
| Google Places API | Restaurants, bars, cafes, attractions | Cache results in `places` table after first fetch |
| Booking.com affiliate | Hotels | Pass-through only in MVP — not cached |

## Database schema

Five tables. Schema source of truth: `schema.ts` (Drizzle). Docs: `docs/schema.md`.

```
users
  └── trips           (user owns many trips)
        └── trip_items  (trip contains many items)
              ├── → places  (resolved by external_id + source when item_type = 'place')
              └── → events  (resolved by external_id + source when item_type = 'event')
```

### Key design decisions

- `trip_items` is the central join table for everything added to a trip. It uses `external_id + source` (not nullable FK columns) to resolve against `places` or `events`.
- Display fields (`title`, `venue`, `start_time`) are **denormalized onto `trip_items`** to avoid joins on itinerary render.
- `places` and `events` are **cache tables** — re-fetch from source APIs if `cached_at` is older than 7 days.
- `item_type` values: `event` | `place` | `hotel`
- `source` values: `ticketmaster` | `eventbrite` | `google_places` | `booking`
- Hotels are **not cached** in MVP — Booking.com results passed through directly.

### Category taxonomy

All UI filters use `category_internal`. `category_raw` preserved as audit trail.

| Internal | Maps from |
|---|---|
| `music` | Ticketmaster: `Music` · Eventbrite: `music` |
| `sports` | Ticketmaster: `Sports` · Eventbrite: `sports-fitness` |
| `arts` | Ticketmaster: `Arts & Theatre`, `Film` · Eventbrite: `performing-arts`, `arts` |
| `restaurant` | Google: `restaurant` · Eventbrite: `food-and-drink` |
| `bar` | Google: `bar` |
| `cafe` | Google: `cafe`, `coffee_shop` |
| `attraction` | Google: `tourist_attraction`, `point_of_interest` · Ticketmaster: `Miscellaneous` |
| `shopping` | Google: `shopping_mall`, `store` |
| `hotel` | Google: `lodging` |

Default fallback: `attraction`. See `normalizeCategory()` in `schema.ts`.

## MVP build plan (month 1)

See `docs/build_plan.html` for the full week-by-week breakdown.

**Week 1** — Monorepo scaffold, CI/CD, Clerk auth, Drizzle + base schema  
**Week 2** — Ticketmaster integration, search UI (city + date picker), event results list  
**Week 3** — "Add to trip" action, trip timeline view, shareable `/trip/[share_slug]` URL  
**Week 4** — Google Places restaurant search, Mapbox map view, send to real users  

**End-of-month-1 milestone**: a real person can search a city + dates → see events → build an itinerary → add restaurants → share a link.

## Deliberately cut from MVP

Do not suggest or build these until explicitly asked:

- Hotel search / hotels cache table (Booking.com pass-through only for now)
- Drag-and-drop reordering
- Business profiles / ad platform
- Mobile app (web first)
- AI itinerary generation
- Email marketing

## UI reference

`docs/ui_mockup.html` contains an interactive HTML mockup of the core itinerary builder UI — two-panel layout with search/results on the left and the day-by-day trip timeline on the right. Use it as a reference for component structure and interaction patterns.

## MVP build plan

`docs/build_plan.html` contains the full week-by-week breakdown with milestones and what's deliberately cut from month 1.

## Conventions

- Always use `category_internal` (not `category_raw`) in queries and UI filters
- Shareable trip URLs use `share_slug` (short random string), not the UUID `id`
- Public trip view (`/trip/[share_slug]`) requires no auth; creating/editing requires Clerk auth
- When adding a place or event to the DB cache, always set both `category_raw` (from source) and `category_internal` (via `normalizeCategory()`)
- Resolve `trip_items` to detail via: `SELECT * FROM events WHERE external_id = ? AND source = ?` (or `places` for `item_type = 'place'`)

## Backend Patterns

- Favor separation of concerns
- The API should use a controller and service pattern where controller methods are thin and manage the HTTP request concerns while business logic should be separated into service files.
- The database layer should use a repository pattern.  When the service needs to access the database it should reference a query service.  The query service will reference repository files that have specific query methods exported.

## Frontend Patterns

- Keep component files small by breaking out logical UI elements into their own components.
- Structure files as verticle slices by feature.
- Only truly shareable components should be in a top level location, but logical grouped components specific to the feature should reside in the same feature folder.
