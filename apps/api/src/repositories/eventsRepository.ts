import { db, events, type NewEvent } from '@wanderaza/db';

async function upsertOne(event: NewEvent) {
  await db
    .insert(events)
    .values(event)
    .onConflictDoUpdate({
      target: [events.externalId, events.source],
      set: { ...event, cachedAt: new Date() },
    });
}

async function upsertMany(eventsToCache: NewEvent[]) {
  await Promise.all(eventsToCache.map(upsertOne));
}

export const eventsRepository = {
  upsertMany,
};
