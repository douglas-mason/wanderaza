# Database schema — MVP

> Last updated: June 2026  
> ORM: Drizzle · Database: PostgreSQL · Schema file: `packages/db/schema.ts`

---

## Overview

Five tables cover the full MVP. The design prioritizes simplicity: a single `trip_items` table acts as the central join point, resolving to either `places` or `events` via `external_id + source` rather than nullable FK columns.

```
users
  └── trips           (user owns many trips)
        └── trip_items  (trip contains many items)
              ├── → places  (resolved by external_id + source when item_type = 'place')
              └── → events  (resolved by external_id + source when item_type = 'event')
```

---

## Tables

### `users`

Thin wrapper around Clerk. Auth state lives in Clerk — this table exists for FK relationships and future email marketing.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | Internal ID |
| `clerk_id` | varchar UNIQUE | Clerk user ID — used to look up on sign-in |
| `email` | varchar | Stored for marketing use |
| `display_name` | varchar | Optional display name |
| `created_at` | timestamp | |

---

### `trips`

One row per planned trip. The `share_slug` generates the public URL (`/trip/[share_slug]`).

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid FK → users | Cascade delete |
| `title` | varchar | e.g. "Nashville trip" |
| `destination` | varchar | Display string e.g. "Nashville, TN" |
| `lat` / `lng` | real | Center point for map |
| `start_date` | date | |
| `end_date` | date | |
| `share_slug` | varchar UNIQUE | Short random slug for public URL |
| `visibility` | varchar | `public` \| `private` \| `unlisted` |
| `created_at` | timestamp | |

---

### `trip_items`

Central join table. Every item added to a trip lands here regardless of type. Resolves to `places` or `events` via `external_id + source`.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `trip_id` | uuid FK → trips | Cascade delete |
| `item_type` | varchar | `event` \| `place` \| `hotel` |
| `external_id` | varchar | ID from the source API |
| `source` | varchar | `ticketmaster` \| `google_places` \| `eventbrite` \| `booking` |
| `title` | varchar | Denormalized — avoids join on render |
| `venue` | varchar | Denormalized venue name |
| `start_time` | timestamp | For events; null for places |
| `sort_order` | integer | Manual sort within a day |
| `metadata` | jsonb | Source-specific extras (ticket URL, price, etc.) |
| `created_at` | timestamp | |

**Resolving an item to its cached detail:**
```ts
if (item.itemType === 'event') {
  // SELECT * FROM events WHERE external_id = ? AND source = ?
} else if (item.itemType === 'place') {
  // SELECT * FROM places WHERE external_id = ? AND source = ?
}
```

---

### `places`

Cache table for Google Places (restaurants, bars, attractions, etc.). Queried instead of hitting the Google Places API on every request. Re-fetch if `cached_at` is older than 7 days.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `external_id` | varchar | Source API ID |
| `source` | varchar | e.g. `google_places` |
| `name` | varchar | |
| `category_raw` | varchar | Raw string from source e.g. `point_of_interest` |
| `category_internal` | varchar | Normalized e.g. `attraction` — see taxonomy below |
| `lat` / `lng` | real | |
| `address_formatted` | varchar | Full display string |
| `street` | varchar | |
| `city` | varchar | |
| `state` | varchar | |
| `country` | varchar(2) | ISO 3166-1 alpha-2 |
| `postal_code` | varchar | |
| `rating` | real | |
| `hours` | jsonb | Opening hours object from API |
| `cached_at` | timestamp | |

**Unique index:** `(external_id, source)`

---

### `events`

Cache table for Ticketmaster / Eventbrite. Same caching strategy as `places`.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `external_id` | varchar | Source API ID |
| `source` | varchar | `ticketmaster` \| `eventbrite` |
| `name` | varchar | |
| `category_raw` | varchar | Raw string from source |
| `category_internal` | varchar | Normalized — see taxonomy below |
| `venue_name` | varchar | e.g. "Bridgestone Arena" |
| `lat` / `lng` | real | |
| `address_formatted` | varchar | Full display string |
| `street` | varchar | |
| `city` | varchar | |
| `state` | varchar | |
| `country` | varchar(2) | ISO 3166-1 alpha-2 |
| `postal_code` | varchar | |
| `start_time` | timestamp with tz | |
| `end_time` | timestamp with tz | |
| `price_range` | varchar | e.g. "$45–$220" |
| `url` | text | Ticketing link |
| `cached_at` | timestamp | |

**Unique index:** `(external_id, source)`

---

## Category taxonomy

All UI filters and queries use `category_internal`. `category_raw` is kept as an audit trail so mappings can be updated without data loss.

| Internal value | Maps from |
|---|---|
| `music` | Ticketmaster: `Music` · Eventbrite: `music` |
| `sports` | Ticketmaster: `Sports` · Eventbrite: `sports-fitness` |
| `arts` | Ticketmaster: `Arts & Theatre`, `Film` · Eventbrite: `performing-arts`, `arts` |
| `festival` | Manual tag |
| `comedy` | Manual tag |
| `restaurant` | Google: `restaurant` · Eventbrite: `food-and-drink` |
| `bar` | Google: `bar` |
| `cafe` | Google: `cafe`, `coffee_shop` |
| `attraction` | Google: `tourist_attraction`, `point_of_interest` · Ticketmaster: `Miscellaneous` |
| `shopping` | Google: `shopping_mall`, `store` |
| `hotel` | Google: `lodging` |

Default fallback: `attraction`

---

## Not in MVP schema

- **Hotels table** — Booking.com affiliate results are passed through directly, not cached. Add in month 2 if needed.
- **Business profiles** — for the future B2B ad product.
- **Campaigns / placements** — ad platform tables, phase 3.
- **Reviews** — not in scope for MVP.
