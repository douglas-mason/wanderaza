import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  date,
  integer,
  real,
  jsonb,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

// ---------------------------------------------------------------------------
// Category taxonomy
// ---------------------------------------------------------------------------

export const CATEGORIES = {
  MUSIC:      'music',
  SPORTS:     'sports',
  ARTS:       'arts',
  FESTIVAL:   'festival',
  COMEDY:     'comedy',
  RESTAURANT: 'restaurant',
  BAR:        'bar',
  CAFE:       'cafe',
  ATTRACTION: 'attraction',
  SHOPPING:   'shopping',
  HOTEL:      'hotel',
} as const;

export type Category = (typeof CATEGORIES)[keyof typeof CATEGORIES];

export function normalizeCategory(raw: string): Category {
  const map: Record<string, Category> = {
    // Google Places
    restaurant:            CATEGORIES.RESTAURANT,
    bar:                   CATEGORIES.BAR,
    cafe:                  CATEGORIES.CAFE,
    coffee_shop:           CATEGORIES.CAFE,
    tourist_attraction:    CATEGORIES.ATTRACTION,
    point_of_interest:     CATEGORIES.ATTRACTION,
    shopping_mall:         CATEGORIES.SHOPPING,
    store:                 CATEGORIES.SHOPPING,
    lodging:               CATEGORIES.HOTEL,
    // Ticketmaster
    Music:                 CATEGORIES.MUSIC,
    Sports:                CATEGORIES.SPORTS,
    'Arts & Theatre':      CATEGORIES.ARTS,
    'Film':                CATEGORIES.ARTS,
    Miscellaneous:         CATEGORIES.ATTRACTION,
    // Eventbrite
    music:                 CATEGORIES.MUSIC,
    'food-and-drink':      CATEGORIES.RESTAURANT,
    'performing-arts':     CATEGORIES.ARTS,
    'arts':                CATEGORIES.ARTS,
    'sports-fitness':      CATEGORIES.SPORTS,
    'film-media-entertainment': CATEGORIES.ARTS,
  };
  return map[raw] ?? CATEGORIES.ATTRACTION;
}

// ---------------------------------------------------------------------------
// Item types for trip_items
// ---------------------------------------------------------------------------

export const ITEM_TYPES = {
  EVENT: 'event',
  PLACE: 'place',
  HOTEL: 'hotel',
} as const;

export type ItemType = (typeof ITEM_TYPES)[keyof typeof ITEM_TYPES];

// ---------------------------------------------------------------------------
// Visibility options for trips
// ---------------------------------------------------------------------------

export const VISIBILITY = {
  PUBLIC:   'public',
  PRIVATE:  'private',
  UNLISTED: 'unlisted',
} as const;

// ---------------------------------------------------------------------------
// Tables
// ---------------------------------------------------------------------------

export const users = pgTable('users', {
  id:          uuid('id').primaryKey().defaultRandom(),
  clerkId:     varchar('clerk_id', { length: 255 }).notNull().unique(),
  email:       varchar('email', { length: 255 }).notNull(),
  displayName: varchar('display_name', { length: 255 }),
  createdAt:   timestamp('created_at').defaultNow().notNull(),
});

export const trips = pgTable('trips', {
  id:          uuid('id').primaryKey().defaultRandom(),
  userId:      uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title:       varchar('title', { length: 255 }).notNull(),
  destination: varchar('destination', { length: 255 }).notNull(),
  lat:         real('lat'),
  lng:         real('lng'),
  startDate:   date('start_date').notNull(),
  endDate:     date('end_date').notNull(),
  shareSlug:   varchar('share_slug', { length: 20 }).notNull().unique(),
  visibility:  varchar('visibility', { length: 20 }).notNull().default(VISIBILITY.PUBLIC),
  createdAt:   timestamp('created_at').defaultNow().notNull(),
});

export const tripItems = pgTable('trip_items', {
  id:         uuid('id').primaryKey().defaultRandom(),
  tripId:     uuid('trip_id').notNull().references(() => trips.id, { onDelete: 'cascade' }),
  itemType:   varchar('item_type', { length: 20 }).notNull(),
  externalId: varchar('external_id', { length: 255 }),
  source:     varchar('source', { length: 50 }),
  title:      varchar('title', { length: 255 }).notNull(),
  venue:      varchar('venue', { length: 255 }),
  startTime:  timestamp('start_time', { withTimezone: true }),
  sortOrder:  integer('sort_order').notNull().default(0),
  metadata:   jsonb('metadata'),
  createdAt:  timestamp('created_at').defaultNow().notNull(),
});

export const places = pgTable(
  'places',
  {
    id:               uuid('id').primaryKey().defaultRandom(),
    externalId:       varchar('external_id', { length: 255 }).notNull(),
    source:           varchar('source', { length: 50 }).notNull(),
    name:             varchar('name', { length: 255 }).notNull(),
    categoryRaw:      varchar('category_raw', { length: 100 }),
    categoryInternal: varchar('category_internal', { length: 50 }),
    lat:              real('lat'),
    lng:              real('lng'),
    addressFormatted: varchar('address_formatted', { length: 500 }),
    street:           varchar('street', { length: 255 }),
    city:             varchar('city', { length: 100 }),
    state:            varchar('state', { length: 100 }),
    country:          varchar('country', { length: 2 }),
    postalCode:       varchar('postal_code', { length: 20 }),
    rating:           real('rating'),
    hours:            jsonb('hours'),
    cachedAt:         timestamp('cached_at').defaultNow().notNull(),
  },
  (table) => ({
    externalSourceIdx: uniqueIndex('places_external_id_source_idx').on(
      table.externalId,
      table.source
    ),
  })
);

export const events = pgTable(
  'events',
  {
    id:               uuid('id').primaryKey().defaultRandom(),
    externalId:       varchar('external_id', { length: 255 }).notNull(),
    source:           varchar('source', { length: 50 }).notNull(),
    name:             varchar('name', { length: 255 }).notNull(),
    categoryRaw:      varchar('category_raw', { length: 100 }),
    categoryInternal: varchar('category_internal', { length: 50 }),
    venueName:        varchar('venue_name', { length: 255 }),
    lat:              real('lat'),
    lng:              real('lng'),
    addressFormatted: varchar('address_formatted', { length: 500 }),
    street:           varchar('street', { length: 255 }),
    city:             varchar('city', { length: 100 }),
    state:            varchar('state', { length: 100 }),
    country:          varchar('country', { length: 2 }),
    postalCode:       varchar('postal_code', { length: 20 }),
    startTime:        timestamp('start_time', { withTimezone: true }),
    endTime:          timestamp('end_time', { withTimezone: true }),
    priceRange:       varchar('price_range', { length: 100 }),
    url:              text('url'),
    cachedAt:         timestamp('cached_at').defaultNow().notNull(),
  },
  (table) => ({
    externalSourceIdx: uniqueIndex('events_external_id_source_idx').on(
      table.externalId,
      table.source
    ),
  })
);

// ---------------------------------------------------------------------------
// Types inferred from schema
// ---------------------------------------------------------------------------

export type User        = typeof users.$inferSelect;
export type NewUser     = typeof users.$inferInsert;
export type Trip        = typeof trips.$inferSelect;
export type NewTrip     = typeof trips.$inferInsert;
export type TripItem    = typeof tripItems.$inferSelect;
export type NewTripItem = typeof tripItems.$inferInsert;
export type Place       = typeof places.$inferSelect;
export type NewPlace    = typeof places.$inferInsert;
export type Event       = typeof events.$inferSelect;
export type NewEvent    = typeof events.$inferInsert;
