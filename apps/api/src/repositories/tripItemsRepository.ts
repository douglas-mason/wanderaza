import { db, tripItems, type NewTripItem, type TripItem } from '@wanderaza/db';
import { asc, eq } from 'drizzle-orm';

async function insertItem(input: NewTripItem): Promise<TripItem> {
  const [item] = await db.insert(tripItems).values(input).returning();
  return item;
}

async function findByTripId(tripId: string): Promise<TripItem[]> {
  return db
    .select()
    .from(tripItems)
    .where(eq(tripItems.tripId, tripId))
    .orderBy(asc(tripItems.startTime));
}

export const tripItemsRepository = {
  insertItem,
  findByTripId,
};
